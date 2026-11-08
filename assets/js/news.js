/* 司夜罗盘 · 公告告示牌
   首页显示最近 5 条，公告页显示全部；数据统一在 NEWS 里改。
   牌角樱花沿直角边生长，有前后层次；点击樱花会炸开一捧花瓣。 */
(function () {
  'use strict';

  // TODO(content): 换成真实公告；type 取 event / update / notice
  var NEWS = [
    { date: '2026.11.01', type: 'notice', title: '新周目开启：樱花街落成' },
    { date: '2026.10.18', type: 'event', title: '周末建造赛：主题「冬天的入口」' },
    { date: '2026.10.06', type: 'update', title: '服务器迁移完成，延迟略有下降' },
    { date: '2026.09.22', type: 'notice', title: '成员页与合照墙上线，欢迎补充素材' },
    { date: '2026.09.10', type: 'update', title: '【待填：公告标题】' },
    { date: '2026.08.28', type: 'event', title: '【待填：公告标题】' },
    { date: '2026.08.15', type: 'notice', title: '【待填：公告标题】' },
    { date: '2026.08.02', type: 'update', title: '【待填：公告标题】' },
    { date: '2026.07.20', type: 'event', title: '【待填：公告标题】' },
    { date: '2026.07.05', type: 'notice', title: '【待填：公告标题】' },
    { date: '2026.06.18', type: 'update', title: '【待填：公告标题】' },
    { date: '2026.06.01', type: 'event', title: '【待填：公告标题】' }
  ];

  var LABEL = { event: '活动', update: '更新', notice: '通知' };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clipId = 0;

  var ICONS = {
    // 8×8 像素剑
    event: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect x="6" y="1" width="1" height="1" fill="#eef2f7"/>' +
      '<rect x="5" y="2" width="1" height="1" fill="#d4dbe4"/>' +
      '<rect x="4" y="3" width="1" height="1" fill="#c3ccd8"/>' +
      '<rect x="3" y="4" width="1" height="1" fill="#aab5c3"/>' +
      '<rect x="2" y="5" width="1" height="1" fill="#b0804c"/>' +
      '<rect x="2" y="6" width="1" height="1" fill="#7d5a35"/>' +
      '<rect x="1" y="5" width="1" height="1" fill="#7d5a35"/>' +
      '</svg>',
    // 8×8 像素绿宝石
    update: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect x="3" y="1" width="2" height="1" fill="#b8f4c0"/>' +
      '<rect x="2" y="2" width="4" height="1" fill="#7fdd8e"/>' +
      '<rect x="2" y="3" width="4" height="1" fill="#5ecb74"/>' +
      '<rect x="3" y="4" width="2" height="1" fill="#49b25f"/>' +
      '<rect x="3" y="2" width="1" height="1" fill="#e6ffe9"/>' +
      '</svg>',
    // 8×8 像素信纸
    notice: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect x="2" y="1" width="4" height="1" fill="#4a3320"/>' +
      '<rect x="2" y="2" width="1" height="3" fill="#4a3320"/>' +
      '<rect x="5" y="2" width="1" height="3" fill="#4a3320"/>' +
      '<rect x="3" y="2" width="2" height="1" fill="#fdf6e6"/>' +
      '<rect x="3" y="3" width="2" height="1" fill="#f2e6cd"/>' +
      '<rect x="3" y="4" width="1" height="1" fill="#f2e6cd"/>' +
      '<rect x="2" y="5" width="4" height="1" fill="#4a3320"/>' +
      '</svg>'
  };

  function dt(date) { return date.replace(/\./g, '-'); }

  function signEl(item) {
    var type = LABEL[item.type] ? item.type : 'notice';
    return '<article class="sign" data-type="' + type + '">' +
      '<div class="sign__meta">' +
      '<time class="sign__date" datetime="' + dt(item.date) + '">' + item.date + '</time>' +
      '<span class="sign__tag sign__tag--' + type + '">' + ICONS[type] + LABEL[type] + '</span>' +
      '</div>' +
      '<h3 class="sign__title">' + item.title + '</h3>' +
      '</article>';
  }

  /* ---------- 樱花：沿直角边、大小错落、前后两层 ---------- */
  var PETALS = [0, 72, 144, 216, 288].map(function (a) {
    return '<ellipse cx="0" cy="-4.6" rx="2.6" ry="4" transform="rotate(' + a + ')"/>';
  }).join('');

  function blossom(x, y, s, rot, i, front) {
    var dur = (3.2 + ((i * 7) % 19) / 10).toFixed(1);
    var delay = (((i * 13) % 27) / 10).toFixed(1);
    var fill = front ? '#f8c8da' : '#d99cb6';
    var heart = front ? '#fbe7c6' : '#ecc7a6';
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ') rotate(' + rot + ')">' +
      '<g class="blossom" style="--dur:' + dur + 's;--delay:' + delay + 's">' +
      '<g fill="' + fill + '">' + PETALS + '</g>' +
      '<circle r="1.6" fill="' + heart + '"/>' +
      '</g></g>';
  }

  // 贴边（会被木板边缘挡住一半）的深层花
  var BACK_SPOTS = [
    { x: 12, y: 60, s: 1.18, r: -8 },
    { x: 26, y: 61, s: 0.92, r: 12 },
    { x: 40, y: 62, s: 0.72, r: -14 },
    { x: 53, y: 63, s: 0.52, r: 8 },
    { x: 11, y: 47, s: 0.86, r: 16 },
    { x: 10, y: 33, s: 0.62, r: -20 },
    { x: 10, y: 21, s: 0.44, r: 12 }
  ];
  // 压在木板边上的浅层花
  var FRONT_SPOTS = [
    { x: 14, y: 56, s: 0.78, r: 6 },
    { x: 25, y: 57, s: 0.52, r: -10 },
    { x: 37, y: 57, s: 0.38, r: 14 },
    { x: 15, y: 44, s: 0.56, r: -8 },
    { x: 14, y: 31, s: 0.4, r: 12 },
    { x: 13, y: 20, s: 0.3, r: -14 }
  ];

  function clusterSVG() {
    var id = 'sakuraClip' + (++clipId);
    var back = BACK_SPOTS.map(function (sp, i) { return blossom(sp.x, sp.y, sp.s, sp.r, i, false); }).join('');
    var front = FRONT_SPOTS.map(function (sp, i) { return blossom(sp.x, sp.y, sp.s, sp.r, i + 3, true); }).join('');

    return '<svg viewBox="0 0 72 72" aria-hidden="true">' +
      '<defs><clipPath id="' + id + '" clipPathUnits="userSpaceOnUse">' +
      '<path d="M0 0H72V72H0Z M13 0H72V58H13Z" clip-rule="evenodd"/>' +
      '</clipPath></defs>' +
      '<path d="M62 70 H5 V10" fill="none" stroke="#b4698a" stroke-opacity=".28" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<g clip-path="url(#' + id + ')">' + back + '</g>' +
      front +
      '<circle cx="66" cy="70" r="1.6" fill="#e79ab6"/>' +
      '<circle cx="4" cy="8" r="1.4" fill="#e79ab6"/>' +
      '<circle cx="33" cy="70" r="1.2" fill="#f0b3c9" opacity=".8"/>' +
      '</svg>';
  }

  function decorate(sign) {
    ['bl', 'tr'].forEach(function (pos) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sakura sakura--' + pos;
      b.setAttribute('aria-label', '撒一把花瓣');
      b.innerHTML = clusterSVG();
      sign.appendChild(b);
    });
  }

  /* ---------- 「更多公告」按钮：绕一圈花 ---------- */
  var RING = [
    { side: 'top', p: 0.08, s: 0.95, behind: true },
    { side: 'top', p: 0.27, s: 1.2, behind: false },
    { side: 'top', p: 0.47, s: 0.7, behind: true },
    { side: 'top', p: 0.67, s: 1.05, behind: false },
    { side: 'top', p: 0.87, s: 0.62, behind: true },
    { side: 'right', p: 0.24, s: 0.86, behind: false },
    { side: 'right', p: 0.58, s: 1.12, behind: true },
    { side: 'right', p: 0.84, s: 0.64, behind: false },
    { side: 'bottom', p: 0.13, s: 0.9, behind: true },
    { side: 'bottom', p: 0.36, s: 1.16, behind: false },
    { side: 'bottom', p: 0.6, s: 0.72, behind: true },
    { side: 'bottom', p: 0.84, s: 0.98, behind: false },
    { side: 'left', p: 0.3, s: 1.05, behind: false },
    { side: 'left', p: 0.72, s: 0.7, behind: true }
  ];

  var CLIP_BY_SIDE = {
    top: 'inset(0 0 50% 0)',
    bottom: 'inset(50% 0 0 0)',
    left: 'inset(0 50% 0 0)',
    right: 'inset(0 0 0 50%)'
  };

  function flowerSVG(behind) {
    return '<svg viewBox="0 0 16 16">' +
      '<g fill="' + (behind ? '#d99cb6' : '#f8c8da') + '">' +
      '<ellipse cx="8" cy="4.4" rx="2.4" ry="3.6"/>' +
      '<ellipse cx="8" cy="4.4" rx="2.4" ry="3.6" transform="rotate(72 8 8)"/>' +
      '<ellipse cx="8" cy="4.4" rx="2.4" ry="3.6" transform="rotate(144 8 8)"/>' +
      '<ellipse cx="8" cy="4.4" rx="2.4" ry="3.6" transform="rotate(216 8 8)"/>' +
      '<ellipse cx="8" cy="4.4" rx="2.4" ry="3.6" transform="rotate(288 8 8)"/>' +
      '</g><circle cx="8" cy="8" r="1.5" fill="' + (behind ? '#ecc7a6' : '#fbe7c6') + '"/></svg>';
  }

  function decorateRing(btn) {
    var ring = document.createElement('span');
    ring.className = 'sakura-ring';
    ring.setAttribute('aria-hidden', 'true');

    RING.forEach(function (r) {
      var el = document.createElement('span');
      el.className = 'ring-bloom';
      var x = r.side === 'right' ? 100 : (r.side === 'left' ? 0 : r.p * 100);
      var y = r.side === 'bottom' ? 100 : (r.side === 'top' ? 0 : r.p * 100);
      el.style.left = x + '%';
      el.style.top = y + '%';
      el.style.transform = 'translate(-50%, -50%) scale(' + r.s + ')';
      if (r.behind) el.style.clipPath = CLIP_BY_SIDE[r.side];
      el.innerHTML = flowerSVG(r.behind);
      ring.appendChild(el);
    });

    btn.appendChild(ring);
  }

  /* ---------- 点击樱花：花瓣猛然散开，再向左下/下方飘散隐去 ---------- */
  function burst(x, y) {
    if (reduceMotion) return;
    var layer = document.createElement('div');
    layer.className = 'petal-layer';
    for (var i = 0; i < 16; i++) {
      var ang = (Math.PI * 2) * (i / 16) + Math.random() * 0.6;
      var rad = 42 + Math.random() * 74;
      var bx = Math.cos(ang) * rad;
      var by = Math.sin(ang) * rad;

      var wrap = document.createElement('div');
      wrap.className = 'petal-burst';
      wrap.style.left = x + 'px';
      wrap.style.top = y + 'px';
      wrap.style.setProperty('--bx', bx.toFixed(1) + 'px');
      wrap.style.setProperty('--by', by.toFixed(1) + 'px');

      var p = document.createElement('i');
      var size = (7 + Math.random() * 6).toFixed(1);
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.setProperty('--dx2', (bx * 0.3 - 24 - Math.random() * 56).toFixed(1) + 'px');
      p.style.setProperty('--dy2', (by * 0.25 + 84 + Math.random() * 96).toFixed(1) + 'px');
      p.style.setProperty('--r2', (Math.random() * 540 - 270).toFixed(0) + 'deg');
      p.style.animationDelay = (0.1 + Math.random() * 0.14).toFixed(2) + 's';

      wrap.appendChild(p);
      layer.appendChild(wrap);
    }
    document.body.appendChild(layer);
    window.setTimeout(function () {
      if (layer.parentNode) layer.parentNode.removeChild(layer);
    }, 3000);
  }

  document.addEventListener('click', function (e) {
    var s = e.target.closest('.sakura');
    if (!s) return;
    e.preventDefault();
    e.stopPropagation();
    var r = s.getBoundingClientRect();
    burst(r.left + r.width * 0.42, r.top + r.height * 0.58);
  });

  /* ---------- 渲染 ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-news]'), function (el) {
    var limit = el.getAttribute('data-news');
    var list = limit === 'all' ? NEWS : NEWS.slice(0, parseInt(limit, 10) || NEWS.length);

    el.innerHTML = list.map(signEl).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.sign'), decorate);

    var holder = el.closest('section');
    var count = holder && holder.querySelector('[data-news-count]');
    if (count) count.textContent = '共 ' + NEWS.length + ' 条';
  });

  Array.prototype.forEach.call(document.querySelectorAll('.more-sign'), decorateRing);
})();
