import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Download, Car, Wrench, MapPin, Gauge, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const records = [
  {
    date: "25/02/2026",
    workshop: "Auto Mecânica Maputo",
    mechanic: "Carlos Nhaca",
    km: "85,230 km",
    services: ["Revisão geral", "Troca de óleo", "Filtro de ar"],
    verified: true,
  },
  {
    date: "10/11/2025",
    workshop: "Oficina Central Matola",
    mechanic: "João Machava",
    km: "78,100 km",
    services: ["Substituição de travões dianteiros", "Verificação de suspensão"],
    verified: true,
  },
  {
    date: "05/06/2025",
    workshop: "Auto Mecânica Maputo",
    mechanic: "Carlos Nhaca",
    km: "72,500 km",
    services: ["Troca de correia dentada", "Substituição de bomba de água"],
    verified: true,
  },
  {
    date: "15/01/2025",
    workshop: "Oficina Rápida Beira",
    mechanic: "Miguel Santos",
    km: "88,000 km",
    services: ["Diagnóstico electrónico"],
    verified: false,
    alert: "Quilometragem superior ao registo seguinte — possível inconsistência",
  },
  {
    date: "20/08/2024",
    workshop: "Auto Mecânica Maputo",
    mechanic: "Carlos Nhaca",
    km: "60,200 km",
    services: ["Primeira revisão", "Alinhamento e balanceamento"],
    verified: true,
  },
];

const VehicleHistory = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Vehicle header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-lg p-6 shadow-card mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Car className="h-6 w-6 text-accent" />
                <h1 className="font-display text-2xl font-bold text-foreground">Toyota Hilux 2019</h1>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="font-mono font-medium text-foreground">MAA-123-MP</span>
                <span>VIN: 1HGBH41JXMN109186</span>
                <span>Última quilometragem: 85,230 km</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-accent text-sm font-medium bg-accent/10 px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-4 w-4" />
                5 Registos Verificados
              </div>
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {records.map((record, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-14 pb-8"
            >
              {/* Timeline dot */}
              <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                record.verified
                  ? "bg-accent/20 border-accent"
                  : "bg-warning/20 border-warning"
              }`}>
                <div className={`absolute inset-1 rounded-full ${record.verified ? "bg-accent" : "bg-warning"}`} />
              </div>

              <div className={`bg-card border rounded-lg p-5 shadow-card transition-shadow hover:shadow-card-hover ${
                record.alert ? "border-warning/50" : "border-border"
              }`}>
                {/* Alert */}
                {record.alert && (
                  <div className="flex items-start gap-2 bg-warning/10 text-warning rounded-md p-3 mb-4 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{record.alert}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {record.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {record.workshop}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5" />
                    {record.mechanic}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" />
                    {record.km}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {record.services.map((s, j) => (
                    <span key={j} className="text-xs bg-muted px-2.5 py-1 rounded-md text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>

                {record.verified ? (
                  <span className="inline-flex items-center gap-1 text-accent text-xs font-medium">
                    <ShieldCheck className="h-3.5 w-3.5" /> Registo Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-warning text-xs font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" /> Verificação Pendente
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleHistory;
