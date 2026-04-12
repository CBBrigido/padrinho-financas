import { useState, useMemo, useEffect, useCallback } from "react";

// ─── API Config ─────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://padrinho-financas-api.onrender.com";

const api = {
  getToken: () => (typeof window !== "undefined" ? localStorage.getItem("pf_token") : null),
  setToken: (t) => localStorage.setItem("pf_token", t),
  clearToken: () => localStorage.removeItem("pf_token"),
  headers: () => ({
    "Content-Type": "application/json",
    ...(api.getToken() ? { Authorization: `Bearer ${api.getToken()}` } : {}),
  }),
  async request(method, path, body) {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: api.headers(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro na requisição");
    return data;
  },
  // Auth
  login: (email, password) => api.request("POST", "/api/auth/login", { email, password }),
  register: (name, email, password) => api.request("POST", "/api/auth/register", { name, email, password }),
  me: () => api.request("GET", "/api/auth/me"),
  // Transactions
  getTransactions: (month, year) => api.request("GET", `/api/transactions?month=${month}&year=${year}`),
  createTransaction: (data) => api.request("POST", "/api/transactions", data),
  updateTransaction: (id, data) => api.request("PUT", `/api/transactions/${id}`, data),
  deleteTransaction: (id) => api.request("DELETE", `/api/transactions/${id}`),
  getSummary: (month, year) => api.request("GET", `/api/transactions/summary?month=${month}&year=${year}&months=6`),
  // Categories
  getCategories: () => api.request("GET", "/api/categories"),
};

// ─── Icons ──────────────────────────────────────────────────────────────
const Icons = {
  Plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Alert: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Filter: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  ChevronLeft: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevronRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Bulb: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>,
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  List: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Chart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Loader: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  Pin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  CalDay: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><text x="12" y="19" textAnchor="middle" fontSize="8" fontWeight="700" stroke="none" fill="currentColor">D</text></svg>,
  Copy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
};

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmt = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── Mini Bar Chart ─────────────────────────────────────────────────────
function MiniBarChart({ data, height = 180, showReserva = true }) {
  if (!data || !data.length) return <div style={{ color: "#8E99A9", padding: 20, textAlign: "center", fontSize: 13 }}>Sem dados para exibir</div>;
  const cols = showReserva ? 3 : 2;
  const max = Math.max(...data.map(d => Math.max(d.receita, d.despesa, showReserva ? (d.reserva || 0) : 0)), 1);
  const barW = Math.min(18, Math.floor(180 / data.length));
  const gap = Math.min(14, Math.floor(60 / data.length));
  const groupW = barW * cols + (cols - 1) * 2;
  const w = data.length * (groupW + gap) + 40;
  return (
    <svg viewBox={`0 0 ${w} ${height + 30}`} style={{ width: "100%", maxHeight: height + 30 }}>
      {data.map((d, i) => {
        const x = 20 + i * (groupW + gap);
        const hR = (d.receita / max) * height;
        const hD = (d.despesa / max) * height;
        const hRes = showReserva ? ((d.reserva || 0) / max) * height : 0;
        return (
          <g key={i}>
            <rect x={x}                  y={height - hR}   width={barW} height={hR}   rx={3} fill="#22C55E" opacity={0.85} />
            <rect x={x + barW + 2}       y={height - hD}   width={barW} height={hD}   rx={3} fill="#E8575A" opacity={0.85} />
            {showReserva && <rect x={x + (barW + 2) * 2} y={height - hRes} width={barW} height={hRes} rx={3} fill="#F59E0B" opacity={0.85} />}
            <text x={x + groupW / 2} y={height + 18} textAnchor="middle" fontSize="11" fill="#8E99A9" fontFamily="inherit">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Donut Chart ────────────────────────────────────────────────────────
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
    return <path key={sl.id} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`} fill={sl.color} stroke="#1A1D23" strokeWidth="2" />;
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

// ─── Modal ──────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1E2128", borderRadius: 16, padding: "28px 28px 20px", width: "100%", maxWidth: 440, border: "1px solid #2A2E37", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#F0F2F5" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8E99A9", cursor: "pointer", padding: 4 }}><Icons.Close /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Login/Register Screen ──────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      let result;
      if (mode === "login") {
        result = await api.login(email, password);
      } else {
        result = await api.register(name, email, password);
      }
      api.setToken(result.token);
      onAuth(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#13151A", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: 16 },
    card: { background: "#1E2128", borderRadius: 20, padding: "40px 32px", width: "100%", maxWidth: 400, border: "1px solid #2A2E37", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" },
    logo: { fontSize: 26, fontWeight: 800, textAlign: "center", marginBottom: 8 },
    subtitle: { fontSize: 14, color: "#8E99A9", textAlign: "center", marginBottom: 28 },
    input: { background: "#252830", border: "1px solid #2A2E37", borderRadius: 10, padding: "12px 14px", color: "#F0F2F5", fontSize: 14, width: "100%", outline: "none", boxSizing: "border-box", marginBottom: 12 },
    btn: { background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none", borderRadius: 12, padding: "14px", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
    toggle: { background: "none", border: "none", color: "#22C55E", cursor: "pointer", fontSize: 13, fontWeight: 600, marginTop: 16, textAlign: "center", width: "100%" },
    error: { background: "#E8575A18", border: "1px solid #E8575A44", borderRadius: 10, padding: "10px 14px", color: "#E8575A", fontSize: 13, marginBottom: 12 },
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src="/logo.png" alt="Padrinho Finanças" style={{ height: 220, objectFit: "contain", margin: "0 auto", display: "block" }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
        <div style={s.subtitle}>{mode === "login" ? "Acesse sua conta" : "Crie sua conta"}</div>
        {error && <div style={s.error}>{error}</div>}
        {mode === "register" && (
          <input style={s.input} placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
        )}
        <input style={s.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={s.input} placeholder="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? <Icons.Loader /> : (mode === "login" ? "Entrar" : "Cadastrar")}
        </button>
        <button style={s.toggle} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [filterCat, setFilterCat] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "despesa", description: "", amount: "", category_id: "", date: "", is_fixed: false });
  const [activeDate, setActiveDate] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  });

  // ── Check auth on mount ──
  useEffect(() => {
    const checkAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const data = await api.me();
          setUser(data.user);
        } catch { api.clearToken(); }
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  // ── Fetch data when month/user changes ──
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txData, sumData, catData] = await Promise.all([
        api.getTransactions(currentMonth, currentYear),
        api.getSummary(currentMonth, currentYear),
        api.getCategories(),
      ]);
      setTransactions(txData.transactions || []);
      setSummary(sumData);
      setCategories(catData.categories || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, currentMonth, currentYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Handlers ──
  const handleAuth = (u) => { setUser(u); };
  const handleLogout = () => { api.clearToken(); setUser(null); setTransactions([]); setSummary(null); };

  const resetForm = () => setForm({ type: "despesa", description: "", amount: "", category_id: categories.length ? String(categories[0].id) : "", date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`, is_fixed: false });
  const openNew = () => { resetForm(); setEditingTx(null); setShowModal(true); };
  const openEdit = (tx) => {
    setForm({ type: tx.type, description: tx.description, amount: String(tx.amount), category_id: String(tx.category_id || ""), date: tx.date?.split("T")[0] || "", is_fixed: tx.is_fixed });
    setEditingTx(tx.id);
    setShowModal(true);
  };

  const save = async () => {
    if (!form.description || !form.amount || !form.date) return;
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), category_id: form.category_id ? parseInt(form.category_id) : null };
      if (editingTx) {
        await api.updateTransaction(editingTx, payload);
      } else {
        await api.createTransaction(payload);
      }
      setShowModal(false);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setLoading(true);
    try {
      await api.deleteTransaction(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (dir) => {
    let m = currentMonth + dir, y = currentYear;
    if (m > 12) { m = 1; y += 1; }
    if (m < 1) { m = 12; y -= 1; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const navigateDay = (dir) => {
    const d = new Date(activeDate + "T12:00:00");
    d.setDate(d.getDate() + dir);
    // manter dentro do mês corrente
    if (d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear) {
      setActiveDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
    }
  };

  const replicateFixed = async (bills, targetMonth, targetYear) => {
    if (!bills.length) return;
    const targetDate = `${targetYear}-${String(targetMonth).padStart(2,"0")}-01`;
    setLoading(true);
    try {
      for (const b of bills) {
        await api.createTransaction({
          type: b.type,
          description: b.description,
          amount: parseFloat(b.amount),
          category_id: b.category_id || null,
          date: targetDate,
          is_fixed: true,
        });
      }
      setError("");
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived data ──
  const totalReceita = summary?.current_month?.receita || 0;
  const totalDespesa = summary?.current_month?.despesa || 0;
  const totalReserva = summary?.current_month?.reserva || 0;
  const saldo = summary?.current_month?.saldo || 0;
  const overBudget = summary?.current_month?.over_budget || false;
  const catBreakdown = (summary?.category_breakdown || []).map(c => ({ id: c.id, label: c.name, color: c.color, value: c.total }));
  const monthComparison = (summary?.monthly_comparison || []).map(m => ({ label: MONTHS[m.month - 1], receita: m.receita, despesa: m.despesa, reserva: m.reserva || 0 }));

  const filteredTxs = useMemo(() => transactions.filter(t => {
    if (filterCat !== "all" && String(t.category_id) !== filterCat) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date)), [transactions, filterCat, filterType]);

  // Previous month comparison
  const prevMonthDespesa = useMemo(() => {
    if (!summary?.monthly_comparison || summary.monthly_comparison.length < 2) return 0;
    const prev = summary.monthly_comparison[summary.monthly_comparison.length - 2];
    return prev?.despesa || 0;
  }, [summary]);
  const despesaDiff = prevMonthDespesa > 0 ? ((totalDespesa - prevMonthDespesa) / prevMonthDespesa * 100) : 0;

  // Tips
  const tips = useMemo(() => {
    const t = [];
    if (catBreakdown.length > 0) t.push(`Sua maior despesa é ${catBreakdown[0].label} (${fmt(catBreakdown[0].value)}). Avalie se há como reduzir.`);
    if (totalReceita > 0) {
      const fixedTotal = transactions.filter(tx => tx.type === "despesa" && tx.is_fixed).reduce((s, tx) => s + parseFloat(tx.amount), 0);
      if (fixedTotal > totalReceita * 0.5) t.push(`Contas fixas representam ${Math.round(fixedTotal / totalReceita * 100)}% da receita. Tente renegociar.`);
      if (saldo > 0) t.push(`Você economizou ${Math.round(saldo / totalReceita * 100)}% da receita. ${saldo / totalReceita > 0.2 ? "Ótimo trabalho!" : "Tente chegar a 20%."}`);
    }
    if (overBudget) t.push("⚠️ Gastos acima da receita! Priorize cortes em despesas variáveis.");
    return t;
  }, [catBreakdown, transactions, totalReceita, saldo, overBudget]);

  // Tip de reserva (fora do useMemo acima para usar totalReserva)
  const reservaTip = totalReceita > 0 && totalReserva > 0
    ? `Você guardou ${fmt(totalReserva)} na reserva este mês (${Math.round(totalReserva / totalReceita * 100)}% da receita).${totalReserva / totalReceita >= 0.1 ? " Ótimo hábito!" : " Tente chegar a 10%."}`
    : null;

  // ── Auth gate ──
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#13151A", color: "#8E99A9" }}>
      <Icons.Loader />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  // ── Styles ──
  const s = {
    app: { fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#13151A", color: "#F0F2F5", minHeight: "100vh", maxWidth: 1200, margin: "0 auto", padding: "0 16px 24px" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0 12px", flexWrap: "wrap", gap: 12 },
    logo: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.3px" },
    headerRight: { display: "flex", alignItems: "center", gap: 10 },
    userBadge: { display: "flex", alignItems: "center", gap: 6, background: "#252830", borderRadius: 10, padding: "6px 12px", fontSize: 13, color: "#CDD2DA" },
    logoutBtn: { background: "none", border: "1px solid #2A2E37", borderRadius: 10, padding: "8px 10px", color: "#8E99A9", cursor: "pointer", display: "flex", alignItems: "center" },
    monthNav: { display: "flex", alignItems: "center", gap: 8, background: "#1E2128", borderRadius: 12, padding: "6px 12px", border: "1px solid #2A2E37" },
    monthLabel: { fontSize: 15, fontWeight: 600, minWidth: 110, textAlign: "center", color: "#F0F2F5" },
    navBtn: { background: "none", border: "none", color: "#8E99A9", cursor: "pointer", padding: 4, display: "flex", borderRadius: 8 },
    addBtn: { background: "linear-gradient(135deg, #22C55E, #16A34A)", border: "none", borderRadius: 12, padding: "10px 18px", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" },
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
    bottomTab: (active) => ({ background: "none", border: "none", color: active ? "#22C55E" : "#5A6070", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", padding: "6px 24px", fontSize: 11, fontWeight: active ? 700 : 500 }),
    tipCard: { background: "#252830", borderRadius: 12, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#CDD2DA", lineHeight: 1.5 },
    loadingOverlay: { position: "fixed", inset: 0, background: "rgba(19,21,26,0.5)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" },
  };

  return (
    <div className="pf-outer" style={{ background: "#13151A", minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#F0F2F5" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Reset overflow ──────────────────────────── */
        .pf-outer, .pf-main { overflow-x: hidden; box-sizing: border-box; }
        * { box-sizing: border-box; }

        /* ── Mobile base ─────────────────────────────── */
        .pf-sidebar { display: none; }
        .pf-main { padding-bottom: 72px; }

        /* Header: logo+mês linha 1, ações linha 2 */
        .pf-header {
          display: grid;
          grid-template-columns: 1fr auto;
          grid-template-rows: auto auto;
          gap: 8px;
          padding: 12px 0 10px;
          align-items: center;
        }
        .pf-header-logo  { grid-column: 1; grid-row: 1; }
        .pf-header-month { grid-column: 2; grid-row: 1; }
        .pf-header-actions {
          grid-column: 1 / -1;
          grid-row: 2;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
        }

        /* KPIs: 2 colunas no mobile */
        .pf-kpi-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .pf-kpi-value { font-size: 16px; font-weight: 800; letter-spacing: -0.5px; }

        /* Bottom nav: 5 abas, flex igual */
        .pf-bottom-nav { padding: 4px 0 6px; }
        .pf-bottom-nav button { flex: 1 !important; padding: 4px 2px !important; min-width: 0 !important; font-size: 10px !important; }

        /* Transações: esconder categoria no mobile, encolher valor */
        .pf-tx-cat { display: none; }
        .pf-tx-amount { min-width: 70px !important; font-size: 13px !important; }

        /* Ranking categorias: esconder barra e % no mobile */
        .pf-rank-bar { display: none; }
        .pf-rank-pct { display: none; }
        .pf-rank-val { min-width: 0 !important; font-size: 12px !important; }

        /* Month label sem minWidth fixo */
        .pf-month-label { min-width: 90px !important; font-size: 14px !important; }

        /* ── Desktop (≥768px) ────────────────────────── */
        @media (min-width: 768px) {
          .pf-sidebar {
            display: flex;
            flex-direction: column;
            width: 220px;
            background: #1A1D23;
            border-right: 1px solid #2A2E37;
            padding: 24px 16px;
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 100;
            overflow-y: auto;
          }
          .pf-outer { padding-left: 220px; }
          .pf-sidebar-logo {
            margin-bottom: 24px;
            padding: 0 8px;
            text-align: center;
          }
          .pf-sidebar-btn {
            background: none;
            border: none;
            color: #5A6070;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            padding: 10px 12px;
            font-size: 14px;
            font-weight: 500;
            border-radius: 10px;
            width: 100%;
            text-align: left;
            margin-bottom: 4px;
            font-family: inherit;
            transition: background 0.15s, color 0.15s;
          }
          .pf-sidebar-btn:hover { background: #252830; color: #CDD2DA; }
          .pf-sidebar-btn.active { background: #252830; color: #22C55E; font-weight: 700; }
          .pf-bottom-nav { display: none !important; }
          .pf-main { padding-bottom: 24px; flex: 1; min-width: 0; }

          /* Header desktop: linha única */
          .pf-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 0 12px;
            gap: 12px;
          }
          .pf-header-actions { justify-content: flex-end; }

          /* KPIs: 4 colunas no desktop */
          .pf-kpi-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; }
          .pf-kpi-value { font-size: 22px; }

          /* Restaurar elementos no desktop */
          .pf-tx-cat { display: inline; }
          .pf-tx-amount { min-width: 90px !important; font-size: 15px !important; }
          .pf-rank-bar { display: block; }
          .pf-rank-pct { display: inline; }
          .pf-rank-val { min-width: 80px !important; font-size: 13px !important; }
          .pf-month-label { min-width: 110px !important; font-size: 15px !important; }
        }
      `}</style>

      {/* SIDEBAR — desktop only */}
      <nav className="pf-sidebar">
        <div className="pf-sidebar-logo">
          <img src="/logo.png" alt="Padrinho Finanças" style={{ width: "100%", maxHeight: 160, objectFit: "contain", display: "block", margin: "0 auto" }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
        <button className={`pf-sidebar-btn${activeTab === "dashboard" ? " active" : ""}`} onClick={() => setActiveTab("dashboard")}><Icons.Home /> Dashboard</button>
        <button className={`pf-sidebar-btn${activeTab === "transactions" ? " active" : ""}`} onClick={() => setActiveTab("transactions")}><Icons.List /> Transações</button>
        <button className={`pf-sidebar-btn${activeTab === "analytics" ? " active" : ""}`} onClick={() => setActiveTab("analytics")}><Icons.Chart /> Análises</button>
        <button className={`pf-sidebar-btn${activeTab === "fixas" ? " active" : ""}`} onClick={() => setActiveTab("fixas")}><Icons.Pin /> Contas Fixas</button>
        <button className={`pf-sidebar-btn${activeTab === "diario" ? " active" : ""}`} onClick={() => setActiveTab("diario")}><Icons.CalDay /> Diário</button>
        <button className="pf-sidebar-btn" style={{ marginTop: "auto", color: "#8E99A9" }} onClick={handleLogout}><Icons.Logout /> Sair</button>
      </nav>

      <div className="pf-main" style={s.app}>

      {/* HEADER */}
      <div className="pf-header">
        <div className="pf-header-logo">
          <img src="/logo.png" alt="Padrinho Finanças" style={{ height: 52, objectFit: "contain", display: "block" }}
            onError={e => { e.target.style.display = "none"; }} />
        </div>
        <div className="pf-header-month" style={s.monthNav}>
          <button style={s.navBtn} onClick={() => navigateMonth(-1)}><Icons.ChevronLeft /></button>
          <span className="pf-month-label" style={s.monthLabel}>{MONTHS[currentMonth - 1]} {currentYear}</span>
          <button style={s.navBtn} onClick={() => navigateMonth(1)}><Icons.ChevronRight /></button>
        </div>
        <div className="pf-header-actions">
          <div style={s.userBadge}><Icons.User /> {user.name?.split(" ")[0]}</div>
          <button style={s.logoutBtn} onClick={handleLogout} title="Sair"><Icons.Logout /></button>
          {activeTab !== "diario" && (
            <button style={s.addBtn} onClick={openNew}><Icons.Plus /> Novo</button>
          )}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{ background: "#E8575A18", border: "1px solid #E8575A44", borderRadius: 12, padding: "10px 16px", marginBottom: 12, color: "#E8575A", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", color: "#E8575A", cursor: "pointer" }}><Icons.Close /></button>
        </div>
      )}

      {/* ALERT */}
      {overBudget && (
        <div style={{ background: "#E8575A18", border: "1px solid #E8575A44", borderRadius: 12, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10, color: "#E8575A", fontSize: 13, fontWeight: 600 }}>
          <Icons.Alert /> Atenção: seus gastos ultrapassaram a receita em {fmt(Math.abs(saldo))}
        </div>
      )}

      {/* ═══════ DASHBOARD ═══════ */}
      {activeTab === "dashboard" && (
        <>
          <div className="pf-kpi-grid">
            <div style={s.kpi("#22C55E")}>
              <div style={s.kpiLabel}>Receita</div>
              <div className="pf-kpi-value" style={{ color: "#22C55E" }}>{fmt(totalReceita)}</div>
            </div>
            <div style={s.kpi("#E8575A")}>
              <div style={s.kpiLabel}>Despesas</div>
              <div className="pf-kpi-value" style={{ color: "#E8575A" }}>{fmt(totalDespesa)}</div>
              {prevMonthDespesa > 0 && (
                <div style={{ fontSize: 11, marginTop: 4, color: despesaDiff > 0 ? "#E8575A" : "#22C55E" }}>
                  {despesaDiff > 0 ? "▲" : "▼"} {Math.abs(despesaDiff).toFixed(1)}% vs anterior
                </div>
              )}
            </div>
            <div style={s.kpi("#F59E0B")}>
              <div style={s.kpiLabel}>Reserva</div>
              <div className="pf-kpi-value" style={{ color: "#F59E0B" }}>{fmt(totalReserva)}</div>
              {totalReceita > 0 && totalReserva > 0 && (
                <div style={{ fontSize: 11, marginTop: 4, color: "#8E99A9" }}>
                  {Math.round(totalReserva / totalReceita * 100)}% da receita
                </div>
              )}
            </div>
            <div style={s.kpi(saldo >= 0 ? "#3EAFC4" : "#E8575A")}>
              <div style={s.kpiLabel}>Saldo</div>
              <div className="pf-kpi-value" style={{ color: saldo >= 0 ? "#3EAFC4" : "#E8575A" }}>{fmt(saldo)}</div>
            </div>
          </div>

          <div style={s.chartsGrid}>
            <div style={s.card}>
              <div style={s.sectionTitle}>Últimos 6 meses</div>
              <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 12, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#22C55E", display: "inline-block" }} /> Receita</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#E8575A", display: "inline-block" }} /> Despesa</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#F59E0B", display: "inline-block" }} /> Reserva</span>
              </div>
              <MiniBarChart data={monthComparison} showReserva={true} />
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

          {(tips.length > 0 || reservaTip) && (
            <div style={{ ...s.card, marginBottom: 16 }}>
              <div style={s.sectionTitle}><Icons.Bulb /> Sugestões Inteligentes</div>
              {reservaTip && (
                <div style={s.tipCard}>
                  <span style={{ color: "#F59E0B", marginTop: 1 }}>•</span>
                  <span>{reservaTip}</span>
                </div>
              )}
              {tips.map((tip, i) => (
                <div key={i} style={s.tipCard}>
                  <span style={{ color: "#22C55E", marginTop: 1 }}>•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}

          <div style={s.card}>
            <div style={s.sectionTitle}>Últimas Transações</div>
            {transactions.length === 0 && <div style={{ color: "#8E99A9", padding: 20, textAlign: "center" }}>Nenhuma transação neste mês. Clique em "Novo" para começar!</div>}
            {transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(tx => (
              <div key={tx.id} style={s.txRow}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: tx.type === "receita" ? "#22C55E" : tx.type === "reserva" ? "#F59E0B" : "#E8575A", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</div>
                    <div style={{ fontSize: 11, color: "#8E99A9" }}>{new Date(tx.date).toLocaleDateString("pt-BR")}</div>
                  </div>
                </div>
                {tx.category_name && <span className="pf-tx-cat" style={s.tag(tx.category_color || "#8E99A9")}>{tx.category_name}</span>}
                <span className="pf-tx-amount" style={{ fontSize: 15, fontWeight: 700, color: tx.type === "receita" ? "#22C55E" : tx.type === "reserva" ? "#F59E0B" : "#E8575A", whiteSpace: "nowrap", minWidth: 90, textAlign: "right" }}>
                  {tx.type === "receita" ? "+" : tx.type === "reserva" ? "↗" : "-"}{fmt(parseFloat(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══════ TRANSACTIONS ═══════ */}
      {activeTab === "transactions" && (
        <div style={s.card}>
          <div style={s.sectionTitle}>Transações — {MONTHS[currentMonth - 1]} {currentYear}</div>
          <div style={s.filterBar}>
            <Icons.Filter />
            <select style={s.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Todos tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
              <option value="reserva">Reservas</option>
            </select>
            <select style={s.select} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">Todas categorias</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          </div>
          {filteredTxs.length === 0 && <div style={{ color: "#8E99A9", padding: 30, textAlign: "center" }}>Nenhuma transação encontrada.</div>}
          {filteredTxs.map(tx => (
            <div key={tx.id} style={s.txRow}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: tx.type === "receita" ? "#22C55E" : tx.type === "reserva" ? "#F59E0B" : "#E8575A", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {tx.description}
                    {tx.is_fixed && <span style={{ ...s.badge, background: "#3EAFC422", color: "#3EAFC4", marginLeft: 8 }}>Fixa</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#8E99A9" }}>{new Date(tx.date).toLocaleDateString("pt-BR")}</div>
                </div>
              </div>
              {tx.category_name && <span className="pf-tx-cat" style={s.tag(tx.category_color || "#8E99A9")}>{tx.category_name}</span>}
              <span className="pf-tx-amount" style={{ fontSize: 15, fontWeight: 700, color: tx.type === "receita" ? "#22C55E" : tx.type === "reserva" ? "#F59E0B" : "#E8575A", whiteSpace: "nowrap", minWidth: 90, textAlign: "right" }}>
                {tx.type === "receita" ? "+" : tx.type === "reserva" ? "↗" : "-"}{fmt(parseFloat(tx.amount))}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => openEdit(tx)} style={{ background: "none", border: "none", color: "#5B8DEF", cursor: "pointer", padding: 6, borderRadius: 8 }}><Icons.Edit /></button>
                <button onClick={() => remove(tx.id)} style={{ background: "none", border: "none", color: "#E8575A88", cursor: "pointer", padding: 6, borderRadius: 8 }}><Icons.Trash /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════ ANALYTICS ═══════ */}
      {activeTab === "analytics" && (
        <>
          <div style={s.chartsGrid}>
            <div style={s.card}>
              <div style={s.sectionTitle}>Evolução 6 Meses</div>
              <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 12, flexWrap: "wrap" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#22C55E", display: "inline-block" }} /> Receita</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#E8575A", display: "inline-block" }} /> Despesa</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#F59E0B", display: "inline-block" }} /> Reserva</span>
              </div>
              <MiniBarChart data={monthComparison} height={200} showReserva={true} />
            </div>
            <div style={s.card}>
              <div style={s.sectionTitle}>Distribuição de Despesas</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <DonutChart slices={catBreakdown} size={200} />
              </div>
            </div>
          </div>

          {/* Gráfico de Reserva Mensal */}
          <div style={{ ...s.card, marginBottom: 16 }}>
            <div style={s.sectionTitle}>Reserva Mensal Acumulada</div>
            {monthComparison.filter(m => m.reserva > 0).length === 0
              ? <div style={{ color: "#8E99A9", padding: 20, textAlign: "center", fontSize: 13 }}>Nenhuma reserva registrada nos últimos 6 meses.</div>
              : (
                <>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120, marginBottom: 8 }}>
                    {monthComparison.map((m, i) => {
                      const maxR = Math.max(...monthComparison.map(x => x.reserva || 0), 1);
                      const pct = ((m.reserva || 0) / maxR) * 100;
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 700, opacity: m.reserva > 0 ? 1 : 0 }}>
                            {m.reserva > 0 ? fmt(m.reserva).replace("R$\u00a0", "R$") : ""}
                          </span>
                          <div style={{ width: "100%", background: "#2A2E37", borderRadius: 6, height: 90, display: "flex", alignItems: "flex-end" }}>
                            <div style={{ width: "100%", height: `${pct}%`, background: "linear-gradient(180deg, #F59E0B, #F59E0B)", borderRadius: 6, minHeight: m.reserva > 0 ? 4 : 0, transition: "height 0.4s ease" }} />
                          </div>
                          <span style={{ fontSize: 11, color: "#8E99A9" }}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {(() => {
                    const totalAcum = monthComparison.reduce((s, m) => s + (m.reserva || 0), 0);
                    const mesesComReserva = monthComparison.filter(m => m.reserva > 0).length;
                    return totalAcum > 0 ? (
                      <div style={{ display: "flex", gap: 12, paddingTop: 10, borderTop: "1px solid #2A2E37", flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#8E99A9", textTransform: "uppercase", letterSpacing: "0.5px" }}>Total (6 meses)</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>{fmt(totalAcum)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#8E99A9", textTransform: "uppercase", letterSpacing: "0.5px" }}>Média mensal</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>{fmt(totalAcum / mesesComReserva)}</div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </>
              )
            }
          </div>
          <div style={s.card}>
            <div style={s.sectionTitle}>Ranking de Categorias</div>
            {catBreakdown.length === 0 && <div style={{ color: "#8E99A9", padding: 20, textAlign: "center" }}>Sem despesas neste mês.</div>}
            {catBreakdown.map((c, i) => {
              const pct = totalDespesa > 0 ? (c.value / totalDespesa * 100) : 0;
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#5A6070", width: 24 }}>{i + 1}</span>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{c.label}</span>
                  <div className="pf-rank-bar" style={{ flex: 2, background: "#2A2E37", borderRadius: 6, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: c.color, borderRadius: 6, transition: "width 0.5s ease" }} />
                  </div>
                  <span className="pf-rank-val" style={{ fontSize: 13, fontWeight: 700, color: "#CDD2DA", minWidth: 80, textAlign: "right" }}>{fmt(c.value)}</span>
                  <span className="pf-rank-pct" style={{ fontSize: 12, color: "#8E99A9", minWidth: 40, textAlign: "right" }}>{pct.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ═══════ CONTAS FIXAS ═══════ */}
      {activeTab === "fixas" && (() => {
        const fixas = transactions.filter(t => t.is_fixed);
        const nextM = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextY = currentMonth === 12 ? currentYear + 1 : currentYear;
        return (
          <div style={s.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div style={s.sectionTitle}><Icons.Pin /> Contas Fixas — {MONTHS[currentMonth - 1]} {currentYear}</div>
              {fixas.length > 0 && (
                <button onClick={() => replicateFixed(fixas, nextM, nextY)}
                  style={{ ...s.addBtn, fontSize: 13, padding: "8px 14px" }}>
                  <Icons.Copy /> Replicar tudo → {MONTHS[nextM - 1]}
                </button>
              )}
            </div>
            {fixas.length === 0 ? (
              <div style={{ color: "#8E99A9", padding: "24px 0", textAlign: "center", fontSize: 14 }}>
                <div style={{ marginBottom: 8 }}>Nenhuma conta fixa neste mês.</div>
                <div style={{ fontSize: 12 }}>Ao adicionar um lançamento, marque "Conta fixa" para aparecer aqui.</div>
              </div>
            ) : (
              fixas.map(tx => (
                <div key={tx.id} style={{ ...s.txRow, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: tx.type === "receita" ? "#22C55E" : tx.type === "reserva" ? "#F59E0B" : "#E8575A", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</div>
                      <div style={{ fontSize: 11, color: "#8E99A9" }}>
                        {tx.category_name && <span style={{ marginRight: 6, color: tx.category_color || "#8E99A9" }}>{tx.category_name}</span>}
                        {tx.type === "receita" ? "Receita" : tx.type === "reserva" ? "Reserva" : "Despesa"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: tx.type === "receita" ? "#22C55E" : tx.type === "reserva" ? "#F59E0B" : "#E8575A" }}>
                      {tx.type === "receita" ? "+" : tx.type === "reserva" ? "↗" : "-"}{fmt(parseFloat(tx.amount))}
                    </span>
                    <button title={`Replicar para ${MONTHS[nextM - 1]}`}
                      onClick={() => replicateFixed([tx], nextM, nextY)}
                      style={{ background: "#252830", border: "1px solid #2A2E37", borderRadius: 8, color: "#3EAFC4", cursor: "pointer", padding: "5px 10px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Icons.Copy /> {MONTHS[nextM - 1]}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })()}

      {/* ═══════ DIÁRIO ═══════ */}
      {activeTab === "diario" && (() => {
        const dayTxs = transactions.filter(t => t.date && t.date.slice(0, 10) === activeDate);
        const dayReceita = dayTxs.filter(t => t.type === "receita").reduce((s, t) => s + parseFloat(t.amount), 0);
        const dayDespesa = dayTxs.filter(t => t.type === "despesa").reduce((s, t) => s + parseFloat(t.amount), 0);
        const dayReserva = dayTxs.filter(t => t.type === "reserva").reduce((s, t) => s + parseFloat(t.amount), 0);
        const daySaldo = dayReceita - dayDespesa - dayReserva;
        const [dy, dm, dd] = activeDate.split("-");
        const dateLabel = `${dd}/${dm}/${dy}`;
        const isToday = activeDate === (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`; })();
        return (
          <>
            {/* Navegador de dia */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1E2128", borderRadius: 12, padding: "6px 12px", border: "1px solid #2A2E37" }}>
                <button style={s.navBtn} onClick={() => navigateDay(-1)}><Icons.ChevronLeft /></button>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#F0F2F5", minWidth: 120, textAlign: "center" }}>
                  {isToday ? "Hoje" : dateLabel}
                  {!isToday && <span style={{ fontSize: 11, color: "#8E99A9", marginLeft: 6 }}>{dateLabel}</span>}
                </span>
                <button style={s.navBtn} onClick={() => navigateDay(1)}><Icons.ChevronRight /></button>
              </div>
              <button style={s.addBtn} onClick={() => {
                setForm(f => ({ ...f, date: activeDate }));
                setEditingTx(null);
                setShowModal(true);
              }}><Icons.Plus /> Novo</button>
            </div>

            {/* KPIs do dia */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
              <div style={{ ...s.kpi("#22C55E"), padding: "14px 12px" }}>
                <div style={{ ...s.kpiLabel, fontSize: 10 }}>Receita</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#22C55E" }}>{fmt(dayReceita)}</div>
              </div>
              <div style={{ ...s.kpi("#E8575A"), padding: "14px 12px" }}>
                <div style={{ ...s.kpiLabel, fontSize: 10 }}>Despesas</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#E8575A" }}>{fmt(dayDespesa)}</div>
              </div>
              <div style={{ ...s.kpi(daySaldo >= 0 ? "#3EAFC4" : "#E8575A"), padding: "14px 12px" }}>
                <div style={{ ...s.kpiLabel, fontSize: 10 }}>Saldo</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: daySaldo >= 0 ? "#3EAFC4" : "#E8575A" }}>{fmt(daySaldo)}</div>
              </div>
            </div>

            {/* Transações do dia */}
            <div style={s.card}>
              <div style={s.sectionTitle}>Transações do dia</div>
              {dayTxs.length === 0 ? (
                <div style={{ color: "#8E99A9", padding: "20px 0", textAlign: "center", fontSize: 14 }}>
                  Nenhuma transação em {dateLabel}. Toque em "Novo" para adicionar.
                </div>
              ) : (
                dayTxs.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)).map(tx => (
                  <div key={tx.id} style={s.txRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: tx.type === "receita" ? "#22C55E" : tx.type === "reserva" ? "#F59E0B" : "#E8575A", flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.description}</div>
                        {tx.category_name && <div style={{ fontSize: 11, color: tx.category_color || "#8E99A9" }}>{tx.category_name}</div>}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: tx.type === "receita" ? "#22C55E" : tx.type === "reserva" ? "#F59E0B" : "#E8575A", whiteSpace: "nowrap" }}>
                      {tx.type === "receita" ? "+" : tx.type === "reserva" ? "↗" : "-"}{fmt(parseFloat(tx.amount))}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => openEdit(tx)} style={{ background: "none", border: "none", color: "#5B8DEF", cursor: "pointer", padding: 6, borderRadius: 8 }}><Icons.Edit /></button>
                      <button onClick={() => remove(tx.id)} style={{ background: "none", border: "none", color: "#E8575A88", cursor: "pointer", padding: 6, borderRadius: 8 }}><Icons.Trash /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );
      })()}

      {/* BOTTOM NAV */}
      <div className="pf-bottom-nav" style={s.bottomNav}>
        <button style={s.bottomTab(activeTab === "dashboard")} onClick={() => setActiveTab("dashboard")}><Icons.Home /><span>Início</span></button>
        <button style={s.bottomTab(activeTab === "transactions")} onClick={() => setActiveTab("transactions")}><Icons.List /><span>Lançamentos</span></button>
        <button style={s.bottomTab(activeTab === "diario")} onClick={() => setActiveTab("diario")}><Icons.CalDay /><span>Diário</span></button>
        <button style={s.bottomTab(activeTab === "fixas")} onClick={() => setActiveTab("fixas")}><Icons.Pin /><span>Fixas</span></button>
        <button style={s.bottomTab(activeTab === "analytics")} onClick={() => setActiveTab("analytics")}><Icons.Chart /><span>Análises</span></button>
      </div>

      {/* MODAL */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingTx ? "Editar Lançamento" : "Novo Lançamento"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { key: "despesa",  label: "Despesa",  active: "#E8575A" },
              { key: "receita",  label: "Receita",  active: "#22C55E" },
              { key: "reserva",  label: "Reserva",  active: "#F59E0B" },
            ].map(({ key, label, active }) => (
              <button key={key}
                onClick={() => setForm(f => ({
                  ...f,
                  type: key,
                  category_id: key === "reserva" && reservaCategory ? String(reservaCategory.id) : f.category_id,
                }))}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid", cursor: "pointer", fontWeight: 700, fontSize: 13,
                  borderColor: form.type === key ? active : "#2A2E37",
                  background: form.type === key ? active + "22" : "#252830",
                  color: form.type === key ? active : "#8E99A9",
                }}>
                {label}
              </button>
            ))}
          </div>
          <input style={s.input} placeholder="Descrição" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input style={s.input} placeholder="Valor" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          {form.type !== "reserva" && (
            <select style={s.input} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">Selecione a categoria</option>
              {categories.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
          )}
          <input style={s.input} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#CDD2DA", cursor: "pointer" }}>
            <input type="checkbox" checked={form.is_fixed} onChange={e => setForm(f => ({ ...f, is_fixed: e.target.checked }))} style={{ accentColor: "#3EAFC4" }} />
            Conta fixa (recorrente)
          </label>
          <button onClick={save} disabled={loading} style={{ ...s.addBtn, justifyContent: "center", padding: "14px", marginTop: 4, borderRadius: 12, fontSize: 15, width: "100%", opacity: loading ? 0.7 : 1 }}>
            {loading ? <Icons.Loader /> : (editingTx ? "Salvar Alterações" : "Adicionar")}
          </button>
        </div>
      </Modal>

      {/* LOADING OVERLAY */}
      {loading && (
        <div style={s.loadingOverlay}>
          <Icons.Loader />
        </div>
      )}
      </div>
    </div>
  );
}
