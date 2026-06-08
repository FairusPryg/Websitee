'use strict';

/* ─── CONSTANTS ─────────────────────────────────────────────────────── */
const STORAGE_KEY = 'expense_tracker_v1';
const CATEGORIES = [
  { id: 'makanan', label: 'Makanan', icon: '🍜', color: '#FF6B35' },
  { id: 'transport', label: 'Transport', icon: '🚌', color: '#3B82F6' },
  { id: 'belanja', label: 'Belanja', icon: '🛒', color: '#A855F7' },
  { id: 'tagihan', label: 'Tagihan', icon: '🧾', color: '#EF4444' },
  { id: 'hiburan', label: 'Hiburan', icon: '🎮', color: '#10B981' },
  { id: 'kesehatan', label: 'Kesehatan', icon: '💊', color: '#06B6D4' },
  { id: 'pendidikan', label: 'Pendidikan', icon: '📚', color: '#F59E0B' },
  { id: 'lainnya', label: 'Lainnya', icon: '📦', color: '#64748B' },
];

const INCOME_CATEGORIES = [
  { id: 'gaji', label: 'Gaji', icon: '💼', color: '#10B981' },
  { id: 'investasi', label: 'Investasi', icon: '📈', color: '#3B82F6' },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#F59E0B' },
  { id: 'lainnya', label: 'Lainnya', icon: '📦', color: '#64748B' },
];

/* ─── STATE ──────────────────────────────────────────────────────────── */
let expenses = [];
let currentMode = 'daily';
let currentFilter = '';
let editId = null;
let deleteId = null;
let selectedCat = '';
let counterAnimId = null;
let selectedType = 'pengeluaran';
let currentChartType = 'pengeluaran';

/* ─── STORAGE ────────────────────────────────────────────────────────── */
function loadData() {
  try { expenses = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { expenses = []; }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

/* ─── FORMAT ─────────────────────────────────────────────────────────── */
const fmtRupiah = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const fmtRupiahShort = n => {
  const sign = n < 0 ? '-' : '';
  const absN = Math.abs(n);
  if (absN >= 1_000_000_000) return sign + 'Rp' + (absN / 1_000_000_000).toFixed(1) + 'm';
  if (absN >= 1_000_000) return sign + 'Rp ' + (absN / 1_000_000).toFixed(1) + 'jt';
  if (absN >= 1_000) return sign + 'Rp ' + (absN / 1_000).toFixed(0) + 'rb';
  return sign + 'Rp ' + absN;
};

/* ─── FILTER LOGIC ───────────────────────────────────────────────────── */
function filterExpenses(mode, value) {
  if (!value) return [];
  return expenses.filter(e => {
    if (mode === 'daily') return e.date === value;
    if (mode === 'monthly') return e.date.startsWith(value + '-');
    if (mode === 'yearly') return e.date.startsWith(value + '-');
    return false;
  });
}

/* ─── HEADER DATE ────────────────────────────────────────────────────── */
function renderHeaderDate() {
  document.getElementById('headerDate').textContent =
    new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

/* ─── MODE TABS ──────────────────────────────────────────────────────── */
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode));

  const input = document.getElementById('filterInput');
  const today = new Date();
  const pad = n => String(n).padStart(2, '0');
  const yyyy = today.getFullYear();
  const mm = pad(today.getMonth() + 1);
  const dd = pad(today.getDate());

  if (mode === 'daily') { input.placeholder = 'YYYY-MM-DD'; input.value = `${yyyy}-${mm}-${dd}`; input.maxLength = 10; }
  if (mode === 'monthly') { input.placeholder = 'YYYY-MM'; input.value = `${yyyy}-${mm}`; input.maxLength = 7; }
  if (mode === 'yearly') { input.placeholder = 'YYYY'; input.value = `${yyyy}`; input.maxLength = 4; }

  applyFilter();
}

/* ─── APPLY FILTER ───────────────────────────────────────────────────── */
function applyFilter() {
  const raw = document.getElementById('filterInput').value.trim();
  const patterns = { daily: /^\d{4}-\d{2}-\d{2}$/, monthly: /^\d{4}-\d{2}$/, yearly: /^\d{4}$/ };
  if (!patterns[currentMode].test(raw)) {
    showToast({ daily: 'Format: YYYY-MM-DD', monthly: 'Format: YYYY-MM', yearly: 'Format: YYYY' }[currentMode], 'error');
    return;
  }
  currentFilter = raw;
  const filtered = filterExpenses(currentMode, raw);
  renderHero(filtered, raw);
  renderList(filtered);
  renderChart(filtered);
}

/* ─── HERO ───────────────────────────────────────────────────────────── */
function renderHero(list, label) {
  const incomeList = list.filter(e => e.type === 'pemasukan');
  const expenseList = list.filter(e => !e.type || e.type === 'pengeluaran');

  const totalIncome = incomeList.reduce((s, e) => s + e.amount, 0);
  const totalExpense = expenseList.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const count = list.length;
  animateCounter(document.getElementById('heroAmount'), netBalance);
  document.getElementById('heroSub').textContent =
    currentMode === 'daily' ? `Pemasukan & Pengeluaran Pada ${label}` :
      currentMode === 'monthly' ? `Pemasukan & Pengeluaran Pada ${label}` :
        `Pemasukan & Pengeluaran Pada ${label}`;
  document.getElementById('statCount').textContent = count;
  document.getElementById('statIncome').textContent = fmtRupiah(totalIncome);
  document.getElementById('statExpense').textContent = fmtRupiah(totalExpense);
}

function animateCounter(el, target) {
  if (counterAnimId) cancelAnimationFrame(counterAnimId);
  const t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / 600, 1);
    const val = Math.round(target * (1 - Math.pow(1 - p, 3)));
    const sign = val < 0 ? '-' : '';
    el.textContent = sign + Math.abs(val).toLocaleString('id-ID');
    if (p < 1) { counterAnimId = requestAnimationFrame(tick); } else { counterAnimId = null; }
  };
  counterAnimId = requestAnimationFrame(tick);
}

/* ─── CHART ──────────────────────────────────────────────────────────── */
function setChartType(type) {
  currentChartType = type;
  document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.chartType === type);
  });
  const filtered = filterExpenses(currentMode, currentFilter);
  renderChart(filtered);
}

function renderChart(list) {
  const card = document.getElementById('chartCard');
  const targetList = list.filter(e => {
    const t = e.type || 'pengeluaran';
    return t === currentChartType;
  });

  if (!targetList.length) { card.classList.remove('visible'); return; }
  const totals = {};
  targetList.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!entries.length) { card.classList.remove('visible'); return; }
  card.classList.add('visible');

  const totalAmt = entries.reduce((sum, [_, amt]) => sum + amt, 0);
  const container = document.getElementById('chartPieContainer');

  let currentAngle = 0;
  const gradientParts = [];
  let legendHTML = '';

  const activeCategories = currentChartType === 'pemasukan' ? INCOME_CATEGORIES : CATEGORIES;

  entries.forEach(([catId, amt]) => {
    const cat = activeCategories.find(c => c.id === catId) || { label: catId, icon: '📦', color: '#64748B' };
    const pct = totalAmt > 0 ? (amt / totalAmt) * 100 : 0;
    const nextAngle = currentAngle + pct;
    gradientParts.push(`${cat.color} ${currentAngle.toFixed(1)}% ${nextAngle.toFixed(1)}%`);
    currentAngle = nextAngle;

    legendHTML += `
      <div class="chart-legend-item">
        <div class="chart-legend-left">
          <span class="chart-legend-color" style="background: ${cat.color};"></span>
          <span class="chart-legend-lbl">${cat.icon} ${cat.label}</span>
        </div>
        <div class="chart-legend-right">
          <span class="chart-legend-pct">${pct.toFixed(0)}%</span>
          <span class="chart-legend-amt">${fmtRupiahShort(amt)}</span>
        </div>
      </div>
    `;
  });

  const conicGradientValue = gradientParts.length > 0 ? `conic-gradient(${gradientParts.join(', ')})` : 'var(--surface-2)';

  container.innerHTML = `
    <div class="chart-pie-layout">
      <div class="chart-pie-wrapper">
        <div class="chart-pie-donut" style="background: ${conicGradientValue}">
          <div class="chart-pie-center">
            <span class="chart-pie-center-val">${fmtRupiahShort(totalAmt)}</span>
            <span class="chart-pie-center-lbl">Total</span>
          </div>
        </div>
      </div>
      <div class="chart-legend">
        ${legendHTML}
      </div>
    </div>
  `;
}

/* ─── LIST ───────────────────────────────────────────────────────────── */
function renderList(list) {
  const ul = document.getElementById('txList');
  const empty = document.getElementById('emptyState');
  document.getElementById('sectionCount').textContent = `${list.length} item`;
  if (!list.length) { ul.innerHTML = ''; empty.classList.add('visible'); return; }
  empty.classList.remove('visible');
  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
  ul.innerHTML = '';
  sorted.forEach((e, i) => {
    const isIncome = e.type === 'pemasukan';
    const activeCategories = isIncome ? INCOME_CATEGORIES : CATEGORIES;
    const cat = activeCategories.find(c => c.id === e.category) || { label: e.category, icon: '📦', color: '#64748B' };
    
    const sign = isIncome ? '+' : '-';
    const color = isIncome ? '#10B981' : '#FF6B6B';

    const div = document.createElement('div');
    div.className = 'tx-item';
    div.style.animationDelay = `${i * 40}ms`;
    div.innerHTML = `
  <div class="tx-badge" style="background:${cat.color}22;"><span>${cat.icon}</span></div>
  <div class="tx-info">
    <div class="tx-category" style="color:${cat.color}">${cat.label}</div>
    <div class="tx-note">${escHtml(e.note || 'Tidak ada catatan')}</div>
    <div class="tx-date">${e.date}</div>
  </div>
  <div class="tx-right">
    <div class="tx-amount" style="color: ${color};">${sign} ${fmtRupiah(e.amount)}</div>
    <div class="tx-actions">
      <button class="tx-btn tx-btn-edit" onclick="openEdit('${e.id}',event)" title="Edit">✏️</button>
      <button class="tx-btn tx-btn-del"  onclick="openDelete('${e.id}',event)" title="Hapus">🗑️</button>
    </div>
  </div>`;
    ul.appendChild(div);
  });
}

/* ─── MODAL ──────────────────────────────────────────────────────────── */
function selectType(type) {
  selectedType = type;
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  selectedCat = '';
  buildCatGrid();
}

function buildCatGrid() {
  const grid = document.getElementById('catGrid');
  grid.innerHTML = '';
  const activeCategories = selectedType === 'pemasukan' ? INCOME_CATEGORIES : CATEGORIES;
  activeCategories.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn'; btn.dataset.id = c.id;
    btn.innerHTML = `<span class="cat-icon">${c.icon}</span><span class="cat-name">${c.label}</span>`;
    btn.onclick = () => selectCat(c.id);
    grid.appendChild(btn);
  });
}

function selectCat(id) {
  selectedCat = id;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('selected', b.dataset.id === id));
  document.getElementById('fieldCategory').classList.remove('has-error');
}

function openModal() {
  editId = null; selectedCat = '';
  document.getElementById('modalTitle').textContent = 'Tambah Pemasukan & Pengeluaran';
  document.getElementById('btnSave').textContent = 'Simpan Transaksi';
  document.getElementById('inputDate').value = todayISO();
  document.getElementById('inputAmount').value = '';
  document.getElementById('inputNote').value = '';
  clearErrors(); 
  selectType('pengeluaran');
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openEdit(id, e) {
  e.stopPropagation();
  const exp = expenses.find(x => x.id === id);
  if (!exp) return;
  editId = id; selectedCat = exp.category;
  document.getElementById('modalTitle').textContent = 'Edit Transaksi';
  document.getElementById('btnSave').textContent = 'Simpan Perubahan';
  document.getElementById('inputDate').value = exp.date;
  document.getElementById('inputAmount').value = formatNumberWithDots(exp.amount.toString());
  document.getElementById('inputNote').value = exp.note || '';
  clearErrors(); 
  selectType(exp.type || 'pengeluaran');
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
  const date = document.getElementById('inputDate').value;
  const amountRaw = document.getElementById('inputAmount').value;
  const amount = parseFloat(amountRaw.replace(/\./g, ''));
  const note = document.getElementById('inputNote').value.trim();
  let valid = true;
  clearErrors();
  if (!date) { document.getElementById('fieldDate').classList.add('has-error'); valid = false; }
  if (!amount || amount <= 0) { document.getElementById('fieldAmount').classList.add('has-error'); valid = false; }
  if (!selectedCat) { document.getElementById('fieldCategory').classList.add('has-error'); valid = false; }
  if (!valid) return;

  if (editId) {
    const idx = expenses.findIndex(e => e.id === editId);
    if (idx > -1) {
      expenses[idx] = { ...expenses[idx], date, amount, type: selectedType, category: selectedCat, note, updatedAt: Date.now() };
      showToast('Transaksi diperbarui ✓', 'success');
    }
  } else {
    expenses.unshift({ id: genId(), date, amount, type: selectedType, category: selectedCat, note, createdAt: Date.now() });
    showToast('Transaksi disimpan ✓', 'success');
  }
  saveData(); closeModal();
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
  saveData(); closeConfirm();
  showToast('Transaksi dihapus', 'success');
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
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function formatNumberWithDots(val) {
  return val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function showToast(msg, type = 'success') {
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`; t.textContent = msg;
  wrap.appendChild(t); setTimeout(() => t.remove(), 2700);
}

/* ─── KEYBOARD ───────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeConfirm(); }
  if (e.key === 'Enter' && document.activeElement === document.getElementById('filterInput')) applyFilter();
});

/* ─── INIT ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderHeaderDate();
  setMode('daily');

  document.getElementById('inputAmount').addEventListener('input', function (e) {
    this.value = formatNumberWithDots(this.value);
  });
});