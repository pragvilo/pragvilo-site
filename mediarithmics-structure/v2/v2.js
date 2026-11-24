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
  /* Desktop: open on hover too, with a short grace delay so the pointer can reach the panel */
  const wide = matchMedia('(min-width:1121px) and (hover:hover)');
  let hoverTimer, hoverAt = 0;
  document.querySelectorAll('.has-sub').forEach((li) => {
    const b = li.querySelector(':scope > button');
    li.addEventListener('mouseenter', () => {
      if (!wide.matches) return;
      clearTimeout(hoverTimer);
      const anyOpen = subs.some((x) => x.getAttribute('aria-expanded') === 'true');
      hoverTimer = setTimeout(() => { closeSubs(b); b.setAttribute('aria-expanded', 'true'); hoverAt = Date.now(); }, anyOpen ? 0 : 90);
    });
    li.addEventListener('mouseleave', () => {
      if (!wide.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => b.setAttribute('aria-expanded', 'false'), 220);
    });
    /* Close when keyboard focus leaves the item */
    li.addEventListener('focusout', (e) => { if (wide.matches && !li.contains(e.relatedTarget)) b.setAttribute('aria-expanded', 'false'); });
  });
  /* A click right after a hover-open keeps the panel open instead of closing it */
  subs.forEach((b) => b.addEventListener('click', (e) => {
    if (wide.matches && Date.now() - hoverAt < 450) { e.stopImmediatePropagation(); b.setAttribute('aria-expanded', 'true'); }
  }, true));

  /* Phone and tablet: full-height panel, page locked behind it */
  const label = toggle.querySelector('.menu-label');
  const setMenu = (open) => {
    if (open) document.documentElement.style.setProperty('--header-h', document.querySelector('.header').offsetHeight + 'px');
    nav.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (label) label.textContent = open ? 'Close' : 'Menu';
    if (!open) closeSubs();
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); toggle.focus(); } });
  matchMedia('(min-width:1121px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

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

  /* Audience example: anonymous profiles as small people. Three illustrative requests, one per industry. */
  const base = '/mediarithmics-structure/assets/connectors/';
  const scenarios = [
    { who: 'Audience manager, TV & media', ask: 'Bring back viewers who haven’t watched in six months.', marks: ['viewers', 'haven’t watched in six months'], criteria: ['Registered viewers', 'No viewing in 6 months', 'Marketing consent'], count: 250000, accent: 'var(--cyan)', send: [['freewheel', 'FreeWheel'], ['the-trade-desk', 'The Trade Desk'], ['google', 'Google']] },
    { who: 'CRM manager, retail', ask: 'Find loyalty members who bought a TV more than five years ago.', marks: ['loyalty members', 'bought a TV more than five years ago'], criteria: ['Loyalty members', 'TV bought over 5 years ago', 'Marketing consent'], count: 410000, accent: 'var(--coral)', send: [['meta', 'Meta'], ['criteo', 'Criteo'], ['brevo', 'Brevo']] },
    { who: 'Media manager, consumer brand', ask: 'Reach shoppers who bought our brand at a partner retailer.', marks: ['at a partner retailer', 'bought our brand'], criteria: ['Partner retailer’s shoppers', 'Bought the brand in 12 months', 'Marketing consent'], count: 180000, accent: 'var(--green)', send: [['amazon-ads', 'Amazon Ads'], ['the-trade-desk', 'The Trade Desk'], ['tiktok', 'TikTok']] },
  ];
  const panel = document.querySelector('[data-audience]');
  const body = panel.querySelector('[data-body]');
  const dots = panel.querySelector('[data-dots]');
  const requestEl = panel.querySelector('[data-request]');
  const criteriaEl = panel.querySelector('[data-criteria]');
  const countEl = panel.querySelector('[data-count]');
  const sendEl = panel.querySelector('[data-send]');
  const tabs = [...panel.querySelectorAll('[data-scenarios] button')];
  /* A crowd seen from above: each person has a home on a loose grid and a size of their own.
     The criteria only light people up where they stand; they gather into one group at the end, each in a place of their own, never on top of each other. */
  const SVG = 'http://www.w3.org/2000/svg';
  const PERSON = '<circle cx="5" cy="3.2" r="2.5"/><path d="M.6 13c0-4.1 1.9-6.3 4.4-6.3S9.4 8.9 9.4 13z"/>';
  const cells = [];
  const looks = [];
  let lookSeed = 3;
  const rnd = () => (lookSeed = (lookSeed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 168; i++) {
    const c = document.createElementNS(SVG, 'svg');
    const size = 11 + rnd() * 6;
    c.setAttribute('viewBox', '0 0 10 13');
    c.innerHTML = PERSON;
    c.style.width = `${size}px`;
    c.style.height = `${size * 1.3}px`;
    dots.appendChild(c);
    cells.push(c);
    looks.push({ w: size, h: size * 1.3, u: (rnd() - 0.5) * 0.35, v: (rnd() - 0.5) * 0.3 });
  }
  /* Places for the group: staggered rows around the centre, nearest first, the group half again as wide as it is tall. */
  const WIDE = 1.5;
  const far = (x, y) => Math.hypot(x / WIDE, y);
  const turn = (x, y) => Math.atan2(y, x / WIDE);
  const places = [];
  for (let j = -7; j <= 7; j++) for (let k = -16; k <= 16; k++) places.push({ x: k * 21 + (j & 1 ? 10.5 : 0), y: j * 26 });
  places.sort((a, b) => far(a.x, a.y) - far(b.x, b.y));
  const crowd = (draw, keep, gathered) => {
    const W = dots.clientWidth;
    const H = dots.clientHeight;
    const cols = W < 520 ? 12 : 24;
    const rows = W < 520 ? 6 : 7;
    const n = cols * rows;
    const cx = W / 2;
    const cy = H / 2;
    const at = cells.map((c, i) => ({ x: ((i % cols) + 0.5 + looks[i].u) / cols * W, y: (Math.floor(i / cols) + 0.5 + looks[i].v) / rows * H }));
    const group = gathered ? cells.map((c, i) => i).filter((i) => i < n && draw[i] < keep) : [];
    const used = places.slice(0, group.length);
    const reach = used.reduce((m, p) => Math.max(m, far(p.x, p.y)), 0);
    /* Places are handed out by angle, so everyone takes the short way in. */
    group.sort((a, b) => turn(at[a].x - cx, at[a].y - cy) - turn(at[b].x - cx, at[b].y - cy));
    used.sort((a, b) => turn(a.x, a.y) - turn(b.x, b.y));
    group.forEach((i, k) => { at[i] = { x: cx + used[k].x, y: cy + used[k].y }; });
    cells.forEach((c, i) => {
      c.style.display = i < n ? '' : 'none';
      c.style.transform = `translate(${at[i].x - looks[i].w / 2}px,${at[i].y - looks[i].h / 2}px)`;
      c.dataset.x = Math.round(at[i].x);
      /* Those left behind inside the group's area step out of sight, so nobody overlaps. */
      c.classList.toggle('gone', gathered && !(draw[i] < keep) && far(at[i].x - cx, at[i].y - cy) < reach + 22);
    });
  };
  /* The light that carries the audience to its destinations. */
  const beam = document.createElementNS(SVG, 'svg');
  beam.setAttribute('class', 'beam');
  beam.setAttribute('aria-hidden', 'true');
  beam.innerHTML = '<path class="trail"/><path class="spark"/>';
  panel.appendChild(beam);
  const [trail, spark] = beam.children;
  const dim = () => [trail, spark].forEach((p) => p.getAnimations().forEach((a) => a.cancel()));
  const travel = (fromX) => {
    const f = panel.getBoundingClientRect();
    const d = dots.getBoundingClientRect();
    const t = sendEl.getBoundingClientRect();
    const sx = d.left - f.left + fromX + 12;
    const sy = d.top - f.top + d.height / 2;
    const ex = t.left - f.left + t.width / 2;
    const ey = t.top - f.top - 4;
    const path = `M${sx} ${sy} C${sx + (ex - sx) * 0.9} ${sy} ${ex} ${sy + (ey - sy) * 0.3} ${ex} ${ey}`;
    trail.setAttribute('d', path);
    spark.setAttribute('d', path);
    const L = trail.getTotalLength();
    trail.style.strokeDasharray = L;
    spark.style.strokeDasharray = `18 ${L}`;
    trail.animate([{ strokeDashoffset: L, opacity: 0.8 }, { strokeDashoffset: 0, opacity: 0.8, offset: 0.7 }, { strokeDashoffset: 0, opacity: 0 }], { duration: 1200, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' });
    spark.animate([{ strokeDashoffset: 18, opacity: 1 }, { strokeDashoffset: -L, opacity: 1, offset: 0.95 }, { strokeDashoffset: -L, opacity: 0 }], { duration: 750, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
  };
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  /* One fixed draw per square and per scenario: the lower the draw, the longer the profile stays in. */
  const draws = (index) => {
    let seed = 7 + index * 131;
    return cells.map(() => (seed = (seed * 16807) % 2147483647) / 2147483647);
  };
  let run = 0;
  let current = 0;
  let shown = 0;
  /* The three examples play in turn until the visitor picks one. Paused off screen and while the keyboard focus is inside. */
  let auto = !calm;
  let settled = false;
  let visible = false;
  let held = false;
  let next = 0;
  const plan = () => {
    clearTimeout(next);
    const go = auto && settled && visible && !held && !document.hidden;
    panel.classList.toggle('is-counting', go);
    if (go) next = setTimeout(() => show((current + 1) % scenarios.length, true), 4500);
  };

  let lastWidth = 0;
  addEventListener('resize', () => {
    if (dots.clientWidth === lastWidth) return;
    lastWidth = dots.clientWidth;
    const gathered = dots.classList.contains('is-grouped');
    crowd(draws(current), gathered ? scenarios[current].count / 1e6 : 0, gathered);
  });
  const show = (index, animate) => {
    const s = scenarios[index];
    const id = ++run;
    const live = () => id === run;
    const at = (ms, fn) => setTimeout(() => { if (live()) fn(); }, ms);
    const draw = draws(index);
    /* The audience narrows in three passes, one per criterion, down to the final share. */
    /* The whole grid stands for one million profiles, so the three blocks compare with each other. */
    const share = s.count / 1e6;
    const levels = [share + 0.38, share + 0.16, share];
    const sizes = levels.map((l) => Math.round(l * 1e6));
    current = index;
    settled = false;
    clearTimeout(next);
    panel.classList.remove('is-counting');
    tabs.forEach((t, k) => t.setAttribute('aria-pressed', String(k === index)));
    panel.style.setProperty('--accent', s.accent);
    criteriaEl.innerHTML = s.criteria.map((c) => `<li${animate ? '' : ' class="on"'}>${c}</li>`).join('');
    sendEl.innerHTML = s.send.map(([file, name], k) => `<li style="--k:${k}"><img src="${base}${file}.png" width="24" height="24" alt="${name}"></li>`).join('');
    const paint = (level, delay) => cells.forEach((c, i) => {
      c.style.transitionDelay = `${Math.round(delay(i))}ms`;
      c.classList.toggle('in', draw[i] < level);
    });
    const done = () => { settled = true; plan(); };
    /* The request with the words each segment comes from wrapped in a mark, lit or not. */
    const marked = (lit) => s.marks.reduce((html, m, k) => html.replace(m, `<mark data-k="${k}"${lit ? ' class="on"' : ''}>${m}</mark>`), s.ask);
    const cols = dots.clientWidth < 520 ? 12 : 24;
    /* The people who remain gather into one group, each in a place of their own. */
    const group = () => {
      cells.forEach((c, i) => { c.style.transitionDelay = `${Math.round(draw[i] * 200)}ms`; });
      dots.classList.add('is-grouped');
      crowd(draw, levels[2], true);
    };
    const ungroup = () => {
      dim();
      dots.classList.remove('is-grouped', 'is-sent');
      crowd(draw, 0, false);
    };
    /* A wave of light crosses the group from left to right, then leaves it for the destinations. */
    const sent = () => {
      const kept = cells.filter((c) => c.style.display !== 'none' && c.classList.contains('in'));
      const xs = kept.map((c) => +c.dataset.x);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs);
      kept.forEach((c) => { c.style.animationDelay = `${Math.round(((c.dataset.x - x0) / (x1 - x0 || 1)) * 450)}ms`; });
      dots.classList.add('is-sent');
      at(450, () => travel(x1));
    };
    if (!animate) {
      panel.classList.remove('is-pending', 'is-typing', 'is-building');
      requestEl.innerHTML = marked(true);
      ungroup();
      paint(levels[2], () => 0);
      group();
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
    at(400, ungroup);
    panel.classList.add('is-pending', 'is-typing', 'is-building');
    requestEl.textContent = '';
    shown = 0;
    countEl.textContent = '0';
    /* A pass: the words light up first, then their segment appears and the grid narrows. */
    const pass = (k) => {
      const mark = requestEl.querySelector(`[data-k="${k}"]`);
      if (mark) mark.classList.add('on');
      at(mark ? 320 : 0, () => narrow(k));
    };
    const narrow = (k) => {
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
      at(450, () => { requestEl.innerHTML = marked(false); panel.classList.remove('is-pending', 'is-typing'); requestEl.offsetWidth; pass(0); });
      at(1750, () => pass(1));
      at(3270, () => pass(2));
      at(4350, group);
      at(5500, sent);
      at(6400, () => panel.classList.remove('is-building'));
      at(7000, done);
    }, 22);
  };

  tabs.forEach((t, k) => t.addEventListener('click', () => {
    auto = false;
    body.setAttribute('aria-live', 'polite');
    show(k, !calm);
  }));
  const hold = (on) => { held = on; plan(); };
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
    }, { threshold: Math.min(0.5, (innerHeight * 0.6) / panel.offsetHeight) }).observe(panel);
  }

  /* Products: a tab scrolls the page to the point where its panel sits on top of the stack */
  const stack = document.querySelector('[data-stack]');
  if (stack) {
    const panels = [...stack.querySelectorAll('.panel')];
    panels.forEach((panel, k) => panel.querySelector('.panel-tab button').addEventListener('click', () => {
      if (getComputedStyle(panel).position !== 'sticky') return panel.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
      const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
      const natural = stack.getBoundingClientRect().top + scrollY + panels.slice(0, k).reduce((sum, p) => sum + p.offsetHeight + gap, 0);
      scrollTo({ top: natural - parseFloat(getComputedStyle(panel).top), behavior: calm ? 'auto' : 'smooth' });
    }));

    /* The panel on top keeps the strong border; a panel more than half covered steps back to the deep surface */
    const tab = parseFloat(getComputedStyle(stack).getPropertyValue('--tab')) || 56;
    /* Height differences with the last panel, so the four are released on the same line whatever their copy length */
    const level = () => {
      const last = panels[panels.length - 1].offsetHeight;
      panels.forEach((p, k) => {
        p.style.setProperty('--dh', `${last - p.offsetHeight}px`);
        if (k) p.style.setProperty('--dh-prev', `${last - panels[k - 1].offsetHeight}px`);
      });
    };
    level();
    addEventListener('resize', level);
    addEventListener('load', level);
    let queued = false;
    const mark = () => {
      queued = false;
      const stuck = getComputedStyle(panels[0]).position === 'sticky';
      let front = -1;
      panels.forEach((p, k) => {
        const next = panels[k + 1];
        const covered = stuck && !!next && next.getBoundingClientRect().top - p.getBoundingClientRect().top <= tab + (p.offsetHeight - tab) / 2;
        p.classList.toggle('is-covered', covered);
        if (!covered && front < 0) front = k;
      });
      panels.forEach((p, k) => p.classList.toggle('is-front', stuck && k === front));
    };
    const ask = () => { if (!queued) { queued = true; requestAnimationFrame(mark); } };
    addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask);
    mark();

    /* Each image fades in once, when its panel comes into view. Skipped with reduced motion. */
    if (!calm && 'IntersectionObserver' in window) {
      stack.classList.add('is-revealing');
      const shown = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        shown.unobserve(e.target);
      }), { threshold: .2 });
      stack.querySelectorAll('.panel-art').forEach((art) => shown.observe(art));
    }
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
  /* Flow, once, after the cascade: a line leaves "Your audience" for each large tile, a dot rides it, the tile lights up on arrival.
     Lines only travel in the gaps between tiles, never over a logo: the route is searched on the grid of gutters, where a large tile blocks the gutters it spans.
     Geometry is read when it starts, so it follows the layout: from the side on desktop, from above when the wall sits under the text. */
  const flow = () => {
    const source = document.querySelector('[data-flow-source]');
    const frame = wall.closest('.split');
    const targets = [...wall.querySelectorAll('li.big')];
    const unit = wall.querySelector('li:not(.big)');
    if (!source || !frame || !targets.length || !unit) return;
    const ns = 'http://www.w3.org/2000/svg';
    const box = frame.getBoundingClientRect();
    const area = wall.getBoundingClientRect();
    const from = source.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(wall).columnGap) || 8;
    const pitch = unit.getBoundingClientRect().width + gap;
    const nx = Math.round((area.width + gap) / pitch);
    const ny = Math.round((area.height + gap) / pitch);
    const gx = (c) => area.left - gap / 2 + c * pitch;
    const gy = (r) => area.top - gap / 2 + r * pitch;
    const tiles = [...wall.children].map((li) => li.getBoundingClientRect());
    const free = (x, y) => !tiles.some((t) => x > t.left + 1 && x < t.right - 1 && y > t.top + 1 && y < t.bottom - 1);
    const side = area.left >= from.right;
    const clamp = (v, max) => Math.min(max, Math.max(0, v));
    const sx = side ? from.right : from.left + from.width / 2;
    const sy = side ? from.top + from.height / 2 : from.bottom;
    const c0 = side ? 0 : clamp(Math.round((sx - gx(0)) / pitch), nx);
    const r0 = side ? clamp(Math.round((sy - gy(0)) / pitch), ny) : 0;
    const lead = side ? [[sx, sy], [gx(0), sy]] : [[sx, sy], [sx, gy(0)]];
    /* Shortest route along free gutters from the entry point to the edge of a tile */
    const route = (t) => {
      const key = (c, r) => r * (nx + 1) + c;
      const prev = new Map([[key(c0, r0), null]]);
      const queue = [[c0, r0]];
      const done = (c, r) => gx(c) > t.left - gap && gx(c) < t.right + gap && gy(r) > t.top - gap && gy(r) < t.bottom + gap;
      while (queue.length) {
        const [c, r] = queue.shift();
        if (done(c, r)) {
          const pts = [];
          for (let at = [c, r]; at; at = prev.get(key(at[0], at[1]))) pts.unshift([gx(at[0]), gy(at[1])]);
          const [lx, ly] = pts[pts.length - 1];
          pts.push([Math.min(t.right, Math.max(t.left, lx)), Math.min(t.bottom, Math.max(t.top, ly))]);
          return [...lead, ...pts];
        }
        [[1, 0], [0, 1], [0, -1], [-1, 0]].forEach(([dc, dr]) => {
          const c2 = c + dc, r2 = r + dr;
          if (c2 < 0 || r2 < 0 || c2 > nx || r2 > ny || prev.has(key(c2, r2))) return;
          if (!free((gx(c) + gx(c2)) / 2, (gy(r) + gy(r2)) / 2)) return;
          prev.set(key(c2, r2), [c, r]);
          queue.push([c2, r2]);
        });
      }
      return null;
    };
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'flow');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    frame.append(svg);
    source.classList.add('is-on');
    const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const run = 1500;
    const lag = 320;
    let left = 0;
    targets.forEach((li) => {
      const pts = route(li.getBoundingClientRect());
      if (!pts) return li.classList.add('is-lit');
      const k = left++;
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', pts.map(([x, y], n) => `${n ? 'L' : 'M'}${(x - box.left).toFixed(1)} ${(y - box.top).toFixed(1)}`).join(''));
      const dot = document.createElementNS(ns, 'circle');
      dot.setAttribute('r', 3);
      svg.append(path, dot);
      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      dot.style.opacity = 0;
      const start = performance.now() + k * lag;
      const step = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / run));
        const e = ease(t);
        const p = path.getPointAtLength(len * e);
        path.style.strokeDashoffset = len * (1 - e);
        dot.setAttribute('cx', p.x);
        dot.setAttribute('cy', p.y);
        dot.style.opacity = t > 0 ? 1 : 0;
        if (t < 1) return requestAnimationFrame(step);
        li.classList.add('is-lit');
        dot.classList.add('is-done');
        /* The network stays readable for a moment after the last arrival, then fades as a whole */
        if (!--left) setTimeout(() => { svg.classList.add('is-done'); setTimeout(() => svg.remove(), 700); }, 1200);
      };
      requestAnimationFrame(step);
    });
  };

  /* Cascade, once, when the wall comes into view. Skipped with reduced motion: the wall is simply there. */
  if (!calm && 'IntersectionObserver' in window) {
    wall.classList.add('is-waiting');
    const seen = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      seen.disconnect();
      wall.classList.add('is-in');
      setTimeout(flow, 900);
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

// Notes de revue : « Show notes » affiche les post-it en surimpression, un second clic les cache.
(function(){
  var b=document.querySelector('[data-notes-btn]');if(!b)return;
  b.addEventListener('click',function(){
    var on=document.body.classList.toggle('notes-on');
    b.setAttribute('aria-pressed',on);b.textContent=on?'Hide notes':'Show notes';
  });
})();


// Post-it sans chevauchement : quand les notes sont ouvertes, une note qui toucherait la précédente descend juste en dessous.
(function(){
  var notes=[].slice.call(document.querySelectorAll('.postit'));if(!notes.length)return;
  function place(){
    if(!document.body.classList.contains('notes-on'))return;
    notes.forEach(function(n){n.style.marginTop=''});
    var bottom=-Infinity;
    notes.forEach(function(n){
      var r=n.getBoundingClientRect(),top=r.top+scrollY;
      if(top<bottom+16){n.style.marginTop=(bottom+16-top)+'px';r=n.getBoundingClientRect()}
      bottom=r.bottom+scrollY;
    });
  }
  var b=document.querySelector('[data-notes-btn]');if(b)b.addEventListener('click',function(){requestAnimationFrame(place);setTimeout(place,350)});
  var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(place,150)});
})();
