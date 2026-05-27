(() => {
  'use strict';

  const WPP_NUMBER = '5531999471019';
  const THEME_KEY = 'tataah.theme';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const normalize = (value = '') => value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const makeWppLink = (message) => `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(message)}`;

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    const themeBtn = $('#themeToggle');
    if (!themeBtn) return;

    themeBtn.setAttribute('aria-pressed', String(saved === 'dark'));
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      themeBtn.setAttribute('aria-pressed', String(next === 'dark'));
    });
  }

  function initMenu() {
    const menuToggle = $('#menuToggle');
    const mainNav = $('#mainNav');
    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    const closeMenu = () => {
      mainNav.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    };

    $$('a', mainNav).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeMenu();
    }, { passive: true });
  }

  function initActiveNav() {
    const navLinks = $$('nav a[href^="#"]');
    const sections = $$('section[id]');
    if (!navLinks.length || !sections.length || !('IntersectionObserver' in window)) return;

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.remove('active'));
        $(`nav a[href="#${entry.target.id}"]`)?.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(section => navObserver.observe(section));
  }

  function initReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .1, rootMargin: '0px 0px -50px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  function getCardData(card) {
    const cat = $('.pcard-cat', card)?.textContent.trim() || '';
    const title = $('h4', card)?.textContent.trim() || 'Produto personalizado';
    const desc = $('p:not(.pcard-cat)', card)?.textContent.trim() || '';
    const price = $('.pcard-price', card)?.textContent.trim() || 'Consultar';
    const sub = card.dataset.sub || 'digital';
    const image = $('.pcard-image img, img', card);
    return { cat, title, desc, price, sub, image };
  }

  function enhanceProductCards() {
    $$('.pcard').forEach(card => {
      if (card.dataset.enhanced === 'true') return;
      card.dataset.enhanced = 'true';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Ver detalhes de ${getCardData(card).title}`);

      const action = document.createElement('a');
      action.className = 'pcard-action';
      action.target = '_blank';
      action.rel = 'noopener';
      action.innerHTML = '<i class="fa-brands fa-whatsapp"></i> Pedir orçamento';
      const { title } = getCardData(card);
      action.href = makeWppLink(`Olá! Tenho interesse no produto: ${title}. Poderia me passar valores, prazo e opções de personalização? 💜`);
      card.appendChild(action);
    });
  }

  function initCatalog() {
    const tabs = $$('.cat-tab');
    const searchInput = $('#catalogSearch');
    const clearBtn = $('#clearCatalogSearch');
    const resultCount = $('#catalogResultCount');
    const emptyState = $('#catalogEmpty');

    const getActivePanel = () => $('.cat-panel.active');

    function updateVisibleCards() {
      const term = normalize(searchInput?.value || '');
      let totalVisible = 0;
      let activeVisible = 0;

      $$('.cat-panel').forEach(panel => {
        const activeSub = $('.subcat-btn.active', panel)?.dataset.sub || 'todos';

        $$('.pcard', panel).forEach(card => {
          const data = normalize(card.textContent);
          const matchesSearch = !term || data.includes(term);
          const matchesSub = activeSub === 'todos' || card.dataset.sub === activeSub;
          const visible = matchesSearch && matchesSub;
          card.classList.toggle('hidden', !visible);
          if (visible) totalVisible += 1;
          if (visible && panel.classList.contains('active')) activeVisible += 1;
        });
      });

      if (resultCount) {
        resultCount.textContent = term
          ? `${totalVisible} produto(s) encontrado(s) para “${searchInput.value}”.`
          : '';
      }
      if (emptyState) emptyState.hidden = term ? totalVisible > 0 : activeVisible > 0;
      if (clearBtn) clearBtn.hidden = !term;
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        $$('.cat-panel').forEach(panel => panel.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        $(`#panel-${tab.dataset.tab}`)?.classList.add('active');
        updateVisibleCards();
      });
    });

    $$('.subcat-row').forEach(row => {
      const grid = row.nextElementSibling;
      if (!grid) return;
      $$('.subcat-btn', row).forEach(btn => {
        btn.addEventListener('click', () => {
          $$('.subcat-btn', row).forEach(button => button.classList.remove('active'));
          btn.classList.add('active');
          updateVisibleCards();
        });
      });
    });

    searchInput?.addEventListener('input', updateVisibleCards);
    clearBtn?.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      updateVisibleCards();
    });

    updateVisibleCards();
  }

  function initDevToggle() {
    const devToggleBtn = $('#devToggleBtn');
    const devSection = $('#devSection');
    if (!devToggleBtn || !devSection) return;

    devToggleBtn.addEventListener('click', () => {
      const isOpen = devSection.classList.toggle('open');
      devToggleBtn.classList.toggle('open', isOpen);
      devToggleBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initToast() {
    const toast = $('#toast');
    if (!toast) return;
    let toastTimer;

    window.showTataahToast = (message) => {
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    };

    $('#btnWhatsapp')?.addEventListener('click', () => window.showTataahToast('Abrindo WhatsApp... 💜'));
  }

  function initModal() {
    const subEmoji = {
      'volta-aulas':'📚','carnaval':'🎭','dia-mulher':'🌸','pascoa':'🐣',
      'dia-maes':'💐','dia-namorados':'💕','ferias':'☀️','dia-pais':'👔',
      'primavera':'🌼','dia-professor':'🍎','dia-criancas':'🎈',
      'corporativo':'🏢','natal':'🎄','ano-novo':'🥂','festa':'🎉',
      'batizado':'🕊️','casamento':'💍','outros':'✨','digital':'💻'
    };

    const overlay = $('#modalOverlay');
    const modalClose = $('#modalClose');
    const modalImageWrap = $('#modalImageWrap');
    const modalCat = $('#modalCat');
    const modalTitleEl = $('#modalTitle');
    const modalDesc = $('#modalDesc');
    const modalPrice = $('#modalPrice');
    const modalContactBtn = $('#modalContactBtn');
    const modalWppBtn = $('#modalWppBtn');
    if (!overlay || !modalClose || !modalWppBtn) return;

    function openModal(card) {
      const { cat, title, desc, price, sub, image } = getCardData(card);
      const emoji = subEmoji[sub] || '🎁';

      if (image?.src) {
        const altText = image.alt || title || 'Produto';
        modalImageWrap.innerHTML = `<img class="modal-img" src="${image.src}" alt="${altText}">`;
      } else {
        modalImageWrap.innerHTML = `<div class="modal-img-emoji" aria-hidden="true">${emoji}</div>`;
      }

      modalCat.textContent = cat;
      modalTitleEl.textContent = title;
      modalDesc.textContent = desc;
      modalPrice.textContent = price;

      const message = `Olá! Tenho interesse no produto: ${title}. Poderia me passar valores, prazo e opções de personalização? 💜`;
      modalWppBtn.href = makeWppLink(message);
      modalContactBtn.dataset.product = title;

      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      modalClose.focus();
    }

    function closeModal() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', event => {
      const card = event.target.closest('.pcard');
      if (card && !event.target.closest('button') && !event.target.closest('a')) openModal(card);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeModal();
      if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('pcard')) {
        event.preventDefault();
        openModal(event.target);
      }
    });

    modalClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeModal(); });

    modalContactBtn?.addEventListener('click', () => {
      const product = modalContactBtn.dataset.product || 'produto personalizado';
      window.open(makeWppLink(`Olá! Quero solicitar orçamento para: ${product}. Pode me ajudar? 💜`), '_blank', 'noopener');
      closeModal();
    });
  }

  function initBackToTop() {
    const button = $('#backToTop');
    if (!button) return;

    const toggleButton = () => button.classList.toggle('show', window.scrollY > 650);
    window.addEventListener('scroll', toggleButton, { passive: true });
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    toggleButton();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMenu();
    initActiveNav();
    initReveal();
    initToast();
    enhanceProductCards();
    initCatalog();
    initDevToggle();
    initModal();
    initBackToTop();
  });
})();
