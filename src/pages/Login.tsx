import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Building2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [userType, setUserType] = useState<"oficina" | "comprador">("oficina");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,hsl(152_60%_38%/0.3),transparent_60%)]" />
        <div className="relative text-center">
          <Shield className="h-16 w-16 text-accent mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold text-navy-foreground mb-4">
            Moz Car History
          </h2>
          <p className="text-navy-foreground/60 max-w-sm">
            Plataforma segura de verificação e registo de histórico automóvel em Moçambique.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-navy-foreground/50">
              <Lock className="h-4 w-4 text-accent" />
              Dados Encriptados
            </div>
            <div className="flex items-center gap-2 text-sm text-navy-foreground/50">
              <Shield className="h-4 w-4 text-accent" />
              Verificação Segura
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="h-7 w-7 text-accent" />
            <span className="font-display font-bold text-lg text-foreground">Moz Car History</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            {isRegister ? "Criar Conta" : "Bem-vindo de Volta"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {isRegister ? "Registe-se para começar a usar a plataforma." : "Inicie sessão na sua conta."}
          </p>

          {/* User type selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setUserType("oficina")}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                userType === "oficina"
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/30"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Oficina / Mecânico
            </button>
            <button
              onClick={() => setUserType("comprador")}
              className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                userType === "comprador"
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/30"
              }`}
            >
              <User className="h-4 w-4" />
              Comprador
            </button>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {isRegister && (
              <div>
                <Label htmlFor="name" className="text-foreground">Nome Completo</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" placeholder="Seu nome" className="pl-10" />
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="email@exemplo.com" className="pl-10" />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground">Palavra-passe</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              {isRegister ? "Criar Conta" : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isRegister ? "Já tem conta? " : "Não tem conta? "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-accent font-medium hover:underline">
              {isRegister ? "Entrar" : "Registar-se"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
