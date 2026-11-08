/* 司夜罗盘 · 音乐播放器
   播放列表 + 上一首/下一首 + 播完自动切下一首。
   单文档内常驻（切子页不中断）；刷新页面从头重放，被浏览器拦截时等第一次点击再起播。
   加新歌：在 TRACKS 里复制一条，填 title / artist / src；src 留空即「预留位」。 */
window.PLAYER = (function () {
  'use strict';

  var TRACKS = [
    { title: '感官过载', artist: '残像音阶 / M3mo', src: './assets/audio/bgm-01.flac' },
    { title: '雨夹雪 (end)', artist: 'Seto', src: './assets/audio/bgm-02.mp3' },
    // ↓ 预留位：以后加歌，把其中一条改成 { title, artist, src } 即可
    { title: '待添加', artist: '预留位 · 03' },
    { title: '待添加', artist: '预留位 · 04' },
    { title: '待添加', artist: '预留位 · 05' }
  ];

  var STORE = 'szly-bgm-v2';
  var audio = null, el = null, panel = null, listEl = null;
  var index = 0;
  var armed = false;
  var errorStreak = 0;

  function isReal(i) { return !!(TRACKS[i] && TRACKS[i].src); }
  function realCount() { return TRACKS.filter(function (t) { return !!t.src; }).length; }

  function nextReal(from) {
    for (var k = 1; k <= TRACKS.length; k++) {
      var j = (from + k) % TRACKS.length;
      if (isReal(j)) return j;
    }
    return from;
  }

  function prevReal(from) {
    for (var k = 1; k <= TRACKS.length; k++) {
      var j = ((from - k) % TRACKS.length + TRACKS.length) % TRACKS.length;
      if (isReal(j)) return j;
    }
    return from;
  }

  function readIndex() {
    try {
      var s = JSON.parse(sessionStorage.getItem(STORE) || 'null');
      if (s && typeof s.i === 'number' && isReal(s.i)) return s.i;
    } catch (err) {}
    return 0;
  }

  function saveIndex() {
    try { sessionStorage.setItem(STORE, JSON.stringify({ i: index })); } catch (err) {}
  }

  /* ---------- 播放控制 ---------- */
  function play() {
    if (!audio) return;
    audio.volume = 0.55;
    var p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function () { armFirstGesture(); });
    }
  }

  function pause() { if (audio) audio.pause(); }
  function toggle() { if (!audio) return; if (audio.paused) play(); else pause(); }

  function select(i, autoplay) {
    if (!isReal(i)) return;
    index = i;
    audio.src = TRACKS[index].src;
    audio.load();
    saveIndex();
    renderMeta();
    renderList();
    if (autoplay !== false) play();
  }

  function next() { select(nextReal(index)); }

  function prev() {
    // 播放超过 3 秒：先回到本曲开头；否则切上一首
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    select(prevReal(index));
  }

  /* ---------- 自动播放被拦截时的补播 ---------- */
  function armFirstGesture() {
    if (armed) return;
    armed = true;
    function go(e) {
      if (e && e.target && e.target.closest && e.target.closest('.player')) return;
      armed = false;
      document.removeEventListener('pointerdown', go, true);
      document.removeEventListener('keydown', go, true);
      if (audio && audio.paused) play();
    }
    document.addEventListener('pointerdown', go, true);
    document.addEventListener('keydown', go, true);
  }

  /* ---------- UI ---------- */
  function renderMeta() {
    if (!el) return;
    var t = TRACKS[index];
    el.querySelector('.player__title').textContent = t.title;
    el.querySelector('.player__sub').textContent =
      'BGM · ' + (index + 1) + ' / ' + TRACKS.length + (t.artist ? ' · ' + t.artist : '');
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = TRACKS.map(function (t, i) {
      var real = !!t.src;
      var current = i === index;
      return '<li class="track' + (current ? ' is-current' : '') + (real ? '' : ' is-empty') + '">' +
        '<button class="track__btn" type="button" data-track="' + i + '"' +
        (real ? '' : ' disabled') +
        (current ? ' aria-current="true"' : '') + '>' +
        '<span class="track__no">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
        '<span class="track__body">' +
        '<span class="track__title">' + t.title + '</span>' +
        '<span class="track__artist">' + (t.artist || '') + '</span>' +
        '</span>' +
        '<span class="track__state">' + (real ? (current ? '播放中' : '') : '预留') + '</span>' +
        '</button></li>';
    }).join('');

    var count = el.querySelector('.player__count');
    if (count) count.textContent = realCount() + ' 首 · ' + (TRACKS.length - realCount()) + ' 个预留位';
  }

  function sync() {
    if (!audio || !el) return;
    var playing = !audio.paused && !audio.ended;
    el.classList.toggle('is-playing', playing);
    var main = el.querySelector('[data-toggle]');
    if (main) main.setAttribute('aria-label', playing ? '暂停音乐' : '播放音乐');
    renderList();
  }

  function setPanel(open) {
    if (!el) return;
    el.classList.toggle('is-open', open);
    if (panel) panel.setAttribute('aria-hidden', String(!open));
    var btn = el.querySelector('[data-list]');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function build() {
    if (el) return;

    el = document.createElement('div');
    el.className = 'player';
    el.id = 'player';
    el.innerHTML =
      '<span class="player__disc" aria-hidden="true"></span>' +
      '<div class="player__meta">' +
      '<span class="player__title">—</span>' +
      '<span class="player__sub">BGM</span>' +
      '</div>' +
      '<div class="player__ctrl">' +
      '<button class="player__btn" type="button" data-prev aria-label="上一首">‹</button>' +
      '<button class="player__btn player__btn--main" type="button" data-toggle aria-label="播放音乐">' +
      '<svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>' +
      '<svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>' +
      '</button>' +
      '<button class="player__btn" type="button" data-next aria-label="下一首">›</button>' +
      '<button class="player__btn player__btn--list" type="button" data-list aria-label="播放列表" aria-expanded="false">☰</button>' +
      '</div>' +
      '<div class="player__panel" data-panel aria-hidden="true">' +
      '<div class="player__panel-head"><span>播放列表</span><span class="player__count"></span></div>' +
      '<ol class="player__tracks" data-tracks></ol>' +
      '<p class="player__tip">点歌名切换；预留位等新歌加入</p>' +
      '</div>';

    document.body.appendChild(el);
    panel = el.querySelector('[data-panel]');
    listEl = el.querySelector('[data-tracks]');

    audio = document.createElement('audio');
    audio.id = 'bgm';
    audio.preload = 'metadata';
    audio.volume = 0.55;
    document.body.appendChild(audio);

    el.querySelector('[data-toggle]').addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    el.querySelector('[data-next]').addEventListener('click', function (e) { e.stopPropagation(); next(); });
    el.querySelector('[data-prev]').addEventListener('click', function (e) { e.stopPropagation(); prev(); });
    el.querySelector('[data-list]').addEventListener('click', function (e) {
      e.stopPropagation();
      setPanel(!el.classList.contains('is-open'));
    });

    listEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-track]');
      if (!b || b.disabled) return;
      select(parseInt(b.getAttribute('data-track'), 10));
      if (window.innerWidth < 640) setPanel(false);
    });

    document.addEventListener('click', function (e) {
      if (!el.contains(e.target)) setPanel(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setPanel(false);
    });

    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('playing', function () { errorStreak = 0; });
    audio.addEventListener('ended', function () { next(); });
    audio.addEventListener('error', function () {
      if (!audio.currentSrc) return;
      errorStreak += 1;
      if (errorStreak < realCount()) next();
    });

    index = readIndex();
    select(index, true);
    if (audio.paused) armFirstGesture();

    if (window.PLAYER) window.PLAYER.__ready = true;
    sync();
  }

  var api = {
    init: build,
    play: play,
    pause: pause,
    toggle: toggle,
    next: next,
    prev: prev,
    select: select,
    isPlaying: function () { return !!audio && !audio.paused; },
    element: function () { return audio; },
    tracks: TRACKS
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

  return api;
})();
