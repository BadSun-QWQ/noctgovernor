/* 司夜罗盘 · 站点骨架
   视图切换（hash 路由）/ 导航 / 滚动显示 / 复制 / 灯箱 / 年份
   单文档运行，切页不刷新，BGM 因此可以连续播放。 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TITLES = {
    home: '司夜罗盘 · Minecraft 服务器',
    history: '历程 · 司夜罗盘',
    scenery: '服务器风景 · 司夜罗盘',
    photos: '合照墙 · 司夜罗盘',
    members: '成员信息 · 司夜罗盘',
    'news-all': '全部公告 · 司夜罗盘'
  };

  /* ---------- 顶部导航 ---------- */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav__toggle');
  var drawer = document.querySelector('.nav__drawer');

  var progressBar = document.getElementById('scroll-progress');

  function updateProgress() {
    if (!progressBar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = max > 4
      ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)).toFixed(2) + '%'
      : '0%';
  }

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    updateProgress();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setDrawer(open) {
    if (!toggle || !drawer) return;
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    if (open) {
      var first = drawer.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      setDrawer(!document.body.classList.contains('nav-open'));
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        setDrawer(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setDrawer(false);
    });
  }

  /* ---------- 提示条 ---------- */
  var toastEl = null, toastTimer = 0;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  /* ---------- 复制 ---------- */
  function legacyCopy(value) {
    try {
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (err) {
      return false;
    }
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value).then(
        function () { return true; },
        function () { return legacyCopy(value); }
      );
    }
    return Promise.resolve(legacyCopy(value));
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var value = btn.getAttribute('data-copy');
    var label = btn.getAttribute('data-copy-label') || '内容';
    copyText(value).then(function (ok) {
      toast(ok ? label + '已复制：' + value : '复制失败，请手动选择：' + value);
    });
  });

  /* ---------- 滚动显示 ---------- */
  var io = null;
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .section-head');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    }
    Array.prototype.forEach.call(els, function (el) {
      if (!el.classList.contains('is-in')) io.observe(el);
    });
  }

  /* ---------- 灯箱 ---------- */
  var lb = null, lbImg = null, lbCaption = null, lbCount = null, lbIndex = 0, lastFocus = null;

  function items() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  }

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', '图片浏览');
    lb.innerHTML =
      '<div class="lightbox__bar">' +
      '<button class="lightbox__btn" type="button" data-lb="prev" aria-label="上一张">‹</button>' +
      '<button class="lightbox__btn" type="button" data-lb="next" aria-label="下一张">›</button>' +
      '<button class="lightbox__btn" type="button" data-lb="close" aria-label="关闭">✕</button>' +
      '</div>' +
      '<img alt="">' +
      '<p class="lightbox__caption"><span data-lb-caption></span> <span class="lightbox__count" data-lb-count></span></p>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img');
    lbCaption = lb.querySelector('[data-lb-caption]');
    lbCount = lb.querySelector('[data-lb-count]');

    lb.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lb]');
      if (btn) {
        var action = btn.getAttribute('data-lb');
        if (action === 'close') closeLightbox();
        if (action === 'prev') step(-1);
        if (action === 'next') step(1);
        return;
      }
      if (e.target === lb) closeLightbox();
    });
  }

  function showSlide(index) {
    var list = items();
    if (!list.length) return;
    lbIndex = (index + list.length) % list.length;
    var el = list[lbIndex];
    var img = el.querySelector('img');
    lbImg.src = el.getAttribute('data-full') || (img && img.src) || '';
    lbImg.alt = (img && img.alt) || '';
    lbCaption.textContent = el.getAttribute('data-caption') || (img && img.alt) || '';
    lbCount.textContent = (lbIndex + 1) + ' / ' + list.length;
  }

  function step(dir) { showSlide(lbIndex + dir); }

  function openLightbox(el) {
    if (!lb) buildLightbox();
    lastFocus = document.activeElement;
    showSlide(items().indexOf(el));
    lb.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    var close = lb.querySelector('[data-lb="close"]');
    if (close) close.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var tile = e.target.closest('[data-lightbox]');
    if (tile) openLightbox(tile);
  });

  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- 视图切换 ---------- */
  function replayIntro(page) {
    var list = page.querySelectorAll('.intro');
    Array.prototype.forEach.call(list, function (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    });
  }

  function showView(name, scrollTarget) {
    var page = document.getElementById(name);
    if (!page) return;
    var changed = !page.classList.contains('is-active');

    if (changed) {
      Array.prototype.forEach.call(document.querySelectorAll('.page'), function (p) {
        p.classList.toggle('is-active', p === page);
      });
      document.body.classList.toggle('view-home', name === 'home');
      Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) {
        if (a.getAttribute('data-nav') === name) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      document.title = TITLES[name] || document.title;
      replayIntro(page);
      window.scrollTo({ top: 0, behavior: 'auto' });
      updateProgress();
      initReveal();
    }

    if (scrollTarget) {
      window.setTimeout(function () {
        var root = document.documentElement;
        var prev = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        scrollTarget.scrollIntoView({ block: 'start' });
        root.style.scrollBehavior = prev;
      }, 140);
    }
  }

  function route() {
    var id = (location.hash || '').replace('#', '');
    if (!id) { showView('home'); return; }
    var page = document.querySelector('.page[id="' + id + '"]');
    if (page) { showView(id); return; }
    var el = document.getElementById(id);
    if (el) {
      var owner = el.closest('.page');
      if (owner) { showView(owner.id, el); return; }
      showView('home', el);
      return;
    }
    showView('home');
  }

  window.addEventListener('hashchange', route);

  /* ---------- 年份 ---------- */
  function fillYear() {
    var year = String(new Date().getFullYear());
    Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
      el.textContent = year;
    });
  }

  initReveal();
  fillYear();
  route();
})();
