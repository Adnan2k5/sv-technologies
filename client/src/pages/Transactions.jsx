import { useEffect, useState, useCallback } from "react";
import { ArrowLeftRight, Trash2, TrendingUp, TrendingDown, Filter, Plus } from "lucide-react";
import { transactionApi, projectApi } from "../api/services";
import { formatCurrency, formatDate, txTypeLabel } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import TransactionModal from "../components/modals/TransactionModal";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
  { value: "project_transfer", label: "To Project" },
  { value: "project_return", label: "From Project" },
];

export default function Transactions() {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState({ type: "", startDate: "", endDate: "" });
  const [txModal, setTxModal] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.type) params.type = filter.type;
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;
      const [txRes, projRes] = await Promise.all([
        transactionApi.getAll(params),
        projectApi.getAll(),
      ]);
      setTransactions(txRes.data.data);
      setProjects(projRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction? The balance will be reversed.")) return;
    setDeleting(id);
    try {
      await transactionApi.delete(id);
      toast("Transaction deleted ✓", "success");
      refreshUser();
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleTxSuccess = () => {
    refreshUser();
    load();
  };

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Transactions"
        subtitle="All credits and debits to your main balance"
        action={
          <Button onClick={() => setTxModal(true)}>
            <Plus size={15} /> Add
          </Button>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap items-center gap-3">
        <Filter size={15} className="text-text-muted flex-shrink-0" />
        <select
          className="input w-auto text-sm py-2"
          value={filter.type}
          onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
        >
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input
          type="date"
          className="input w-auto text-sm py-2"
          value={filter.startDate}
          onChange={(e) => setFilter((f) => ({ ...f, startDate: e.target.value }))}
          placeholder="From"
        />
        <input
          type="date"
          className="input w-auto text-sm py-2"
          value={filter.endDate}
          onChange={(e) => setFilter((f) => ({ ...f, endDate: e.target.value }))}
          placeholder="To"
        />
        {(filter.type || filter.startDate || filter.endDate) && (
          <button
            className="text-xs text-text-muted hover:text-danger transition-colors"
            onClick={() => setFilter({ type: "", startDate: "", endDate: "" })}
          >
            Clear
          </button>
        )}
      </div>

      {/* Transaction list */}
      <div className="card">
        {loading ? (
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-surface-tertiary flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-surface-tertiary rounded" />
                  <div className="h-3 w-20 bg-surface-tertiary rounded" />
                </div>
                <div className="h-4 w-20 bg-surface-tertiary rounded" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No transactions found" description="Try adjusting your filters or add a new transaction." />
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => {
              const { label } = txTypeLabel(tx.type);
              const isPositive = tx.type === "credit" || tx.type === "project_return";
              return (
                <div key={tx._id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/50 transition-colors group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isPositive ? "bg-success-light" : "bg-danger-light"}`}>
                    {isPositive
                      ? <TrendingUp size={15} className="text-success" />
                      : <TrendingDown size={15} className="text-danger" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {tx.description || (tx.project?.name ? `→ ${tx.project.name}` : label)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-text-muted">{formatDate(tx.transactionDate)}</p>
                      {tx.project?.name && (
                        <span className="text-xs text-text-muted">· {tx.project.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${isPositive ? "text-success" : "text-danger"}`}>
                      {isPositive ? "+" : "−"}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant={tx.type} className="mt-0.5">{label}</Badge>
                  </div>
                  <button
                    onClick={() => handleDelete(tx._id)}
                    disabled={deleting === tx._id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-danger hover:bg-danger-light opacity-0 group-hover:opacity-100 transition-all duration-150 flex-shrink-0"
                  >
                    {deleting === tx._id
                      ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      : <Trash2 size={13} />
                    }
                  </button>
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
