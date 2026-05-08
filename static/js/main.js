(() => {
// Отключаем автовосстановление скролла
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
// Убираем hash и сразу скроллим наверх
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname);
}
window.scrollTo(0, 0);

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

  // Анимация появления главного блока при загрузке
  function restartAnimation(elem, className) {
    elem.classList.remove(className);
    void elem.offsetWidth;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        elem.classList.add(className);
      });
    });
  }
  
  function runHeroAnimation() {
    const text   = document.querySelector('.hero-content');
    const image  = document.querySelector('.hero-media');
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
      setTimeout(() => {
        restartAnimation(navbar, 'animate');
      }, 0); // ⏱ задержка 300 мс
    }
  }
  
// Анимация появления калькулятора и тарифов
const calcCalculator = document.querySelector('.calc-calculator-wrapper');
const calcPricing   = document.querySelector('.calc-pricing-wrapper');
const calcContainer = document.querySelector('.calc-main-wrapper');

if (calcContainer && calcCalculator && calcPricing) {
  const calcObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        calcCalculator.classList.add('visible');
        calcPricing.classList.add('visible');
        calcObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });

  calcObserver.observe(calcContainer);
}

// ============================================
  // АУДИОДЕМО — инициализация всех плееров
  // ============================================

  document.querySelectorAll('.audio-demo').forEach((demo) => {
    const audio = demo.querySelector('.audio-demo__audio');
    const btn   = demo.querySelector('.audio-demo__btn');
    const range = demo.querySelector('.audio-demo__range');
    const fill  = demo.querySelector('.audio-demo__bar-fill');
    const bar   = demo.querySelector('.audio-demo__bar');
    const time  = demo.querySelector('.audio-demo__time');

    function formatTime(sec) {
      if (!isFinite(sec)) return '0:00';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function updateProgress() {
      const dur = audio.duration;
      if (!dur || !isFinite(dur)) return;
      const pct = (audio.currentTime / dur) * 100;
      fill.style.width = pct + '%';
      range.value = pct;
      time.textContent = formatTime(audio.currentTime);
    }

    // Play / Pause
    btn.addEventListener('click', () => {
      if (audio.paused) {
        // Останавливаем все остальные плееры перед запуском нового
        document.querySelectorAll('.audio-demo').forEach((other) => {
          if (other !== demo) {
            const otherAudio = other.querySelector('.audio-demo__audio');
            otherAudio.pause();
            other.classList.remove('is-playing');
          }
        });
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play',  () => demo.classList.add('is-playing'));
    audio.addEventListener('pause', () => demo.classList.remove('is-playing'));
    audio.addEventListener('ended', () => {
      demo.classList.remove('is-playing');
      audio.currentTime = 0;
      updateProgress();
    });

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
      time.textContent = formatTime(audio.duration);
    });

    // Перемотка
    range.addEventListener('input', () => {
      const dur = audio.duration;
      if (!dur || !isFinite(dur)) return;
      audio.currentTime = (range.value / 100) * dur;
      updateProgress();
    });
  });

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

  window.addEventListener('load', () => {
    setTimeout(() => {
      requestAnimationFrame(() => {
        updateLens();
        runHeroAnimation();
  
        const home = document.getElementById('home');
        if (home) home.scrollIntoView({ behavior: 'auto' });
      });
    }, 0); // ← небольшая задержка, чтобы Firefox восстановил скролл
  });

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
  const overlay = modal?.querySelector('.calc-modal-overlay');
  
  if (modal) {
    modal.classList.add('calc-active');
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
  const overlay = modal?.querySelector('.calc-modal-overlay');
  
  if (modal && modal.classList.contains('calc-active')) {
    // Убираем блюр
    if (overlay) overlay.classList.remove('active');
    
    // Добавляем класс анимации закрытия
    modal.classList.add('calc-closing');
    
    // Ждём завершения анимации (300ms)
    setTimeout(() => {
      modal.classList.remove('calc-active');
      modal.classList.remove('calc-closing');
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
      const oldNotification = document.querySelector('.calc-notification');
      if (oldNotification) {
        document.body.removeChild(oldNotification);
      }
      
      const notification = document.createElement('div');
      notification.className = 'calc-notification';
      notification.textContent = text;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('calc-hiding');
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
  document.getElementById('calc-currentDate').textContent = calcDateString;

// ============================================
// CLICK-TO-LOAD ВИДЕО ПОРТФОЛИО
// ============================================
document.querySelectorAll('.portfolio-video').forEach(placeholder => {
  placeholder.addEventListener('click', () => {
    // Если видео уже создано — ничего не делаем (не пересоздаём!)
    if (placeholder.dataset.loaded === 'true') return;

    const videoSrc = placeholder.dataset.videoSrc;
    const videoPoster = placeholder.querySelector('img')?.src || '';
    if (!videoSrc) return;

    // Останавливаем все остальные видео в портфолио
    document.querySelectorAll('.portfolio-card video').forEach(otherVideo => {
      if (!otherVideo.paused) {
        otherVideo.pause();
      }
    });

    // Также останавливаем аудиоплееры в hero
    document.querySelectorAll('.audio-demo__audio').forEach(audio => {
      if (!audio.paused) {
        audio.pause();
        audio.closest('.audio-demo')?.classList.remove('is-playing');
      }
    });

    // Создаём video-элемент
    const video = document.createElement('video');
    video.src = videoSrc;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;                // ← inline-воспроизведение (не полный экран)
    video.setAttribute('playsinline', '');   // ← дублируем атрибутом для подстраховки
    video.setAttribute('webkit-playsinline', ''); // ← для старых iOS Safari
    video.poster = videoPoster;
    video.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;';

    // Когда видео начинает играть — останавливаем все остальные
    video.addEventListener('play', () => {
      document.querySelectorAll('.portfolio-card video').forEach(otherVideo => {
        if (otherVideo !== video && !otherVideo.paused) {
          otherVideo.pause();
        }
      });
    });

    // Заменяем placeholder содержимое на видео
    placeholder.innerHTML = '';
    placeholder.style.cursor = 'default';
    placeholder.dataset.loaded = 'true';      // ← помечаем как «уже загружен»
    placeholder.appendChild(video);
  });
});

})();