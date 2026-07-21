/* ============================================================
   calc.js — калькулятор стоимости am_voice
   Математика расчёта + интерфейс в одном файле.
   Требует в DOM разметку .panel и общую модалку (window.showContactModal).
   ============================================================ */

/* ─────────────  РАСЧЁТ  ───────────── */
function countWordsInNumber(num){num=Math.abs(parseInt(num));if(num===0)return 1;if(num<=20)return 1;if(num<=99)return 2;if(num<=999){let w=1,r=num%100;if(r>0)w+=countWordsInNumber(r);return w}if(num<=9999){let t=Math.floor(num/1000),r=num%1000,w=countWordsInNumber(t)+1;if(r>0)w+=countWordsInNumber(r);return w}if(num<=999999){let t=Math.floor(num/1000),r=num%1000,w=countWordsInNumber(t)+1;if(r>0)w+=countWordsInNumber(r);return w}return Math.floor(num.toString().length/2)+2}
function countWords(t){if(!t)return 0;t=t.replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g,'-').replace(/[\u00A0\u202F]/g,' ').replace(/[\u200B\u200C\u200D]/g,'');t=t.replace(/([№$#@%€£¥₽°=])/g,' $1 ');t=t.replace(/\b\d+([.,]\d+)?\b/g,m=>{const n=m.replace(/[.,]/g,'');return ' СЛОВО '.repeat(countWordsInNumber(n)).trim()});t=t.replace(/['\u2019]/g,'').replace(/-/g,' ').replace(/[^\wа-яА-ЯёЁ\s]/g,' ').replace(/\s+/g,' ').trim();return t.split(' ').filter(w=>w.trim()!=='').length}
function countChars(t){return t?t.replace(/\s/g,'').length:0}
function roundToHundred(v,min=500){return Math.max(min,Math.floor((parseInt(v)+50)/100)*100)}
function calcTextPrice(w){const m=Math.max(1,Math.ceil(w/125));const rate=m>60?180:m>=10?200:250;return Math.max(500,m*rate)}
function calcVideoPrice(min){min=Math.max(1,Math.ceil(min));const rate=min>30?200:min>=10?250:300;return Math.max(500,min*rate)}
function calcTranslateTextPrice(c){return Math.max(500,Math.round(c/1000*200))}
function calcTranslateVoicePrice(min){min=Math.ceil(min);return Math.max(500,min*150+calcVideoPrice(min))}
function calcFacePrice(w){const m=Math.max(1,Math.ceil(w/125));const rate=m>=10?200:250;return Math.max(5000,m*rate*4)}
function getTiming(w){const fmt=s=>{s=Math.round(s);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`};return `${fmt(w*60/180)} – ${fmt(w*60/120)}`}
function pluralizeDay(n){if(n%10===1&&n%100!==11)return"день";if(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))return"дня";return"дней"}
function fmtDate(d){return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`}
function applyUrgentMarkup(price){let m;
  if(price<=500)m=1.0;else if(price<=600)m=.8;else if(price<=700)m=.7;else if(price<=800)m=.6;
  else if(price<=2000)m=.5;else if(price<=2200)m=.45;else if(price<=2500)m=.4;else if(price<=2700)m=.35;
  else if(price<=2900)m=.32;else if(price<=3000)m=.31;else if(price<=4000)m=.30;else if(price<=4300)m=.27;
  else if(price<=4400)m=.26;else m=.25;
  const up=price+Math.floor(price*m);return Math.floor((up+99)/100)*100}
function calcDeadline(minDur,extra=0,urgent=false){let t=new Date();const wd=t.getDay(),pw=wd===0?6:wd-1;if(pw>=5&&!urgent)t.setDate(t.getDate()+(7-pw));
  if(urgent&&minDur<=60){const f=new Date(t);f.setDate(f.getDate()+1);return{days:1,date:fmtDate(f)}}
  let need=minDur<=10?1:minDur<=20?2:minDur<=30?3:minDur<=60?4:4+Math.ceil((minDur-60)/60);need+=extra;let f=new Date(t),a=0;while(a<need){f.setDate(f.getDate()+1);const d=f.getDay();if(d>=1&&d<=5)a++}return{days:Math.floor((f-t)/864e5),date:fmtDate(f)}}

/* ===== SVG-иконки услуг ===== */
const ICONS={
  mic:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/></svg>`,
  video:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none"/></svg>`,
  translate:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7"/><path d="M8 4.5C8 9 6 13 3 15.5"/><path d="M5 10.5c1.8 2.2 4 3.8 6.5 4.8"/><path d="M13.5 20l4-9 4 9"/><path d="M15 16.5h5"/></svg>`,
  subtitles:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8.5 11.3a1.7 1.7 0 0 0-2.9 1.2 1.7 1.7 0 0 0 2.9 1.2"/><path d="M14.5 11.3a1.7 1.7 0 0 0-2.9 1.2 1.7 1.7 0 0 0 2.9 1.2"/></svg>`,
  camera:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="10" r="2.6"/><path d="M7.5 18a4.5 4.5 0 0 1 9 0"/></svg>`,
};

/* ===== УСЛУГИ: тариф (для списка) + шкала ===== */

/* Экспорт (совместимость со старым window.PricingCalculator) */
window.PricingCalculator = {
  countWords, countChars,
  calcTextPrice, calcVideoPrice, calcTranslateTextPrice, calcTranslateVoicePrice, calcFacePrice,
  applyUrgentMarkup, getTiming, calcDeadline, pluralizeDay, fmtDate
};

/* ─────────────  ИНТЕРФЕЙС  ───────────── */
const SERVICES={
  voice_text:{ico:ICONS.mic,label:'Озвучка текста',tab:'Текст',rate:'RU, EN',from:'500',mode:'text',unit:'words',trans:'chars',
    price:w=>calcTextPrice(w),dur:w=>Math.ceil(w/125),pos:w=>w/125,max:80,axis:'60+ мин',
    tiers:[{from:0,to:10,rate:'250 ₽/мин'},{from:10,to:60,rate:'200 ₽/мин'},{from:60,to:80,rate:'180 ₽/мин'}]},
  voice_video:{ico:ICONS.video,label:'Озвучка видеоряда',tab:'Видео',rate:'с синхронизацией',from:'500',mode:'min',trans:'min',
    price:m=>calcVideoPrice(m),dur:m=>m,pos:m=>m,max:60,axis:'30+ мин',
    tiers:[{from:0,to:10,rate:'300 ₽/мин'},{from:10,to:30,rate:'250 ₽/мин'},{from:30,to:60,rate:'200 ₽/мин'}]},
  voice_camera:{ico:ICONS.camera,label:'Озвучка на камеру',tab:'На камеру',rate:'в кадре',from:'5000',mode:'text',unit:'words',trans:'chars',
    price:w=>calcFacePrice(w),dur:w=>Math.ceil(w/125),pos:w=>w/125,max:20,axis:'20 мин',
    tiers:[{from:0,to:10,rate:'1000 ₽/мин'},{from:10,to:20,rate:'800 ₽/мин'}]},
};
let current='voice_text';
const rl=n=>n.toLocaleString('ru-RU');
let subtitlesOn=false;
let translateOn=false;
let urgentOn=false;
const HOOK_THRESHOLD=3000;
let hookTimer=null;
function evalHook(price){
  const icon=document.getElementById('hookIcon');
  const row=document.getElementById('hook');
  if(price>=HOOK_THRESHOLD){
    if(!icon.classList.contains('lit')&&!hookTimer){
      hookTimer=setTimeout(()=>{icon.classList.add('lit');row.classList.add('show');hookTimer=null;},600);
    }
  }else{
    clearTimeout(hookTimer);hookTimer=null;
    icon.classList.remove('lit');row.classList.remove('show');
  }
}

/* ===== Переключатель услуг (табы + линза) ===== */
const tabsEl=document.getElementById('svcTabs');
const svcLens=document.getElementById('svcLens');
Object.entries(SERVICES).forEach(([k,s])=>{
  const el=document.createElement('div');
  el.className='tab'+(k===current?' active':'');el.dataset.k=k;
  el.innerHTML=`<span class="tab-ico">${s.ico}</span><span>${s.tab}</span>`;
  el.onclick=()=>selectService(k);
  tabsEl.appendChild(el);
});
function moveLens(){
  const a=tabsEl.querySelector('.tab.active');
  if(a&&svcLens){svcLens.style.left=a.offsetLeft+'px';svcLens.style.width=a.offsetWidth+'px';}
}
// первичная установка без анимации
svcLens.style.transition='none';moveLens();
requestAnimationFrame(()=>{svcLens.style.transition='';});
window.addEventListener('resize',moveLens);
window.addEventListener('load',()=>requestAnimationFrame(moveLens));

/* ===== Шкала ===== */
const ladderEl=document.getElementById('ladder');
function buildLadder(){
  const s=SERVICES[current];ladderEl.innerHTML='';
  s.tiers.forEach((t,i)=>{const seg=document.createElement('div');seg.className='seg'+(i===s.tiers.length-1?' seg-last':'');seg.dataset.i=i;
    seg.style.flex=1;seg.innerHTML=`<span class="seg-label">${t.rate}</span>`;ladderEl.appendChild(seg)});
  const fill=document.createElement('div');fill.className='fill';fill.id='fill';ladderEl.appendChild(fill);
  const mk=document.createElement('div');mk.className='marker';mk.id='marker';mk.style.left='0%';ladderEl.appendChild(mk);
  document.getElementById('axisMax').textContent=s.axis;
}

const field=document.getElementById('field'),minwrap=document.getElementById('minwrap');
const area=document.getElementById('area'),minInput=document.getElementById('minInput');
const pasteBtn=document.getElementById('paste');
function updatePasteBtn(){pasteBtn.textContent=area.value.trim()?'Очистить':'Вставить'}

function selectService(k){
  current=k;const s=SERVICES[k];
  document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('active',e.dataset.k===k));
  moveLens();
  document.getElementById('calcTitle').textContent=s.label;
  document.getElementById('calcChip').textContent='от '+rl(+s.from)+' ₽';
  const isMin=s.mode==='min';
  field.classList.toggle('hide-text',isMin);
  minwrap.classList.toggle('show',isMin);
  area.value='';minInput.value='';
  document.getElementById('ladderNote').style.display=s.unit==='words'?'block':'none';
  subtitlesOn=false;
  const subToggle=document.getElementById('subToggle');
  document.getElementById('subRow').classList.toggle('show',isMin);
  subToggle.dataset.on='false';
  subToggle.setAttribute('aria-checked','false');
  document.getElementById('subRow').classList.remove('on');
  translateOn=false;
  const transRow=document.getElementById('transRow');
  transRow.classList.toggle('show',!!s.trans);
  if(s.trans){document.getElementById('transPrice').textContent=s.trans==='chars'?'200 ₽ / 1000 знаков':'+150 ₽/мин';}
  const transToggle=document.getElementById('transToggle');
  transToggle.dataset.on='false';transToggle.setAttribute('aria-checked','false');
  transRow.classList.remove('on');
  urgentOn=false;
  const urgToggle=document.getElementById('urgToggle');
  urgToggle.dataset.on='false';urgToggle.setAttribute('aria-checked','false');
  document.getElementById('urgRow').classList.remove('on');
  document.getElementById('hook').classList.remove('show');document.getElementById('hookIcon').classList.remove('lit');
  updatePasteBtn();
  buildLadder();recalc();
}

/* ===== Анимация цены ===== */
let priceAnim=null,shownPrice=0;
function animatePrice(to){
  cancelAnimationFrame(priceAnim);
  const from=shownPrice,start=performance.now(),dur=500,el=document.getElementById('priceVal');
  el.classList.remove('idle');
  function step(now){const p=Math.min((now-start)/dur,1),e=1-Math.pow(1-p,3);
    const v=Math.round((from+(to-from)*e)/10)*10;el.innerHTML=rl(v)+' <small>₽</small>';
    if(p<1)priceAnim=requestAnimationFrame(step);else{shownPrice=to;el.innerHTML=rl(to)+' <small>₽</small>'}}
  priceAnim=requestAnimationFrame(step);
}

/* ===== Пересчёт ===== */
function recalc(){
  const s=SERVICES[current];
  const words=countWords(area.value),chars=countChars(area.value);

  let value=s.mode==='min'?(parseInt(minInput.value)||0):(s.unit==='chars'?chars:words);
  const priceEl=document.getElementById('priceVal'),cta=document.getElementById('cta');
  const now=document.getElementById('ladderNow'),hint=document.getElementById('ladderHint');
  const fill=document.getElementById('fill'),marker=document.getElementById('marker');
  const deadline=document.getElementById('deadline'),priceLbl=document.getElementById('priceLbl');

  if(value<=0){
    cancelAnimationFrame(priceAnim);shownPrice=0;
    priceEl.classList.add('idle');priceEl.innerHTML='— <small>₽</small>';
    cta.disabled=true;deadline.textContent='';priceLbl.textContent='Стоимость';
    document.getElementById('priceWrap').classList.remove('has-info','open');
    document.getElementById('urgRow').classList.remove('disabled');
    now.textContent='Введите объём';hint.textContent='';
    evalHook(0);
    if(fill)fill.style.width='0%';if(marker)marker.style.left='0%';
    document.querySelectorAll('.seg').forEach(x=>x.classList.remove('on'));return;
  }

  const base=s.price(value);
  let price=base;
  const dur=Math.ceil(s.dur(value));
  const subCost=(subtitlesOn&&s.mode==='min')?100*value:0;
  let transCost=0;
  if(translateOn&&s.trans){transCost=s.trans==='chars'?Math.round(chars/1000*200):Math.ceil(value)*150;}
  price+=subCost+transCost;
  const urgAllowed=dur<=60;
  document.getElementById('urgRow').classList.toggle('disabled',!urgAllowed);
  const urgActive=urgentOn&&urgAllowed;
  let urgCost=0;
  if(urgActive){const up=applyUrgentMarkup(price);urgCost=up-price;price=up;}
  const dl=calcDeadline(dur,s.extra||0,urgActive);
  const posVal=s.pos(value);
  let activeTier=0;s.tiers.forEach((t,i)=>{if(posVal>=t.from)activeTier=i});
  const atSeg=s.tiers[activeTier],frac=Math.max(0,Math.min((posVal-atSeg.from)/(atSeg.to-atSeg.from),1));
  const pct=Math.max(1.5,((activeTier+frac)/s.tiers.length)*100);
  if(fill)fill.style.width=pct+'%';if(marker)marker.style.left=pct+'%';
  document.querySelectorAll('.seg').forEach((x,i)=>x.classList.toggle('on',i===activeTier));

  let label;
  if(s.mode==='min')label=value+' мин';
  else if(s.unit==='chars')label=rl(chars)+' знаков';
  else label=rl(words)+' слов · '+rl(chars)+' симв. · '+getTiming(words);
  now.textContent=label;
  const at=s.tiers[activeTier];
  hint.innerHTML=at.plateau?('<em>'+at.rate+'</em> — фикс.'):('ставка: <em>'+at.rate+'</em>');
  priceLbl.textContent=(s.unit==='chars')?'Стоимость':('Стоимость · до '+dur+' мин');
  const hasExtras=subCost||urgCost||transCost;
  let pop='<div class="ln"><span>Базовая стоимость</span><b>'+rl(base)+' ₽</b></div>';
  if(transCost)pop+='<div class="ln"><span>Перевод</span><b>+'+rl(transCost)+' ₽</b></div>';
  if(subCost)pop+='<div class="ln"><span>Субтитры</span><b>+'+rl(subCost)+' ₽</b></div>';
  if(urgCost)pop+='<div class="ln"><span>Срочность</span><b>+'+rl(urgCost)+' ₽</b></div>';
  if(hasExtras)pop+='<div class="ln tot"><span>Итого</span><b>'+rl(price)+' ₽</b></div>';
  document.getElementById('costPop').innerHTML=pop;
  document.getElementById('priceWrap').classList.toggle('has-info',!!hasExtras);
  deadline.innerHTML='Срок: '+dl.days+' '+pluralizeDay(dl.days)+' · до '+dl.date;
  evalHook(price);
  cta.disabled=false;
  animatePrice(price);
}

/* ===== События ===== */
let timer;const deb=()=>{clearTimeout(timer);timer=setTimeout(recalc,200)};
area.addEventListener('input',deb);area.addEventListener('input',updatePasteBtn);
minInput.addEventListener('input',deb);
pasteBtn.onclick=async()=>{
  if(area.value.trim()){area.value='';recalc();updatePasteBtn();area.focus();return}
  try{const t=await navigator.clipboard.readText();if(t){area.value=t;recalc();updatePasteBtn();area.focus()}}catch(e){area.focus()}
};
document.getElementById('cta').onclick=()=>{ if(window.showContactModal) window.showContactModal(); };
document.getElementById('subToggle').onclick=()=>{
  subtitlesOn=!subtitlesOn;
  const t=document.getElementById('subToggle');
  t.dataset.on=subtitlesOn?'true':'false';
  t.setAttribute('aria-checked',subtitlesOn?'true':'false');
  document.getElementById('subRow').classList.toggle('on',subtitlesOn);
  recalc();
};
document.getElementById('transToggle').onclick=()=>{
  translateOn=!translateOn;
  const t=document.getElementById('transToggle');
  t.dataset.on=translateOn?'true':'false';
  t.setAttribute('aria-checked',translateOn?'true':'false');
  document.getElementById('transRow').classList.toggle('on',translateOn);
  recalc();
};
document.getElementById('urgToggle').onclick=()=>{
  urgentOn=!urgentOn;
  const t=document.getElementById('urgToggle');
  t.dataset.on=urgentOn?'true':'false';
  t.setAttribute('aria-checked',urgentOn?'true':'false');
  document.getElementById('urgRow').classList.toggle('on',urgentOn);
  recalc();
};
(()=>{const pw=document.getElementById('priceWrap');
  pw.addEventListener('click',e=>{if(!pw.classList.contains('has-info'))return;e.stopPropagation();pw.classList.toggle('open')});
  document.addEventListener('click',()=>pw.classList.remove('open'));
})();
const _hookAct=()=>{ if(window.showContactModal) window.showContactModal(); };
document.getElementById('hook').onclick=_hookAct;
document.getElementById('hookIcon').onclick=_hookAct;


selectService('voice_text');

/* Степпер минут (видео): кнопки ±1, нижняя граница 0 (ручной ввод — через input) */
(function(){
  const mi=document.getElementById('minInput');
  if(!mi)return;
  const step=d=>{let v=parseInt(mi.value)||0;v=Math.max(0,v+d);mi.value=v;recalc();};
  const mm=document.getElementById('minMinus'),mp=document.getElementById('minPlus');
  if(mm&&mp){mm.onclick=()=>step(-1);mp.onclick=()=>step(1);}
})();
