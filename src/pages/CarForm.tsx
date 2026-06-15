import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Save, Hash, Plus, Loader2, Camera, Fuel, Settings, Calendar, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { createCar } from "@/api/cars";

const BRANDS = [
  "Toyota", "Nissan", "Ford", "Isuzu", "Mercedes-Benz", "Volkswagen",
  "Mitsubishi", "Hyundai", "Kia", "Honda", "BMW", "Land Rover",
  "Mazda", "Peugeot", "Renault", "Chevrolet", "Outro",
];

const FUEL_TYPES = ["Gasolina", "Gasóleo", "Eléctrico", "Híbrido", "GPL"];
const TRANSMISSIONS = ["Manual", "Automático"];
const BODY_TYPES = ["Sedan", "SUV", "Pickup", "Hatchback", "Comercial", "Caminhão", "Moto", "Outro"];

const CarForm = () => {
  const [formData, setFormData] = useState({
    plate: "",
    vin: "",
    brand: "",
    model: "",
    year: "",
    color: "",
    fuelType: "",
    transmission: "",
    engineSize: "",
    bodyType: "",
    initialMileage: "",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotoFiles(prev => [...prev, ...files].slice(0, 5));
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getMessage = (error: any) => {
    if (!error) return "Erro desconhecido";
    if (typeof error === "string") return error;
    if (Array.isArray(error)) return error.join(" ");
    if (error?.message) return error.message;
    return JSON.stringify(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createCar(
        {
          plateNumber: formData.plate,
          brand: formData.brand,
          model: formData.model,
          vin: formData.vin || undefined,
          year: formData.year ? Number(formData.year) : undefined,
          color: formData.color || undefined,
          fuelType: formData.fuelType || undefined,
          transmission: formData.transmission || undefined,
          engineSize: formData.engineSize || undefined,
          bodyType: formData.bodyType || undefined,
          initialMileage: formData.initialMileage ? Number(formData.initialMileage) : undefined,
          photos: photoFiles,
        },
        token ?? undefined,
      );
      toast.success("Viatura registada com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(getMessage(error));
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
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Registar Nova Viatura
          </h1>
          <p className="text-muted-foreground mb-8">
            Preencha os dados da viatura. Os campos com * são obrigatórios.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Identification */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Identificação</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plate">Matrícula *</Label>
                  <Input
                    id="plate"
                    placeholder="MAA-123-MP"
                    className="mt-1 font-mono"
                    value={formData.plate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="vin">Chassis (VIN)</Label>
                  <Input
                    id="vin"
                    placeholder="1HGBH41JXMN109186"
                    className="mt-1 font-mono"
                    value={formData.vin}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Brand & Model */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Marca e Modelo</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Marca *</Label>
                  <select
                    id="brand"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Selecione a marca --</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    placeholder="Hilux, Canter, Civic..."
                    className="mt-1"
                    value={formData.model}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Ano de Fabrico</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="year"
                      type="number"
                      placeholder="2019"
                      className="pl-10"
                      min={1950}
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bodyType">Tipo de Carroçaria</Label>
                  <select
                    id="bodyType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.bodyType}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecione --</option>
                    {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Technical details */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Dados Técnicos</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fuelType">Combustível</Label>
                  <div className="relative mt-1">
                    <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <select
                      id="fuelType"
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.fuelType}
                      onChange={handleChange}
                    >
                      <option value="">-- Selecione --</option>
                      {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="transmission">Transmissão</Label>
                  <select
                    id="transmission"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.transmission}
                    onChange={handleChange}
                  >
                    <option value="">-- Selecione --</option>
                    {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="engineSize">Cilindrada</Label>
                  <Input
                    id="engineSize"
                    placeholder="2.0L, 2500cc..."
                    className="mt-1"
                    value={formData.engineSize}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <div className="relative mt-1">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="color"
                      placeholder="Branco, Prata, Preto..."
                      className="pl-10"
                      value={formData.color}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="initialMileage">Quilometragem Inicial</Label>
                  <Input
                    id="initialMileage"
                    type="number"
                    placeholder="45000"
                    className="mt-1"
                    min={0}
                    value={formData.initialMileage}
                    onChange={handleChange}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Km da viatura no momento do registo
                  </p>
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Fotos da Viatura</h2>
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
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-muted/30">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Adicionar</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Máximo 5 fotos. Primeira foto será a principal.</p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Registar Viatura
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CarForm;
