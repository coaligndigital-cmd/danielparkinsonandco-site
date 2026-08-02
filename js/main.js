document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const list = document.querySelector('#nav-list');

  if (toggle && list) {
    const closeMenu = () => {
      toggle.setAttribute('aria-expanded', 'false');
      list.classList.remove('open');
    };

    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      list.classList.toggle('open', !open);
    });
    list.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        toggle.focus();
      }
    });
  }

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const notice = document.querySelector('[data-cookie]');
  let choice = '';
  try {
    choice = localStorage.getItem('dp-cookie-choice') || '';
  } catch {}
  if (notice && !choice) notice.hidden = false;

  const saveChoice = (value) => {
    try {
      localStorage.setItem('dp-cookie-choice', value);
    } catch {}
    if (notice) notice.hidden = true;
    if (value === 'analytics') window.dispatchEvent(new CustomEvent('analytics-consent'));
  };
  document.querySelector('[data-cookie-accept]')?.addEventListener('click', () => saveChoice('analytics'));
  document.querySelector('[data-cookie-essential]')?.addEventListener('click', () => saveChoice('essential'));

  const interest = document.querySelector('#interest');
  const requested = new URLSearchParams(location.search).get('interest');
  if (interest && requested) {
    const option = [...interest.options].find((item) => item.text.toLowerCase() === requested.toLowerCase());
    if (option) interest.value = option.value;
  }

  const form = document.querySelector('.contact-form');
  form?.addEventListener('submit', () => {
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Sending your enquiry…';
    const button = form.querySelector('button[type=submit]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }
  });

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion) {
    reveals.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  reveals.forEach((element) => observer.observe(element));

  const layers = [...document.querySelectorAll('[data-parallax]')];
  let ticking = false;
  const updateParallax = () => {
    const viewportHeight = innerHeight;
    layers.forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < viewportHeight) {
        const rate = Math.min(Number(element.dataset.parallax) || 0.01, 0.012);
        const offset = (rect.top - viewportHeight * 0.5) * -rate;
        element.style.setProperty('--parallax-y', `${Math.max(-10, Math.min(10, offset))}px`);
      }
    });
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  updateParallax();

  // Marketing in a Box selector — v1.8.2
  const boxChecks = [...document.querySelectorAll('input[name="box_service"]')];
  if (boxChecks.length) {
    const emptyState = document.querySelector('[data-box-empty]');
    const summaryState = document.querySelector('[data-box-summary]');
    const selectedList = document.querySelector('[data-box-selected]');
    const count = document.querySelector('[data-box-count]');
    const servicesField = document.querySelector('[data-box-services-field]');
    const formPreview = document.querySelector('[data-box-form-preview]');
    const quoteForm = document.querySelector('[data-box-form]');

    const selectedItems = () => boxChecks.filter((item) => item.checked);

    const updateBox = () => {
      const items = selectedItems();
      if (emptyState) emptyState.hidden = items.length > 0;
      if (summaryState) summaryState.hidden = items.length === 0;
      if (count) count.textContent = `${items.length} ${items.length === 1 ? 'service' : 'services'} selected`;
      if (selectedList) selectedList.innerHTML = items.map((item) => `<li>${item.value}</li>`).join('');

      const values = items.map((item) => item.value);
      if (servicesField) servicesField.value = values.join(', ');
      if (formPreview) {
        formPreview.textContent = values.length
          ? `Selected: ${values.join(' · ')}`
          : 'Choose services above to build your box.';
      }
    };

    boxChecks.forEach((item) => item.addEventListener('change', updateBox));

    document.querySelectorAll('[data-box-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        const ids = button.dataset.boxPreset.split(',');
        boxChecks.forEach((item) => { item.checked = ids.includes(item.dataset.boxId); });
        updateBox();
        document.querySelector('#build-your-box')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
      });
    });

    document.querySelector('[data-box-request]')?.addEventListener('click', () => {
      document.querySelector('#request-a-quote')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
      window.setTimeout(() => document.querySelector('#box-name')?.focus({preventScroll:true}), 400);
    });

    document.querySelector('[data-box-clear]')?.addEventListener('click', () => {
      boxChecks.forEach((item) => { item.checked = false; });
      updateBox();
    });

    quoteForm?.addEventListener('submit', (event) => {
      if (!selectedItems().length) {
        event.preventDefault();
        document.querySelector('#build-your-box')?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
        });
        return;
      }
      updateBox();
      const status = quoteForm.querySelector('.form-status');
      if (status) status.textContent = 'Sending your quote request…';
      const button = quoteForm.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending…';
      }
    });

    updateBox();
  }

});
