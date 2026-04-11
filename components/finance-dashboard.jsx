import { useState, useMemo, useEffect } from "react";

// ─── Icons (inline SVG components) ───────────────────────────────────────────
const Icons = {
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Wallet: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  TrendUp: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  Alert: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Bulb: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>,
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  List: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
};

// ─── Constants ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "moradia", label: "Moradia", color: "#E8575A" },
  { id: "alimentacao", label: "Alimentação", color: "#F4A940" },
  { id: "transporte", label: "Transporte", color: "#3EAFC4" },
  { id: "lazer", label: "Lazer", color: "#9B6DD7" },
  { id: "saude", label: "Saúde", color: "#4ACA8B" },
  { id: "educacao", label: "Educação", color: "#5B8DEF" },
  { id: "servicos", label: "Serviços", color: "#E87BAF" },
  { id: "outros", label: "Outros", color: "#8E99A9" },
];

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const catColor = (id) => CATEGORIES.find(c => c.id === id)?.color || "#8E99A9";
const catLabel = (id) => CATEGORIES.find(c => c.id === id)?.label || id;
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const INITIAL_DATA = [
  { id: 1, type: "receita", description: "Salário", amount: 6500, category: "outros", date: "2026-04-05", fixed: true },
  { id: 2, type: "receita", description: "Freelance", amount: 1200, category: "outros", date: "2026-04-12", fixed: false },
  { id: 3, type: "despesa", description: "Aluguel", amount: 1800, category: "moradia", date: "2026-04-01", fixed: true },
  { id: 4, type: "despesa", description: "Condomínio", amount: 450, category: "moradia", date: "2026-04-01", fixed: true },
  { id: 5, type: "despesa", description: "Energia", amount: 220, category: "servicos", date: "2026-04-10", fixed: true },
  { id: 6, type: "despesa", description: "Internet", amount: 120, category: "servicos", date: "2026-04-05", fixed: true },
  { id: 7, type: "despesa", description: "Supermercado", amount: 890, category: "alimentacao", date: "2026-04-08", fixed: false },
  { id: 8, type: "despesa", description: "Restaurante", amount: 180, category: "alimentacao", date: "2026-04-15", fixed: false },
  { id: 9, type: "despesa", description: "Uber/Gasolina", amount: 340, category: "transporte", date: "2026-04-11", fixed: false },
  { id: 10, type: "despesa", description: "Academia", amount: 130, category: "saude", date: "2026-04-01", fixed: true },
  { id: 11, type: "despesa", description: "Cinema", amount: 60, category: "lazer", date: "2026-04-20", fixed: false },
  { id: 12, type: "despesa", description: "Curso Online", amount: 90, category: "educacao", date: "2026-04-03", fixed: true },
  // March data
  { id: 13, type: "receita", description: "Salário", amount: 6500, category: "outros", date: "2026-03-05", fixed: true },
  { id: 14, type: "despesa", description: "Aluguel", amount: 1800, category: "moradia", date: "2026-03-01", fixed: true },
  { id: 15, type: "despesa", description: "Supermercado", amount: 750, category: "alimentacao", date: "2026-03-10", fixed: false },
  { id: 16, type: "despesa", description: "Energia", amount: 195, category: "servicos", date: "2026-03-10", fixed: true },
  { id: 17, type: "despesa", description: "Condomínio", amount: 450, category: "moradia", date: "2026-03-01", fixed: true },
  { id: 18, type: "despesa", description: "Uber/Gasolina", amount: 280, category: "transporte", date: "2026-03-14", fixed: false },
];

// ─── Mini Bar Chart (SVG) ───────────────────────────────────────────────
function MiniBarChart({ data, height = 180 }) {
  if (!data.length) return <div style={{ color: "#8E99A9", padding: 20, textAlign: "center", fontSize: 13 }}>Sem dados para exibir</div>;
  const max = Math.max(...data.map(d => Math.max(d.receita, d.despesa)), 1);
  const barW = Math.min(28, Math.floor(260 / data.length));
  const gap = Math.min(16, Math.floor(80 / data.length));
  const w = data.length * (barW * 2 + gap) + 40;
  return (
    <svg viewBox={`0 0 ${w} ${height + 30}`} style={{ width: "100%", maxHeight: height + 30 }}>
      {data.map((d, i) => {
        const x = 20 + i * (barW * 2 + gap);
        const hR = (d.receita / max) * height;
        const hD = (d.despesa / max) * height;
        return (
          <g key={i}>
            <rect x={x} y={height - hR} width={barW} height={hR} rx={4} fill="#4ACA8B" opacity={0.85} />
            <rect x={x + barW + 2} y={height - hD} width={barW} height={hD} rx={4} fill="#E8575A" opacity={0.85} />
            <text x={x + barW} y={height + 18} textAnchor="middle" fontSize="11" fill="#8E99A9" fontFamily="inherit">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Donut Chart (SVG) ──────────────────────────────────────────────────
function DonutChart({ slices, size = 160 }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (!total) return <div style={{ color: "#8E99A9", padding: 20, textAlign: "center", fontSize: 13 }}>Sem despesas</div>;
  const r = size / 2 - 10;
  const cx = size / 2, cy = size / 2;
  let cumAngle = -90;
  const paths = slices.filter(s => s.value > 0).map((sl) => {
    const pct = sl.value / total;
    const angle = pct * 360;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    cumAngle = endAngle;
    const large = angle > 180 ? 1 : 0;
    const rad = Math.PI / 180;
    const x1 = cx + r * Math.cos(startAngle * rad);
    const y1 = cy + r * Math.sin(startAngle * rad);
    const x2 = cx + r * Math.cos(endAngle * rad);
    const y2 = cy + r * Math.sin(endAngle * rad);
    return (
      <path
        key={sl.id}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={sl.color}
        stroke="#1A1D23"
        strokeWidth="2"
      />
    );
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {paths}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#1A1D23" />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700" fontFamily="inherit">{fmt(total)}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#8E99A9" fontSize="10" fontFamily="inherit">total despesas</text>
    </svg>
  );
}

// ─── Modal Component ────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: 16,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#1E2128", borderRadius: 16, padding: "28px 28px 20px", width: "100%", maxWidth: 440,
        border: "1px solid #2A2E37", boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#F0F2F5" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8E99A9", cursor: "pointer", padding: 4 }}><Icons.Close /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState(INITIAL_DATA);
  const [currentMonth, setCurrentMonth] = useState(3); // April = index 3 (0-based)
  const [currentYear, setCurrentYear] = useState(2026);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Form state
  const [form, setForm] = useState({ type: "despesa", description: "", amount: "", category: "outros", date: "", fixed: false });

  const resetForm = () => setForm({ type: "despesa", description: "", amount: "", category: "outros", date: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`, fixed: false });

  const openNew = () => { resetForm(); setEditingTx(null); setShowModal(true); };
  const openEdit = (tx) => { setForm({ ...tx, amount: String(tx.amount) }); setEditingTx(tx.id); setShowModal(true); };

  const save = () => {
    if (!form.description || !form.amount || !form.date) return;
    const entry = { ...form, amount: parseFloat(form.amount) };
    if (editingTx) {
      setTransactions(prev => prev.map(t => t.id === editingTx ? { ...entry, id: editingTx } : t));
    } else {
      setTransactions(prev => [...prev, { ...entry, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const remove = (id) => setTransactions(prev => prev.filter(t => t.id !== id));

  // Filtered data for current month
  const monthTxs = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date + "T00:00:00");
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }), [transactions, currentMonth, currentYear]);

  const filteredTxs = useMemo(() => monthTxs.filter(t => {
    if (filterCat !== "all" && t.category !== filterCat) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date)), [monthTxs, filterCat, filterType]);

  const totalReceita = useMemo(() => monthTxs.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0), [monthTxs]);
  const totalDespesa = useMemo(() => monthTxs.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0), [monthTxs]);
  const saldo = totalReceita - totalDespesa;
  const overBudget = totalDespesa > totalReceita;

  // Category breakdown for current month
  const catBreakdown = useMemo(() =>
    CATEGORIES.map(c => ({
      ...c,
      value: monthTxs.filter(t => t.type === "despesa" && t.category === c.id).reduce((s, t) => s + t.amount, 0),
    })).filter(c => c.value > 0).sort((a, b) => b.value - a.value)
  , [monthTxs]);

  // Last 6 months comparison
  const monthComparison = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m < 0) { m += 12; y -= 1; }
      const txs = transactions.filter(t => { const d = new Date(t.date + "T00:00:00"); return d.getMonth() === m && d.getFullYear() === y; });
      result.push({
        label: MONTHS[m],
        receita: txs.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0),
        despesa: txs.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0),
      });
    }
    return result;
  }, [transactions, currentMonth, currentYear]);

  // Smart tips
  const tips = useMemo(() => {
    const t = [];
    if (catBreakdown.length > 0) {
      const top = catBreakdown[0];
      t.push(`Sua maior despesa é ${top.label} (${fmt(top.value)}). Avalie se há como reduzir.`);
    }
    const fixedTotal = monthTxs.filter(tx => tx.type === "despesa" && tx.fixed).reduce((s, tx) => s + tx.amount, 0);
    if (fixedTotal > totalReceita * 0.5) {
      t.push(`Contas fixas representam ${Math.round(fixedTotal / totalReceita * 100)}% da receita. Tente renegociar contratos.`);
    }
    if (saldo > 0 && totalReceita > 0) {
      t.push(`Você economizou ${Math.round(saldo / totalReceita * 100)}% da receita. ${saldo / totalReceita > 0.2 ? "Ótimo trabalho!" : "Tente chegar a 20%."}`);
    }
    if (overBudget) {
      t.push("⚠️ Gastos acima da receita! Priorize cortes em despesas variáveis.");
    }
    return t;
  }, [catBreakdown, monthTxs, totalReceita, totalDespesa, saldo, overBudget]);

  // Previous month comparison
  const prevMonth = useMemo(() => {
    let m = currentMonth - 1, y = currentYear;
    if (m < 0) { m = 11; y -= 1; }
    const txs = transactions.filter(t => { const d = new Date(t.date + "T00:00:00"); return d.getMonth() === m && d.getFullYear() === y; });
    return txs.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
  }, [transactions, currentMonth, currentYear]);

  const despesaDiff = prevMonth > 0 ? ((totalDespesa - prevMonth) / prevMonth * 100) : 0;

  const navigateMonth = (dir) => {
    let m = currentMonth + dir, y = currentYear;
    if (m > 11) { m = 0; y += 1; }
    if (m < 0) { m = 11; y -= 1; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  // ── Styles ──
  const s = {
    app: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#13151A", color: "#F0F2F5", minHeight: "100vh", maxWidth: 1200, margin: "0 auto", padding: "0 16px 100px" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 12px", flexWrap: "wrap", gap: 12 },
    logo: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", background: "linear-gradient(135deg, #4ACA8B, #3EAFC4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    monthNav: { display: "flex", alignItems: "center", gap: 8, background: "#1E2128", borderRadius: 12, padding: "6px 12px", border: "1px solid #2A2E37" },
    monthLabel: { fontSize: 15, fontWeight: 600, minWidth: 110, textAlign: "center", color: "#F0F2F5" },
    navBtn: { background: "none", border: "none", color: "#8E99A9", cursor: "pointer", padding: 4, display: "flex", borderRadius: 8 },
    addBtn: { background: "linear-gradient(135deg, #4ACA8B, #3EAFC4)", border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
    card: { background: "#1E2128", borderRadius: 16, padding: 20, border: "1px solid #2A2E37" },
    kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 },
    kpi: (accent) => ({ background: "#1E2128", borderRadius: 14, padding: "18px 20px", border: "1px solid #2A2E37", borderLeft: `4px solid ${accent}` }),
    kpiLabel: { fontSize: 12, fontWeight: 500, color: "#8E99A9", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 },
    kpiValue: { fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" },
    chartsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 14, fontWeight: 700, color: "#8E99A9", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 },
    txRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, background: "#252830", marginBottom: 6, gap: 12 },
    tag: (color) => ({ background: color + "22", color: color, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }),
    badge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
    filterBar: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" },
    select: { background: "#252830", border: "1px solid #2A2E37", borderRadius: 10, padding: "8px 12px", color: "#F0F2F5", fontSize: 13, outline: "none" },
    input: { background: "#252830", border: "1px solid #2A2E37", borderRadius: 10, padding: "10px 14px", color: "#F0F2F5", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box" },
    bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#1A1D23", borderTop: "1px solid #2A2E37", display: "flex", justifyContent: "center", gap: 0, padding: "8px 0", zIndex: 900 },
    bottomTab: (active) => ({ background: "none", border: "none", color: active ? "#4ACA8B" : "#5A6070", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", padding: "6px 24px", fontSize: 11, fontWeight: active ? 700 : 500 }),
    tipCard: { background: "#252830", borderRadius: 12, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#CDD2DA", lineHeight: 1.5 },
  };

  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <div style={s.app}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.logo}>FinanZen</div>
        <div style={s.monthNav}>
          <button style={s.navBtn} onClick={() => navigateMonth(-1)}><Icons.ChevronLeft /></button>
          <span style={s.monthLabel}>{MONTHS[currentMonth]} {currentYear}</span>
          <button style={s.navBtn} onClick={() => navigateMonth(1)}><Icons.ChevronRight /></button>
        </div>
        <button style={s.addBtn} onClick={openNew}><Icons.Plus /> Novo</button>
      </div>

      {/* ALERT */}
      {overBudget && (
        <div style={{ background: "#E8575A18", border: "1px solid #E8575A44", borderRadius: 12, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, color: "#E8575A", fontSize: 13, fontWeight: 600 }}>
          <Icons.Alert /> Atenção: seus gastos ultrapassaram a receita em {fmt(Math.abs(saldo))}
        </div>
      )}

      {/* ═══════ DASHBOARD ═══════ */}
      {activeTab === "dashboard" && (
        <>
          {/* KPIs */}
          <div style={s.kpiGrid}>
            <div style={s.kpi("#4ACA8B")}>
              <div style={s.kpiLabel}>Receita</div>
              <div style={{ ...s.kpiValue, color: "#4ACA8B" }}>{fmt(totalReceita)}</div>
            </div>
            <div style={s.kpi("#E8575A")}>
              <div style={s.kpiLabel}>Despesas</div>
              <div style={{ ...s.kpiValue, color: "#E8575A" }}>{fmt(totalDespesa)}</div>
              {prevMonth > 0 && (
                <div style={{ fontSize: 12, marginTop: 4, color: despesaDiff > 0 ? "#E8575A" : "#4ACA8B" }}>
                  {despesaDiff > 0 ? "▲" : "▼"} {Math.abs(despesaDiff).toFixed(1)}% vs mês anterior
                </div>
              )}
            </div>
            <div style={s.kpi(saldo >= 0 ? "#3EAFC4" : "#E8575A")}>
              <div style={s.kpiLabel}>Saldo</div>
              <div style={{ ...s.kpiValue, color: saldo >= 0 ? "#3EAFC4" : "#E8575A" }}>{fmt(saldo)}</div>
            </div>
          </div>

          {/* CHARTS */}
          <div style={s.chartsGrid}>
            <div style={s.card}>
              <div style={s.sectionTitle}>Últimos 6 meses</div>
              <div style={{ display: "flex", gap: 16, marginBottom: 10, fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#4ACA8B", display: "inline-block" }} /> Receita</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#E8575A", display: "inline-block" }} /> Despesa</span>
              </div>
              <MiniBarChart data={monthComparison} />
            </div>
            <div style={s.card}>
              <div style={s.sectionTitle}>Gastos por Categoria</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <DonutChart slices={catBreakdown} />
                <div style={{ flex: 1, minWidth: 120 }}>
                  {catBreakdown.map(c => (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, display: "inline-block" }} />
                        <span style={{ fontSize: 13, color: "#CDD2DA" }}>{c.label}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#F0F2F5" }}>{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TIPS */}
          {tips.length > 0 && (
            <div style={{ ...s.card, marginBottom: 16 }}>
              <div style={s.sectionTitle}><Icons.Bulb /> Sugestões Inteligentes</div>
              {tips.map((tip, i) => (
                <div key={i} style={s.tipCard}>
                  <span style={{ color: "#F4A940", marginTop: 1 }}>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* RECENT TXS */}
          <div style={s.card}>
            <div style={s.sectionTitle}>Últimas Transações</div>
            {monthTxs.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(tx => (
              <div key={tx.id} style={s.txRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: tx.type === "receita" ? "#4ACA8B" : "#E8575A", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</div>
                    <div style={{ fontSize: 11, color: "#8E99A9" }}>{new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
                <span style={s.tag(catColor(tx.category))}>{catLabel(tx.category)}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: tx.type === "receita" ? "#4ACA8B" : "#E8575A", whiteSpace: "nowrap" }}>
                  {tx.type === "receita" ? "+" : "-"}{fmt(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══════ TRANSACTIONS TAB ═══════ */}
      {activeTab === "transactions" && (
        <div style={s.card}>
          <div style={s.sectionTitle}>Transações — {MONTHS[currentMonth]} {currentYear}</div>
          <div style={s.filterBar}>
            <Icons.Filter />
            <select style={s.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Todos tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
            <select style={s.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">Todas categorias</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          {filteredTxs.length === 0 && <div style={{ color: "#8E99A9", padding: 30, textAlign: "center" }}>Nenhuma transação encontrada.</div>}
          {filteredTxs.map(tx => (
            <div key={tx.id} style={s.txRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: tx.type === "receita" ? "#4ACA8B" : "#E8575A", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tx.description}
                    {tx.fixed && <span style={{ ...s.badge, background: "#3EAFC422", color: "#3EAFC4", marginLeft: 8 }}>Fixa</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#8E99A9" }}>{new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}</div>
                </div>
              </div>
              <span style={s.tag(catColor(tx.category))}>{catLabel(tx.category)}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: tx.type === "receita" ? "#4ACA8B" : "#E8575A", whiteSpace: "nowrap", minWidth: 90, textAlign: "right" }}>
                {tx.type === "receita" ? "+" : "-"}{fmt(tx.amount)}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => openEdit(tx)} style={{ background: "none", border: "none", color: "#5B8DEF", cursor: "pointer", padding: 6, borderRadius: 8 }}><Icons.Edit /></button>
                <button onClick={() => remove(tx.id)} style={{ background: "none", border: "none", color: "#E8575A88", cursor: "pointer", padding: 6, borderRadius: 8 }}><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ ANALYTICS TAB ═══════ */}
      {activeTab === "analytics" && (
        <>
          <div style={s.chartsGrid}>
            <div style={s.card}>
              <div style={s.sectionTitle}>Evolução 6 Meses</div>
              <MiniBarChart data={monthComparison} height={200} />
            </div>
            <div style={s.card}>
              <div style={s.sectionTitle}>Distribuição de Despesas</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <DonutChart slices={catBreakdown} size={200} />
              </div>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.sectionTitle}>Ranking de Categorias</div>
            {catBreakdown.map((c, i) => {
              const pct = totalDespesa > 0 ? (c.value / totalDespesa * 100) : 0;
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#5A6070", width: 24 }}>{i + 1}</span>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                  <div style={{ flex: 2, background: "#2A2E37", borderRadius: 6, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: c.color, borderRadius: 6, transition: "width 0.5s ease" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#CDD2DA", minWidth: 80, textAlign: "right" }}>{fmt(c.value)}</span>
                  <span style={{ fontSize: 12, color: "#8E99A9", minWidth: 40, textAlign: "right" }}>{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* BOTTOM NAV */}
      <div style={s.bottomNav}>
        <button style={s.bottomTab(activeTab === "dashboard")} onClick={() => setActiveTab("dashboard")}>
          <Icons.Home /> Dashboard
        </button>
        <button style={s.bottomTab(activeTab === "transactions")} onClick={() => setActiveTab("transactions")}>
          <Icons.List /> Transações
        </button>
        <button style={s.bottomTab(activeTab === "analytics")} onClick={() => setActiveTab("analytics")}>
          <Icons.Chart /> Análises
        </button>
      </div>

      {/* MODAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingTx ? "Editar Lançamento" : "Novo Lançamento"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["despesa", "receita"].map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid", cursor: "pointer", fontWeight: 700, fontSize: 14,
                  borderColor: form.type === t ? (t === "receita" ? "#4ACA8B" : "#E8575A") : "#2A2E37",
                  background: form.type === t ? (t === "receita" ? "#4ACA8B18" : "#E8575A18") : "#252830",
                  color: form.type === t ? (t === "receita" ? "#4ACA8B" : "#E8575A") : "#8E99A9",
                }}>
                {t === "receita" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>
          <input style={s.input} placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input style={s.input} placeholder="Valor" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          <select style={{ ...s.input }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input style={s.input} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#CDD2DA", cursor: "pointer" }}>
            <input type="checkbox" checked={form.fixed} onChange={e => setForm(f => ({ ...f, fixed: e.target.checked }))} style={{ accentColor: "#3EAFC4" }} />
            Conta fixa (recorrente)
          </label>
          <button onClick={save} style={{ ...s.addBtn, justifyContent: "center", padding: "14px", marginTop: 4, borderRadius: 12, fontSize: 15, width: "100%" }}>
            {editingTx ? "Salvar Alterações" : "Adicionar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
