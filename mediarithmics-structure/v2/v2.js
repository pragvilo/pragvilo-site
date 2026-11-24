/* mediarithmics homepage, version 2: menu, audience example (plays once), connector rows. */
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Menu: sub-menus open on click, close on Escape or outside click */
  const nav = document.getElementById('navigation');
  const toggle = document.querySelector('.menu-toggle');
  const subs = [...document.querySelectorAll('.has-sub > button')];
  const closeSubs = (except) => subs.forEach((b) => { if (b !== except) b.setAttribute('aria-expanded', 'false'); });
  subs.forEach((b) => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    closeSubs(b);
    b.setAttribute('aria-expanded', String(!open));
  }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-sub')) closeSubs(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = subs.find((b) => b.getAttribute('aria-expanded') === 'true');
    closeSubs();
    if (open) open.focus();
  });
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  });

  /* Audience example: 168 anonymous profiles as squares, about a third match the request */
  const panel = document.querySelector('[data-audience]');
  const dots = panel.querySelector('[data-dots]');
  const TOTAL = 168;
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const cells = [];
  for (let i = 0; i < TOTAL; i++) { const c = document.createElement('i'); dots.appendChild(c); cells.push(c); }
  const matched = cells.filter(() => rand() < 0.34);
  const requestEl = panel.querySelector('[data-request]');
  const countEl = panel.querySelector('[data-count]');
  const text = requestEl.textContent;
  const target = 250000;
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const finish = () => {
    panel.classList.remove('is-pending', 'is-typing');
    requestEl.textContent = text;
    matched.forEach((c) => c.classList.add('in'));
    countEl.textContent = fmt(target);
  };

  const play = () => {
    setTimeout(finish, 6000);
    matched.forEach((c) => c.classList.remove('in'));
    panel.classList.add('is-pending', 'is-typing');
    requestEl.textContent = '';
    countEl.textContent = '0';
    let i = 0;
    const type = setInterval(() => {
      requestEl.textContent = text.slice(0, ++i);
      if (i < text.length) return;
      clearInterval(type);
      setTimeout(() => {
        panel.classList.remove('is-pending', 'is-typing');
        matched.forEach((c, k) => setTimeout(() => c.classList.add('in'), k * 14));
        const start = performance.now();
        const dur = matched.length * 14 + 250;
        const tick = (now) => {
          const p = Math.min(1, (now - start) / dur);
          countEl.textContent = fmt(target * p);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 350);
    }, 28);
  };

  finish();
  if (!calm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      play();
    }, { threshold: 0.4 });
    io.observe(panel);
  }

  /* Connectors: two rows, each written twice so the loop has no seam */
  const base = '/mediarithmics-structure/assets/connectors/';
  const rows = [
    [['meta', 'Meta'], ['google', 'Google'], ['braze', 'Braze'], ['the-trade-desk', 'The Trade Desk'], ['freewheel', 'FreeWheel'], ['tiktok', 'TikTok'], ['criteo', 'Criteo'], ['ab-tasty', 'AB Tasty'], ['adform', 'Adform'], ['snapchat', 'Snapchat'], ['microsoft-advertising', 'Microsoft Advertising'], ['brevo', 'Brevo'], ['equativ', 'Equativ'], ['pinterest', 'Pinterest'], ['yahoo', 'Yahoo'], ['kameleoon', 'Kameleoon']],
    [['teads', 'Teads'], ['linkedin', 'LinkedIn'], ['salesforce', 'Salesforce Marketing Cloud'], ['amazon-ads', 'Amazon Ads'], ['magnite', 'Magnite'], ['emarsys', 'Emarsys'], ['x', 'X'], ['active-agent', 'Active Agent'], ['lotame', 'Lotame'], ['index-exchange', 'Index Exchange'], ['airship', 'Airship'], ['xandr', 'Xandr'], ['batch', 'Batch'], ['adswizz', 'AdsWizz'], ['xtremepush', 'Xtremepush'], ['adot', 'Adot'], ['beeswax', 'Beeswax']],
  ];
  const marquee = document.querySelector('[data-marquee]');
  rows.forEach((list, r) => {
    const row = document.createElement('div');
    row.className = 'marquee-row';
    row.style.setProperty('--t', `${70 + r * 12}s`);
    [0, 1].forEach((copy) => list.forEach(([file, name]) => {
      const chip = document.createElement('span');
      chip.className = 'chip';
      if (copy) chip.dataset.copy = '';
      chip.innerHTML = `<img src="${base}${file}.png" width="28" height="28" alt="" loading="lazy" decoding="async">${name}`;
      row.appendChild(chip);
    }));
    marquee.appendChild(row);
  });
})();
