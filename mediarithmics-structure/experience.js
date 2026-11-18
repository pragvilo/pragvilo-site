(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gsap = window.gsap;
  const canAnimate = () => Boolean(gsap) && !motionPreference.matches;
  // The charter's cubic-bezier(.2,0,.2,1), as a time function for GSAP.
  function ease(progress) {
    let t = progress;
    for (let i = 0; i < 5; i++) {
      const x = t * (.6 + t * (t - .6));
      t = Math.max(0, Math.min(1, t - (x - progress) / (.6 - 1.2 * t + 3 * t * t)));
    }
    return t * t * (3 - 2 * t);
  }

  function icon(button, id) {
    button.querySelector('use').setAttribute('href', '#' + id);
  }

  const mobileMenu = $('.menu-toggle');
  const nav = $('#navigation');
  function menu(open) {
    nav.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    icon(mobileMenu, open ? 'close' : 'menu');
  }
  mobileMenu.addEventListener('click', () => menu(mobileMenu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', () => menu(false));
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !e.target.closest('.header')) menu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      menu(false);
      mobileMenu.focus();
    }
  });
  window.matchMedia('(max-width:760px)').addEventListener('change', () => menu(false));

  function setupArtwork() {
    const figure = $('.hero-figure');
    const artStage = $('.art-stage');
    const live = $('.art-live');
    const caption = $('#stage-caption');
    const buttons = $$('.steps button');
    const play = $('.art-play');
    const art = window.MicsArtwork;
    if (!art) {
      $('.art-control').hidden = true;
      return;
    }
    const stages = buttons.map((_, i) => art.makeStage(i));
    const captions = [
      'Bring scattered signals into one customer view.',
      'Find the people who belong in the same audience.',
      'Take that audience into your next campaign.'
    ];
    live.innerHTML = art.svg(0);
    const paths = [...live.querySelectorAll('path')];
    artStage.classList.add('ready');
    let current = 0;
    let playing = !motionPreference.matches;
    let visible = false;
    let focusing = false;
    let timer = 0;

    function updatePlay() {
      play.hidden = motionPreference.matches;
      play.setAttribute('aria-label', playing ? 'Pause illustration' : 'Play illustration');
      icon(play, playing ? 'pause' : 'play');
    }
    function display(index) {
      const target = stages[index];
      if (canAnimate()) {
        gsap.to(paths, {attr:{d:i => target[i].d}, duration:.22, ease, overwrite:'auto'});
        gsap.fromTo(caption, {opacity:.25, y:2}, {opacity:1, y:0, duration:.18, ease, overwrite:true});
      } else {
        paths.forEach((path, i) => path.setAttribute('d', target[i].d));
      }
      current = index;
      buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
      caption.textContent = captions[index];
    }
    function schedule() {
      window.clearTimeout(timer);
      if (!playing || !visible || focusing || document.hidden || document.querySelector('dialog[open]')) return;
      timer = window.setTimeout(() => {
        display(current + 1);
        if (current === buttons.length - 1) playing = false;
        updatePlay();
        schedule();
      }, 6200);
    }
    buttons.forEach((button, i) => button.addEventListener('click', () => {
      playing = false;
      display(i);
      updatePlay();
      schedule();
    }));
    play.addEventListener('click', () => {
      playing = !playing;
      if (playing && current === buttons.length - 1) display(0);
      updatePlay();
      // A deliberate play command should start even while the button retains focus.
      focusing = false;
      schedule();
    });
    figure.addEventListener('focusin', () => {focusing = true; schedule();});
    figure.addEventListener('focusout', e => {
      if (!figure.contains(e.relatedTarget)) {focusing = false; schedule();}
    });
    document.addEventListener('visibilitychange', schedule);
    document.addEventListener('mics:dialog', schedule);
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      schedule();
    }, {threshold:.28});
    observer.observe(figure);
    motionPreference.addEventListener('change', () => {
      if (motionPreference.matches) {
        playing = false;
        if (gsap) {
          gsap.killTweensOf(paths);
          gsap.killTweensOf(caption);
          gsap.set(caption,{clearProps:'transform,opacity'});
        }
        display(current);
      }
      updatePlay();
      schedule();
    });
    updatePlay();
  }
  setupArtwork();

  const tabs = $$('.sector-tabs [role="tab"]');
  function activateTab(tab) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      panel.hidden = !selected;
      if (selected && canAnimate()) {
        gsap.fromTo(panel.children, {opacity:.35, y:3}, {opacity:1, y:0, duration:.18, ease, overwrite:true});
      }
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', e => {
      const positions = {Home:0, End:tabs.length - 1, ArrowLeft:(i - 1 + tabs.length) % tabs.length, ArrowRight:(i + 1) % tabs.length};
      if (!(e.key in positions)) return;
      e.preventDefault();
      const next = tabs[positions[e.key]];
      next.focus();
      activateTab(next);
    });
  });
  function syncDeepLink() {
    const tab = tabs.find(t => '#' + t.getAttribute('aria-controls') === location.hash);
    if (tab) {
      activateTab(tab);
      document.getElementById(tab.getAttribute('aria-controls')).scrollIntoView({block:'start'});
    }
  }
  window.addEventListener('hashchange', syncDeepLink);
  if (location.hash) syncDeepLink();

  const notes = $('#review-dialog');
  const film = $('#film-dialog');
  const video = film.querySelector('video');
  function notifyDialog() {document.dispatchEvent(new Event('mics:dialog'));}
  function openDialog(dialog) {
    dialog.showModal();
    notifyDialog();
  }
  $('#open-notes').addEventListener('click', () => openDialog(notes));
  $('#open-film').addEventListener('click', () => {
    openDialog(film);
    if (!video.hasAttribute('src')) video.src = '/mediarithmics-structure/sources-profil.mp4';
    video.currentTime = 0;
    video.play().catch(() => {});
  });
  film.addEventListener('close', () => video.pause());
  for (const dialog of [notes,film]) {
    dialog.addEventListener('close', notifyDialog);
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close();
    });
  }

  const heading = $('#headline');
  const defaultHeadline = heading.innerHTML;
  const variants = {
    brand: defaultHeadline,
    a:'Master your customer <strong>identities.</strong> Let AI agents run your <strong class="accent">marketing.</strong>',
    b:'From campaign idea to <strong>launch,</strong> in <strong class="accent">minutes.</strong>',
    c:'The European agentic marketing platform, built on <strong class="accent">your own data.</strong>'
  };
  function setHeadline(value) {
    heading.innerHTML = variants[value];
    heading.classList.toggle('review-headline', value !== 'brand');
    $('.review-banner')?.remove();
    if (value === 'brand') return;
    const banner = document.createElement('div');
    banner.className = 'review-banner';
    banner.textContent = 'Headline preview · Option ' + value.toUpperCase() + (value === 'b' ? ' · Timing to substantiate' : '');
    const reset = document.createElement('button');
    reset.type = 'button';
    reset.textContent = 'End preview';
    reset.addEventListener('click', () => {
      notes.querySelector('[value="brand"]').checked = true;
      setHeadline('brand');
      $('#open-notes').focus({preventScroll:true});
    });
    banner.append(reset);
    $('.hero-actions').after(banner);
  }
  $('.preview-headline').addEventListener('click', () => {
    setHeadline(notes.querySelector('input:checked').value);
    notes.close();
    window.scrollTo({top:0, behavior:'instant'});
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
  });

  if (canAnimate()) {
    gsap.from('.hero-copy > *', {opacity:.15, y:4, duration:.18, stagger:.018, ease, clearProps:'transform,opacity'});
    const observed = $$('.diagram,.case-cover,.sector-image');
    const reveal = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (canAnimate()) gsap.from(entry.target, {opacity:.55, y:4, duration:.2, ease, clearProps:'transform,opacity'});
        reveal.unobserve(entry.target);
      }
    }, {threshold:.18});
    observed.forEach(item => reveal.observe(item));
  }
})();
