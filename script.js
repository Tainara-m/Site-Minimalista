  /* ── TEMA ── */
  const THEME_KEY = 'tataah.theme';
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const themeBtn = document.getElementById('themeToggle');
  themeBtn.setAttribute('aria-pressed', String(saved === 'dark'));
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    themeBtn.setAttribute('aria-pressed', String(next === 'dark'));
  });

  /* ── MENU ── */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav    = document.getElementById('mainNav');
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  mainNav.querySelectorAll('a').forEach(l => {
    l.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── NAV ATIVO AO ROLAR ── */
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`nav a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
  sections.forEach(s => navObserver.observe(s));

  /* ── REVEAL AO ROLAR ── */
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: .1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* ── CATÁLOGO — ABAS + SUBCATEGORIAS ── */
  // Abas principais
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      document.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Subcategorias (funciona para qualquer painel)
  document.querySelectorAll('.subcat-row').forEach(row => {
    const grid = row.nextElementSibling; // .products-grid
    row.querySelectorAll('.subcat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        row.querySelectorAll('.subcat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sub = btn.dataset.sub;
        grid.querySelectorAll('.pcard').forEach(card => {
          card.classList.toggle('hidden', sub !== 'todos' && card.dataset.sub !== sub);
        });
      });
    });
  });

  /* ── TOGGLE DEV ── */
  const devToggleBtn = document.getElementById('devToggleBtn');
  const devSection   = document.getElementById('devSection');
  devToggleBtn.addEventListener('click', () => {
    const isOpen = devSection.classList.toggle('open');
    devToggleBtn.classList.toggle('open', isOpen);
    devToggleBtn.setAttribute('aria-expanded', String(isOpen));
  });

  /* ── TOAST ── */
  const toast = document.getElementById('toast');
  let toastTimer;

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
  }

  const btnWpp = document.getElementById('btnWhatsapp');
  if (btnWpp) {
    btnWpp.addEventListener('click', () => showToast('Abrindo WhatsApp... 💜'));
  }

  /* ── MODAL ── */
  const subEmoji = {
    'volta-aulas':'📚','carnaval':'🎭','dia-mulher':'🌸','pascoa':'🐣',
    'dia-maes':'💐','dia-namorados':'💕','ferias':'☀️','dia-pais':'👔',
    'primavera':'🌼','dia-professor':'🍎','dia-criancas':'🎈',
    'corporativo':'🏢','natal':'🎄','ano-novo':'🥂',
    'festa':'🎉','batizado':'🕊️','casamento':'💍','outros':'✨','digital':'💻'
  };

  const overlay        = document.getElementById('modalOverlay');
  const modalClose     = document.getElementById('modalClose');
  const modalImageWrap = document.getElementById('modalImageWrap');
  const modalCat       = document.getElementById('modalCat');
  const modalTitleEl   = document.getElementById('modalTitle');
  const modalDesc      = document.getElementById('modalDesc');
  const modalPrice     = document.getElementById('modalPrice');
  const modalContactBtn= document.getElementById('modalContactBtn');
  const modalWppBtn    = document.getElementById('modalWppBtn');

  function openModal(card) {
    const cat   = card.querySelector('.pcard-cat')?.textContent || '';
    const title = card.querySelector('h4')?.textContent         || '';
    const desc  = card.querySelector('p')?.textContent          || '';
    const price = card.querySelector('.pcard-price')?.textContent|| '';
    const sub   = card.dataset.sub || 'digital';
    const emoji = subEmoji[sub] || '🎁';
    const cardImage = card.querySelector('.pcard-image img, img');

    if (cardImage && cardImage.src) {
      const altText = cardImage.alt || title || 'Produto';
      modalImageWrap.innerHTML = `<img class="modal-img" src="${cardImage.src}" alt="${altText}">`;
    } else {
      modalImageWrap.innerHTML = `<div class="modal-img-emoji">${emoji}</div>`;
    }

    modalCat.textContent     = cat;
    modalTitleEl.textContent = title;
    modalDesc.textContent    = desc;
    modalPrice.textContent   = price;

    const wppMsg = encodeURIComponent(`Olá! Tenho interesse no produto: *${title}*. Poderia me dar mais informações? 💜`);
    modalWppBtn.href = `https://wa.me/5531999471019?text=${wppMsg}`;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Abre ao clicar no card
  document.addEventListener('click', e => {
    const card = e.target.closest('.pcard');
    if (card && !e.target.closest('button') && !e.target.closest('a')) openModal(card);
  });

  // Fecha
  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // "Solicitar" → fecha modal + rola para contato
  modalContactBtn.addEventListener('click', () => {
    closeModal();
    setTimeout(() => {
      document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
    }, 300);
  });