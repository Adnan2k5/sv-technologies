import { useState } from "react";
import { HardHat } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function AuthPage() {
  const { login, register } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast("Fill in all fields", "error");
    if (mode === "register" && form.password.length < 6) return toast("Password must be at least 6 characters", "error");

    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      toast(err.response?.data?.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-secondary px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-text-primary flex items-center justify-center">
            <HardHat size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary leading-none">SiteVault</p>
            <p className="text-[11px] text-text-muted">Construction Expense Manager</p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-7">
          <h2 className="text-base font-semibold text-text-primary mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm text-text-muted mb-6">
            {mode === "login" ? "Sign in to your workspace" : "Get started for free"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <Input label="Your Name" type="text" placeholder="e.g. Adnan Ashraf" value={form.name} onChange={set("name")} />
            )}
            <Input label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} />
            <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />

            <Button className="w-full justify-center mt-2" loading={loading}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Switch mode */}
        <p className="text-center text-sm text-text-muted mt-5">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-text-primary font-medium hover:underline"
          >
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
