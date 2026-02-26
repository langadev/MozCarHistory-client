import { motion } from "framer-motion";
import { ShieldCheck, Star, MapPin, Phone, Mail, Calendar, Wrench, Award } from "lucide-react";

const WorkshopProfile = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg shadow-card overflow-hidden mb-8">
          <div className="gradient-hero p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-xl bg-accent/20 flex items-center justify-center shadow-glow">
                <Wrench className="h-10 w-10 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-foreground">Auto Mecânica Maputo, Lda.</h1>
                  <div className="inline-flex items-center gap-1 bg-accent/20 text-accent px-2.5 py-1 rounded-full text-xs font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verificada
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-navy-foreground/60">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Av. 24 de Julho, Maputo</span>
                  <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +258 84 123 4567</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> info@automecanica.co.mz</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            {[
              { icon: Star, label: "Pontuação", value: "4.8 / 5" },
              { icon: Wrench, label: "Serviços Totais", value: "482" },
              { icon: Calendar, label: "Desde", value: "Mar 2022" },
              { icon: Award, label: "Ranking", value: "Top 5%" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-accent" />
                <div className="text-lg font-display font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Verification badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card border border-accent/30 rounded-lg p-6 shadow-card mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full gradient-accent flex items-center justify-center shrink-0 shadow-glow">
              <ShieldCheck className="h-7 w-7 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">Selo de Oficina Verificada</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Esta oficina foi verificada pela plataforma Moz Car History. Os seus registos de manutenção são auditados e considerados confiáveis.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Documentação Completa", "NUIT Verificado", "Endereço Confirmado", "Técnicos Certificados"].map((badge, i) => (
                  <span key={i} className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium">
                    ✓ {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent services */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-lg shadow-card">
          <div className="p-6 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">Últimos Serviços Realizados</h3>
          </div>
          <div className="divide-y divide-border">
            {[
              { car: "Toyota Hilux 2019", plate: "MAA-123-MP", service: "Revisão Geral", date: "25/02/2026" },
              { car: "Nissan NP300 2020", plate: "MBB-456-MP", service: "Substituição de Travões", date: "24/02/2026" },
              { car: "Ford Ranger 2021", plate: "MDD-012-MP", service: "Troca de Óleo", date: "22/02/2026" },
              { car: "Mitsubishi L200 2017", plate: "MEE-345-MP", service: "Diagnóstico Completo", date: "20/02/2026" },
              { car: "Isuzu KB 2018", plate: "MFF-678-MP", service: "Suspensão Dianteira", date: "18/02/2026" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div>
                  <div className="font-medium text-sm text-foreground">{item.car}</div>
                  <div className="text-xs text-muted-foreground">{item.plate} · {item.service}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                  <ShieldCheck className="h-4 w-4 text-accent" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkshopProfile;
