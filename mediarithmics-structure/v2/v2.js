/* mediarithmics homepage, version 2: menu, customer logo carousel, connector wall. */
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

  /* Header: hairline once the page has moved */
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Customers: the logo line is doubled and scrolls. Left static with reduced motion. */
  const marquee = document.querySelector('[data-marquee]');
  if (marquee && !calm) {
    const list = marquee.querySelector('ul');
    [...list.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; }); list.appendChild(c); });
    marquee.classList.add('is-live');
  }

  /* Audience example: anonymous profiles as squares. Three illustrative requests, one per industry. */
  const base = '/mediarithmics-structure/assets/connectors/';
  const scenarios = [
    { who: 'Audience manager, TV & media', ask: 'Bring back viewers who haven’t watched in six months.', criteria: ['Registered viewers', 'No viewing in 6 months', 'Marketing consent'], count: 250000, share: 0.34, accent: 'var(--cyan)', send: [['freewheel', 'FreeWheel'], ['the-trade-desk', 'The Trade Desk'], ['google', 'Google']] },
    { who: 'CRM manager, retail', ask: 'Find loyalty members who bought a TV more than five years ago.', criteria: ['Loyalty members', 'TV bought over 5 years ago', 'Marketing consent'], count: 410000, share: 0.22, accent: 'var(--coral)', send: [['meta', 'Meta'], ['criteo', 'Criteo'], ['brevo', 'Brevo']] },
    { who: 'Media manager, consumer brand', ask: 'Reach shoppers who bought our brand at a partner retailer.', criteria: ['Partner retailer’s shoppers', 'Bought the brand in 12 months', 'Marketing consent'], count: 96000, share: 0.12, accent: 'var(--green)', send: [['amazon-ads', 'Amazon Ads'], ['the-trade-desk', 'The Trade Desk'], ['tiktok', 'TikTok']] },
  ];
  const panel = document.querySelector('[data-audience]');
  const dots = panel.querySelector('[data-dots]');
  const whoEl = panel.querySelector('[data-who]');
  const requestEl = panel.querySelector('[data-request]');
  const criteriaEl = panel.querySelector('[data-criteria]');
  const countEl = panel.querySelector('[data-count]');
  const sendEl = panel.querySelector('[data-send]');
  const tabs = [...panel.querySelectorAll('[data-scenarios] button')];
  const cells = [];
  for (let i = 0; i < 270; i++) { const c = document.createElement('i'); dots.appendChild(c); cells.push(c); }
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const pick = (index) => {
    let seed = 7 + index * 131;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    return cells.filter(() => rand() < scenarios[index].share);
  };
  let run = 0;

  const show = (index, animate) => {
    const s = scenarios[index];
    const id = ++run;
    const live = () => id === run;
    const matched = pick(index);
    tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === index)));
    panel.style.setProperty('--accent', s.accent);
    whoEl.textContent = s.who;
    criteriaEl.innerHTML = s.criteria.map((c) => `<li>${c}</li>`).join('');
    sendEl.innerHTML = s.send.map(([file, name]) => `<li><img src="${base}${file}.png" width="24" height="24" alt="${name}"></li>`).join('');
    cells.forEach((c) => c.classList.remove('in'));
    const finish = () => {
      if (!live()) return;
      panel.classList.remove('is-pending', 'is-typing');
      requestEl.textContent = s.ask;
      matched.forEach((c) => c.classList.add('in'));
      countEl.textContent = fmt(s.count);
    };
    if (!animate) return finish();
    setTimeout(finish, 5000);
    panel.classList.add('is-pending', 'is-typing');
    requestEl.textContent = '';
    countEl.textContent = '0';
    let i = 0;
    const type = setInterval(() => {
      if (!live()) return clearInterval(type);
      requestEl.textContent = s.ask.slice(0, ++i);
      if (i < s.ask.length) return;
      clearInterval(type);
      setTimeout(() => {
        if (!live()) return;
        panel.classList.remove('is-pending', 'is-typing');
        const step = Math.min(14, 900 / matched.length);
        matched.forEach((c, k) => setTimeout(() => { if (live()) c.classList.add('in'); }, k * step));
        const start = performance.now();
        const dur = matched.length * step + 250;
        const tick = (now) => {
          if (!live()) return;
          const p = Math.min(1, (now - start) / dur);
          countEl.textContent = fmt(s.count * p);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }, 300);
    }, 22);
  };

  tabs.forEach((t, k) => t.addEventListener('click', () => show(k, !calm)));
  show(0, false);
  if (!calm && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      show(0, true);
    }, { threshold: 0.4 });
    io.observe(panel);
  }

  /* Products: a tab scrolls the page to the point where its panel sits on top of the stack */
  const stack = document.querySelector('[data-stack]');
  if (stack) {
    const panels = [...stack.children];
    panels.forEach((panel, k) => panel.querySelector('.panel-tab button').addEventListener('click', () => {
      if (getComputedStyle(panel).position !== 'sticky') return panel.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
      const natural = stack.getBoundingClientRect().top + scrollY + panels.slice(0, k).reduce((sum, p) => sum + p.offsetHeight + gap, 0);
      scrollTo({ top: natural - parseFloat(getComputedStyle(panel).top), behavior: calm ? 'auto' : 'smooth' });
    }));
  }

  /* Connectors: a static wall of logos */
  const connectors = [['meta', 'Meta'], ['google', 'Google'], ['braze', 'Braze'], ['the-trade-desk', 'The Trade Desk'], ['freewheel', 'FreeWheel'], ['tiktok', 'TikTok'], ['criteo', 'Criteo'], ['ab-tasty', 'AB Tasty'], ['adform', 'Adform'], ['snapchat', 'Snapchat'], ['microsoft-advertising', 'Microsoft Advertising'], ['brevo', 'Brevo'], ['equativ', 'Equativ'], ['pinterest', 'Pinterest'], ['yahoo', 'Yahoo'], ['kameleoon', 'Kameleoon'], ['teads', 'Teads'], ['linkedin', 'LinkedIn'], ['salesforce', 'Salesforce Marketing Cloud'], ['amazon-ads', 'Amazon Ads'], ['magnite', 'Magnite'], ['emarsys', 'Emarsys'], ['x', 'X'], ['active-agent', 'Active Agent'], ['lotame', 'Lotame'], ['index-exchange', 'Index Exchange'], ['airship', 'Airship'], ['xandr', 'Xandr'], ['batch', 'Batch'], ['adswizz', 'AdsWizz'], ['xtremepush', 'Xtremepush'], ['adot', 'Adot'], ['beeswax', 'Beeswax']];
  const wall = document.querySelector('[data-wall]');
  /* Large tiles for the platforms every visitor looks for; the rest stays small and dense. */
  const known = ['meta', 'google', 'amazon-ads', 'microsoft-advertising', 'the-trade-desk', 'snapchat', 'pinterest', 'x'];
  const big = known.map((file) => connectors.find((c) => c[0] === file));
  const small = connectors.filter((c) => !known.includes(c[0]));
  const tile = ([file, name], cls, size, delay) => `<li class="${cls}" title="${name}" style="--d:${delay}"><img src="${base}${file}.png" width="${size}" height="${size}" alt="${name}" decoding="async"></li>`;
  const smallStart = 420;
  const tiles = [];
  big.forEach((c, j) => {
    tiles.push(tile(c, 'big', 48, j * 70));
    small.slice(j * 3, j * 3 + 3).forEach((s, k) => tiles.push(tile(s, '', 24, smallStart + (j * 3 + k) * 18)));
  });
  small.slice(big.length * 3).forEach((s, k) => tiles.push(tile(s, '', 24, smallStart + (big.length * 3 + k) * 18)));
  wall.innerHTML = tiles.join('');
  /* Empty tiles complete the last row and add two more, which the mask fades out. */
  const cols = getComputedStyle(wall).gridTemplateColumns.split(' ').length;
  const slots = big.length * 4 + small.length;
  const extra = (cols - (slots % cols)) % cols + cols * 2;
  const moreStart = smallStart + small.length * 18;
  wall.insertAdjacentHTML('beforeend', Array.from({ length: extra }, (_, m) => `<li class="more" aria-hidden="true" style="--d:${moreStart + m * 8}"></li>`).join(''));
  /* Cascade, once, when the wall comes into view. Skipped with reduced motion: the wall is simply there. */
  if (!calm && 'IntersectionObserver' in window) {
    wall.classList.add('is-waiting');
    const seen = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      seen.disconnect();
      wall.classList.add('is-in');
    }, { threshold: 0.2 });
    seen.observe(wall);
  }

  /* Testimonials: the cards start as a pile on the first one and fan out once the section is in view */
  const pile = document.querySelector('.quote-list');
  if (pile && !calm && 'IntersectionObserver' in window) {
    pile.classList.add('is-piled');
    const seen = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      pile.classList.remove('is-piled');
      seen.disconnect();
    }, { threshold: 0.45 });
    seen.observe(pile);
  }
})();
