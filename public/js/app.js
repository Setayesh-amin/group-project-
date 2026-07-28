const toggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.site-nav');

toggle?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.decorative-link').forEach((link) => {
  link.addEventListener('click', (event) => event.preventDefault());
});
