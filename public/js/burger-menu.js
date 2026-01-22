const menuButton = document.querySelector('.nav-toggle');
const menu = document.querySelector('.site-nav');
const menuList = document.querySelector('.site-nav__list');
const body = document.body;

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.classList.toggle('active');
  menu.classList.toggle('active');
  body.classList.toggle('lock');
  menuButton.setAttribute('aria-expanded', isOpen);
});

menuList.addEventListener('click', () => {
  menuButton.classList.remove('active');
  menu.classList.remove('active');
  body.classList.remove('lock');
  menuButton.setAttribute('aria-expanded', false);
});