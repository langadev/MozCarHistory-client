import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Wrench, Camera, Save, Hash, Gauge, User, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MaintenanceForm = () => {
  const [formData, setFormData] = useState({
    plate: "",
    vin: "",
    brand: "",
    km: 0,
    desc: "",
    parts: "",
    mechanic: ""
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotoFiles(prev => [...prev, ...files].slice(0, 5));
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: id === 'km' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('plateNumber', formData.plate);
      data.append('vin', formData.vin);
      data.append('brandModel', formData.brand);
      data.append('mileage', formData.km.toString());
      data.append('description', formData.desc);
      data.append('parts', formData.parts);
      data.append('mechanic', formData.mechanic);
      data.append('workshopId', user.id.toString());
      
      photoFiles.forEach(file => {
        data.append('photos', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/maintenance`, {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Erro ao guardar o registo');

      toast.success("Serviço registado com sucesso!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent font-medium mb-6 transition-colors"
        >
          <Plus className="h-4 w-4 rotate-45" />
          Voltar
        </button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Registar Novo Serviço</h1>
          <p className="text-muted-foreground mb-8">Preencha os dados da manutenção realizada.</p>

          <form className="space-y-8" onSubmit={handleSubmit}>
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
                    <Input 
                      id="plate" 
                      placeholder="MAA-123-MP" 
                      className="pl-10 font-mono" 
                      value={formData.plate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="vin">Número de Chassis (VIN)</Label>
                  <Input 
                    id="vin" 
                    placeholder="1HGBH41JXMN109186" 
                    className="mt-1 font-mono" 
                    value={formData.vin}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Marca / Modelo</Label>
                  <Input 
                    id="brand" 
                    placeholder="Toyota Hilux" 
                    className="mt-1" 
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="km">Quilometragem Atual</Label>
                  <div className="relative mt-1">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="km" 
                      type="number" 
                      placeholder="85000" 
                      className="pl-10" 
                      value={formData.km}
                      onChange={handleInputChange}
                      required
                    />
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
                  <Textarea 
                    id="desc" 
                    placeholder="Descreva o serviço realizado em detalhe..." 
                    className="mt-1" 
                    rows={4} 
                    value={formData.desc}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parts">Peças Substituídas</Label>
                  <Textarea 
                    id="parts" 
                    placeholder="Lista de peças utilizadas..." 
                    className="mt-1" 
                    rows={3} 
                    value={formData.parts}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="mechanic">Mecânico Responsável</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="mechanic" 
                      placeholder="Nome do mecânico" 
                      className="pl-10" 
                      value={formData.mechanic}
                      onChange={handleInputChange}
                    />
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
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-border">
                    <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="h-4 w-4 rotate-45" />
                    </button>
                  </div>
                ))}
                {photoFiles.length < 5 && (
                  <label
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-muted/30"
                  >
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Adicionar Foto</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Guardar Registo
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceForm;
