import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Wrench, Camera, Save, Gauge, Plus, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { apiFetch, withAuthToken } from "@/api/client";

const SERVICE_TYPES = [
  "Troca de Óleo",
  "Revisão Geral",
  "Travões / Freios",
  "Pneus",
  "Sistema Eléctrico",
  "Motor",
  "Transmissão / Caixa",
  "Suspensão",
  "Filtros",
  "Ar Condicionado",
  "Diagnóstico",
  "Outro",
];

const MechanicServiceForm = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    km: "",
    serviceType: "",
    desc: "",
    parts: "",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [kmError, setKmError] = useState<string | null>(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await apiFetch<any[]>("/mechanics/me/vehicles", {
          headers: withAuthToken(token!),
        });
        setVehicles(data);
        const plate = searchParams.get("plate");
        if (plate) {
          const match = data.find((v: any) => v.plateNumber === plate);
          if (match) setSelectedVehicle(match);
        }
      } catch {
        toast.error("Erro ao carregar viaturas");
      }
    };
    if (token) fetchVehicles();
  }, [token, searchParams]);

  const lastMileage = selectedVehicle?.records?.[0]?.mileage;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotoFiles(prev => [...prev, ...files].slice(0, 5));
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 5));
  };

  const removePhoto = (i: number) => {
    setPhotoFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      toast.error("Selecione uma viatura.");
      return;
    }
    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("carId", String(selectedVehicle.id));
      fd.append("mileage", formData.km);
      fd.append("description", formData.desc);
      if (formData.serviceType) fd.append("serviceType", formData.serviceType);
      if (formData.parts) fd.append("parts", formData.parts);
      fd.append("workshopId", "0");
      photoFiles.forEach(f => fd.append("photos", f));

      await apiFetch("/maintenance", {
        method: "POST",
        body: fd,
        headers: withAuthToken(token!),
      });

      toast.success("Serviço registado com sucesso!");
      navigate("/mecanico/dashboard");
    } catch (err: any) {
      const msg = err?.message || "Erro ao registar serviço.";
      if (msg.toLowerCase().includes("quilometragem")) {
        setKmError(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Registar Serviço</h1>
          <p className="text-muted-foreground mb-8">Preencha os dados da manutenção realizada.</p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Vehicle */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Viatura *</h2>
              </div>

              <Label htmlFor="vehicle-select">Selecionar Viatura</Label>
              <select
                id="vehicle-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedVehicle?.id || ""}
                onChange={(e) => {
                  const v = vehicles.find(x => x.id === Number(e.target.value)) || null;
                  setSelectedVehicle(v);
                  setKmError(null);
                }}
                required
              >
                <option value="">-- Selecione uma viatura --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.brand} {v.model}{v.year ? ` (${v.year})` : ""}
                  </option>
                ))}
              </select>

              {/* Vehicle details card */}
              {selectedVehicle && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-lg border border-border bg-muted/30 overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {selectedVehicle.photos?.[0] ? (
                      <img
                        src={selectedVehicle.photos[0]}
                        alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                        className="h-20 w-28 rounded-md object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-28 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                        <Car className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-foreground text-lg leading-tight">
                        {selectedVehicle.brand} {selectedVehicle.model}
                        {selectedVehicle.year && (
                          <span className="text-muted-foreground font-normal text-sm ml-1">({selectedVehicle.year})</span>
                        )}
                      </p>
                      <p className="font-mono text-sm text-muted-foreground mt-0.5">{selectedVehicle.plateNumber}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        {selectedVehicle.color && <span>Cor: <span className="text-foreground">{selectedVehicle.color}</span></span>}
                        {selectedVehicle.fuelType && <span>Combustível: <span className="text-foreground">{selectedVehicle.fuelType}</span></span>}
                        {selectedVehicle.transmission && <span>Transmissão: <span className="text-foreground">{selectedVehicle.transmission}</span></span>}
                      </div>
                    </div>
                  </div>
                  {lastMileage !== undefined && (
                    <div className="px-4 py-2 bg-accent/5 border-t border-border flex items-center gap-2 text-xs">
                      <Gauge className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className="text-muted-foreground">Última km registada:</span>
                      <span className="font-bold text-foreground">{lastMileage.toLocaleString("pt-PT")} km</span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Service details */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Detalhes do Serviço</h2>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="km">Quilometragem Actual *</Label>
                    <div className="relative mt-1">
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="km"
                        type="number"
                        placeholder={lastMileage ? String(lastMileage + 1000) : "85000"}
                        className={`pl-10 ${kmError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        value={formData.km}
                        onChange={(e) => {
                          setKmError(null);
                          handleChange(e);
                        }}
                        min={lastMileage ?? 0}
                        required
                      />
                    </div>
                    {kmError && (
                      <div className="flex items-start gap-1.5 mt-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                        <p className="text-xs text-destructive">{kmError}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="serviceType">Tipo de Serviço</Label>
                    <select
                      id="serviceType"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.serviceType}
                      onChange={handleChange}
                    >
                      <option value="">-- Selecione o tipo --</option>
                      {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="desc">Descrição Técnica *</Label>
                  <Textarea
                    id="desc"
                    placeholder="Descreva o serviço realizado..."
                    className="mt-1"
                    rows={4}
                    value={formData.desc}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="parts">Peças Substituídas</Label>
                  <Textarea
                    id="parts"
                    placeholder="Ex: Óleo 5W30 (4L), Filtro de óleo, Correia de distribuição..."
                    className="mt-1"
                    rows={3}
                    value={formData.parts}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Fotos</h2>
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
                    <span className="text-[10px] text-muted-foreground">Foto</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">Máximo 5 fotos.</p>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
              disabled={isLoading || !selectedVehicle}
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

export default MechanicServiceForm;
