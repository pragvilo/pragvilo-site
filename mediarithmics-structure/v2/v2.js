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
    [...list.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); list.appendChild(c); });
    marquee.classList.add('is-live');
  }

  const base = '/mediarithmics-structure/assets/connectors/';
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
})();
