import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { expenseApi, categoryApi } from "../api/services";
import { useToast } from "../context/ToastContext";
import { formatCurrency, formatDate } from "../utils/format";
import Button from "../components/ui/Button";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import MonthlySpendChart from "../components/charts/MonthlySpendChart";
import AddExpenseModal from "../components/modals/AddExpenseModal";
import { TrendingDown } from "lucide-react";

export default function ExpenseDetail() {
  const { projectId, categoryId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expenseModal, setExpenseModal] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detailRes, catRes] = await Promise.all([
        expenseApi.getCategoryDetail({ projectId, categoryId }),
        categoryApi.getAll(),
      ]);
      setData(detailRes.data.data);
      setCategories(catRes.data.data);
    } catch (e) {
      if (e.response?.status === 404) navigate(`/projects/${projectId}`);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId, categoryId, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    setDeleting(id);
    try {
      await expenseApi.delete(id);
      toast("Expense deleted ✓", "success");
      load();
    } catch (err) {
      toast("Failed to delete expense", "error");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container animate-pulse space-y-4">
        <div className="h-6 w-32 bg-surface-tertiary rounded-xl" />
        <div className="h-40 bg-surface-tertiary rounded-2xl" />
        <div className="h-60 bg-surface-tertiary rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const { project, category, expenses, total, trend } = data;

  // Build trend data compatible with MonthlySpendChart
  const trendForChart = trend.map((t) => ({
    _id: { year: t._id.year, month: t._id.month },
    total: t.total,
  }));

  return (
    <div className="page-container animate-fade-in">
      {/* Back nav */}
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-5"
      >
        <ArrowLeft size={15} /> {project.name}
      </button>

      {/* Category header */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${category.color}22` }}
          >
            <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: category.color }} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{category.name}</h1>
            <p className="text-sm text-text-muted">{project.name}</p>
          </div>
        </div>
        <Button onClick={() => setExpenseModal(true)}>
          <Plus size={15} /> Add
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard
          label="Total Spent"
          value={formatCurrency(total)}
          icon={TrendingDown}
          iconColor="text-danger"
          accent="bg-danger-light"
        />
        <StatCard
          label="Number of Entries"
          value={expenses.length}
          sub={`in ${category.name}`}
        />
        <StatCard
          label="Average per Entry"
          value={expenses.length > 0 ? formatCurrency(total / expenses.length) : "—"}
        />
      </div>

      {/* Spend trend chart */}
      <div className="card p-5 mb-5">
        <p className="text-sm font-semibold text-text-primary mb-4">Spend Over Time</p>
        <MonthlySpendChart data={trendForChart} />
      </div>

      {/* Expense entries list */}
      <div className="card">
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <p className="text-sm font-semibold text-text-primary">All Entries</p>
        </div>
        {expenses.length === 0 ? (
          <EmptyState
            icon={TrendingDown}
            title={`No ${category.name} expenses`}
            description="Add your first entry"
            action={<Button onClick={() => setExpenseModal(true)}><Plus size={15} />Add Entry</Button>}
          />
        ) : (
          <div className="divide-y divide-border">
            {expenses.map((e) => (
              <div key={e._id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {e.description || category.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {e.vendor && <span className="text-xs text-text-muted">{e.vendor}</span>}
                    <span className="text-xs text-text-muted">{formatDate(e.expenseDate)}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-text-primary flex-shrink-0">{formatCurrency(e.amount)}</p>
                <button
                  onClick={() => handleDelete(e._id)}
                  disabled={deleting === e._id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-danger-light opacity-0 group-hover:opacity-100 transition-all duration-150"
                >
                  {deleting === e._id
                    ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                    : <Trash2 size={13} />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddExpenseModal
        open={expenseModal}
        onClose={() => setExpenseModal(false)}
        onSuccess={load}
        projectId={projectId}
        categories={categories}
      />
    </div>
  );
}
