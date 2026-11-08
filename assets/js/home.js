/* 司夜罗盘 · 首页交互
   轻触进入（仅首次打开首页时）+ 背景轮播
   无依赖。 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var unlocked = false;

  /* ---------- 轻触进入：只在直接打开首页时出现 ---------- */
  function initGate() {
    var hint = document.getElementById('tap-hint');
    var gate = document.getElementById('gate');
    if (!hint || !gate) return;

    var hash = location.hash || '';
    if (hash && hash !== '#home') return; // 直接进内页时不做门槛

    var docEl = document.documentElement;
    docEl.classList.add('is-gated');
    hint.hidden = false;

    function unlock() {
      if (unlocked) return;
      unlocked = true;
      docEl.classList.remove('is-gated');
      hint.classList.add('is-gone');
      window.setTimeout(function () { hint.hidden = true; }, 460);
      if (window.PLAYER) window.PLAYER.play();
    }

    hint.addEventListener('click', function (e) {
      e.stopPropagation();
      unlock();
    });
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        if (e.target && e.target.closest && e.target.closest('.player')) return;
        e.preventDefault();
        unlock();
      }
    });
  }

  /* ---------- 背景轮播：5s 一张 ---------- */
  function initSlides() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slides] .hero-slide'));
    if (slides.length < 2 || reduceMotion) return;
    var index = 0;
    var timer = window.setInterval(next, 5000);
    function next() {
      slides[index].classList.remove('is-active');
      index = (index + 1) % slides.length;
      slides[index].classList.add('is-active');
    }
    document.addEventListener('visibilitychange', function () {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(next, 5000);
    });
  }

  initGate();
  initSlides();
})();
