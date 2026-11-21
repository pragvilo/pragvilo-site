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

  function focusDemoStep(heading) {
    heading.focus({preventScroll:true});
    const bounds = heading.getBoundingClientRect();
    if (bounds.top < $('.header').getBoundingClientRect().bottom || bounds.bottom > window.innerHeight) {
      heading.scrollIntoView({block:'center'});
    }
  }

  function setupAudienceDemo() {
    const demo = $('#audience-agent');
    const examples = [
      {count:250000,role:'Audience manager',request:'Bring back viewers who haven’t watched in six months.',sector:'media',name:'Viewers to reconnect with',group:'Registered viewers',history:'No viewing in 6 months',summary:'Registered viewers with no viewing in six months and permission to receive marketing.'},
      {count:480000,role:'Retail media manager',request:'Help me reach loyalty members who shop in store.',sector:'retail',name:'Your in-store shoppers',group:'Loyalty members',history:'An in-store purchase',summary:'Loyalty members with an in-store purchase and permission to receive marketing.'},
      {count:140000,role:'CRM manager',request:'Bring back customers who haven’t shopped in six months.',sector:'brands',name:'Customers to reconnect with',group:'Existing customers',history:'No purchase in 6 months',summary:'Customers with no purchase in six months and permission to receive marketing.'}
    ];
    let selectedByVisitor=null;
    const formatAudience=count=>new Intl.NumberFormat('fr-FR').format(count).replace(/\u202f/g,' ');
    function showExample(moment) {
      if (!moment || !Number.isInteger(moment.index) || !examples[moment.index] || !['request','rules','created'].includes(moment.step)) return;
      const brief=examples[moment.index];
      demo.dataset.example=String(moment.index);
      demo.dataset.step=moment.step;
      demo.dataset.sector=brief.sector;
      demo.querySelectorAll('[data-agent-example]').forEach((item,index)=>{
        item.classList.toggle('is-active',index===moment.index);
        item.setAttribute('aria-pressed',String(index===moment.index));
      });
      $('#agent-count').textContent=formatAudience(brief.count);
      $('#agent-writer').textContent=brief.role+' writes';
      $('#agent-request-accessible').textContent=brief.request;
      const writing=moment.step==='request'?(moment.writing??0):1;
      $('#agent-request').textContent=brief.request.slice(0,Math.round(brief.request.length*writing));
      demo.querySelector('.agent-criteria').setAttribute('aria-hidden',String(moment.step==='request'));
      demo.querySelector('.audience-count').setAttribute('aria-hidden',String(moment.step==='request'));
      if(moment.step==='created'&&selectedByVisitor===moment.index){
        $('#agent-selection-status').textContent=brief.name+'. Suggested criteria: '+brief.group+', '+brief.history+', marketing consent. Illustrative audience: '+formatAudience(brief.count)+' people.';
        selectedByVisitor=null;
      }
      $('#agent-audience-sector').textContent=['TV & media','Retail','Brands'][moment.index];
      demo.querySelector('[data-audience-fallback]').src='/mediarithmics-structure/assets/audience-'+brief.sector+'.svg';
      $('#agent-group').textContent=brief.group;
      $('#agent-history').textContent=brief.history;
      $('#agent-name').textContent=brief.name;
      $('#agent-summary').textContent=brief.summary;
      $('#agent-match-state').textContent=moment.step==='created'?'People matching your criteria':moment.step==='rules'?'Checking the suggested criteria':'Writing your request…';
    }
    demo.addEventListener('mics:audience-tick',event=>showExample(event.detail));
    demo.querySelectorAll('[data-agent-example]').forEach(button=>button.addEventListener('click',()=>{
      const index=Number(button.dataset.agentExample);
      // Works even if the animation bundle fails or reduced motion is enabled.
      selectedByVisitor=index;
      if(!demo.querySelector('[data-motion-kind="audience"]')?.hasAttribute('data-ready')) showExample({index,step:'created'});
      demo.dispatchEvent(new CustomEvent('mics:audience-select',{detail:{index}}));
    }));
    const host=demo.querySelector('[data-motion-kind="audience"]');
    showExample({index:Number(host?.dataset.example||0),step:host?.dataset.step||'created'});
    demo.dataset.ready='';
  }

  function setupRetailTrace() {
    const trace = $('#click-to-store');
    const clickButton = $('#record-click');
    const purchaseButton = $('#record-purchase');
    const checkout = $('#checkout-card');
    const retry = $('#reset-trace');
    const result = $('#trace-result');
    const mobile = window.matchMedia('(max-width:760px)');
    const cards = [...trace.querySelectorAll('.trace-card')];
    let currentState = 'idle';
    function syncCards() {
      const step = currentState === 'idle' ? 0 : currentState === 'clicked' ? 1 : 2;
      const focusedCard = cards.findIndex(card => card.contains(document.activeElement));
      cards.forEach((card, index) => {card.hidden = mobile.matches && index !== step;});
      $('#trace-step-number').textContent = String(step + 1);
      $('#trace-step-name').textContent = '· ' + ['Ad click', 'Store receipt', 'Campaign report'][step];
      if (mobile.matches && focusedCard >= 0 && focusedCard !== step) cards[step].querySelector('h5').focus({preventScroll:true});
    }
    mobile.addEventListener('change', syncCards);
    const detail = $('#trace-detail');
    const reports = {
      idle: ['Waiting for an ad click','Click the example ad to start following this shopper.'],
      clicked: ['Waiting for a store receipt','The campaign click is recorded. Choose how the shopper checks out, then record their purchase.'],
      matched: [result.textContent, detail.textContent],
      unmatched: ['Unmatched store sale','The purchase is recorded without the loyalty account used online. The retailer sees a sale, but cannot link this receipt to the ad click.']
    };
    function render(state) {
      currentState = state;
      const clicked = state !== 'idle';
      const complete = state === 'matched' || state === 'unmatched';
      trace.dataset.state = state;
      clickButton.disabled = clicked;
      checkout.disabled = purchaseButton.disabled = state !== 'clicked';
      retry.hidden = !complete;
      clickButton.querySelector('span').textContent = clicked ? 'Click recorded' : 'Click the example ad';
      purchaseButton.querySelector('span').textContent = complete ? 'Purchase recorded' : 'Record the purchase';
      icon(clickButton, clicked ? 'check' : 'arrow');
      icon(purchaseButton, complete ? 'check' : 'arrow');
      $('#click-event').toggleAttribute('data-recorded',clicked);
      $('#purchase-event').toggleAttribute('data-recorded',complete);
      $('#report-event').toggleAttribute('data-recorded',complete);
      [result.textContent, detail.textContent] = reports[state];
      syncCards();
    }
    clickButton.addEventListener('click', () => {
      render('clicked');
      focusDemoStep($('#purchase-event h5'));
    });
    purchaseButton.addEventListener('click', () => {
      render(checkout.value);
      if (canAnimate()) {
        gsap.fromTo(result.parentElement, {opacity:.65, y:3}, {opacity:1, y:0, duration:.18, ease, overwrite:true, clearProps:'transform,opacity'});
      }
      focusDemoStep(result);
    });
    retry.addEventListener('click', () => {
      checkout.value = trace.dataset.state === 'matched' ? 'unmatched' : 'matched';
      render('clicked');
      focusDemoStep(checkout);
    });
    $('#restart-trace').addEventListener('click', () => {
      checkout.value = 'matched';
      render('idle');
      focusDemoStep($('#click-event h5'));
    });
    checkout.value = 'matched';
    render('idle');
    trace.dataset.ready = '';
  }
  setupAudienceDemo();
  setupRetailTrace();

  const agent = $('#audience-agent');
  const sectorLink = $('#use-case-link');
  const sectorPaths = [
    {panel: $('#broadcast'), label: 'TV & media', sector: 'media'},
    {panel: $('#retail'), label: 'retail media', sector: 'retail'},
    {panel: $('#brands'), label: 'consumer brands', sector: 'brands'}
  ];
  const stories = $('#audiences');
  let pinnedPath = null;

  function displayPath(path) {
    sectorPaths.forEach(({panel}) => { panel.hidden = panel !== path.panel; });
  }

  function followExample(index) {
    const path = sectorPaths[index];
    if (!path) return;
    const href = '#' + path.panel.id;
    if (sectorLink.getAttribute('href') !== href) {
      sectorLink.setAttribute('href', href);
      sectorLink.querySelector('span').textContent = 'Explore the ' + path.label + ' use case';
    }
    // Keep a story stable while the visitor reads it or uses the retail walkthrough.
    if (!pinnedPath && path.panel.hidden && !stories.contains(document.activeElement) &&
        stories.getBoundingClientRect().top >= window.innerHeight) displayPath(path);
  }

  agent.addEventListener('mics:audience-tick', event => followExample(event.detail.index));
  agent.addEventListener('mics:audience-select', event => {
    pinnedPath = sectorPaths[event.detail.index];
    if (!pinnedPath) return;
    followExample(event.detail.index);
    displayPath(pinnedPath);
  });
  followExample(Number(agent.dataset.example));

  function openSector(hash, focus) {
    const target = document.getElementById(hash.slice(1));
    const path = sectorPaths.find(({panel}) => panel.contains(target));
    if (!path) return;
    pinnedPath = path;
    displayPath(path);
    if (agent.dataset.sector !== path.sector) {
      agent.querySelector('button[data-sector="' + path.sector + '"]').click();
    }
    const disclosure = target.closest('details');
    if (disclosure) disclosure.open = true;
    if (focus) path.panel.focus({preventScroll:true});
    target.scrollIntoView({block:'start'});
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target?.closest('.sector')) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    openSector(link.hash, true);
  });
  window.addEventListener('hashchange', () => openSector(location.hash, true));
  if (location.hash) openSector(location.hash, false);

  const notes = $('#review-dialog');
  const demoDialog = $('#demo-dialog');
  function notifyDialog() {document.dispatchEvent(new Event('mics:dialog'));}
  function openDialog(dialog) {
    dialog.showModal();
    notifyDialog();
  }
  $('#open-notes').addEventListener('click', () => openDialog(notes));
  for (const dialog of [notes,demoDialog]) {
    dialog.addEventListener('close', notifyDialog);
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close();
    });
  }


  const demoForm = $('#demo-form');
  const confirmation = $('#demo-confirmation');
  const demoFields = ['name', 'email', 'interest'].map(name => $('#demo-' + name));
  const errors = {
    name:'Enter your name to preview the request.',
    email:'Enter a valid email address, such as alex@example.com.',
    interest:'Choose a topic for this example.'
  };
  function validateField(field) {
    const valid = field.value.trim() !== '' && !(field.type === 'email' && field.validity.typeMismatch);
    field.setAttribute('aria-invalid', String(!valid));
    $('#' + field.id + '-error').textContent = valid ? '' : errors[field.name];
    return valid;
  }
  $$('[data-demo-open]').forEach(button => button.addEventListener('click', () => {
    openDialog(demoDialog);
    $('#demo-name').focus({preventScroll:true});
  }));
  demoFields.forEach(field => field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(field);
  }));
  demoForm.addEventListener('submit', event => {
    event.preventDefault();
    const invalid = demoFields.filter(field => !validateField(field));
    if (invalid.length) {invalid[0].focus(); return;}
    $('#request-name').textContent = $('#demo-name').value.trim();
    $('#request-email').textContent = $('#demo-email').value.trim();
    $('#request-topic').textContent = $('#demo-interest').value;
    demoForm.hidden = true;
    confirmation.hidden = false;
    $('#demo-confirmation-title').focus();
  });
  $('#edit-request').addEventListener('click', () => {
    confirmation.hidden = true;
    demoForm.hidden = false;
    $('#demo-name').focus();
  });
  demoDialog.addEventListener('close', () => {
    demoForm.reset();
    demoForm.hidden = false;
    confirmation.hidden = true;
    demoFields.forEach(field => {
      field.removeAttribute('aria-invalid');
      $('#' + field.id + '-error').textContent = '';
    });
    ['name','email','topic'].forEach(name => {$('#request-' + name).textContent = '';});
  });

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
