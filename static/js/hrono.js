    const DASHES_RE        = /[\u2010\u2011\u2012\u2013\u2014\u2212]/g;
    const NON_BREAK_SPACES = /[\u00A0\u202F]/g;
    const ZERO_WIDTH_RE    = /[\u200B\u200C\u200D]/g;

    function countWordsInNumber(num) {
      num = Math.abs(parseInt(num));
      if (num === 0) return 1;
      if (num <= 20) return 1;
      if (num <= 99) return 2;
      if (num <= 999) {
        let words = 1, remainder = num % 100;
        if (remainder > 0) words += countWordsInNumber(remainder);
        return words;
      }
      if (num <= 999999) {
        let thousands = Math.floor(num / 1000), remainder = num % 1000;
        let words = countWordsInNumber(thousands) + 1;
        if (remainder > 0) words += countWordsInNumber(remainder);
        return words;
      }
      return Math.floor(num.toString().length / 2) + 2;
    }

    function countWords(text) {
      if (!text) return 0;
      text = text.replace(DASHES_RE, '-');
      text = text.replace(NON_BREAK_SPACES, ' ');
      text = text.replace(ZERO_WIDTH_RE, '');

      const symbolReplacements = { '№':'номер','$':'доллар','#':'хэштэг','@':'собака','%':'процент','€':'евро','£':'фунт','¥':'иена','₽':'рубль','°':'градус','=':'равно' };
      text = text.replace(/([№$#@%€£¥₽°=])/g, ' $1 ');
      for (const [symbol, word] of Object.entries(symbolReplacements)) {
        const esc = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        text = text.replace(new RegExp(`(^|\\s)${esc}($|\\s)`, 'g'), `$1${word}$2`);
      }
      text = text.replace(/\b\d+([.,]\d+)?\b/g, match => {
        const wordCount = countWordsInNumber(match.replace(/[.,]/g, ''));
        return ' СЛОВО '.repeat(wordCount).trim();
      });
      text = text.replace(/-/g, ' ').replace(/[^\wа-яА-ЯёЁ\s]/g, ' ').replace(/\s+/g, ' ').trim();
      return text.split(' ').filter(w => w.trim() !== '').length;
    }

    function countChars(text) {
      if (!text) return 0;
      return text.replace(/\s/g, '').length;
    }

    function roundToHundred(value, minimum = 500) {
      return Math.max(minimum, Math.floor((parseInt(value) + 50) / 100) * 100);
    }

    function calculateTextPrice(words) {
      const m = Math.max(1, Math.ceil(words / 125));
      const rate = m > 60 ? 180 : m >= 10 ? 200 : 250;
      return Math.max(500, m * rate);
    }

    function calculatePrice(service, value) {
      if (service !== 'voice_text') return { priceNormal: 0 };
      const wordCount = parseInt(value);
      const price = calculateTextPrice(wordCount);
      return { priceNormal: price };
    }

        /* ============================================
       СЛЕЖЕНИЕ ЗА СИСТЕМНОЙ ТЕМОЙ
       Автоматически переключает тему при смене настроек ОС,
       но только если пользователь не выбрал тему вручную.
       ============================================ */
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
        if (!localStorage.getItem('hronometr-theme')) {
          var html = document.documentElement;
          html.classList.add('theme-transition');
          setTimeout(function () { html.classList.remove('theme-transition'); }, 500);
          if (e.matches) {
            html.setAttribute('data-theme', 'light');
          } else {
            html.removeAttribute('data-theme');
          }
        }
      });
    }

        /* ============================================
       BURGER MENU
       ============================================ */
    const burger     = document.querySelector('.burger');
    const mobileMenu = document.getElementById('mobileMenu');

    window.toggleMenu = function(btn) {
      const isOpen = btn.classList.toggle('active');
      mobileMenu.classList.toggle('open', isOpen);
    };

    document.addEventListener('click', e => {
      if (!burger.contains(e.target) && !mobileMenu.contains(e.target)) {
        burger.classList.remove('active');
        mobileMenu.classList.remove('open');
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });

    /* ============================================
       AUDIO PLAYER
       ============================================ */
    document.querySelectorAll('.audio-demo').forEach(demo => {
      const audio = demo.querySelector('.audio-demo__audio');
      const btn   = demo.querySelector('.audio-demo__btn');
      if (!audio || !btn) return;

      btn.addEventListener('click', () => {
        if (audio.paused) {
          document.querySelectorAll('.audio-demo').forEach(other => {
            if (other !== demo) { other.querySelector('.audio-demo__audio')?.pause(); other.classList.remove('is-playing'); }
          });
          audio.play();
        } else {
          audio.pause();
        }
      });

      audio.addEventListener('play',  () => demo.classList.add('is-playing'));
      audio.addEventListener('pause', () => demo.classList.remove('is-playing'));
      audio.addEventListener('ended', () => { demo.classList.remove('is-playing'); audio.currentTime = 0; });
    });

    /* ============================================
       FAQ ACCORDION
       ============================================ */
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('active'));
    });

    const faqItems = document.querySelectorAll('.faq-item');
    let faqShown = false;

    function checkFAQVisible() {
      const faqSection = document.getElementById('faq');
      if (!faqSection) return;
      const rect = faqSection.getBoundingClientRect();
      if (!faqShown && rect.top <= window.innerHeight * 0.75) {
        faqShown = true;
        faqItems.forEach((item, i) => setTimeout(() => item.classList.add('visible'), i * 150));
      }
    }

    window.addEventListener('scroll', checkFAQVisible);
    window.addEventListener('load', checkFAQVisible);

        /* ============================================
       NAV LENS
       ============================================ */
    const lens     = document.querySelector('.nav-lens');
    const sections = ['home', 'about', 'faq'];

    function updateLens() {
      let current = 'home';
      for (let id of sections) {
        const sec = document.getElementById(id);
        if (!sec) continue;
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= 100) current = id;
      }
      const a = document.querySelector(`.nav-links a[data-section="${current}"]`);
      if (a && lens) { lens.style.left = a.offsetLeft + 'px'; lens.style.width = a.offsetWidth + 'px'; lens.style.opacity = '1'; }
    }

    window.addEventListener('scroll', updateLens);
    window.addEventListener('resize', updateLens);
    window.addEventListener('load', updateLens);

    /* ============================================
       ХРОНОМЕТР — основная логика
       ============================================ */
    document.addEventListener('DOMContentLoaded', () => {
      const input     = document.getElementById('hronomer-input');
      const wrap      = input.closest('.hronomer-textarea-wrap');
      const clearBtn  = document.getElementById('hronomer-clear');
      const sampleBtn = document.getElementById('hronomer-sample');
      const tSlow     = document.getElementById('hronomer-timing-slow');
      const tMedium   = document.getElementById('hronomer-timing-medium');
      const tFast     = document.getElementById('hronomer-timing-fast');
      const words     = document.getElementById('hronomer-words');
      const chars     = document.getElementById('hronomer-chars');
      const charsNS   = document.getElementById('hronomer-chars-nospace');
      const price     = document.getElementById('hronomer-price');
      const calcTotal   = document.getElementById('hronomer-calc-total');
      const calcMinutes = document.getElementById('hronomer-calc-minutes');
      const rateInput   = document.getElementById('hronomer-rate');
      const findBtn     = document.getElementById('hronomer-find-btn');
      const calcFooter  = document.getElementById('hronomer-calc-footer');
      const orderBar    = document.getElementById('hronomer-order');
      let currentMinutes = 0;

      function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }

      function recalcRate() {
        const rate = parseFloat(rateInput.value) || 0;
        const mins = parseFloat(calcMinutes.value) || 0;
        if (rate > 0 && mins > 0) {
          const total = Math.round(rate * mins);
          calcTotal.textContent = total.toLocaleString('ru-RU') + ' ₽';
          calcFooter.classList.add('visible');
        } else {
          calcTotal.textContent = '0 ₽';
          calcFooter.classList.remove('visible');
          orderBar.classList.remove('visible');
        }
      }

      function recalc() {
        const text     = input.value;
        const wordCount   = countWords(text);
        const charCount   = text.length;
        const charNoSpace = countChars(text);

        words.textContent   = wordCount;
        chars.textContent   = charCount;
        charsNS.textContent = charNoSpace;

        if (wordCount > 0) {
          tSlow.textContent   = formatTime(wordCount * 60 / 125);
          tMedium.textContent = formatTime(wordCount * 60 / 150);
          tFast.textContent   = formatTime(wordCount * 60 / 180);
          currentMinutes      = Math.ceil(wordCount / 125);
          calcMinutes.value   = currentMinutes;
          recalcRate();
          const result = calculatePrice('voice_text', wordCount);
          price.textContent = result.priceNormal.toLocaleString('ru-RU');
        } else {
          tSlow.textContent   = '00:00';
          tMedium.textContent = '00:00';
          tFast.textContent   = '00:00';
          price.textContent   = '—';
          calcMinutes.value   = '';
          calcTotal.textContent = '0 ₽';
          calcFooter.classList.remove('visible');
          orderBar.classList.remove('visible');
        }

        clearBtn.classList.toggle('visible', text.length > 0);
        wrap.classList.toggle('has-text', text.length > 0);
      }

      findBtn.addEventListener('click', () => {
        if (!orderBar.classList.contains('visible')) orderBar.classList.add('visible');
      });

      rateInput.addEventListener('input', recalcRate);

      clearBtn.addEventListener('click', () => {
        input.value = '';
        calcMinutes.value = '';
        calcTotal.textContent = '0 ₽';
        calcFooter.classList.remove('visible');
        input.focus();
        recalc();
      });

      sampleBtn.addEventListener('click', async () => {
        input.focus();
        const pasted = document.execCommand('paste');
        if (!pasted) {
          try {
            const text = await navigator.clipboard.readText();
            input.value += text;
            recalc();
          } catch { /* держим фокус */ }
        }
        recalc();
      });

      input.addEventListener('input', recalc);
      recalc();
    });