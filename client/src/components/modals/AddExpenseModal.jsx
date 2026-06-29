import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input, { Select } from "../ui/Input";
import { expenseApi } from "../../api/services";
import { useToast } from "../../context/ToastContext";

export default function AddExpenseModal({ open, onClose, onSuccess, projectId, categories = [] }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    description: "",
    vendor: "",
    expenseDate: "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) return toast("Select a category", "error");
    if (!form.amount || Number(form.amount) <= 0) return toast("Enter a valid amount", "error");

    setLoading(true);
    try {
      const { data } = await expenseApi.create({
        projectId,
        categoryId: form.categoryId,
        amount: Number(form.amount),
        description: form.description,
        vendor: form.vendor,
        expenseDate: form.expenseDate || undefined,
      });
      toast("Expense added ✓", "success");
      onSuccess?.(data);
      onClose();
      setForm({ categoryId: "", amount: "", description: "", vendor: "", expenseDate: "" });
    } catch (err) {
      toast(err.response?.data?.message || "Failed to add expense", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Expense"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Add</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Category *" value={form.categoryId} onChange={set("categoryId")}>
          <option value="">Select category…</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </Select>

        <Input label="Amount (₹) *" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={set("amount")} />
        <Input label="Vendor / Supplier" placeholder="e.g. ABC Hardware" value={form.vendor} onChange={set("vendor")} />

        <div className="space-y-1.5">
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="What was this expense for?"
            value={form.description}
            onChange={set("description")}
          />
        </div>

        <Input label="Date (optional)" type="datetime-local" value={form.expenseDate} onChange={set("expenseDate")} />
      </form>
    </Modal>
  );
}
