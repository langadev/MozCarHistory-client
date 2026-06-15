import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { changePassword } from "@/api/auth";

const ChangePassword = () => {
  const { user, token, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isForcedChange = user?.mustChangePassword === true;

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "oficina"
      ? "/dashboard"
      : user?.role === "mecanico"
      ? "/mecanico/dashboard"
      : "/consulta";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (form.next.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres");
      return;
    }
    setIsLoading(true);
    try {
      await changePassword(token!, form.current, form.next);
      toast.success("Senha alterada com sucesso!");
      // Update local user state so mustChangePassword is cleared
      if (user) {
        login({ ...user, mustChangePassword: false }, token!);
      } else {
        navigate(dashboardPath);
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao alterar a senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-lg p-8 shadow-card">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
              <KeyRound className="h-6 w-6 text-accent" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">
              {isForcedChange ? "Defina a sua senha" : "Alterar senha"}
            </h1>
            {isForcedChange && (
              <p className="text-sm text-muted-foreground mt-1">
                Por segurança, deve alterar a senha temporária antes de continuar.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="current">Senha atual</Label>
              <div className="relative mt-1">
                <Input
                  id="current"
                  type={showCurrent ? "text" : "password"}
                  className="pr-10"
                  value={form.current}
                  onChange={(e) => setForm((f) => ({ ...f, current: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowCurrent((v) => !v)}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="next">Nova senha</Label>
              <div className="relative mt-1">
                <Input
                  id="next"
                  type={showNext ? "text" : "password"}
                  className="pr-10"
                  placeholder="Mínimo 8 caracteres"
                  value={form.next}
                  onChange={(e) => setForm((f) => ({ ...f, next: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowNext((v) => !v)}
                >
                  {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirm">Confirmar nova senha</Label>
              <Input
                id="confirm"
                type="password"
                className="mt-1"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isForcedChange ? "Definir senha e entrar" : "Guardar nova senha"}
            </Button>

            {!isForcedChange && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate(dashboardPath)}
              >
                Cancelar
              </Button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;
