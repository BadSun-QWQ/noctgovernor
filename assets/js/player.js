/* 司夜罗盘 · 背景音乐
   单文档内常驻的 <audio>，切页不中断。
   刷新后按上次的进度与播放状态恢复（若浏览器拦截自动播放，则保持暂停）。
   无依赖。 */
window.PLAYER = (function () {
  'use strict';

  var KEY = 'szly-bgm';
  var audio = null, el = null, btn = null, ready = false;

  function readState() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function saveState() {
    if (!audio) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        t: audio.currentTime || 0,
        playing: !audio.paused && !audio.ended
      }));
    } catch (err) { /* 隐私模式下写不进去，忽略 */ }
  }

  function sync() {
    if (!audio || !el) return;
    var playing = !audio.paused && !audio.ended;
    el.classList.toggle('is-playing', playing);
    if (btn) btn.setAttribute('aria-label', playing ? '暂停音乐' : '播放音乐');
    if (playing) saveState();
  }

  function build() {
    if (el || document.getElementById('bgm')) return;

    el = document.createElement('div');
    el.className = 'player';
    el.id = 'player';
    el.innerHTML =
      '<span class="player__disc" aria-hidden="true"></span>' +
      '<div class="player__meta">' +
      '<span class="player__title">感官过载</span>' +
      '<span class="player__sub">BGM · 残像音阶 / M3mo</span>' +
      '</div>' +
      '<button class="player__btn" id="bgm-toggle" type="button" aria-label="播放音乐">' +
      '<svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>' +
      '<svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>' +
      '</button>';
    document.body.appendChild(el);

    audio = document.createElement('audio');
    audio.id = 'bgm';
    audio.src = '/noctgovernor/assets/audio/bgm.flac';
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.55;
    document.body.appendChild(audio);

    btn = el.querySelector('#bgm-toggle');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (audio.paused) play(); else pause();
    });

    audio.addEventListener('play', sync);
    audio.addEventListener('pause', function () { sync(); saveState(); });
    audio.addEventListener('ended', sync);
    audio.addEventListener('loadedmetadata', function () {
      ready = true;
      var st = readState();
      if (st && typeof st.t === 'number' && st.t > 0 && st.t < (audio.duration || Infinity) - 1) {
        audio.currentTime = st.t;
      }
    });
    audio.addEventListener('timeupdate', function () {
      if (!audio.paused) saveState();
    });

    var st = readState();
    if (st && st.playing) {
      // 刷新后尝试续播；被浏览器拦截时静默退回暂停态
      var p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(function () { sync(); });
    }
    sync();
  }

  function play() {
    if (!audio) return;
    audio.volume = 0.55;
    var p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(function () { sync(); });
  }

  function pause() {
    if (!audio) return;
    audio.pause();
    saveState();
  }

  var api = {
    init: build,
    play: play,
    pause: pause,
    isPlaying: function () { return !!audio && !audio.paused; },
    element: function () { return audio; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

  return api;
})();
