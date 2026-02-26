import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Wrench, Camera, Save, Hash, Gauge, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MaintenanceForm = () => {
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Registar Novo Serviço</h1>
          <p className="text-muted-foreground mb-8">Preencha os dados da manutenção realizada.</p>

          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
            {/* Vehicle info */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Dados da Viatura</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plate">Matrícula</Label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="plate" placeholder="MAA-123-MP" className="pl-10 font-mono" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vin">Número de Chassis (VIN)</Label>
                  <Input id="vin" placeholder="1HGBH41JXMN109186" className="mt-1 font-mono" />
                </div>
                <div>
                  <Label htmlFor="brand">Marca / Modelo</Label>
                  <Input id="brand" placeholder="Toyota Hilux" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="km">Quilometragem Atual</Label>
                  <div className="relative mt-1">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="km" type="number" placeholder="85,000" className="pl-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Service info */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Descrição do Serviço</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="desc">Descrição Técnica</Label>
                  <Textarea id="desc" placeholder="Descreva o serviço realizado em detalhe..." className="mt-1" rows={4} />
                </div>
                <div>
                  <Label htmlFor="parts">Peças Substituídas</Label>
                  <Textarea id="parts" placeholder="Lista de peças utilizadas..." className="mt-1" rows={3} />
                </div>
                <div>
                  <Label htmlFor="mechanic">Mecânico Responsável</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="mechanic" placeholder="Nome do mecânico" className="pl-10" />
                  </div>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Fotos (Antes / Depois)</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <label
                    key={i}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-muted/30"
                  >
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{i < 2 ? "Antes" : "Depois"}</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              <Save className="mr-2 h-5 w-5" />
              Guardar Registo
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceForm;
