(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var m = localStorage.getItem('theme-mode');
    if (m === 'dark' || m === 'light') d.setAttribute('data-theme', m);
  } catch (e) {}
})();
