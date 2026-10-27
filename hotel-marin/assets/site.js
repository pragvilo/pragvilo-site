// Hôtel Marin : menu mobile, ombre de l'en-tête, apparitions au défilement, visionneuse de la galerie.
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');

  // ----- Menu mobile -----
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.getElementById('menu');
  if (toggle && nav) {
    var label = toggle.querySelector('.menu-toggle__texte');
    var setOpen = function (open, returnFocus) {
      if (open) nav.setAttribute('data-open', '');
      else nav.removeAttribute('data-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = toggle.getAttribute(open ? 'data-label-close' : 'data-label-open');
      document.body.classList.toggle('menu-ouvert', open);
      // Keep keyboard and screen-reader focus inside the open panel.
      document.querySelectorAll('.skip, .bandeau, main, .site-footer').forEach(function (el) { el.inert = open; });
      if (open) {
        var first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else if (returnFocus) {
        toggle.focus();
      }
    };
    toggle.addEventListener('click', function () { setOpen(!nav.hasAttribute('data-open'), true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.hasAttribute('data-open')) setOpen(false, true);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false, false); });
    var wide = window.matchMedia('(min-width: 900px)');
    var onWide = function () { if (wide.matches) setOpen(false, false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }

  // ----- Changer de page ramène en haut -----
  // Le lecteur de la version en ligne garde parfois la position de la page quittée : chaque nouvelle page
  // repart donc du haut, ou de la section visée par le lien. En revenant en arrière, le navigateur rend
  // la position quittée ; et si la personne a déjà commencé à défiler, on ne la déplace plus.
  var entry = window.performance && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
  if (!entry || entry.type !== 'back_forward') {
    var moved = false;
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (name) {
      window.addEventListener(name, function () { moved = true; }, { once: true, passive: true });
    });
    var toStart = function () {
      var target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
    };
    toStart();
    window.addEventListener('load', function () { requestAnimationFrame(function () { if (!moved) toStart(); }); });
  }

  // ----- En-tête : une ombre dès que la page défile sous lui -----
  var header = document.querySelector('.site-header');
  if (header) {
    var shade = function () { header.classList.toggle('defile', window.scrollY > 40); };
    window.addEventListener('scroll', shade, { passive: true });
    shade();
  }

  // ----- Apparitions : chaque élément marqué apparaît une fois, en entrant à l'écran -----
  // Les volets attendent que la moitié de la fenêtre soit visible pour s'ouvrir.
  var marked = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (marked.length) {
    if (!('IntersectionObserver' in window)) {
      marked.forEach(function (el) { el.classList.add('vu'); });
    } else {
      var watch = function (threshold, margin) {
        return new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vu'); obs.unobserve(e.target); } });
        }, { threshold: threshold, rootMargin: margin });
      };
      var general = watch(0.15, '0px 0px -8% 0px');
      var shutters = watch(0.5, '0px');
      marked.forEach(function (el) { (el.getAttribute('data-reveal') === 'volets' ? shutters : general).observe(el); });
    }
  }

  // ----- Visionneuse de la galerie -----
  var dialog = document.querySelector('.visionneuse');
  var tiles = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (dialog && tiles.length && typeof dialog.showModal === 'function') {
    var img = dialog.querySelector('.visionneuse__img');
    var caption = dialog.querySelector('.visionneuse__legende');
    var counter = dialog.querySelector('.visionneuse__compteur');
    var current = 0;
    var closing = false;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    var show = function (i) {
      current = (i + tiles.length) % tiles.length;
      var tile = tiles[current];
      var thumb = tile.querySelector('img');
      img.src = tile.getAttribute('href');
      img.alt = ''; // the caption below already describes the photo
      caption.textContent = thumb ? thumb.alt : '';
      counter.textContent = (current + 1) + ' / ' + tiles.length;
    };
    var open = function (i) {
      show(i);
      dialog.classList.remove('visionneuse--ferme');
      dialog.showModal();
    };
    var close = function () {
      if (closing || !dialog.open) return;
      var finish = function () {
        closing = false;
        dialog.classList.remove('visionneuse--ferme');
        dialog.close();
        tiles[current].focus();
      };
      if (reduce.matches) { finish(); return; }
      closing = true;
      dialog.classList.add('visionneuse--ferme');
      setTimeout(finish, 160);
    };

    tiles.forEach(function (tile, i) {
      tile.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        open(i);
      });
    });
    dialog.querySelector('.visionneuse__precedent').addEventListener('click', function () { show(current - 1); });
    dialog.querySelector('.visionneuse__suivant').addEventListener('click', function () { show(current + 1); });
    dialog.querySelector('.visionneuse__fermer').addEventListener('click', close);
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
    // Clic sur le fond : fermer.
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });

    // Glisser au doigt : distance ou vitesse suffisent.
    var startX = null, startT = 0;
    dialog.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') { startX = e.clientX; startT = Date.now(); } });
    dialog.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      var v = Math.abs(dx) / Math.max(1, Date.now() - startT);
      startX = null;
      if (Math.abs(dx) > 50 || (Math.abs(dx) > 10 && v > 0.11)) show(current + (dx < 0 ? 1 : -1));
    });
  }
})();
