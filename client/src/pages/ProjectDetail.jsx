import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, User, ArrowRight, Wallet, TrendingDown, DollarSign, Edit2, CheckCircle } from "lucide-react";
import { projectApi, expenseApi, categoryApi } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency, formatDate } from "../utils/format";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import ExpenseBreakdownChart from "../components/charts/ExpenseBreakdownChart";
import MonthlySpendChart from "../components/charts/MonthlySpendChart";
import AddExpenseModal from "../components/modals/AddExpenseModal";

const STATUS_OPTIONS = ["active", "completed", "on_hold"];
const statusLabel = { active: "Active", completed: "Completed", on_hold: "On Hold" };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenseModal, setExpenseModal] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, catRes] = await Promise.all([
        projectApi.getById(id),
        categoryApi.getAll(),
      ]);
      setData(projRes.data.data);
      setCategories(catRes.data.data);
    } catch (e) {
      if (e.response?.status === 404) navigate("/projects");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleExpenseSuccess = () => {
    refreshUser();
    load();
  };

  const handleStatusChange = async (status) => {
    setUpdatingStatus(true);
    try {
      await projectApi.update(id, { status });
      toast("Status updated ✓", "success");
      setEditStatus(false);
      load();
    } catch (err) {
      toast("Failed to update status", "error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container animate-pulse space-y-4">
        <div className="h-6 w-32 bg-surface-tertiary rounded-xl" />
        <div className="h-48 bg-surface-tertiary rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-surface-tertiary rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { project, breakdown, recentExpenses, monthlyTrend } = data;
  const remaining = project.allocatedFunds - project.spentAmount;
  const overBudget = remaining < 0 && project.allocatedFunds > 0;
  const pct = project.allocatedFunds > 0 ? Math.min((project.spentAmount / project.allocatedFunds) * 100, 100) : 0;

  return (
    <div className="page-container animate-fade-in">
      {/* Back + header */}
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-5"
      >
        <ArrowLeft size={15} /> Projects
      </button>

      {/* Project header card */}
      <div className="card p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-text-primary">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-text-muted mt-1">{project.description}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-2">
              {project.clientName && (
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <User size={12} /> {project.clientName}
                </span>
              )}
              {project.location && (
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <MapPin size={12} /> {project.location}
                </span>
              )}
              <span className="text-xs text-text-muted">Started {formatDate(project.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {editStatus ? (
              <div className="flex items-center gap-2">
                <select
                  className="input text-xs py-1.5 px-2.5 w-auto"
                  defaultValue={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
                <button onClick={() => setEditStatus(false)} className="text-text-muted hover:text-text-primary"><CheckCircle size={16} /></button>
              </div>
            ) : (
              <>
                <Badge variant={project.status}>{statusLabel[project.status]}</Badge>
                <button onClick={() => setEditStatus(true)} className="text-text-muted hover:text-text-primary transition-colors">
                  <Edit2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Budget progress */}
        {project.allocatedFunds > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-text-muted mb-1.5">
              <span>{formatCurrency(project.spentAmount)} spent</span>
              <span>{pct.toFixed(0)}% of {formatCurrency(project.allocatedFunds)}</span>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${overBudget ? "bg-danger" : "bg-text-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard label="Allocated Funds" value={formatCurrency(project.allocatedFunds)} icon={Wallet} />
        <StatCard label="Total Spent" value={formatCurrency(project.spentAmount)} icon={TrendingDown} iconColor="text-danger" accent="bg-danger-light" />
        <StatCard
          label={overBudget ? "Over Budget" : "Remaining"}
          value={formatCurrency(Math.abs(remaining))}
          icon={DollarSign}
          iconColor={overBudget ? "text-danger" : "text-success"}
          accent={overBudget ? "bg-danger-light" : "bg-success-light"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="card p-5">
          <p className="text-sm font-semibold text-text-primary mb-4">Expense Breakdown</p>
          <ExpenseBreakdownChart data={breakdown} />
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold text-text-primary mb-4">Monthly Spend</p>
          <MonthlySpendChart data={monthlyTrend} />
        </div>
      </div>

      {/* Category breakdown list — clickable */}
      {breakdown.length > 0 && (
        <div className="card mb-5">
          <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">By Category</p>
            <Button size="sm" onClick={() => setExpenseModal(true)}>
              <Plus size={13} /> Add Expense
            </Button>
          </div>
          <div className="divide-y divide-border">
            {breakdown.map((b) => (
              <button
                key={b.categoryId}
                onClick={() => navigate(`/projects/${id}/expenses/${b.categoryId}`)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-surface-secondary transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: b.categoryColor }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{b.categoryName}</p>
                  <p className="text-xs text-text-muted">{b.count} expense{b.count !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-text-primary">{formatCurrency(b.total)}</p>
                  {project.spentAmount > 0 && (
                    <p className="text-[11px] text-text-muted">{((b.total / project.spentAmount) * 100).toFixed(0)}%</p>
                  )}
                </div>
                <ArrowRight size={14} className="text-text-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent expenses */}
      <div className="card">
        <div className="px-5 pt-5 pb-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary">Recent Expenses</p>
          {breakdown.length === 0 && (
            <Button size="sm" onClick={() => setExpenseModal(true)}>
              <Plus size={13} /> Add
            </Button>
          )}
        </div>
        {recentExpenses.length === 0 ? (
          <EmptyState
            icon={TrendingDown}
            title="No expenses yet"
            description="Add your first expense to this project"
            action={<Button onClick={() => setExpenseModal(true)}><Plus size={15} />Add Expense</Button>}
          />
        ) : (
          <div className="divide-y divide-border">
            {recentExpenses.map((e) => (
              <div key={e._id} className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${e.category?.color}22` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.category?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {e.description || e.category?.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {e.vendor ? `${e.vendor} · ` : ""}{formatDate(e.expenseDate)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-text-primary flex-shrink-0">{formatCurrency(e.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddExpenseModal
        open={expenseModal}
        onClose={() => setExpenseModal(false)}
        onSuccess={handleExpenseSuccess}
        projectId={id}
        categories={categories}
      />
    </div>
  );
}
