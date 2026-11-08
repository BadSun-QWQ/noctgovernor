/* 司夜罗盘 · 成员名单
   数据驱动：新增一位成员只需在 MEMBERS 里加一条。
   头像：填 avatar 路径就用照片；不填会自动生成一张像素脸，保证每个岗位都有头像位。 */
(function () {
  'use strict';

  // 新增成员复制一条即可；role / since / bio 随意改，avatar 可留空
  var MEMBERS = [
    { name: '【BadSun_QWQ】', role: '腐竹 · Owner', since: '2023.03', bio: '：）', avatar: './assets/img/avatars/badsun.png' },
    { name: '【0rangy】', role: '管理 · Admin', since: '2023.05', bio: '原木的主人，平地的手子', avatar: './assets/img/avatars/0rangy.png'},
    { name: '【ChiZz_Xinggg】', role: '管理 · Admin', since: '2024.09', bio: '「司夜罗盘首席建筑师」', avatar: './assets/img/avatars/ChiZz_Xinggg.png' },
    { name: '【R1n_Song】', role: '管理 · Admin', since: '2024.06', bio: '王从天降面目狰狞，长手长脚打枪挺行' , avatar: './assets/img/avatars/R1n_Song.png'},
    { name: '【OneMore_TvT】', role: '肝帝 · Grinder', since: '2025.02', bio: '空', avatar:'./assets/img/avatars/OneMore_TvT.png'},
    { name: '【Moonlightn23777】', role: '咕咕嘎嘎 · GuGuGaGa', since: '2025.04', bio: '空'  , avatar: './assets/img/avatars/Moonlightn23777.png'},
    { name: '【待填：昵称】', role: '活动 · Events', since: '2025.08', bio: '空。'  , avatar: './assets/img/avatars/R1n_Song.png'},
    { name: '【待填：昵称】', role: '接待 · Welcomer', since: '2026.01', bio: '空。'  , avatar: './assets/img/avatars/R1n_Song.png'}
  ];

  /* 自动头像：8×8 像素脸，按索引取配色，看起来像 MC 皮肤头 */
  var PALETTES = [
    { hair: '#3a2a22', skin: '#e8b98f', shade: '#cf9f78', eye: '#241812', mouth: '#8a4b3e', neck: '#c99066' },
    { hair: '#6b4a2b', skin: '#f0c9a0', shade: '#d8ae86', eye: '#2a1c14', mouth: '#8f5240', neck: '#d1a077' },
    { hair: '#d8c27a', skin: '#f2d3b3', shade: '#dcb894', eye: '#3a2a1e', mouth: '#a0624c', neck: '#d9b190' },
    { hair: '#2b2534', skin: '#d9a97f', shade: '#c08c62', eye: '#1d161c', mouth: '#7d4536', neck: '#bd8459' },
    { hair: '#a86f82', skin: '#f3cbb4', shade: '#dcaa92', eye: '#33222a', mouth: '#9a5a52', neck: '#d8a68e' },
    { hair: '#4a7f7a', skin: '#e2b18a', shade: '#c9976f', eye: '#20302e', mouth: '#8b4f40', neck: '#c58d65' }
  ];

  function face(i) {
    var p = PALETTES[i % PALETTES.length];
    var cells = '';
    function px(x, y, c) {
      cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>';
    }
    var x, y;
    // 头发：顶部两行
    for (y = 0; y < 2; y++) for (x = 0; x < 8; x++) px(x, y, p.hair);
    // 两侧头发
    for (y = 2; y <= 4; y++) { px(0, y, p.hair); px(7, y, p.hair); }
    // 脸
    for (y = 2; y <= 6; y++) for (x = 1; x <= 6; x++) px(x, y, p.skin);
    // 额头阴影
    for (x = 1; x <= 6; x++) px(x, 2, p.shade);
    // 眼睛
    px(2, 3, p.eye); px(5, 3, p.eye);
    // 鼻影
    px(3, 4, p.shade); px(4, 4, p.shade);
    // 嘴
    px(3, 5, p.mouth); px(4, 5, p.mouth);
    // 下巴与脖子
    for (x = 2; x <= 5; x++) px(x, 6, p.shade);
    for (x = 2; x <= 5; x++) px(x, 7, p.neck);

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">' + cells + '</svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function plainName(name) {
    return name.replace(/[【】]/g, '').replace(/^待填：/, '');
  }

  function card(m, i) {
    var src = m.avatar || face(i);
    var alt = m.avatar ? plainName(m.name) + ' 的头像' : '自动生成的占位头像';
    return '<article class="member reveal" data-delay="' + (i % 4) + '">' +
      '<span class="member__avatar member__avatar--photo">' +
      '<img src="' + src + '" alt="' + alt + '" loading="lazy">' +
      '</span>' +
      '<h3 class="member__name">' + m.name + '</h3>' +
      '<p class="member__role">' + m.role + '</p>' +
      '<p class="member__meta">加入于 ' + m.since + '<br>' + m.bio + '</p>' +
      '</article>';
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-members]'), function (el) {
    el.innerHTML = MEMBERS.map(card).join('');
  });
})();
