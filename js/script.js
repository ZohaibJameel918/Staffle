const navToggle = document.getElementById('navToggle');
  const panel = document.getElementById('mobilePanel');
  const menuIcon = document.getElementById('menuIcon');
  navToggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    menuIcon.innerHTML = isOpen ? '<use href="#ic-close"/>' : '<use href="#ic-menu"/>';
  });
  panel.querySelectorAll('a, .btn').forEach(el => el.addEventListener('click', () => {
    panel.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    menuIcon.innerHTML = '<use href="#ic-menu"/>';
  }));