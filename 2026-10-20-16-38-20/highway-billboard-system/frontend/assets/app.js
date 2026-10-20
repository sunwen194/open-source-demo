/* 高速公路广告牌管理系统 —— 前端单体应用（原生 JS，无构建依赖） */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const view = $('#view');

const state = { options: null, page: 'dashboard' };

/* ---------------- 图标 ---------------- */
const ICON = {
  dash: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" fill="currentColor"/></svg>',
  board: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="10" rx="1.6" stroke="currentColor" stroke-width="1.7"/><path d="M12 14v6M8 20h8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  inspect: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 4h6a1 1 0 0 1 1 1v1h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2V5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7"/><path d="m8.5 13 2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  hazard: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5 21 19H3l9-15.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 9.5v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.4" r="1" fill="currentColor"/></svg>',
  order: '<svg viewBox="0 0 24 24" fill="none"><path d="M5 4h9l5 5v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7"/><path d="M13 4v5h5M8 13h7M8 16.5h4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none"><path d="M7 3h7l4 4v14H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M13.5 3.5V8H18" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  export: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5v11m0 0 4-4m-4 4-4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 17v2.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.2" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m8 12.2 2.6 2.6L16 9.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.6v5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" stroke="currentColor" stroke-width="1.5"/><path d="m3.5 7.5 8.5 4.6 8.5-4.6M12 12.1V21" stroke="currentColor" stroke-width="1.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.4" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.6V12l3 1.8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 16.5V5m0 0L7.5 9.5M12 5l4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.5 15v3.5a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V15" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
};

/* ---------------- 基础工具 ---------------- */
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dash = (v) => (v === null || v === undefined || v === '' ? '<span class="muted">—</span>' : esc(v));
const fmt = (v) => (v ? String(v).slice(0, 16) : '');
const fmtDay = (v) => (v ? String(v).slice(5, 10) : '');
const bytes = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n > 1024 ? (n / 1024).toFixed(0) + ' KB' : n + ' B');

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* ignore */ }
  if (!res.ok || data.ok === false) throw new Error(data.message || `请求失败（${res.status}）`);
  return data.data;
}

function toast(message, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="ico">${type === 'err' ? ICON.warn : type === 'info' ? ICON.info : ICON.check}</span><span>${esc(message)}</span>`;
  $('#toastRoot').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; }, 2600);
  setTimeout(() => el.remove(), 2950);
}

function tag(text, kind) {
  return `<span class="tag ${kind}">${esc(text)}</span>`;
}

function statusTag(s) {
  const m = { 正常: 'normal', 待整改: 'pending', 故障: 'fault', 停用: 'stopped',
              已完成: 'normal', 已整改: 'normal', 已关闭: 'stopped',
              处理中: 'info', 整改中: 'info', 待派发: 'plain' };
  return tag(s, m[s] || 'plain');
}

function priorityTag(p) {
  return tag(p, { 高: 'fault', 中: 'pending', 低: 'plain' }[p] || 'plain');
}

/* ---------------- 弹窗 ---------------- */
let modalStack = [];
function openModal({ title, subtitle = '', body, footer = '', wide = false }) {
  const mask = document.createElement('div');
  mask.className = 'modal-mask';
  mask.innerHTML = `
    <div class="modal ${wide ? 'wide' : ''}">
      <div class="modal-head">
        <div><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>
        <button class="modal-close" data-close>${ICON.x}</button>
      </div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>`;
  const close = () => { mask.remove(); modalStack = modalStack.filter((m) => m !== close); };
  mask.addEventListener('click', (e) => { if (e.target === mask || e.target.closest('[data-close]')) close(); });
  document.body.appendChild(mask);
  modalStack.push(close);
  const first = mask.querySelector('input,select,textarea');
  if (first) setTimeout(() => first.focus(), 60);
  return { root: mask, close };
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalStack.length) modalStack[modalStack.length - 1](); });

function confirmDialog(title, text, onOk, okText = '确认删除') {
  const m = openModal({
    title,
    body: `<p style="margin:0;font-size:13.5px;line-height:1.7;color:var(--ink-2)">${esc(text)}</p>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn danger" data-ok>${esc(okText)}</button>`,
  });
  m.root.querySelector('[data-ok]').onclick = async () => {
    try { await onOk(); m.close(); } catch (e) { toast(e.message, 'err'); }
  };
}

/* ---------------- 分页 ---------------- */
function pager(data, onGo) {
  const { total, page, size } = data;
  const pages = Math.max(1, Math.ceil(total / size));
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '...') nums.push('...');
  }
  const el = document.createElement('div');
  el.className = 'pager';
  el.innerHTML = `<span>共 <b>${total}</b> 条 · 第 ${page}/${pages} 页</span>
    <div class="pages">
      <button ${page <= 1 ? 'disabled' : ''} data-go="${page - 1}">上一页</button>
      ${nums.map((n) => n === '...' ? '<span style="color:var(--faint)">…</span>'
        : `<button class="${n === page ? 'active' : ''}" data-go="${n}">${n}</button>`).join('')}
      <button ${page >= pages ? 'disabled' : ''} data-go="${page + 1}">下一页</button>
    </div>`;
  el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => onGo(Number(b.dataset.go))));
  return el;
}

function emptyRow(cols, text = '暂无数据') {
  return `<tr><td colspan="${cols}"><div class="empty">${ICON.box}<div>${esc(text)}</div></div></td></tr>`;
}

/* ---------------- 导航 ---------------- */
const NAV = [
  { id: 'dashboard', name: '运营概览', icon: ICON.dash, group: '总览' },
  { id: 'billboards', name: '广告牌档案', icon: ICON.board, group: '资产管理' },
  { id: 'inspections', name: '巡检记录', icon: ICON.inspect, group: '运维作业' },
  { id: 'hazards', name: '隐患台账', icon: ICON.hazard, group: '运维作业' },
  { id: 'orders', name: '运维工单', icon: ICON.order, group: '运维作业' },
  { id: 'attachments', name: '附件管理', icon: ICON.file, group: '资料归档' },
  { id: 'export', name: '台账导出', icon: ICON.export, group: '资料归档' },
];

function renderNav() {
  let html = '';
  const groups = [];
  NAV.forEach((n) => { if (!groups.includes(n.group)) groups.push(n.group); });
  groups.forEach((g) => {
    html += `<div class="nav-label">${esc(g)}</div>`;
    NAV.filter((n) => n.group === g).forEach((n) => {
      html += `<div class="nav-item ${state.page === n.id ? 'active' : ''}" data-page="${n.id}">
        ${n.icon}<span>${esc(n.name)}</span>
        ${n.id === 'hazards' ? '<span class="nav-badge" id="hazardBadge" hidden>0</span>' : ''}
      </div>`;
    });
  });
  $('#nav').innerHTML = html;
  $$('.nav-item').forEach((el) => el.addEventListener('click', () => go(el.dataset.page)));
}

function go(page) {
  if (!NAV.some((n) => n.id === page)) page = 'dashboard';
  state.page = page;
  location.hash = '#/' + page;
  renderNav();
  $('#pageTitle').textContent = NAV.find((n) => n.id === page).name;
  PAGES[page]();
}

/* ================================================================
   页面：运营概览
   ================================================================ */
async function pageDashboard() {
  view.innerHTML = `<div class="empty">正在加载运营数据…</div>`;
  let s;
  try { s = await api('/api/stats'); } catch (e) { view.innerHTML = `<div class="empty">${esc(e.message)}</div>`; return; }

  const cards = [
    { cls: 'blue', label: '广告牌资产总数', value: s.billboard_total, foot: `覆盖 ${s.by_route.length} 条高速路段`, icon: ICON.board },
    { cls: 'amber', label: '未整改隐患', value: s.pending_hazard, foot: '含待整改 / 整改中', icon: ICON.hazard },
    { cls: 'red', label: '待办运维工单', value: s.open_order, foot: '待派发 + 处理中', icon: ICON.order },
    { cls: 'green', label: '本月巡检次数', value: s.inspect_month, foot: '巡检记录累计入库', icon: ICON.inspect },
  ];

  const totalStatus = Object.values(s.by_status).reduce((a, b) => a + b, 0) || 1;
  const colors = { 正常: '#0f9960', 待整改: '#d98407', 故障: '#d92d20', 停用: '#98a2b3' };

  view.innerHTML = `
    <div class="page-head">
      <div><h1>运营概览</h1><p>高速公路广告牌资产、隐患与运维工单的实时汇总</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn" id="btnRefresh">刷新数据</button>
        <button class="btn primary" id="btnQuickInspect">${ICON.plus} 快速巡检</button>
      </div>
    </div>

    <div class="stat-grid">
      ${cards.map((c) => `
        <div class="stat ${c.cls}">
          <div class="icon">${c.icon}</div>
          <div class="label">${esc(c.label)}</div>
          <div class="value">${c.value}</div>
          <div class="foot">${esc(c.foot)}</div>
        </div>`).join('')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head"><h2>近 14 天巡检与隐患趋势</h2><span class="sub">蓝色=巡检次数　橙色=发现隐患</span></div>
        <div class="card-body chart-wrap">${trendChart(s.trend)}</div>
      </div>
      <div class="card">
        <div class="card-head"><h2>广告牌状态分布</h2><span class="sub">合计 ${totalStatus} 块</span></div>
        <div class="card-body" style="display:flex;align-items:center;gap:22px">
          ${donut(s.by_status, colors, totalStatus)}
          <div class="legend" style="flex:1">
            ${Object.entries(s.by_status).map(([k, v]) => `
              <div class="legend-row"><span class="swatch" style="background:${colors[k]}"></span>
                <span class="name">${esc(k)}</span><span class="val">${v} 块</span></div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2b">
      <div class="card">
        <div class="card-head"><h2>分路段资产健康度</h2><span class="sub">异常=待整改+故障+停用</span></div>
        <div class="card-body">
          <div class="bars">
            ${s.by_route.map((r) => {
              const t = r.total || 1;
              return `<div class="bar-row">
                <div class="top"><span>${esc(r.route)}</span><span>${r.normal} 正常 / ${r.total} 总计</span></div>
                <div class="bar-track">
                  <div class="bar-fill" style="width:${(r.normal / t) * 100}%;background:#0f9960"></div>
                  <div class="bar-fill" style="width:${(r.abnormal / t) * 100}%;background:#f0b44a"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>待整改隐患</h2><span class="sub">按发现时间倒序</span></div>
        <div class="mini-list">
          ${s.recent_hazards.length ? s.recent_hazards.map((h) => `
            <div class="mini-item">
              <div class="main-line">
                <div class="t1">${esc(h.billboard_name)}</div>
                <div class="t2">${esc(h.code || h.billboard_code)} · ${esc(h.hazard_type)}隐患 · ${esc(h.level)} · ${fmt(h.found_time)}</div>
              </div>
              ${statusTag(h.status)}
            </div>`).join('') : '<div class="empty">暂无待整改隐患</div>'}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="card-head"><h2>最近运维工单</h2><span class="sub">最新 6 条</span></div>
      <table>
        <thead><tr><th>工单编号</th><th>广告牌</th><th>标题</th><th>负责人</th><th>优先级</th><th>状态</th><th>创建时间</th></tr></thead>
        <tbody>
          ${s.recent_orders.length ? s.recent_orders.map((o) => `
            <tr>
              <td class="strong num">${esc(o.order_no)}</td>
              <td>${esc(o.billboard_name)}<div class="muted">${esc(o.billboard_code)}</div></td>
              <td>${esc(o.title)}</td>
              <td>${dash(o.assignee)}</td>
              <td>${priorityTag(o.priority)}</td>
              <td>${statusTag(o.status)}</td>
              <td class="num muted">${fmt(o.create_time)}</td>
            </tr>`).join('') : emptyRow(7)}
        </tbody>
      </table>
    </div>`;

  $('#btnRefresh').onclick = () => pageDashboard();
  $('#btnQuickInspect').onclick = () => inspectionForm();
}

function trendChart(trend) {
  const W = 640, H = 190, padL = 30, padB = 26, padT = 12;
  if (!trend.length) return '<div class="empty">暂无巡检数据</div>';
  const max = Math.max(...trend.map((d) => d.total), 3);
  const innerW = W - padL - 10, innerH = H - padB - padT;
  const step = innerW / trend.length;
  const bw = Math.min(13, step * 0.32);
  const y = (v) => padT + innerH - (v / max) * innerH;
  let bars = '', labels = '', grid = '';
  for (let g = 0; g <= 3; g++) {
    const gy = padT + (innerH / 3) * g;
    grid += `<line x1="${padL}" y1="${gy}" x2="${W - 6}" y2="${gy}" stroke="#eef1f6"/>`;
    grid += `<text x="${padL - 7}" y="${gy + 4}" text-anchor="end" font-size="9.5" fill="#b3bccb">${Math.round(max - (max / 3) * g)}</text>`;
  }
  trend.forEach((d, i) => {
    const cx = padL + step * i + step / 2;
    bars += `<rect x="${cx - bw - 1.5}" y="${y(d.total)}" width="${bw}" height="${Math.max(2, padT + innerH - y(d.total))}" rx="2.5" fill="#9dbdf0"/>`;
    if (d.hazard) bars += `<rect x="${cx + 1.5}" y="${y(d.hazard)}" width="${bw}" height="${Math.max(2, padT + innerH - y(d.hazard))}" rx="2.5" fill="#f0b44a"/>`;
    if (i % 2 === 0) labels += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="9.5" fill="#98a2b3">${esc(fmtDay(d.day))}</text>`;
  });
  return `<svg class="trend-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}${bars}${labels}</svg>`;
}

function donut(byStatus, colors, total) {
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0, segs = '';
  Object.entries(byStatus).forEach(([k, v]) => {
    if (!v) return;
    const len = (v / total) * C;
    segs += `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${colors[k]}" stroke-width="17"
      stroke-dasharray="${len - 2} ${C - len + 2}" stroke-dashoffset="${-offset}" stroke-linecap="round"
      transform="rotate(-90 70 70)"/>`;
    offset += len;
  });
  return `<svg width="140" height="140" viewBox="0 0 140 140">
    <circle cx="70" cy="70" r="${R}" fill="none" stroke="#f1f4f9" stroke-width="17"/>${segs}
    <text x="70" y="66" text-anchor="middle" font-size="22" font-weight="700" fill="#101828">${total}</text>
    <text x="70" y="84" text-anchor="middle" font-size="10.5" fill="#98a2b3">广告牌总数</text>
  </svg>`;
}

/* ================================================================
   页面：广告牌档案
   ================================================================ */
const boardQuery = { keyword: '', status: '', route: '', page: 1, size: 10 };

async function pageBillboards() {
  view.innerHTML = `
    <div class="page-head">
      <div><h1>广告牌档案</h1><p>维护高速公路广告牌资产台账，状态由巡检 / 隐患 / 工单自动联动</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn" id="btnExport">${ICON.export} 导出档案</button>
        <button class="btn primary" id="btnNew">${ICON.plus} 新增广告牌</button>
      </div>
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search">${ICON.search}<input id="q" type="text" placeholder="搜索编号 / 名称 / 路段 / 桩号" value="${esc(boardQuery.keyword)}"></div>
        <div class="field"><label>状态</label>
          <select id="fStatus"><option value="">全部</option>
            ${(state.options.billboard_status).map((s) => `<option ${boardQuery.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="field"><label>路段</label>
          <select id="fRoute"><option value="">全部</option>
            ${state.options.routes.map((r) => `<option ${boardQuery.route === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
          </select>
        </div>
        <div class="grow"></div>
        <button class="btn" id="btnReset">重置</button>
      </div>
      <div id="tableBox"></div>
      <div id="pagerBox"></div>
    </div>`;

  const load = async () => {
    const qs = new URLSearchParams(boardQuery).toString();
    const data = await api('/api/billboards?' + qs);
    $('#tableBox').innerHTML = `
      <table>
        <thead><tr>
          <th>编号</th><th>名称</th><th>所在路段</th><th>桩号</th><th>类型 / 尺寸</th>
          <th>状态</th><th>待整改隐患</th><th>更新时间</th><th style="width:150px">操作</th>
        </tr></thead>
        <tbody>
          ${data.items.length ? data.items.map((b) => `
            <tr>
              <td class="strong num">${esc(b.code)}</td>
              <td>${esc(b.name)}<div class="muted">${esc(b.owner || '')}</div></td>
              <td>${esc(b.route)}</td>
              <td class="num muted">${esc(b.stake)}</td>
              <td>${esc(b.media_type)}<div class="muted">${esc(b.size)} · ${esc(b.side)}</div></td>
              <td>${statusTag(b.status)}</td>
              <td>${b.pending_hazard ? `<span style="color:var(--red);font-weight:600">${b.pending_hazard}</span>` : '<span class="muted">0</span>'}</td>
              <td class="num muted">${fmt(b.updated_at)}</td>
              <td><div class="actions">
                <button class="btn sm" data-detail="${b.id}">详情</button>
                <button class="btn sm" data-edit="${b.id}">编辑</button>
                <button class="btn sm danger" data-del="${b.id}">删除</button>
              </div></td>
            </tr>`).join('') : emptyRow(9)}
        </tbody>
      </table>`;
    const box = $('#pagerBox');
    box.innerHTML = '';
    box.appendChild(pager(data, (p) => { boardQuery.page = p; load(); }));

    $$('[data-edit]').forEach((el) => el.onclick = () => boardForm(data.items.find((x) => x.id == el.dataset.edit)));
    $$('[data-detail]').forEach((el) => el.onclick = () => boardDetail(el.dataset.detail));
    $$('[data-del]').forEach((el) => el.onclick = () => {
      const b = data.items.find((x) => x.id == el.dataset.del);
      confirmDialog('删除广告牌', `确定删除「${b.code} ${b.name}」？其关联的巡检、隐患、工单记录将一并删除，且不可恢复。`,
        async () => { await api('/api/billboards/' + b.id, { method: 'DELETE' }); toast('已删除'); load(); });
    });
  };

  $('#q').addEventListener('input', debounce((e) => { boardQuery.keyword = e.target.value; boardQuery.page = 1; load(); }, 260));
  $('#fStatus').onchange = (e) => { boardQuery.status = e.target.value; boardQuery.page = 1; load(); };
  $('#fRoute').onchange = (e) => { boardQuery.route = e.target.value; boardQuery.page = 1; load(); };
  $('#btnReset').onclick = () => { Object.assign(boardQuery, { keyword: '', status: '', route: '', page: 1 }); pageBillboards(); };
  $('#btnNew').onclick = () => boardForm();
  $('#btnExport').onclick = () => { window.location = '/api/export?type=billboard&keyword=' + encodeURIComponent(boardQuery.keyword); };
  load();
}

function boardForm(item) {
  const isEdit = !!item;
  const v = item || { code: '', name: '', route: '', stake: '', direction: '上行', media_type: '高立柱', size: '', side: '单面', owner: '', install_date: '', status: '正常', remark: '' };
  const m = openModal({
    title: isEdit ? '编辑广告牌' : '新增广告牌',
    subtitle: isEdit ? `${v.code} · ${v.name}` : '编号唯一，保存后进入资产台账',
    body: `<div class="form-grid">
      ${row('广告牌编号', `<input id="f_code" value="${esc(v.code)}" placeholder="HB-G4-0012" ${isEdit ? 'disabled' : ''}>`, true)}
      ${row('广告牌名称', `<input id="f_name" value="${esc(v.name)}" placeholder="京港澳K1120高立柱">`, true)}
      ${row('所在高速 / 路段', `<input id="f_route" value="${esc(v.route)}" list="routeList" placeholder="G4 京港澳高速">
        <datalist id="routeList">${state.options.routes.map((r) => `<option>${esc(r)}</option>`).join('')}</datalist>`)}
      ${row('桩号', `<input id="f_stake" value="${esc(v.stake)}" placeholder="K1120+300">`)}
      ${row('方向', select('f_direction', ['上行', '下行'], v.direction))}
      ${row('媒体类型', select('f_media_type', state.options.media_types, v.media_type))}
      ${row('版面尺寸', `<input id="f_size" value="${esc(v.size)}" placeholder="18m×6m">`)}
      ${row('面数', select('f_side', ['单面', '双面'], v.side))}
      ${row('权属单位', `<input id="f_owner" value="${esc(v.owner)}" placeholder="路桥传媒">`)}
      ${row('建设日期', `<input id="f_install_date" type="date" value="${esc(v.install_date)}">`)}
      ${row('资产状态', select('f_status', state.options.billboard_status, v.status), false, '手工置为「停用」后不再参与自动状态联动')}
      ${row('备注', `<input id="f_remark" value="${esc(v.remark || '')}" placeholder="选填">`)}
    </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-save>保存</button>`,
  });
  m.root.querySelector('[data-save]').onclick = async () => {
    const payload = {
      code: val('f_code'), name: val('f_name'), route: val('f_route'), stake: val('f_stake'),
      direction: val('f_direction'), media_type: val('f_media_type'), size: val('f_size'),
      side: val('f_side'), owner: val('f_owner'), install_date: val('f_install_date'),
      status: val('f_status'), remark: val('f_remark'),
    };
    try {
      if (isEdit) await api('/api/billboards/' + item.id, { method: 'PUT', body: payload });
      else await api('/api/billboards', { method: 'POST', body: payload });
      toast(isEdit ? '保存成功' : '新增成功');
      m.close();
      pageBillboards();
    } catch (e) { toast(e.message, 'err'); }
  };
}

async function boardDetail(id) {
  const b = await api('/api/billboards/' + id);
  const kv = (k, v) => `<div class="detail-item"><div class="k">${esc(k)}</div><div class="v">${v || '<span class="muted">—</span>'}</div></div>`;
  const m = openModal({
    title: `${b.code} · ${b.name}`,
    subtitle: `${b.route} ${b.stake} · ${b.media_type} · ${b.side}`,
    wide: true,
    body: `
      <div class="detail-grid">
        ${kv('当前状态', statusTag(b.status))}
        ${kv('权属单位', esc(b.owner))}
        ${kv('版面尺寸', esc(b.size))}
        ${kv('方向', esc(b.direction))}
        ${kv('建设日期', esc(b.install_date))}
        ${kv('更新时间', esc(b.updated_at))}
        ${kv('待整改隐患', `${b.hazards.filter((h) => h.status !== '已整改').length} 条`)}
        ${kv('巡检记录', `${b.inspections.length} 次`)}
        ${kv('运维工单', `${b.orders.length} 张`)}
      </div>
      ${b.remark ? `<div class="detail-item" style="margin-bottom:14px"><div class="k">备注</div><div class="v">${esc(b.remark)}</div></div>` : ''}
      <div class="sub-head">隐患记录（${b.hazards.length}）</div>
      ${b.hazards.length ? `<table><thead><tr><th>类型</th><th>等级</th><th>描述</th><th>状态</th><th>发现时间</th></tr></thead>
        <tbody>${b.hazards.map((h) => `<tr><td>${esc(h.hazard_type)}</td><td>${priorityTag(h.level)}</td>
          <td>${esc(h.description)}</td><td>${statusTag(h.status)}</td><td class="num muted">${fmt(h.found_time)}</td></tr>`).join('')}</tbody></table>`
        : '<div class="empty" style="padding:22px 0">暂无隐患记录</div>'}
      <div class="sub-head">最近巡检（${b.inspections.length}）</div>
      ${b.inspections.length ? `<table><thead><tr><th>巡检时间</th><th>巡检人</th><th>天气</th><th>结果</th><th>说明</th></tr></thead>
        <tbody>${b.inspections.slice(0, 5).map((i) => `<tr><td class="num">${fmt(i.inspect_time)}</td><td>${esc(i.inspector)}</td>
          <td>${dash(i.weather)}</td><td>${i.has_hazard ? tag('异常', 'fault') : tag('正常', 'normal')}</td>
          <td class="muted">${esc(i.description)}</td></tr>`).join('')}</tbody></table>`
        : '<div class="empty" style="padding:22px 0">暂无巡检记录</div>'}
      <div class="sub-head">运维工单（${b.orders.length}）</div>
      ${b.orders.length ? `<table><thead><tr><th>工单编号</th><th>标题</th><th>负责人</th><th>状态</th><th>创建时间</th></tr></thead>
        <tbody>${b.orders.slice(0, 5).map((o) => `<tr><td class="num">${esc(o.order_no)}</td><td>${esc(o.title)}</td>
          <td>${dash(o.assignee)}</td><td>${statusTag(o.status)}</td><td class="num muted">${fmt(o.create_time)}</td></tr>`).join('')}</tbody></table>`
        : '<div class="empty" style="padding:22px 0">暂无工单</div>'}
    `,
    footer: `<button class="btn" data-close>关闭</button>`,
  });
  return m;
}

/* ================================================================
   页面：巡检记录
   ================================================================ */
const inspQuery = { keyword: '', result: '', start: '', end: '', page: 1, size: 10 };

async function pageInspections() {
  view.innerHTML = `
    <div class="page-head">
      <div><h1>巡检记录</h1><p>登记日常巡检；勾选「发现隐患」将自动生成隐患台账并把广告牌置为待整改</p></div>
      <button class="btn primary" id="btnNew">${ICON.plus} 新增巡检</button>
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search">${ICON.search}<input id="q" placeholder="搜索广告牌 / 巡检人" value="${esc(inspQuery.keyword)}"></div>
        <div class="field"><label>结果</label><select id="fResult"><option value="">全部</option><option>正常</option><option>异常</option></select></div>
        <div class="field"><label>起</label><input id="fStart" type="date" value="${inspQuery.start}"></div>
        <div class="field"><label>止</label><input id="fEnd" type="date" value="${inspQuery.end}"></div>
        <div class="grow"></div>
        <button class="btn" id="btnReset">重置</button>
      </div>
      <div id="tableBox"></div><div id="pagerBox"></div>
    </div>`;

  const load = async () => {
    const data = await api('/api/inspections?' + new URLSearchParams(inspQuery));
    $('#tableBox').innerHTML = `
      <table>
        <thead><tr><th>巡检时间</th><th>广告牌</th><th>巡检人</th><th>天气</th><th>结果</th><th>隐患</th><th>情况说明</th><th style="width:100px">附件</th></tr></thead>
        <tbody>
          ${data.items.length ? data.items.map((i) => `
            <tr>
              <td class="num">${fmt(i.inspect_time)}</td>
              <td class="strong">${esc(i.billboard_name)}<div class="muted">${esc(i.billboard_code)}</div></td>
              <td>${esc(i.inspector)}</td>
              <td class="muted">${dash(i.weather)}</td>
              <td>${i.has_hazard ? tag('异常', 'fault') : tag('正常', 'normal')}</td>
              <td>${i.has_hazard ? tag('已生成', 'pending') : '<span class="muted">—</span>'}</td>
              <td class="muted" style="max-width:280px">${esc(i.description)}</td>
              <td><button class="btn sm" data-attach="${i.id}">上传</button></td>
            </tr>`).join('') : emptyRow(8)}
        </tbody>
      </table>`;
    const box = $('#pagerBox'); box.innerHTML = '';
    box.appendChild(pager(data, (p) => { inspQuery.page = p; load(); }));
    $$('[data-attach]').forEach((el) => el.onclick = () => attachPanel('inspection', el.dataset.attach,
      data.items.find((x) => x.id == el.dataset.attach).billboard_name));
  };

  $('#q').addEventListener('input', debounce((e) => { inspQuery.keyword = e.target.value; inspQuery.page = 1; load(); }, 260));
  $('#fResult').onchange = (e) => { inspQuery.result = e.target.value; inspQuery.page = 1; load(); };
  $('#fStart').onchange = (e) => { inspQuery.start = e.target.value; inspQuery.page = 1; load(); };
  $('#fEnd').onchange = (e) => { inspQuery.end = e.target.value; inspQuery.page = 1; load(); };
  $('#btnReset').onclick = () => { Object.assign(inspQuery, { keyword: '', result: '', start: '', end: '', page: 1 }); pageInspections(); };
  $('#btnNew').onclick = () => inspectionForm();
  load();
}

function inspectionForm() {
  const boards = state.options.billboards;
  const m = openModal({
    title: '新增巡检记录',
    subtitle: '若勾选「发现隐患」，系统在同一事务内写入隐患并联动广告牌状态',
    body: `<div class="form-grid">
      ${row('广告牌', `<select id="i_bid">${boards.map((b) => `<option value="${b.id}">${esc(b.code)} · ${esc(b.name)}</option>`).join('')}</select>`, true)}
      ${row('巡检人', `<input id="i_inspector" placeholder="张伟">`, true)}
      ${row('巡检时间', `<input id="i_time" type="datetime-local" value="${nowLocal()}">`)}
      ${row('天气', select('i_weather', ['晴', '多云', '阴', '小雨', '大雪', '大雾'], '晴'))}
      <div class="form-row full">
        <label class="checkline"><input type="checkbox" id="i_hazard"> 本次巡检发现隐患（将自动生成隐患台账）</label>
      </div>
      <div class="form-row full" id="hazardBox" style="display:none">
        <div class="section-title">隐患信息</div>
      </div>
      <div class="form-row" id="h_type_row" style="display:none">${lbl('隐患类型')}${select('i_htype', state.options.hazard_types, '结构')}</div>
      <div class="form-row" id="h_level_row" style="display:none">${lbl('隐患等级')}${select('i_level', state.options.hazard_levels, '一般')}</div>
      ${row('情况说明', `<textarea id="i_desc" rows="3" placeholder="结构、画面、照明等检查情况"></textarea>`, false, '', true)}
    </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-save>提交巡检</button>`,
  });
  const toggle = (on) => {
    ['hazardBox', 'h_type_row', 'h_level_row'].forEach((id) => { $('#' + id).style.display = on ? (id === 'hazardBox' ? 'block' : '') : 'none'; });
    if (on) $('#hazardBox').style.gridColumn = '1 / -1';
  };
  $('#i_hazard').onchange = (e) => toggle(e.target.checked);
  m.root.querySelector('[data-save]').onclick = async () => {
    const hasHazard = $('#i_hazard').checked;
    const payload = {
      billboard_id: Number(val('i_bid')), inspector: val('i_inspector'),
      inspect_time: (val('i_time') || '').replace('T', ' '), weather: val('i_weather'),
      has_hazard: hasHazard, description: val('i_desc'),
      hazard_type: val('i_htype'), level: val('i_level'),
    };
    try {
      const r = await api('/api/inspections', { method: 'POST', body: payload });
      toast(hasHazard ? `巡检已提交，广告牌状态更新为「${r.status}」` : '巡检已提交');
      m.close();
      loadOptions().then(() => pageInspections());
    } catch (e) { toast(e.message, 'err'); }
  };
}

/* ================================================================
   页面：隐患台账
   ================================================================ */
const hazardQuery = { keyword: '', status: '', level: '', page: 1, size: 10 };

async function pageHazards() {
  view.innerHTML = `
    <div class="page-head">
      <div><h1>隐患台账</h1><p>巡检发现或人工登记的隐患，整改闭环后自动回写广告牌状态</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn" id="btnExport">${ICON.export} 导出台账</button>
        <button class="btn primary" id="btnNew">${ICON.plus} 登记隐患</button>
      </div>
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search">${ICON.search}<input id="q" placeholder="搜索广告牌 / 隐患描述" value="${esc(hazardQuery.keyword)}"></div>
        <div class="field"><label>整改状态</label><select id="fStatus"><option value="">全部</option>
          ${state.options.hazard_status.map((s) => `<option ${hazardQuery.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label>等级</label><select id="fLevel"><option value="">全部</option>
          ${state.options.hazard_levels.map((s) => `<option ${hazardQuery.level === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="grow"></div>
        <button class="btn" id="btnReset">重置</button>
      </div>
      <div id="tableBox"></div><div id="pagerBox"></div>
    </div>`;

  const load = async () => {
    const data = await api('/api/hazards?' + new URLSearchParams(hazardQuery));
    const badge = $('#hazardBadge');
    if (badge) { badge.hidden = !data.total; badge.textContent = data.total; }
    $('#tableBox').innerHTML = `
      <table>
        <thead><tr><th>#</th><th>广告牌</th><th>类型</th><th>等级</th><th>隐患描述</th><th>状态</th><th>发现时间</th><th>整改完成</th><th style="width:210px">操作</th></tr></thead>
        <tbody>
          ${data.items.length ? data.items.map((h) => `
            <tr>
              <td class="num muted">${h.id}</td>
              <td class="strong">${esc(h.billboard_name)}<div class="muted">${esc(h.billboard_code)}</div></td>
              <td>${esc(h.hazard_type)}</td>
              <td>${priorityTag(h.level)}</td>
              <td class="muted" style="max-width:300px">${esc(h.description)}</td>
              <td>${statusTag(h.status)}</td>
              <td class="num muted">${fmt(h.found_time)}</td>
              <td class="num muted">${dash(fmt(h.resolve_time))}</td>
              <td><div class="actions">
                ${h.status === '待整改' ? `<button class="btn sm" data-progress="${h.id}">开始整改</button>` : ''}
                ${h.status !== '已整改' ? `<button class="btn sm" data-resolve="${h.id}">整改完成</button>` : ''}
                ${!h.order_count ? `<button class="btn sm" data-order="${h.id}">建工单</button>` : `<span class="muted" style="font-size:11.5px">已关联工单</span>`}
              </div></td>
            </tr>`).join('') : emptyRow(9)}
        </tbody>
      </table>`;
    const box = $('#pagerBox'); box.innerHTML = '';
    box.appendChild(pager(data, (p) => { hazardQuery.page = p; load(); }));

    const setStatus = async (id, status) => {
      try {
        const r = await api(`/api/hazards/${id}/status`, { method: 'PUT', body: { status } });
        toast(`隐患已${status}，广告牌状态：${r.billboard_status}`);
        load(); loadOptions();
      } catch (e) { toast(e.message, 'err'); }
    };
    $$('[data-progress]').forEach((el) => el.onclick = () => setStatus(el.dataset.progress, '整改中'));
    $$('[data-resolve]').forEach((el) => el.onclick = () => setStatus(el.dataset.resolve, '已整改'));
    $$('[data-order]').forEach((el) => el.onclick = () => orderForm(null, data.items.find((x) => x.id == el.dataset.order)));
  };

  $('#q').addEventListener('input', debounce((e) => { hazardQuery.keyword = e.target.value; hazardQuery.page = 1; load(); }, 260));
  $('#fStatus').onchange = (e) => { hazardQuery.status = e.target.value; hazardQuery.page = 1; load(); };
  $('#fLevel').onchange = (e) => { hazardQuery.level = e.target.value; hazardQuery.page = 1; load(); };
  $('#btnReset').onclick = () => { Object.assign(hazardQuery, { keyword: '', status: '', level: '', page: 1 }); pageHazards(); };
  $('#btnNew').onclick = () => hazardForm();
  $('#btnExport').onclick = () => { window.location = '/api/export?type=hazard&keyword=' + encodeURIComponent(hazardQuery.keyword); };
  load();
}

function hazardForm() {
  const m = openModal({
    title: '登记隐患',
    subtitle: '登记后广告牌自动置为「待整改」',
    body: `<div class="form-grid">
      ${row('广告牌', `<select id="h_bid">${state.options.billboards.map((b) => `<option value="${b.id}">${esc(b.code)} · ${esc(b.name)}</option>`).join('')}</select>`, true)}
      ${row('隐患类型', select('h_type', state.options.hazard_types, '结构'))}
      ${row('隐患等级', select('h_level', state.options.hazard_levels, '一般'))}
      ${row('发现时间', `<input id="h_time" type="datetime-local" value="${nowLocal()}">`)}
      ${row('隐患描述', `<textarea id="h_desc" rows="3" placeholder="如：立柱底部锈蚀，画面边缘撕裂约 30cm"></textarea>`, true, '', true)}
    </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-save>保存</button>`,
  });
  m.root.querySelector('[data-save]').onclick = async () => {
    try {
      await api('/api/hazards', {
        method: 'POST',
        body: { billboard_id: Number(val('h_bid')), hazard_type: val('h_type'), level: val('h_level'),
                found_time: (val('h_time') || '').replace('T', ' '), description: val('h_desc') },
      });
      toast('隐患已登记，广告牌状态已联动');
      m.close(); pageHazards(); loadOptions();
    } catch (e) { toast(e.message, 'err'); }
  };
}

/* ================================================================
   页面：运维工单
   ================================================================ */
const orderQuery = { keyword: '', status: '', start: '', end: '', page: 1, size: 10 };

async function pageOrders() {
  view.innerHTML = `
    <div class="page-head">
      <div><h1>运维工单</h1><p>隐患整改派单与闭环跟踪；工单办结且无未整改隐患时广告牌自动恢复「正常」</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn" id="btnExport">${ICON.export} 导出运维台账</button>
        <button class="btn primary" id="btnNew">${ICON.plus} 新建工单</button>
      </div>
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search">${ICON.search}<input id="q" placeholder="工单号 / 标题 / 广告牌 / 负责人" value="${esc(orderQuery.keyword)}"></div>
        <div class="field"><label>状态</label><select id="fStatus"><option value="">全部</option>
          ${state.options.order_status.map((s) => `<option ${orderQuery.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
        <div class="field"><label>起</label><input id="fStart" type="date" value="${orderQuery.start}"></div>
        <div class="field"><label>止</label><input id="fEnd" type="date" value="${orderQuery.end}"></div>
        <div class="grow"></div>
        <button class="btn" id="btnReset">重置</button>
      </div>
      <div id="tableBox"></div><div id="pagerBox"></div>
    </div>`;

  const load = async () => {
    const data = await api('/api/work-orders?' + new URLSearchParams(orderQuery));
    $('#tableBox').innerHTML = `
      <table>
        <thead><tr><th>工单编号</th><th>广告牌</th><th>标题</th><th>类型</th><th>优先级</th><th>负责人</th><th>状态</th><th>创建 / 完成</th><th style="width:190px">操作</th></tr></thead>
        <tbody>
          ${data.items.length ? data.items.map((o) => `
            <tr>
              <td class="strong num">${esc(o.order_no)}</td>
              <td>${esc(o.billboard_name)}<div class="muted">${esc(o.billboard_code)}</div></td>
              <td>${esc(o.title)}${o.hazard_type ? `<div class="muted">关联${esc(o.hazard_type)}隐患</div>` : ''}</td>
              <td>${esc(o.work_type)}</td>
              <td>${priorityTag(o.priority)}</td>
              <td>${dash(o.assignee)}</td>
              <td>${statusTag(o.status)}</td>
              <td class="num muted">${fmt(o.create_time)}${o.finish_time ? `<div>${fmt(o.finish_time)}</div>` : ''}</td>
              <td><div class="actions">
                ${o.status === '待派发' ? `<button class="btn sm" data-set="${o.id}|处理中">派发</button>` : ''}
                ${['待派发', '处理中'].includes(o.status) ? `<button class="btn sm" data-set="${o.id}|已完成">办结</button>` : ''}
                ${o.status !== '已关闭' ? `<button class="btn sm" data-set="${o.id}|已关闭">关闭</button>` : ''}
                <button class="btn sm" data-attach="${o.id}">附件</button>
              </div></td>
            </tr>`).join('') : emptyRow(9)}
        </tbody>
      </table>`;
    const box = $('#pagerBox'); box.innerHTML = '';
    box.appendChild(pager(data, (p) => { orderQuery.page = p; load(); }));

    $$('[data-set]').forEach((el) => el.onclick = async () => {
      const [id, status] = el.dataset.set.split('|');
      try {
        const r = await api(`/api/work-orders/${id}/status`, { method: 'PUT', body: { status } });
        toast(`工单已${status}，广告牌状态：${r.billboard_status}`);
        load(); loadOptions();
      } catch (e) { toast(e.message, 'err'); }
    });
    $$('[data-attach]').forEach((el) => el.onclick = () => {
      const o = data.items.find((x) => x.id == el.dataset.attach);
      attachPanel('work_order', o.id, o.order_no);
    });
  };

  $('#q').addEventListener('input', debounce((e) => { orderQuery.keyword = e.target.value; orderQuery.page = 1; load(); }, 260));
  $('#fStatus').onchange = (e) => { orderQuery.status = e.target.value; orderQuery.page = 1; load(); };
  $('#fStart').onchange = (e) => { orderQuery.start = e.target.value; orderQuery.page = 1; load(); };
  $('#fEnd').onchange = (e) => { orderQuery.end = e.target.value; orderQuery.page = 1; load(); };
  $('#btnReset').onclick = () => { Object.assign(orderQuery, { keyword: '', status: '', start: '', end: '', page: 1 }); pageOrders(); };
  $('#btnNew').onclick = () => orderForm();
  $('#btnExport').onclick = () => {
    const p = new URLSearchParams({ type: 'ledger', start: orderQuery.start, end: orderQuery.end, keyword: orderQuery.keyword });
    window.location = '/api/export?' + p.toString();
  };
  load();
}

async function orderForm(fixedBoard, hazard) {
  const boards = state.options.billboards;
  const bid = fixedBoard || (hazard ? hazard.billboard_id : boards[0]?.id);
  const m = openModal({
    title: '新建运维工单',
    subtitle: hazard ? `来源隐患：${hazard.description}` : '选择广告牌后可关联未整改隐患',
    body: `<div class="form-grid">
      ${row('广告牌', `<select id="o_bid" ${hazard ? 'disabled' : ''}>
        ${boards.map((b) => `<option value="${b.id}" ${b.id === bid ? 'selected' : ''}>${esc(b.code)} · ${esc(b.name)}</option>`).join('')}
      </select>`, true)}
      ${row('工单标题', `<input id="o_title" placeholder="如：高立柱基础加固">`, true)}
      ${row('作业类型', select('o_type', state.options.work_types, '维修'))}
      ${row('优先级', select('o_prio', state.options.priorities, '中'))}
      ${row('负责人', `<input id="o_assignee" placeholder="刘工">`)}
      ${row('初始状态', select('o_status', ['待派发', '处理中'], '待派发'))}
      ${row('关联隐患', `<select id="o_hazard"><option value="">不关联</option></select>`, false, '关联后隐患自动置为「整改中」，工单办结时同步置为「已整改」', true)}
      ${row('备注', `<textarea id="o_remark" rows="2" placeholder="选填"></textarea>`, false, '', true)}
    </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-save>创建工单</button>`,
  });

  const loadHazards = async () => {
    const sel = $('#o_hazard');
    const boardId = Number($('#o_bid').value);
    try {
      const data = await api(`/api/hazards?status=待整改&size=100&keyword=`);
      const list = data.items.filter((h) => h.billboard_id === boardId || h.billboard_id === String(boardId));
      sel.innerHTML = '<option value="">不关联</option>' + list.map((h) =>
        `<option value="${h.id}" ${hazard && h.id === hazard.id ? 'selected' : ''}>#${h.id} ${esc(h.hazard_type)}·${esc(h.level)} — ${esc(h.description).slice(0, 28)}</option>`).join('');
      if (hazard && !list.some((h) => h.id === hazard.id)) {
        sel.innerHTML += `<option value="${hazard.id}" selected>#${hazard.id} ${esc(hazard.hazard_type)}·${esc(hazard.level)}</option>`;
      }
    } catch { /* 忽略 */ }
  };
  $('#o_bid').onchange = loadHazards;
  await loadHazards();

  m.root.querySelector('[data-save]').onclick = async () => {
    try {
      await api('/api/work-orders', {
        method: 'POST',
        body: {
          billboard_id: Number($('#o_bid').value), title: val('o_title'), work_type: val('o_type'),
          priority: val('o_prio'), assignee: val('o_assignee'), status: val('o_status'),
          hazard_id: val('o_hazard') ? Number(val('o_hazard')) : null, remark: val('o_remark'),
        },
      });
      toast('工单创建成功');
      m.close(); pageOrders(); loadOptions();
    } catch (e) { toast(e.message, 'err'); }
  };
}

/* ================================================================
   页面：附件管理
   ================================================================ */
async function pageAttachments() {
  view.innerHTML = `
    <div class="page-head">
      <div><h1>附件管理</h1><p>附件与广告牌 / 巡检 / 工单绑定；同名文件按「时间戳 + 随机串」重命名，不再互相覆盖</p></div>
      <button class="btn primary" id="btnUpload">${ICON.upload} 上传附件</button>
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search">${ICON.search}<input id="q" placeholder="搜索文件名"></div>
        <div class="field"><label>关联类型</label>
          <select id="fType"><option value="">全部</option><option value="billboard">广告牌</option>
            <option value="inspection">巡检记录</option><option value="work_order">运维工单</option></select>
        </div>
        <div class="grow"></div>
        <span class="sub" id="count"></span>
      </div>
      <div id="tableBox"></div>
    </div>`;

  let keyword = '', bizType = '';
  const load = async () => {
    const data = await api('/api/attachments?' + new URLSearchParams({ keyword, biz_type: bizType }));
    $('#count').textContent = `共 ${data.total} 个附件`;
    $('#tableBox').innerHTML = `
      <table>
        <thead><tr><th>文件名</th><th>关联对象</th><th>存储文件名</th><th>大小</th><th>上传时间</th><th style="width:200px">操作</th></tr></thead>
        <tbody>
          ${data.items.length ? data.items.map((a) => `
            <tr>
              <td class="strong">${esc(a.origin_name)}</td>
              <td>${esc(typeName(a.biz_type))} · ${esc(a.biz_label || a.biz_id)}</td>
              <td class="muted num" style="font-size:11.5px">${esc(a.stored_name)}</td>
              <td class="num muted">${bytes(a.file_size)}</td>
              <td class="num muted">${fmt(a.upload_time)}</td>
              <td><div class="actions">
                <a class="btn sm" href="/api/attachments/${a.id}/download?inline=1" target="_blank">预览</a>
                <a class="btn sm" href="/api/attachments/${a.id}/download">下载</a>
                <button class="btn sm danger" data-del="${a.id}">删除</button>
              </div></td>
            </tr>`).join('') : emptyRow(6, '暂无附件，点击右上角上传')}
        </tbody>
      </table>`;
    $$('[data-del]').forEach((el) => el.onclick = () => {
      confirmDialog('删除附件', '将同时删除磁盘上的物理文件，确定继续？', async () => {
        await api('/api/attachments/' + el.dataset.del, { method: 'DELETE' });
        toast('附件已删除'); load();
      });
    });
  };

  $('#q').addEventListener('input', debounce((e) => { keyword = e.target.value; load(); }, 260));
  $('#fType').onchange = (e) => { bizType = e.target.value; load(); };
  $('#btnUpload').onclick = () => attachPanel(bizType || 'billboard', null, '');
  load();
}

const typeName = (t) => ({ billboard: '广告牌', inspection: '巡检', work_order: '工单' }[t] || t);

async function attachPanel(bizType, bizId, label) {
  let options = '';
  if (bizType === 'billboard') {
    options = state.options.billboards.map((b) => `<option value="${b.id}" ${b.id == bizId ? 'selected' : ''}>${esc(b.code)} · ${esc(b.name)}</option>`).join('');
  } else if (bizType === 'work_order') {
    const d = await api('/api/work-orders?size=100');
    options = d.items.map((o) => `<option value="${o.id}" ${o.id == bizId ? 'selected' : ''}>${esc(o.order_no)} · ${esc(o.title)}</option>`).join('');
  } else {
    const d = await api('/api/inspections?size=100');
    options = d.items.map((i) => `<option value="${i.id}" ${i.id == bizId ? 'selected' : ''}>${esc(i.billboard_code)} · ${fmt(i.inspect_time)} · ${esc(i.inspector)}</option>`).join('');
  }

  const files = [];
  const m = openModal({
    title: '上传附件',
    subtitle: label ? `当前业务对象：${label}` : '附件将绑定到所选业务对象',
    body: `<div class="form-grid">
      ${row('关联类型', `<select id="a_type">
        <option value="billboard" ${bizType === 'billboard' ? 'selected' : ''}>广告牌</option>
        <option value="inspection" ${bizType === 'inspection' ? 'selected' : ''}>巡检记录</option>
        <option value="work_order" ${bizType === 'work_order' ? 'selected' : ''}>运维工单</option>
      </select>`)}
      ${row('关联对象', `<select id="a_biz">${options}</select>`)}
      <div class="form-row full">
        <div class="upload-zone" id="zone">${ICON.upload}
          <div>点击选择文件，或将文件拖拽到此处</div>
          <div class="tip" style="font-size:11px;color:var(--faint);margin-top:4px">支持图片 / PDF / Word / Excel，单个不超过 20MB，可多选</div>
        </div>
        <input type="file" id="a_file" multiple hidden>
        <div id="fileList"></div>
      </div>
    </div>`,
    footer: `<button class="btn" data-close>取消</button><button class="btn primary" data-save>开始上传</button>`,
  });

  const zone = $('#zone'), input = $('#a_file');
  zone.onclick = () => input.click();
  zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('drag'); };
  zone.ondragleave = () => zone.classList.remove('drag');
  zone.ondrop = (e) => { e.preventDefault(); zone.classList.remove('drag'); addFiles(e.dataTransfer.files); };
  input.onchange = () => addFiles(input.files);

  function addFiles(list) {
    Array.from(list).forEach((f) => {
      if (f.size > 20 * 1024 * 1024) { toast(`${f.name} 超过 20MB`, 'err'); return; }
      files.push(f);
    });
    $('#fileList').innerHTML = files.map((f, i) =>
      `<span class="file-chip">${esc(f.name)} · ${bytes(f.size)}<span class="rm" data-i="${i}">×</span></span>`).join('');
    $$('#fileList .rm').forEach((el) => el.onclick = () => { files.splice(Number(el.dataset.i), 1); addFiles([]); });
  }

  m.root.querySelector('[data-save]').onclick = async () => {
    if (!files.length) return toast('请先选择文件', 'err');
    const btn = m.root.querySelector('[data-save]');
    btn.disabled = true; btn.textContent = '上传中…';
    let ok = 0;
    for (const f of files) {
      try {
        const base64 = await readBase64(f);
        await api('/api/attachments', {
          method: 'POST',
          body: { biz_type: val('a_type'), biz_id: Number(val('a_biz')), filename: f.name,
                  content_type: f.type, content_base64: base64 },
        });
        ok++;
      } catch (e) { toast(`${f.name}：${e.message}`, 'err'); }
    }
    if (ok) toast(`已上传 ${ok} 个附件`);
    m.close();
    if (state.page === 'attachments') pageAttachments();
  };
}

function readBase64(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error('读取文件失败'));
    fr.readAsDataURL(file);
  });
}

/* ================================================================
   页面：台账导出
   ================================================================ */
function pageExport() {
  view.innerHTML = `
    <div class="page-head">
      <div><h1>台账导出</h1><p>固定表头顺序、空值统一补空、单次最多导出 1000 条，避免大数据量请求超时</p></div>
    </div>
    <div class="grid-2b" style="margin-top:0">
      ${exportCard('ledger', '运维台账', '工单 + 广告牌 + 隐患三表联查，14 列固定表头', [
        ['工单编号', '广告牌编号', '广告牌名称', '所在路段', '桩号', '工单类型', '关联隐患',
          '隐患等级', '优先级', '负责人', '工单状态', '创建时间', '完成时间', '备注']])}
      ${exportCard('hazard', '隐患台账', '按发现时间统计的隐患闭环情况', [
        ['隐患编号', '广告牌编号', '广告牌名称', '所在路段', '隐患类型', '隐患等级',
          '隐患描述', '发现时间', '整改状态', '整改完成时间']])}
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-head"><h2>广告牌资产档案</h2><span class="sub">全量资产清单，11 列固定表头</span></div>
      <div class="card-body">
        <div class="toolbar" style="padding:0;border:none">
          <div class="field"><label>关键字</label><input id="bbKw" placeholder="编号 / 名称 / 路段" style="width:220px"></div>
          <div class="grow"></div>
          <button class="btn primary" data-export="billboard">导出资产档案</button>
        </div>
        <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">
          ${['广告牌编号', '广告牌名称', '所在路段', '桩号', '方向', '媒体类型', '版面尺寸', '面数', '权属单位', '建设日期', '当前状态']
            .map((h) => `<span class="tag plain">${h}</span>`).join('')}
        </div>
      </div>
    </div>`;

  $$('[data-export]').forEach((btn) => btn.onclick = () => {
    const kind = btn.dataset.export;
    const card = btn.closest('.card');
    const p = new URLSearchParams({ type: kind });
    if (kind === 'billboard') p.set('keyword', $('#bbKw').value || '');
    else {
      const s = card.querySelector('.ex-start').value;
      const e = card.querySelector('.ex-end').value;
      if (s) p.set('start', s);
      if (e) p.set('end', e);
    }
    window.location = '/api/export?' + p.toString();
    toast('导出任务已开始，请留意浏览器下载');
  });
}

function exportCard(type, title, desc, headers) {
  return `<div class="card">
    <div class="card-head"><h2>${esc(title)}</h2><span class="sub">${esc(desc)}</span></div>
    <div class="card-body">
      <div class="toolbar" style="padding:0;border:none;margin-bottom:14px">
        <div class="field"><label>开始日期</label><input class="ex-start" type="date"></div>
        <div class="field"><label>结束日期</label><input class="ex-end" type="date"></div>
        <div class="grow"></div>
        <button class="btn primary" data-export="${type}">${ICON.export} 导出 Excel</button>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${headers[0].map((h) => `<span class="tag plain">${h}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

/* ================================================================
   公共小工具
   ================================================================ */
function row(label, control, req = false, tip = '', full = false) {
  return `<div class="form-row ${full ? 'full' : ''}">
    <label>${esc(label)}${req ? '<span class="req">*</span>' : ''}</label>${control}
    ${tip ? `<span class="tip">${esc(tip)}</span>` : ''}</div>`;
}
const lbl = (t) => `<label>${esc(t)}</label>`;

function select(id, list, current) {
  return `<select id="${id}">${list.map((v) => `<option ${String(v) === String(current) ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>`;
}
const val = (id) => { const el = $('#' + id); return el ? el.value.trim() : ''; };

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

async function loadOptions() {
  state.options = await api('/api/options');
  return state.options;
}

function tickClock() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  $('#clock').textContent = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} 周${week} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const PAGES = {
  dashboard: pageDashboard,
  billboards: pageBillboards,
  inspections: pageInspections,
  hazards: pageHazards,
  orders: pageOrders,
  attachments: pageAttachments,
  export: pageExport,
};

(async function boot() {
  tickClock();
  setInterval(tickClock, 30000);
  try {
    await loadOptions();
  } catch (e) {
    view.innerHTML = `<div class="empty">无法连接后端服务：${esc(e.message)}</div>`;
    return;
  }
  const initial = (location.hash || '#/dashboard').replace('#/', '');
  go(NAV.some((n) => n.id === initial) ? initial : 'dashboard');
  // 隐患角标
  try {
    const h = await api('/api/hazards?status=待整改&size=1');
    const badge = $('#hazardBadge');
    if (badge) { badge.hidden = !h.total; badge.textContent = h.total; }
  } catch { /* 忽略 */ }
})();

window.addEventListener('hashchange', () => {
  const p = (location.hash || '#/dashboard').replace('#/', '');
  if (p !== state.page) go(p);
});
