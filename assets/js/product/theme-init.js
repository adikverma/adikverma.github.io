(function () {
  var d = document.documentElement;
  d.classList.add('js');
  try {
    var m = localStorage.getItem('rwt-theme');
    if (m === 'dark' || m === 'light') d.setAttribute('data-theme', m);
  } catch (e) {}
})();
