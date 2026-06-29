import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input, { Textarea } from "../ui/Input";
import { projectApi } from "../../api/services";
import { useToast } from "../../context/ToastContext";

export default function CreateProjectModal({ open, onClose, onSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    clientName: "",
    location: "",
    initialFunds: "",
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast("Project name is required", "error");

    setLoading(true);
    try {
      const { data } = await projectApi.create({
        name: form.name.trim(),
        description: form.description,
        clientName: form.clientName,
        location: form.location,
        initialFunds: Number(form.initialFunds) || 0,
      });
      toast("Project created ✓", "success");
      onSuccess?.(data);
      onClose();
      setForm({ name: "", description: "", clientName: "", location: "", initialFunds: "" });
    } catch (err) {
      toast(err.response?.data?.message || "Failed to create project", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Project"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Create</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Project Name *" placeholder="e.g. Residential Building" value={form.name} onChange={set("name")} />
        <Input label="Client Name" placeholder="e.g. Mr. Adnan Ashraf" value={form.clientName} onChange={set("clientName")} />
        <Input label="Location" placeholder="e.g. Main Road" value={form.location} onChange={set("location")} />
        <Input
          label="Initial Funds (₹)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.initialFunds}
          onChange={set("initialFunds")}
        />
        <div className="space-y-1.5">
          <label className="label">Description</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Project details…"
            value={form.description}
            onChange={set("description")}
          />
        </div>
        {Number(form.initialFunds) > 0 && (
          <p className="text-xs text-text-muted bg-info-light text-info rounded-lg px-3 py-2">
            ₹{Number(form.initialFunds).toLocaleString("en-IN")} will be transferred from your main balance.
          </p>
        )}
      </form>
    </Modal>
  );
}
