(function () {
  var theme = 'dark';
  try { theme = JSON.parse(localStorage.getItem('requiem.theme')) === 'light' ? 'light' : 'dark'; } catch (err) { theme = 'dark'; }
  var root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-bs-theme', theme);
  root.classList.add('js');
}());
