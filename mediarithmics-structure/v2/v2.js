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
  const body = panel.querySelector('[data-body]');
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
  /* One fixed draw per square and per scenario: the lower the draw, the longer the profile stays in. */
  const draws = (index) => {
    let seed = 7 + index * 131;
    return cells.map(() => (seed = (seed * 16807) % 2147483647) / 2147483647);
  };
  let run = 0;
  let current = 0;
  let shown = 0;
  /* The three examples play in turn until the visitor picks one. Paused off screen and under the pointer. */
  let auto = !calm;
  let settled = false;
  let visible = false;
  let held = false;
  let next = 0;
  const plan = () => {
    clearTimeout(next);
    if (auto && settled && visible && !held && !document.hidden) next = setTimeout(() => show((current + 1) % scenarios.length, true), 4500);
  };

  const show = (index, animate) => {
    const s = scenarios[index];
    const id = ++run;
    const live = () => id === run;
    const at = (ms, fn) => setTimeout(() => { if (live()) fn(); }, ms);
    const draw = draws(index);
    /* The audience narrows in three passes, one per criterion, down to the final share. */
    const levels = [s.share + 0.38, s.share + 0.16, s.share];
    const sizes = levels.map((l, k) => (k === 2 ? s.count : Math.round((s.count * l) / s.share / 1000) * 1000));
    current = index;
    settled = false;
    clearTimeout(next);
    tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === index)));
    panel.style.setProperty('--accent', s.accent);
    whoEl.textContent = s.who;
    criteriaEl.innerHTML = s.criteria.map((c) => `<li${animate ? '' : ' class="on"'}>${c}</li>`).join('');
    sendEl.innerHTML = s.send.map(([file, name], k) => `<li style="--k:${k}"><img src="${base}${file}.png" width="24" height="24" alt="${name}"></li>`).join('');
    const paint = (level, delay) => cells.forEach((c, i) => {
      c.style.transitionDelay = `${Math.round(delay(i))}ms`;
      c.classList.toggle('in', draw[i] < level);
    });
    const done = () => { settled = true; plan(); };
    if (!animate) {
      panel.classList.remove('is-pending', 'is-typing', 'is-building');
      requestEl.textContent = s.ask;
      paint(levels[2], () => 0);
      shown = s.count;
      countEl.textContent = fmt(shown);
      return done();
    }
    const countTo = (target, dur) => {
      const from = shown;
      const start = performance.now();
      const tick = (now) => {
        if (!live()) return;
        const p = Math.min(1, (now - start) / dur);
        shown = from + (target - from) * (1 - (1 - p) ** 3);
        countEl.textContent = fmt(shown);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    paint(0, () => 0);
    panel.classList.add('is-pending', 'is-typing', 'is-building');
    requestEl.textContent = '';
    shown = 0;
    countEl.textContent = '0';
    const cols = getComputedStyle(dots).gridTemplateColumns.split(' ').length;
    const pass = (k) => {
      criteriaEl.children[k].classList.add('on');
      /* First pass sweeps in from the left; the next two let squares drop out in no order. */
      paint(levels[k], k === 0 ? (i) => ((i % cols) / cols) * 450 + draw[i] * 120 : (i) => ((draw[i] * 977) % 1) * 260);
      countTo(sizes[k], 600);
    };
    let i = 0;
    const type = setInterval(() => {
      if (!live()) return clearInterval(type);
      requestEl.textContent = s.ask.slice(0, ++i);
      if (i < s.ask.length) return;
      clearInterval(type);
      at(350, () => { panel.classList.remove('is-pending', 'is-typing'); pass(0); });
      at(1250, () => pass(1));
      at(2050, () => pass(2));
      at(2850, () => panel.classList.remove('is-building'));
      at(3400, done);
    }, 22);
  };

  tabs.forEach((t, k) => t.addEventListener('click', () => {
    auto = false;
    body.setAttribute('aria-live', 'polite');
    show(k, !calm);
  }));
  const hold = (on) => { held = on; plan(); };
  panel.addEventListener('pointerenter', () => hold(true));
  panel.addEventListener('pointerleave', () => hold(false));
  panel.addEventListener('focusin', () => hold(true));
  panel.addEventListener('focusout', () => hold(false));
  document.addEventListener('visibilitychange', plan);
  show(0, false);
  if (!calm && 'IntersectionObserver' in window) {
    let started = false;
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !started) { started = true; return show(0, true); }
      plan();
    }, { threshold: 0.4 }).observe(panel);
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
