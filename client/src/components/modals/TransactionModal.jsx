import { useState } from "react";
import { Plus, Minus, TrendingUp, TrendingDown } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input, { Select, Textarea } from "../ui/Input";
import { transactionApi } from "../../api/services";
import { useToast } from "../../context/ToastContext";
import clsx from "clsx";

export default function TransactionModal({ open, onClose, onSuccess, projects = [] }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("credit");
  const [form, setForm] = useState({ amount: "", description: "", projectId: "", transactionDate: "" });

  const isProjectType = type === "project_transfer" || type === "project_return";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return toast("Enter a valid amount", "error");
    if (isProjectType && !form.projectId) return toast("Select a project", "error");

    setLoading(true);
    try {
      const payload = {
        type,
        amount: Number(form.amount),
        description: form.description,
        project: isProjectType ? form.projectId : undefined,
        transactionDate: form.transactionDate || undefined,
      };
      const { data } = await transactionApi.create(payload);
      toast(type === "credit" ? "Funds credited ✓" : "Funds debited ✓", "success");
      onSuccess?.(data);
      onClose();
      setForm({ amount: "", description: "", projectId: "", transactionDate: "" });
      setType("credit");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to process transaction", "error");
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { value: "credit", label: "Credit", icon: TrendingUp, color: "text-success" },
    { value: "debit", label: "Debit", icon: TrendingDown, color: "text-danger" },
    { value: "project_transfer", label: "To Project", icon: Plus, color: "text-info" },
    { value: "project_return", label: "From Project", icon: Minus, color: "text-info" },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Transaction"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Confirm</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="grid grid-cols-4 gap-2">
          {types.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={clsx(
                "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all duration-150",
                type === t.value
                  ? "border-text-primary bg-surface-secondary"
                  : "border-border text-text-muted hover:border-border-strong"
              )}
            >
              <t.icon size={16} className={type === t.value ? t.color : ""} />
              {t.label}
            </button>
          ))}
        </div>

        <Input
          label="Amount (₹)"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        {isProjectType && (
          <Select
            label="Project"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          >
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </Select>
        )}

        <div className="space-y-1.5">
          <label className="label">Note / Comment</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="e.g. Transfer from City Centre project…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <Input
          label="Date (optional)"
          type="datetime-local"
          value={form.transactionDate}
          onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
        />
      </form>
    </Modal>
  );
}
