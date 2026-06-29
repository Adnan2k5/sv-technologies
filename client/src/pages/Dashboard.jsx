import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, FolderOpen, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { transactionApi, projectApi } from "../api/services";
import { formatCurrency, formatDate, txTypeLabel } from "../utils/format";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import BalanceTrendChart from "../components/charts/BalanceTrendChart";
import TransactionModal from "../components/modals/TransactionModal";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [recent, setRecent] = useState([]);
  const [projects, setProjects] = useState([]);
  const [txModal, setTxModal] = useState(false);

  const load = useCallback(async () => {
    try {
      const [summaryRes, trendRes, txRes, projectsRes] = await Promise.all([
        transactionApi.getSummary(),
        transactionApi.getBalanceTrend(30),
        transactionApi.getAll({ limit: 5 }),
        projectApi.getAll({ status: "active" }),
      ]);
      setSummary(summaryRes.data.data);
      setTrend(trendRes.data.data);
      setRecent(txRes.data.data);
      setProjects(projectsRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTxSuccess = () => {
    refreshUser();
    load();
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-40 bg-surface-tertiary rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-surface-tertiary rounded-2xl" />)}
          </div>
          <div className="h-52 bg-surface-tertiary rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title={`Good ${getGreeting()}, ${user?.name?.split(" ")[0] || "there"}`}
        subtitle="Here's your financial overview"
        action={
          <Button onClick={() => setTxModal(true)}>
            <Plus size={15} /> New Transaction
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Balance"
          value={formatCurrency(user?.balance || 0)}
          icon={Wallet}
          accent="bg-surface-tertiary"
        />
        <StatCard
          label="Total Credited"
          value={formatCurrency(summary?.totalCredit || 0)}
          icon={TrendingUp}
          iconColor="text-success"
          accent="bg-success-light"
        />
        <StatCard
          label="Total Debited"
          value={formatCurrency(summary?.totalDebit || 0)}
          icon={TrendingDown}
          iconColor="text-danger"
          accent="bg-danger-light"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Balance trend */}
        <div className="card p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-text-primary mb-4">Balance Trend — Last 30 Days</p>
          <BalanceTrendChart data={trend} />
        </div>

        {/* Active projects mini list */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-text-primary">Active Projects</p>
            <button onClick={() => navigate("/projects")} className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          {projects.length === 0 ? (
            <EmptyState icon={FolderOpen} title="No active projects" />
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((p) => (
                <button
                  key={p._id}
                  onClick={() => navigate(`/projects/${p._id}`)}
                  className="w-full text-left p-3 rounded-xl hover:bg-surface-secondary transition-all duration-150"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                    <ArrowUpRight size={14} className="text-text-muted flex-shrink-0 ml-2" />
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{formatCurrency(p.spentAmount)} spent</p>
                  {/* Progress bar */}
                  {p.allocatedFunds > 0 && (
                    <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-text-primary transition-all"
                        style={{ width: `${Math.min((p.spentAmount / p.allocatedFunds) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <p className="text-sm font-semibold text-text-primary">Recent Transactions</p>
          <button onClick={() => navigate("/transactions")} className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </button>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={Wallet} title="No transactions yet" description="Add your first credit or debit above" />
        ) : (
          <div className="divide-y divide-border">
            {recent.map((tx) => {
              const { label, cls } = txTypeLabel(tx.type);
              return (
                <div key={tx._id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "credit" || tx.type === "project_return" ? "bg-success-light" : "bg-danger-light"}`}>
                    {tx.type === "credit" || tx.type === "project_return"
                      ? <TrendingUp size={14} className="text-success" />
                      : <TrendingDown size={14} className="text-danger" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {tx.description || (tx.project?.name ? `Transfer → ${tx.project.name}` : label)}
                    </p>
                    <p className="text-xs text-text-muted">{formatDate(tx.transactionDate)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${tx.type === "credit" || tx.type === "project_return" ? "text-success" : "text-danger"}`}>
                      {tx.type === "credit" || tx.type === "project_return" ? "+" : "−"}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant={tx.type}>{label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionModal
        open={txModal}
        onClose={() => setTxModal(false)}
        onSuccess={handleTxSuccess}
        projects={projects}
      />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
