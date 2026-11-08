/* 司夜罗盘 · 服务器发展历程尺
   六期开服记录，横向排列，可拖动 / 滚轮 / 方向键浏览。
   数据只在这里改一次，首页与「历程」页共用。 */
(function () {
  'use strict';

  // TODO(content): 把开服时间、版本号、封面换成真实信息；封面可加 cover: '/noctgovernor/assets/img/xxx.jpg'
  var ERAS = [
    {
      name: '宝可梦重铸',
      since: '【待填】',
      version: '【待填】',
      text: '第一次把宝可梦模组搬进服务器，从零开始重建图鉴。',
      live: false
    },
    {
      name: '养老之家',
      since: '【待填】',
      version: '【待填】',
      text: '慢节奏生存周目，公共农场与分类仓库在这一期成形。',
      live: false
    },
    {
      name: '龙之冒险',
      since: '【待填】',
      version: '【待填】',
      text: '围绕冰火传说展开的冒险线，第一次有了完整的 Boss 挑战。',
      live: false
    },
    {
      name: '方可梦一期',
      since: '【待填】',
      version: '【待填】',
      text: '宝可梦与生存结合的第一期，广场与樱花街开始动工。',
      live: false
    },
    {
      name: '惊变一百天',
      since: '【待填】',
      version: '【待填】',
      text: '一百天限时生存挑战，活动体系在这一期固定下来。',
      live: false
    },
    {
      name: '方可梦二期',
      since: '【待填】',
      version: '【待填】',
      text: '当前周目：樱花街落成，建筑、活动与风景并行。',
      live: true
    }
  ];

  var COMPASS =
    '<svg viewBox="0 0 64 64" aria-hidden="true">' +
    '<circle cx="32" cy="32" r="21" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1 4"/>' +
    '<path d="M32 12 36 28 52 32 36 36 32 52 28 36 12 32 28 28Z" fill="currentColor" opacity=".85"/>' +
    '<circle cx="32" cy="32" r="4" fill="#0b1020" stroke="currentColor"/>' +
    '</svg>';

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function card(era, i) {
    var num = pad(i + 1);
    var cover = era.cover
      ? '<img src="' + era.cover + '" alt="' + era.name + ' 封面" loading="lazy">'
      : COMPASS;
    var badge = era.live
      ? '<span class="era-card__badge era-card__badge--live">进行中</span>'
      : '<span class="era-card__badge">已归档</span>';

    return '<li class="era-card">' +
      '<div class="era-card__cover">' + cover +
      (era.cover ? '' : '<em>封面待上传</em>') +
      '<span class="era-card__num">' + num + '</span>' +
      '</div>' +
      '<div class="era-card__body">' +
      '<p class="era-card__kicker">第 ' + (i + 1) + ' 期 · Season ' + num + badge + '</p>' +
      '<h3 class="era-card__title">' + era.name + '</h3>' +
      '<dl class="era-card__meta">' +
      '<div><dt>开服时间</dt><dd>' + era.since + '</dd></div>' +
      '<div><dt>版本号</dt><dd>' + era.version + '</dd></div>' +
      '</dl>' +
      '<p class="era-card__text">' + era.text + '</p>' +
      '</div></li>';
  }

  function mount(ruler) {
    var track = ruler.querySelector('[data-era-track]');
    var viewport = ruler.querySelector('[data-era-viewport]');
    if (!track || !viewport) return;

    track.innerHTML = ERAS.map(card).join('');

    var section = ruler.closest('section');
    var count = section && section.querySelector('.eras-count');
    if (count) count.innerHTML = pad(ERAS.length) + '<small>期</small>';

    var prev = ruler.querySelector('[data-era-prev]');
    var next = ruler.querySelector('[data-era-next]');

    function gap() {
      var cs = viewport.ownerDocument.defaultView.getComputedStyle(track);
      return parseFloat(cs.columnGap || cs.gap || 16) || 16;
    }

    function stepSize() {
      var first = track.querySelector('.era-card');
      return first ? first.offsetWidth + gap() : 300;
    }

    function sync() {
      var max = viewport.scrollWidth - viewport.clientWidth;
      if (prev) prev.disabled = viewport.scrollLeft <= 2;
      if (next) next.disabled = viewport.scrollLeft >= max - 2;
    }

    function slide(dir) {
      viewport.scrollBy({ left: dir * stepSize(), behavior: 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { slide(-1); });
    if (next) next.addEventListener('click', function () { slide(1); });

    viewport.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    // 滚轮横向
    viewport.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = viewport.scrollWidth - viewport.clientWidth;
      if (max <= 0) return;
      var goingRight = e.deltaY > 0;
      if ((goingRight && viewport.scrollLeft >= max - 1) || (!goingRight && viewport.scrollLeft <= 0)) return;
      e.preventDefault();
      viewport.scrollLeft += e.deltaY;
    }, { passive: false });

    // 鼠标拖动
    var dragging = false, startX = 0, startLeft = 0;
    viewport.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startLeft = viewport.scrollLeft;
      viewport.classList.add('is-dragging');
    });
    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      viewport.scrollLeft = startLeft - (e.clientX - startX);
    });
    function endDrag() {
      dragging = false;
      viewport.classList.remove('is-dragging');
    }
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointerleave', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    // 键盘
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); slide(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); slide(-1); }
    });

    sync();
  }

  Array.prototype.forEach.call(document.querySelectorAll('.ruler'), mount);
})();
