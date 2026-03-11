import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Building2, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [userType, setUserType] = useState<"oficina" | "comprador">("oficina");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    nuit: "",
  });

  const { login: authLogin } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const body = isRegister 
        ? { ...formData, role: userType }
        : { email: formData.email, password: formData.password, role: userType };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na autenticação');
      }

      authLogin(data.user, data.access_token);
      toast.success(isRegister ? "Conta criada com sucesso!" : "Bem-vindo de volta!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="h-7 w-7 text-accent" />
            <span className="font-display font-bold text-lg text-foreground">Moz Car History</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? "register" : "login"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                {isRegister ? "Criar Conta" : "Bem-vindo de Volta"}
              </h1>
              <p className="text-muted-foreground text-sm mb-6">
                {isRegister ? "Registe-se para começar a usar a plataforma." : "Inicie sessão na sua conta."}
              </p>

              {/* User type selector */}
              <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-muted rounded-xl">
                <button
                  onClick={() => setUserType("oficina")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-all ${
                    userType === "oficina"
                      ? "bg-card text-accent shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Oficina
                </button>
                <button
                  onClick={() => setUserType("comprador")}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-all ${
                    userType === "comprador"
                      ? "bg-card text-accent shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Comprador
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {isRegister && (
                  <>
                    <div>
                      <Label htmlFor="name" className="text-foreground">
                        {userType === 'oficina' ? "Nome da Oficina" : "Nome Completo"}
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="name" 
                          placeholder={userType === 'oficina' ? "Ex: Auto Mecânica Lda" : "Seu nome"}
                          className="pl-10 h-10" 
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    {userType === 'oficina' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="nuit" className="text-foreground">NUIT</Label>
                            <Input 
                              id="nuit" 
                              placeholder="123456789"
                              className="h-10" 
                              value={formData.nuit}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-foreground">Telefone</Label>
                            <Input 
                              id="phone" 
                              placeholder="+258..."
                              className="h-10" 
                              value={formData.phone}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="address" className="text-foreground">Endereço Físico</Label>
                          <Input 
                            id="address" 
                            placeholder="Cidade, Bairro, Rua..."
                            className="h-10" 
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
                <div>
                  <Label htmlFor="email" className="text-foreground">Email Profissional</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="email@exemplo.com" 
                      className="pl-10 h-12" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">Palavra-passe</Label>
                    {!isRegister && (
                      <button type="button" className="text-xs text-accent hover:underline">
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="pl-10 pr-10 h-12" 
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRegister ? "Criar Conta Gratuita" : "Entrar na Conta")}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {isRegister ? "Já tem uma conta? " : "Ainda não tem conta? "}
                <button onClick={() => setIsRegister(!isRegister)} className="text-accent font-semibold hover:underline">
                  {isRegister ? "Iniciar Sessão" : "Registar-se Agora"}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Login;
