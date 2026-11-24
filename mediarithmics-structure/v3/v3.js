(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-navigation');
  const groups = [...document.querySelectorAll('.nav-group')];
  const closeMenus = () => groups.forEach(group => { group.open = false; });
  const closeNavigation = (restoreFocus = false) => {
    navigation.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    closeMenus();
    if (restoreFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    navigation.classList.toggle('is-open', expanded);
    if (!expanded) closeMenus();
  });
  groups.forEach(group => {
    group.addEventListener('toggle', () => {
      if (group.open) groups.filter(other => other !== group).forEach(other => { other.open = false; });
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeNavigation();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openGroup = groups.find(group => group.open);
    if (openGroup) {
      openGroup.open = false;
      openGroup.querySelector('summary').focus();
    } else if (toggle.getAttribute('aria-expanded') === 'true') closeNavigation(true);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeNavigation()));
  const wideScreen = matchMedia('(min-width: 901px)');
  wideScreen.addEventListener('change', () => closeNavigation());

  const examples = {
    media: {
      question: '“Bring back viewers who haven’t watched in six months.”',
      criteria: ['Registered viewers', 'No viewing in 6 months', 'Marketing consent'],
      name: 'Viewers to reconnect with',
      selected: [1, 3, 6, 7, 11, 12, 13, 16, 17, 21, 23]
    },
    retail: {
      question: '“Reach loyalty members who shop in store.”',
      criteria: ['Loyalty members', 'In-store purchase', 'Marketing consent'],
      name: 'In-store shoppers',
      selected: [0, 2, 4, 5, 6, 8, 10, 11, 12, 15, 17, 19, 20, 22, 24]
    },
    brands: {
      question: '“Bring back customers who haven’t shopped in six months.”',
      criteria: ['Known customers', 'No purchase in 6 months', 'Marketing consent'],
      name: 'Customers to reconnect with',
      selected: [2, 6, 7, 8, 11, 12, 13, 17, 22]
    }
  };
  const buttons = [...document.querySelectorAll('[data-example]')];
  const result = document.querySelector('#example-result');
  const dots = document.querySelector('.audience-dots');
  const dotElements = Array.from({ length: 25 }, () => {
    const dot = document.createElement('i');
    dots.append(dot);
    return dot;
  });
  const renderExample = key => {
    const example = examples[key];
    if (!example) return;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.example === key)));
    result.dataset.sector = key;
    document.querySelector('#example-question').textContent = example.question;
    document.querySelector('#example-name').textContent = example.name;
    const criteria = document.querySelector('#example-criteria');
    criteria.replaceChildren(...example.criteria.map((text, index) => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.className = 'criterion-label';
      label.textContent = ['People', 'Activity', 'Permission'][index];
      const value = document.createElement('span');
      value.textContent = text;
      item.append(label, value);
      return item;
    }));
    dotElements.forEach((dot, index) => dot.classList.toggle('is-selected', example.selected.includes(index)));
  };
  buttons.forEach(button => button.addEventListener('click', () => renderExample(button.dataset.example)));
  renderExample('media');
})();
