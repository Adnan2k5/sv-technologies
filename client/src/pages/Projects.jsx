import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Plus, ArrowUpRight, Trash2, MapPin, User } from "lucide-react";
import { projectApi } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency, formatDate } from "../utils/format";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import CreateProjectModal from "../components/modals/CreateProjectModal";

const STATUS_TABS = ["all", "active", "completed", "on_hold"];
const statusLabel = { all: "All", active: "Active", completed: "Completed", on_hold: "On Hold" };

export default function Projects() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [createModal, setCreateModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = tab !== "all" ? { status: tab } : {};
      const { data } = await projectApi.getAll(params);
      setProjects(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project? All expenses and transactions will be removed.")) return;
    try {
      await projectApi.delete(id);
      toast("Project deleted ✓", "success");
      refreshUser();
      load();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const handleCreateSuccess = () => {
    refreshUser();
    load();
  };

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Projects"
        subtitle="Track expenses by project"
        action={
          <Button onClick={() => setCreateModal(true)}>
            <Plus size={15} /> New Project
          </Button>
        }
      />

      {/* Status tabs */}
      <div className="flex items-center gap-1 bg-surface-secondary rounded-xl p-1 w-fit mb-5 border border-border">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${tab === s ? "bg-surface shadow-soft text-text-primary" : "text-text-muted hover:text-text-primary"}`}
          >
            {statusLabel[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-surface-tertiary rounded-2xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FolderOpen}
            title="No projects found"
            description={tab !== "all" ? `No ${statusLabel[tab].toLowerCase()} projects` : "Create your first project to get started"}
            action={tab === "all" && <Button onClick={() => setCreateModal(true)}><Plus size={15} />New Project</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const pct = p.allocatedFunds > 0 ? Math.min((p.spentAmount / p.allocatedFunds) * 100, 100) : 0;
            const overBudget = p.spentAmount > p.allocatedFunds && p.allocatedFunds > 0;
            return (
              <div
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}`)}
                className="card p-5 cursor-pointer hover:shadow-card transition-all duration-200 group relative"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, p._id)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-light opacity-0 group-hover:opacity-100 transition-all duration-150"
                >
                  <Trash2 size={13} />
                </button>

                {/* Status + date */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={p.status}>{statusLabel[p.status] || p.status}</Badge>
                  <p className="text-[11px] text-text-muted">{formatDate(p.createdAt)}</p>
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-text-primary mb-1 pr-8">{p.name}</h3>

                {/* Meta */}
                {(p.clientName || p.location) && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {p.clientName && (
                      <span className="flex items-center gap-1 text-[11px] text-text-muted">
                        <User size={11} /> {p.clientName}
                      </span>
                    )}
                    {p.location && (
                      <span className="flex items-center gap-1 text-[11px] text-text-muted">
                        <MapPin size={11} /> {p.location}
                      </span>
                    )}
                  </div>
                )}

                {/* Spend stats */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <p className="text-[11px] text-text-muted">Spent</p>
                    <p className={`text-base font-semibold ${overBudget ? "text-danger" : "text-text-primary"}`}>
                      {formatCurrency(p.spentAmount)}
                    </p>
                  </div>
                  {p.allocatedFunds > 0 && (
                    <div className="text-right">
                      <p className="text-[11px] text-text-muted">Budget</p>
                      <p className="text-sm text-text-secondary">{formatCurrency(p.allocatedFunds)}</p>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {p.allocatedFunds > 0 ? (
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${overBudget ? "bg-danger" : "bg-text-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                ) : (
                  <div className="h-1.5 rounded-full bg-border" />
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-text-muted">
                    {p.allocatedFunds > 0 ? `${pct.toFixed(0)}% of budget` : "No budget set"}
                  </p>
                  <ArrowUpRight size={14} className="text-text-muted" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
