/* Audience pages: mobile menu and review notes toggle (same stored choice as the homepage). */
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('navigation');
  const menu = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    toggle.querySelector('use').setAttribute('href', open ? '#close' : '#menu');
  };
  toggle.addEventListener('click', () => menu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', () => menu(false));

  const notes = document.querySelector('[data-notes-toggle]');
  const set = (shown, remember) => {
    document.documentElement.classList.toggle('notes-off', !shown);
    notes.setAttribute('aria-pressed', String(shown));
    notes.querySelector('[data-notes-label]').textContent = shown ? 'Hide notes' : 'Show notes';
    if (remember) { try { localStorage.setItem('review-notes', shown ? 'on' : 'off'); } catch (e) {} }
  };
  let stored = null;
  try { stored = localStorage.getItem('review-notes'); } catch (e) {}
  set(stored !== 'off', false);
  notes.addEventListener('click', () => set(notes.getAttribute('aria-pressed') !== 'true', true));
})();
