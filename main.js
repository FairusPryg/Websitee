'use strict';

/* ─── CONSTANTS ─────────────────────────────────────────────────────── */
const STORAGE_KEY = 'expense_tracker_v1';

// Perubahan warna kategori Belanja menjadi Oranye Jingga (#ff7607)
const CATEGORIES = [
  { id:'makanan',    label:'Makanan',    icon:'🍜', color:'#FF6B35' },
  { id:'transport',  label:'Transport',  icon:'🚌', color:'#3B82F6' },
  { id:'belanja',    label:'Belanja',    icon:'🛒', color:'#ff7607' }, 
  { id:'tagihan',    label:'Tagihan',    icon:'🧾', color:'#f2f1f1' },
  { id:'hiburan',    label:'Hiburan',    icon:'🎮', color:'#10B981' },
  { id:'kesehatan',  label:'Kesehatan',  icon:'💊', color:'#06B6D4' },
  { id:'pendidikan', label:'Pendidikan', icon:'📚', color:'#F59E0B' },
  { id:'lainnya',    label:'Lainnya',    icon:'📦', color:'#64748B' },
];

/* ─── STATE ──────────────────────────────────────────────────────────── */
let expenses        = [];
let currentMode     = 'daily';
let currentFilter   = '';
let editId          = null;
let deleteId        = null;
let selectedCat     = '';
let counterAnimId   = null; // FIX #4: track animasi counter agar bisa dibatalkan

/* ─── STORAGE ────────────────────────────────────────────────────────── */
function loadData() {
  try { expenses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { expenses = []; }
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ─── FORMAT ─────────────────────────────────────────────────────────── */
const fmtRupiah = n =>
  'Rp ' + Math.round(n).toLocaleString('id-ID');

const fmtRupiahShort = n => {
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + 'jt';
  if (n >= 1_000)     return 'Rp ' + (n / 1_000).toFixed(0) + 'rb';
  return 'Rp ' + n;
};

/* ─── FILTER LOGIC ───────────────────────────────────────────────────── */
function filterExpenses(mode, value) {
  if (!value) return [];
  return expenses.filter(e => {
    if (mode === 'daily')   return e.date === value;
    if (mode === 'monthly') return e.date.startsWith(value + '-');
    // FIX #2: cukup startsWith(value + '-') saja, tidak perlu kondisi kedua
    if (mode === 'yearly')  return e.date.startsWith(value + '-');
    return false;
  });
}

/* ─── UI: HEADER DATE ────────────────────────────────────────────────── */
function renderHeaderDate() {
  const now  = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  document.getElementById('headerDate').textContent =
    now.toLocaleDateString('id-ID', opts);
}

/* ─── UI: MODE TABS ──────────────────────────────────────────────────── */
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });

  const input = document.getElementById('filterInput');
  const today = new Date();
  const pad   = n => String(n).padStart(2, '0');
  const yyyy  = today.getFullYear();
  const mm    = pad(today.getMonth() + 1);
  const dd    = pad(today.getDate());

  if (mode === 'daily')   { input.placeholder = 'DD-MM-YYY'; input.value = `${dd}-${mm}-${yyyy}`; input.maxLength = 10; }
  if (mode === 'monthly') { input.placeholder = 'MM-YYY';    input.value = `${mm}-${yyyy}`;       input.maxLength = 7;  }
  if (mode === 'yearly')  { input.placeholder = 'YYYY';       input.value = `${yyyy}`;             input.maxLength = 4;  }

  applyFilter();
}

/* ─── UI: APPLY FILTER ───────────────────────────────────────────────── */
function applyFilter() {
  const raw = document.getElementById('filterInput').value.trim();

  const patterns = {
    daily:   /^\d{4}-\d{2}-\d{2}$/,
    monthly: /^\d{4}-\d{2}$/,
    yearly:  /^\d{4}$/,
  };

  if (!patterns[currentMode].test(raw)) {
    const hints = {
      daily:   'Format: YYYY-MM-DD',
      monthly: 'Format: YYYY-MM',
      yearly:  'Format: YYYY',
    };
    showToast(hints[currentMode], 'error');
    return;
  }

  currentFilter = raw;
  const filtered = filterExpenses(currentMode, raw);
  renderHero(filtered, raw);
  renderList(filtered);
  renderChart(filtered);
}

/* ─── UI: HERO ───────────────────────────────────────────────────────── */
function renderHero(list, label) {
  const total = list.reduce((s, e) => s + e.amount, 0);
  const count = list.length;
  const avg   = count ? total / count : 0;
  const max   = count ? Math.max(...list.map(e => e.amount)) : 0;

  animateCounter(document.getElementById('heroAmount'), total);

  document.getElementById('heroSub').textContent =
    currentMode === 'daily'   ? `Pengeluaran tanggal ${label}` :
    currentMode === 'monthly' ? `Pengeluaran bulan ${label}`   :
                                `Pengeluaran tahun ${label}`;

  document.getElementById('statCount').textContent = count;
  document.getElementById('statAvg').textContent   = fmtRupiahShort(avg);
  document.getElementById('statTop').textContent   = count ? fmtRupiahShort(max) : '—';
}

// FIX #4: cancel animasi sebelumnya sebelum mulai yang baru
function animateCounter(el, target) {
  if (counterAnimId) cancelAnimationFrame(counterAnimId);
  const dur = 600;
  const t0  = performance.now();
  const tick = now => {
    const p    = Math.min((now - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * ease).toLocaleString('id-ID');
    if (p < 1) { counterAnimId = requestAnimationFrame(tick); }
    else        { counterAnimId = null; }
  };
  counterAnimId = requestAnimationFrame(tick);
}

/* ─── UI: CHART ──────────────────────────────────────────────────────── */
function renderChart(list) {
  const card = document.getElementById('chartCard');
  if (!list.length) { card.classList.remove('visible'); return; }

  const totals = {};
  list.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 8);

  if (!entries.length) { card.classList.remove('visible'); return; }
  card.classList.add('visible');

  const maxVal = Math.max(...entries.map(e => e[1]));
  const wrap   = document.getElementById('chartBars');
  wrap.innerHTML = '';

  entries.forEach(([catId, amt]) => {
    const cat = CATEGORIES.find(c => c.id === catId) || { label: catId, icon: '📦', color: '#64748B' };
    const pct = maxVal > 0 ? (amt / maxVal) * 100 : 0;
    const div = document.createElement('div');
    div.className = 'chart-bar-wrap';
    div.innerHTML = `
      <span class="chart-bar-amt">${fmtRupiahShort(amt)}</span>
      <div class="chart-bar-outer">
        <div class="chart-bar" style="height:${pct}%;background:${cat.color};"></div>
      </div>
      <span class="chart-bar-lbl">${cat.icon} ${cat.label}</span>
    `;
    wrap.appendChild(div);
  });
}

/* ─── UI: LIST ───────────────────────────────────────────────────────── */
function renderList(list) {
  const ul    = document.getElementById('txList');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('sectionCount');

  count.textContent = `${list.length} item`;

  if (!list.length) {
    ul.innerHTML = '';
    empty.classList.add('visible');
    return;
  }
  empty.classList.remove('visible');

  const sorted = [...list].sort((a, b) =>
    b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  ul.innerHTML = '';

  sorted.forEach((e, i) => {
    const cat = CATEGORIES.find(c => c.id === e.category) ||
                { label: e.category, icon: '📦', color: '#64748B' };
    const div = document.createElement('div');
    div.className = 'tx-item';
    div.style.animationDelay = `${i * 40}ms`;
    div.innerHTML = `
      <div class="tx-badge" style="background:${cat.color}22;">
        <span>${cat.icon}</span>
      </div>
      <div class="tx-info">
        <div class="tx-category" style="color:${cat.color}">${cat.label}</div>
        <div class="tx-note">${escHtml(e.note || 'Tidak ada catatan')}</div>
        <div class="tx-date">${e.date}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount">${fmtRupiah(e.amount)}</div>
        <div class="tx-actions">
          <button class="tx-btn tx-btn-edit" onclick="openEdit('${e.id}',event)" title="Edit">✏️</button>
          <button class="tx-btn tx-btn-del"  onclick="openDelete('${e.id}',event)" title="Hapus">🗑️</button>
        </div>
      </div>
    `;
    ul.appendChild(div);
  });
}

/* ─── MODAL ──────────────────────────────────────────────────────────── */
function buildCatGrid() {
  const grid = document.getElementById('catGrid');
  grid.innerHTML = '';
  CATEGORIES.forEach(c => {
    const btn      = document.createElement('button');
    btn.className  = 'cat-btn';
    btn.dataset.id = c.id;
    btn.innerHTML  = `<span class="cat-icon">${c.icon}</span><span class="cat-name">${c.label}</span>`;
    btn.onclick    = () => selectCat(c.id);
    grid.appendChild(btn);
  });
}

function selectCat(id) {
  selectedCat = id;
  document.querySelectorAll('.cat-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.id === id);
  });
  document.getElementById('fieldCategory').classList.remove('has-error');
}

function openModal() {
  editId = null; selectedCat = '';
  document.getElementById('modalTitle').textContent = 'Tambah Pengeluaran';
  document.getElementById('btnSave').textContent    = 'Simpan Pengeluaran';
  document.getElementById('inputDate').value        = todayISO();
  document.getElementById('inputAmount').value      = '';
  document.getElementById('inputNote').value        = '';
  clearErrors();
  buildCatGrid();
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openEdit(id, e) {
  e.stopPropagation();
  const exp = expenses.find(x => x.id === id);
  if (!exp) return;

  editId = id; selectedCat = exp.category;
  document.getElementById('modalTitle').textContent = 'Edit Pengeluaran';
  document.getElementById('btnSave').textContent    = 'Simpan Perubahan';
  document.getElementById('inputDate').value        = exp.date;
  document.getElementById('inputAmount').value      = exp.amount;
  document.getElementById('inputNote').value        = exp.note || '';
  clearErrors();
  buildCatGrid();
  selectCat(exp.category);
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function overlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeModal();
}

/* ─── SAVE ───────────────────────────────────────────────────────────── */
function saveExpense() {
  const date   = document.getElementById('inputDate').value;
  const amount = parseFloat(document.getElementById('inputAmount').value);
  const note   = document.getElementById('inputNote').value.trim();
  let valid    = true;

  clearErrors();
  if (!date)              { document.getElementById('fieldDate').classList.add('has-error');     valid = false; }
  if (!amount || amount <= 0) { document.getElementById('fieldAmount').classList.add('has-error'); valid = false; }
  if (!selectedCat)       { document.getElementById('fieldCategory').classList.add('has-error'); valid = false; }
  if (!valid) return;

  if (editId) {
    const idx = expenses.findIndex(e => e.id === editId);
    if (idx > -1) {
      // FIX #5: pastikan createdAt tidak hilang saat edit
      expenses[idx] = {
        ...expenses[idx],
        date,
        amount,
        category: selectedCat,
        note,
        updatedAt: Date.now(),
      };
      showToast('Pengeluaran diperbarui ✓', 'success');
    }
  } else {
    expenses.unshift({
      id: genId(), date, amount,
      category: selectedCat, note,
      createdAt: Date.now(),
    });
    showToast('Pengeluaran disimpan ✓', 'success');
  }

  saveData();
  closeModal();
  if (currentFilter) applyFilter();
}

/* ─── DELETE ─────────────────────────────────────────────────────────── */
function openDelete(id, e) {
  e.stopPropagation();
  deleteId = id;
  document.getElementById('confirmOverlay').classList.add('open');
}

function closeConfirm() {
  deleteId = null;
  document.getElementById('confirmOverlay').classList.remove('open');
}

function confirmDelete() {
  expenses = expenses.filter(e => e.id !== deleteId);
  saveData();
  closeConfirm();
  showToast('Pengeluaran dihapus', 'success');
  if (currentFilter) applyFilter();
}

/* ─── HELPERS ────────────────────────────────────────────────────────── */
function clearErrors() {
  ['fieldDate', 'fieldAmount', 'fieldCategory'].forEach(id =>
    document.getElementById(id).classList.remove('has-error'));
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function escHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  const t    = document.createElement('div');
  t.className   = `toast toast-${type}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 2700);
}

/* ─── KEYBOARD ───────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeConfirm(); }
  if (e.key === 'Enter' && document.activeElement === document.getElementById('filterInput')) {
    applyFilter();
  }
});