import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, Search, FileText, Car, Wrench, BarChart3, Users, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import heroImage from "@/assets/hero-car.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage} alt="Verificação automóvel" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/60" />
        <div className="relative container mx-auto px-4 py-24 md:py-36">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">Plataforma Certificada</span>
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-navy-foreground leading-tight mb-6">
              Histórico Automóvel Confiável.{" "}
              <span className="text-gradient">Transparência que Gera Confiança.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-navy-foreground/70 mb-8 max-w-lg">
              A primeira plataforma de Moçambique para registo e verificação do histórico completo de manutenção automóvel.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3">
              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 animate-pulse-glow">
                      <Building2 className="mr-2 h-5 w-5" />
                      Registar Oficina
                    </Button>
                  </Link>
                  <Link to="/consulta">
                    <Button size="lg" variant="outline" className="border-navy-foreground/30 text-navy-foreground hover:bg-navy-foreground/10 font-semibold px-8">
                      <Search className="mr-2 h-5 w-5" />
                      Consultar Matrícula
                    </Button>
                  </Link>
                  <Link to="/veiculos">
                    <Button size="lg" variant="ghost" className="text-accent hover:bg-accent/10 font-semibold px-8 border border-accent/20">
                      <Car className="mr-2 h-5 w-5" />
                      Ver Catálogo
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={user?.role === 'oficina' ? "/dashboard" : "/veiculos"}>
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">
                      <Shield className="mr-2 h-5 w-5" />
                      {user?.role === 'oficina' ? 'Ir para o Dashboard' : 'Ver Catálogo de Viaturas'}
                    </Button>
                  </Link>
                  <Link to="/consulta">
                    <Button size="lg" variant="outline" className="border-navy-foreground/30 text-navy-foreground hover:bg-navy-foreground/10 font-semibold px-8">
                      <Search className="mr-2 h-5 w-5" />
                      Fazer Nova Consulta
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2,500+", label: "Oficinas Registadas" },
              { value: "45,000+", label: "Viaturas Verificadas" },
              { value: "120,000+", label: "Registos de Serviço" },
              { value: "99.2%", label: "Taxa de Confiança" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-2xl md:text-3xl font-display font-bold text-primary">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problema" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-destructive font-medium text-sm mb-3">
              <AlertTriangle className="h-4 w-4" /> O Problema
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Fraudes e Falta de Transparência
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Em Moçambique, a compra de viaturas usadas é arriscada: quilometragem manipulada, histórico desconhecido e falta de registos verificáveis.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Car, title: "Quilometragem Adulterada", desc: "Vendedores manipulam o hodômetro para aumentar o valor do veículo." },
              { icon: FileText, title: "Sem Histórico Documentado", desc: "Não existe um sistema centralizado de registo de manutenções." },
              { icon: AlertTriangle, title: "Risco para Compradores", desc: "Compradores não têm como verificar a condição real da viatura." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solucao" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-accent font-medium text-sm mb-3">
              <Shield className="h-4 w-4" /> A Solução
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Moz Car History
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma digital em nuvem que centraliza e verifica todo o histórico de manutenção automóvel.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Wrench, title: "Para Oficinas", desc: "Registe cada serviço, ganhe credibilidade e atraia mais clientes com o selo de oficina verificada.", color: "accent" },
              { icon: Users, title: "Para Compradores", desc: "Consulte o histórico completo de qualquer viatura antes de comprar. Sem surpresas.", color: "primary" },
              { icon: BarChart3, title: "Para Seguradoras", desc: "Aceda a dados confiáveis para avaliação de risco e processamento de sinistros.", color: "accent" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-lg border border-border p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${item.color === "accent" ? "bg-accent/10" : "bg-primary/10"}`}>
                  <item.icon className={`h-6 w-6 ${item.color === "accent" ? "text-accent" : "text-primary"}`} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Como Funciona</h2>
            <p className="text-muted-foreground">Três passos simples para um histórico automóvel confiável.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", title: "Oficina Regista-se", desc: "A oficina cria o perfil e é verificada pela plataforma." },
              { step: "02", title: "Serviço é Registado", desc: "Cada manutenção é documentada com fotos, peças e quilometragem." },
              { step: "03", title: "Comprador Consulta", desc: "Qualquer pessoa pode consultar o histórico completo da viatura." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <span className="font-display font-bold text-xl text-accent-foreground">{item.step}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
                {i < 2 && <ArrowRight className="h-5 w-5 text-muted-foreground/30 mx-auto mt-4 hidden md:block rotate-0" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-navy-foreground mb-4">
              Pronto para Começar?
            </h2>
            <p className="text-navy-foreground/60 max-w-lg mx-auto mb-8">
              Junte-se a milhares de oficinas e compradores que confiam no Moz Car History.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">
                  Registar Oficina
                </Button>
              </Link>
              <Link to="/consulta">
                <Button size="lg" variant="outline" className="border-navy-foreground/30 text-navy-foreground hover:bg-navy-foreground/10 font-semibold px-8">
                  Consultar Viatura
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
