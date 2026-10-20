// Intro screen: cycles the tagline, then slides the panel away once the page is ready (and not before MIN ms).
// The look and the name animation are pure CSS in index.html; this only handles the tagline and the exit.
(function () {
  var html = document.documentElement;
  var el = document.getElementById("preloader");
  if (!el || !html.classList.contains("preloading")) return;

  var MIN = 3000; // shortest time the screen stays up
  var MAX = 7000; // never trap the visitor if the app is slow or fails
  var TEXTS = ["Student developer", "I build web apps and desktop apps"];
  var start = performance.now();
  var left = false;
  var line = 0;

  var slogan = el.querySelector(".pl-slogan");
  var lines = TEXTS.map(function (text) {
    var p = document.createElement("p");
    p.className = "pl-line";
    text.split("").forEach(function (ch, i) {
      var s = document.createElement("span");
      s.className = "pl-sc";
      s.style.setProperty("--i", i);
      s.textContent = ch;
      p.appendChild(s);
    });
    slogan.appendChild(p);
    return p;
  });

  function show(n) {
    lines.forEach(function (p, i) {
      p.classList.toggle("on", i === n);
      p.classList.toggle("out", i < n);
    });
  }
  setTimeout(function () { show(0); }, 600);
  var cycle = setInterval(function () {
    if (left || line >= lines.length - 1) return clearInterval(cycle);
    show(++line);
  }, 1500);

  function done() {
    el.remove();
    html.classList.remove("preloading");
    try { sessionStorage.setItem("preloaded", "1"); } catch (e) {}
  }
  function leave() {
    if (left) return;
    left = true;
    clearInterval(cycle);
    window.__preloaderLeaving = true;
    window.dispatchEvent(new Event("preloader:leave"));
    el.classList.add("leaving");
    setTimeout(done, 1100);
  }
  function check() {
    if (left || !window.__appReady) return;
    var wait = MIN - (performance.now() - start);
    if (wait <= 0) leave();
    else setTimeout(leave, wait);
  }
  window.addEventListener("app:ready", check);
  setTimeout(leave, MAX);
  check();
})();
