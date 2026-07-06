(() => {
// Получаем элемент
const mobileMenu = document.getElementById('mobileMenu');
const burger      = document.querySelector('.burger');

// Функция открытия/закрытия по клику на бургер
window.toggleMenu = function (btn) {
    const mobileMenu = document.getElementById('mobileMenu');
    const isOpen = btn.classList.toggle('active');
    mobileMenu.classList.toggle('open', isOpen);
  };

// Закрываем меню, если клик произошёл вне бургер-иконки и вне самого меню
document.addEventListener('click', e => {
  if (!burger.contains(e.target) && !mobileMenu.contains(e.target)) {
    burger.classList.remove('active');
    mobileMenu.classList.remove('open');
  }
});

// **НОВОЕ**: при клике на любую ссылку внутри mobileMenu — скрываем его
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// Обновление «линзы» в основном меню
const sections = ['home','about', 'portfolio', 'reviews','pricing','faq','contacts'];
const lens     = document.querySelector('.nav-lens');
function updateLens() {
  let current = 'home';
  for (let id of sections) {
    const sec = document.getElementById(id);
    if (!sec) continue;
    const rect = sec.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2 && rect.bottom >= 100) {
      current = id;
    }
  }
  const a = document.querySelector(`.nav-links a[data-section="${current}"]`);
  if (a) {
    lens.style.left  = a.offsetLeft + 'px';
    lens.style.width = a.offsetWidth + 'px';
  }
}
window.addEventListener('scroll', updateLens);
window.addEventListener('resize', updateLens);
window.addEventListener('load',   updateLens);

// Закрываем mobileMenu при растяжении окна >768px
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    burger.classList.remove('active');
    mobileMenu.classList.remove('open');
  }
});

// Анимация появления отзывов с рандомным порядком
const reviewCards = document.querySelectorAll('.review-card');

if (reviewCards.length) {
  const reviewsObserver = new IntersectionObserver((entries) => {
    // Собираем все видимые карточки в этом срабатывании
    const visibleEntries = entries.filter(e => e.isIntersecting);

    // Перемешиваем (алгоритм Фишера-Йетса)
    for (let i = visibleEntries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [visibleEntries[i], visibleEntries[j]] = [visibleEntries[j], visibleEntries[i]];
    }

    // Применяем с задержкой в перемешанном порядке
    visibleEntries.forEach((entry, index) => {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 200);
      reviewsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  reviewCards.forEach(card => reviewsObserver.observe(card));
}

// Анимация появления портфолио со рандомным порядком
const portfolioCards = document.querySelectorAll('.portfolio-card');

if (portfolioCards.length) {
  const portfolioObserver = new IntersectionObserver((entries) => {
    const visibleEntries = entries.filter(e => e.isIntersecting);

    // Перемешиваем (Фишер-Йетс)
    for (let i = visibleEntries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [visibleEntries[i], visibleEntries[j]] = [visibleEntries[j], visibleEntries[i]];
    }

    visibleEntries.forEach((entry, index) => {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      portfolioObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  portfolioCards.forEach(card => portfolioObserver.observe(card));
}


// ============================================
// HERO-ПЛЕЕР С ПЕРЕКЛЮЧАТЕЛЕМ ЯЗЫКА
// ============================================
(function(){
    const player = document.getElementById('heroDemo');
    if (!player) return;
    const playBtn = document.getElementById('hpPlay');
    const wave    = document.getElementById('hpWave');
    const curEl   = document.getElementById('hpCur');
    const durEl   = document.getElementById('hpDur');
    const langWrap= document.getElementById('hpLang');
    const langBtns= [...langWrap.querySelectorAll('button')];
    const audio   = document.getElementById('hpAudio');
    const PITCH = 5; // px на одну полоску (≈2.5px бар + 2.5px gap)

    function calcBars(){
    return Math.max(20, Math.floor(wave.clientWidth / PITCH));
    }

    const SRC = {
        ru: { src:'media/demo_ru.mp3', dur:0, seed:0.9  },
        en: { src:'media/demo_en.mp3', dur:0, seed:0.55 }
    };
    let lang='ru', bars=[];

    const fmt = s => { s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };

    function buildWave(seed){
        const n = calcBars();
        wave.innerHTML=''; bars=[];
        for(let i=0;i<n;i++){
            const b=document.createElement('span'); b.className='bar';
            const h=22+Math.abs(Math.sin(i*seed)*Math.cos(i*0.4))*78;
            b.style.height=Math.max(16,h)+'%'; wave.appendChild(b); bars.push(b);
        }
    }

    // пересборка при изменении ширины (один раз, после loadLang)
    new ResizeObserver(()=>{
        const t = audio.currentTime || 0;
        buildWave(SRC[lang].seed);
        render(t);
    }).observe(wave);

    function render(t){
        const d=audio.duration||SRC[lang].dur||1;
        curEl.textContent=fmt(t);
        const filled = Math.round(Math.min(1, t/d) * bars.length);
        bars.forEach((b,i)=>b.classList.toggle('played',i<filled));
    }
    function loadLang(l){
        audio.pause(); player.classList.remove('is-playing');
        lang=l; langWrap.dataset.lang=l;
        langBtns.forEach(b=>b.classList.toggle('on',b.dataset.l===l));
        audio.src=SRC[l].src; audio.load();
        durEl.textContent=fmt(SRC[l].dur); buildWave(SRC[l].seed); render(0);
    }

    audio.addEventListener('loadedmetadata',()=>{ SRC[lang].dur=audio.duration; durEl.textContent=fmt(audio.duration); });
    audio.addEventListener('timeupdate',()=>render(audio.currentTime));
    audio.addEventListener('play', ()=>{player.classList.add('is-playing');playBtn.setAttribute('aria-label','Пауза');document.querySelectorAll('.portfolio-card video').forEach(v=>{ if(!v.paused) v.pause(); });});
    audio.addEventListener('pause',()=>{ player.classList.remove('is-playing'); playBtn.setAttribute('aria-label','Воспроизвести'); });
    audio.addEventListener('ended',()=>{ audio.currentTime=0; render(0); });

    playBtn.addEventListener('click',()=> audio.paused ? audio.play() : audio.pause());
    langBtns.forEach(b=>b.addEventListener('click',()=>{ if(b.dataset.l!==lang) loadLang(b.dataset.l); }));
    wave.addEventListener('click',e=>{
        const r=wave.getBoundingClientRect();
        const p=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));
        const d=audio.duration; if(d) audio.currentTime=p*d;
    });

    loadLang('ru');
})();



  const aboutPhoto = document.querySelector('.about-photo');
  const aboutText  = document.querySelector('.about-text');

  const aboutObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutPhoto.classList.add('visible');
        aboutText.classList.add('visible');
        aboutObserver.disconnect(); // отключаем, чтобы не анимировать повторно
      }
    });
  }, { threshold: 0.3 });

  // следим за .about-wrapper — когда она входит в зону видимости
  const aboutWrapper = document.querySelector('.about-wrapper');
  if (aboutWrapper) aboutObserver.observe(aboutWrapper);

const contactsWrapper = document.querySelector('.contacts-wrapper');
const contactButtons = document.querySelectorAll('.contacts-content .btn');

const contactsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      contactsWrapper.classList.add('visible');
      contactButtons.forEach((btn, i) => {
        setTimeout(() => {
          btn.classList.add('visible');
        }, i * 150);
      });
      contactsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

if (contactsWrapper) contactsObserver.observe(contactsWrapper);

// Анимация появления калькулятора
const calcPanel = document.getElementById('panel');
if (calcPanel) {
  const calcObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        calcPanel.classList.add('visible');
        calcObserver.disconnect();
      }
    });
  }, { threshold: 0.15 });
  calcObserver.observe(calcPanel);
}

  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('active');
    });
  });

  const faqItems = document.querySelectorAll('.faq-item');
  let faqShown = false;

  function showFAQItemsStaggered() {
    faqItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 150); // ← задержка между вопросами
    });
  }

  const faqSection = document.getElementById('faq');

  function checkFAQVisible() {
    const rect = faqSection.getBoundingClientRect();
    if (!faqShown && rect.top <= window.innerHeight * 0.75) {
      faqShown = true;
      showFAQItemsStaggered();
    }
  }

  window.addEventListener('scroll', checkFAQVisible);
  window.addEventListener('load', checkFAQVisible);


// ============================================
// МОДАЛЬНОЕ ОКНО ЗАКАЗА
// ============================================
window.showContactModal = function() {
  const modal = document.getElementById('orderModal');
  const overlay = modal?.querySelector('.modal-overlay');
  
  if (modal) {
    modal.classList.add('modal-active');
    document.body.style.overflow = 'hidden'; // Блокируем скролл
    document.addEventListener('keydown', handleModalEscape);
    
    // Добавляем блюр с небольшой задержкой для плавности
    setTimeout(() => {
      if (overlay) overlay.classList.add('active');
    }, 0);
  }
}

window.closeOrderModal = function() {
  const modal = document.getElementById('orderModal');
  const overlay = modal?.querySelector('.modal-overlay');
  
  if (modal && modal.classList.contains('modal-active')) {
    // Убираем блюр
    if (overlay) overlay.classList.remove('active');
    
    // Добавляем класс анимации закрытия
    modal.classList.add('modal-closing');
    
    // Ждём завершения анимации (300ms)
    setTimeout(() => {
      modal.classList.remove('modal-active');
      modal.classList.remove('modal-closing');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleModalEscape);
    }, 500);
  }
}

function handleModalEscape(e) {
  if (e.key === 'Escape') {
    closeOrderModal();
  }
}

    // ============================================
    // КОПИРОВАНИЕ EMAIL
    // ============================================

    window.copyEmailFromModal = function() {
      const email = 'i@nof8.ru';
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          showNotificationMain('✅ Адрес почты скопирован');
        }).catch(() => {
          fallbackCopyEmailMain(email);
        });
      } else {
        fallbackCopyEmailMain(email);
      }
    }

    // Кнопка «Скопировать Email» в блоке контактов
    window.copyEmail = window.copyEmailFromModal;

    function fallbackCopyEmailMain(email) {
      const textarea = document.createElement('textarea');
      textarea.value = email;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.top = '0';
      textarea.style.left = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        document.execCommand('copy');
        showNotificationMain('✅ Адрес почты скопирован');
      } catch (err) {
        alert('Email: ' + email);
      }
      
      document.body.removeChild(textarea);
    }

    // ============================================
    // УВЕДОМЛЕНИЕ
    // ============================================

    function showNotificationMain(text) {
      const oldNotification = document.querySelector('.toast');
      if (oldNotification) {
        document.body.removeChild(oldNotification);
      }
      
      const notification = document.createElement('div');
      notification.className = 'toast';
      notification.textContent = text;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('toast-hiding');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 400);
      }, 2500);
    }

// ============================================
// ТОЧКИ-ИНДИКАТОРЫ для мобильных каруселей
// ============================================
function initCarouselDots() {
  const carousels = [
    { container: '.portfolio-cards', cardSelector: '.portfolio-card' },
    { container: '.reviews-grid',    cardSelector: '.review-card' }
  ];

  carousels.forEach(({ container, cardSelector }) => {
    const carousel = document.querySelector(container);
    if (!carousel) return;

    const cards = carousel.querySelectorAll(cardSelector);
    if (!cards.length) return;

    // Создаём контейнер точек
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    carousel.insertAdjacentElement('afterend', dotsContainer);

    cards.forEach((_, index) => {
      const dot = document.createElement('span');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-hidden', 'true');

    dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    // === Непрерывная интерполяция через RAF ===
    let rafId = null;

    function updateDotsProgress() {
      rafId = null;

      const carouselRect = carousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + carouselRect.width / 2;

      // "Шаг" между карточками — для нормализации расстояния
      const cardWidth = cards[0].offsetWidth;
      const cardStep = cards.length > 1
        ? cards[1].offsetLeft - cards[0].offsetLeft
        : cardWidth;

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - carouselCenter);

        // 1.0 — точно по центру, 0.0 — на расстоянии cardStep или дальше
        // Нелинейная кривая (степень 1.4) делает рост точки заметнее у центра
        const linear = Math.max(0, 1 - distance / cardStep);
        const eased = Math.pow(linear, 1.4);

        dots[index].style.setProperty('--progress', eased.toFixed(3));
      });
    }

    function onScroll() {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateDotsProgress);
      }
    }

    carousel.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Стартовое состояние
    updateDotsProgress();
  });
}

window.addEventListener('load', initCarouselDots);

    // ============================================
    // ПЛАВНЫЙ СКРОЛЛ
    // ============================================

    document.addEventListener('DOMContentLoaded', function() {
      // Плавный скролл для всех якорных ссылок
      const smoothScrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
      
      smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          // Пропускаем если это вызов модалки
          if (this.getAttribute('onclick')) return;
          
          const targetId = this.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          
          if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
            
            // Обновляем URL без перезагрузки
            history.pushState(null, null, targetId);
          }
        });
      });
    });

  // Вставка текущей даты
  const calcCurrentDate = new Date();
  const calcMonths = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const calcDateString = `${calcCurrentDate.getDate()} ${calcMonths[calcCurrentDate.getMonth()]} ${calcCurrentDate.getFullYear()} года`;


  
// ============================================
// CLICK-TO-LOAD + КАСТОМНЫЙ ВИДЕОПЛЕЕР ПОРТФОЛИО
// ============================================
function buildVideoPlayer(src, poster, type){
  const vp = document.createElement('div');
  vp.className = 'vplayer paused';
  vp.tabIndex = 0;
  vp.innerHTML = `
    <video preload="metadata" poster="${poster}" playsinline>
      <source src="${src}" type="${type}">
    </video>
    <button class="v-big" aria-label="Воспроизвести">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    </button>
    <div class="v-spin"></div>
    <div class="v-ctrl">
      <div class="v-scrub">
        <div class="v-track">
          <div class="v-buf"></div><div class="v-played"></div><div class="v-thumb"></div>
        </div>
        <div class="v-tip">0:00</div>
      </div>
      <div class="v-row">
        <button class="v-btn play-toggle" aria-label="Пауза">
          <svg class="play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
        </button>
        <div class="v-volume">
          <button class="v-btn mute" aria-label="Звук">
            <svg class="vol-on" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13 3a4 4 0 00-2-3.5v7A4 4 0 0016 12zm-2-8v2a6 6 0 010 12v2a8 8 0 000-16z"/></svg>
            <svg class="vol-mute" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm18.5 3l2.5-2.5-1.5-1.5L20 10.5 17.5 8 16 9.5l2.5 2.5L16 14.5 17.5 16 20 13.5 22.5 16 24 14.5z"/></svg>
          </button>
          <input type="range" class="v-vol-slider" min="0" max="1" step="0.01" value="1" aria-label="Громкость">
        </div>
        <span class="v-time"><span class="cur">0:00</span><span class="sep"> / </span><span class="dur">0:00</span></span>
        <span class="v-spacer"></span>
        <button class="v-btn fs" aria-label="На весь экран">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
        </button>
      </div>
    </div>`;
  return vp;
}

function initVideoPlayer(vp){
  const vid    = vp.querySelector('video');
  const bigBtn = vp.querySelector('.v-big');
  const tglBtn = vp.querySelector('.play-toggle');
  const scrub  = vp.querySelector('.v-scrub');
  const played = vp.querySelector('.v-played');
  const buf    = vp.querySelector('.v-buf');
  const thumb  = vp.querySelector('.v-thumb');
  const tip    = vp.querySelector('.v-tip');
  const curEl  = vp.querySelector('.cur');
  const durEl  = vp.querySelector('.dur');
  const muteBtn= vp.querySelector('.mute');
  const vol    = vp.querySelector('.v-vol-slider');
  const fsBtn  = vp.querySelector('.fs');
  const fmt = s => { s=Math.max(0,Math.floor(s||0)); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); };
  const isPlaying = () => vp.classList.contains('playing');

  function render(){
    const d=vid.duration||0, p=d?vid.currentTime/d:0;
    played.style.width=(p*100)+'%'; thumb.style.left=(p*100)+'%';
    curEl.textContent=fmt(vid.currentTime); durEl.textContent=fmt(d);
    if(vid.buffered.length){ try{ buf.style.width=(vid.buffered.end(vid.buffered.length-1)/d*100)+'%'; }catch(e){} }
  }
  function tgl(){ vid.paused ? vid.play().catch(()=>{}) : vid.pause(); }

  bigBtn.addEventListener('click',e=>{e.stopPropagation();tgl();});
  tglBtn.addEventListener('click',e=>{e.stopPropagation();tgl();});
  vp.addEventListener('click',()=>tgl());

  vid.addEventListener('loadedmetadata',render);
  vid.addEventListener('timeupdate',render);
  vid.addEventListener('progress',render);
  vid.addEventListener('waiting',()=>vp.classList.add('buffering'));
  vid.addEventListener('playing',()=>vp.classList.remove('buffering'));
  vid.addEventListener('ended',()=>{vp.classList.remove('playing');vp.classList.add('paused');showUI();});

  vid.addEventListener('play',()=>{
    vp.classList.add('playing'); vp.classList.remove('paused'); hideSoon();
    // глушим остальные видео и hero-аудио
    document.querySelectorAll('.portfolio-card video').forEach(o=>{ if(o!==vid && !o.paused) o.pause(); });
    const hp=document.getElementById('hpAudio'); if(hp && !hp.paused) hp.pause();
  });
  vid.addEventListener('pause',()=>{vp.classList.remove('playing');vp.classList.add('paused');showUI();});

  // перемотка
  function seekAt(x){ const r=scrub.getBoundingClientRect(); const p=Math.min(1,Math.max(0,(x-r.left)/r.width)); if(vid.duration)vid.currentTime=p*vid.duration; }
  let dragging=false;
  scrub.addEventListener('pointerdown',e=>{e.stopPropagation();dragging=true;scrub.classList.add('drag');scrub.setPointerCapture(e.pointerId);seekAt(e.clientX);});
  scrub.addEventListener('pointermove',e=>{const r=scrub.getBoundingClientRect();const p=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));tip.style.left=(p*100)+'%';tip.textContent=fmt(p*(vid.duration||0));if(dragging)seekAt(e.clientX);});
  scrub.addEventListener('pointerup',()=>{dragging=false;scrub.classList.remove('drag');});

  // звук
  muteBtn.addEventListener('click',e=>{e.stopPropagation();vid.muted=!vid.muted;vp.classList.toggle('muted',vid.muted);});
  vol.addEventListener('input',e=>{e.stopPropagation();vid.volume=+vol.value;vid.muted=(+vol.value===0);vp.classList.toggle('muted',vid.muted);});
  vol.addEventListener('click',e=>e.stopPropagation());

  // фуллскрин
  fsBtn.addEventListener('click',e=>{e.stopPropagation(); document.fullscreenElement?document.exitFullscreen():vp.requestFullscreen?.();});
  vp.addEventListener('dblclick',()=>{ document.fullscreenElement?document.exitFullscreen():vp.requestFullscreen?.(); });

  // автоскрытие контролов
  let hideTimer=null;
  function showUI(){vp.classList.add('show-ui');clearTimeout(hideTimer);if(isPlaying())hideSoon();}
  function hideSoon(){clearTimeout(hideTimer);hideTimer=setTimeout(()=>{if(isPlaying())vp.classList.remove('show-ui');},2500);}
  vp.addEventListener('pointermove',showUI);
  vp.addEventListener('pointerleave',()=>{if(isPlaying())vp.classList.remove('show-ui');});

  // клавиатура
  vp.addEventListener('keydown',e=>{
    if(e.code==='Space'||e.code==='KeyK'){e.preventDefault();tgl();}
    else if(e.code==='ArrowRight'&&vid.duration){vid.currentTime=Math.min(vid.duration,vid.currentTime+5);}
    else if(e.code==='ArrowLeft'){vid.currentTime=Math.max(0,vid.currentTime-5);}
    else if(e.code==='KeyM'){vid.muted=!vid.muted;vp.classList.toggle('muted',vid.muted);}
    else if(e.code==='KeyF'){document.fullscreenElement?document.exitFullscreen():vp.requestFullscreen?.();}
  });

  return vid;
}

document.querySelectorAll('.portfolio-video').forEach(placeholder => {
  placeholder.addEventListener('click', () => {
    if (placeholder.dataset.loaded === 'true') return;
    const src = placeholder.dataset.videoSrc;
    if (!src) return;
    const poster = placeholder.querySelector('img')?.src || '';
    const type = src.endsWith('.webm') ? 'video/webm' : 'video/mp4';

    const vp = buildVideoPlayer(src, poster, type);
    placeholder.innerHTML = '';
    placeholder.style.cursor = 'default';
    placeholder.dataset.loaded = 'true';
    placeholder.appendChild(vp);

    const vid = initVideoPlayer(vp);
    vid.play().catch(()=>{});   // запуск по жесту пользователя
    vp.focus();
  });
});
})();