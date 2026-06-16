import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Wrench, Camera, Save, Gauge, Plus, Loader2, User, DollarSign, AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { createRecord } from "@/api/records";
import { getAllCars, type Car as CarType } from "@/api/cars";
import { getMechanics, type Mechanic } from "@/api/mechanics";

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

const MaintenanceForm = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    km: "",
    serviceType: "",
    desc: "",
    parts: "",
    cost: "",
    nextServiceMileage: "",
    mechanicId: "",
  });
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [registeredCars, setRegisteredCars] = useState<CarType[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [kmError, setKmError] = useState<string | null>(null);

  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cars, mechs] = await Promise.all([
          getAllCars(token ?? undefined),
          token ? getMechanics(token, true) : Promise.resolve([]),
        ]);
        setRegisteredCars(cars);
        setMechanics(mechs);

        const plate = searchParams.get("plate");
        if (plate) {
          const match = cars.find(c => c.plateNumber === plate);
          if (match) setSelectedCar(match);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [searchParams, token]);

  const lastMileage = selectedCar?.records?.[0]?.mileage;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotoFiles(prev => [...prev, ...files].slice(0, 5));
      setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
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
    if (!user || !selectedCar) {
      toast.error("Por favor, selecione uma viatura.");
      return;
    }
    setIsLoading(true);
    try {
      await createRecord(
        {
          carId: selectedCar.id,
          mileage: Number(formData.km),
          serviceType: formData.serviceType || undefined,
          description: formData.desc,
          parts: formData.parts || undefined,
          cost: formData.cost ? Number(formData.cost) : undefined,
          nextServiceMileage: formData.nextServiceMileage ? Number(formData.nextServiceMileage) : undefined,
          mechanicId: formData.mechanicId ? Number(formData.mechanicId) : undefined,
          workshopId: user.id,
          photos: photoFiles,
        },
        token ?? undefined,
      );
      toast.success("Serviço registado com sucesso!");
      navigate(selectedCar.plateNumber ? `/historico?plate=${selectedCar.plateNumber}` : "/dashboard");
    } catch (error: any) {
      const msg = getMessage(error);
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent font-medium mb-6 transition-colors"
        >
          <Plus className="h-4 w-4 rotate-45" />
          Voltar
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Registar Serviço
          </h1>
          <p className="text-muted-foreground mb-8">
            Preencha os dados da manutenção realizada. Os campos com * são obrigatórios.
          </p>

          {user?.verified === false && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-amber-800">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="font-semibold text-sm">Conta não verificada</p>
                <p className="text-sm mt-0.5">Não é possível registar serviços enquanto a sua oficina não for verificada pelo administrador.</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Vehicle selection */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Viatura *</h2>
              </div>

              <Label htmlFor="car-select">Selecionar Viatura Registada</Label>
              <select
                id="car-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedCar?.id || ""}
                onChange={(e) => {
                  const car = registeredCars.find(c => c.id === Number(e.target.value)) || null;
                  setSelectedCar(car);
                  setKmError(null);
                }}
                required
              >
                <option value="">-- Selecione uma viatura --</option>
                {registeredCars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.plateNumber} — {car.brand} {car.model}{car.year ? ` (${car.year})` : ""}
                  </option>
                ))}
              </select>

              {!isFetching && registeredCars.length === 0 && (
                <p className="text-[10px] text-destructive mt-1">
                  Nenhuma viatura registada. <Link to="/registar-viatura" className="underline font-bold text-accent">Registe uma aqui</Link> primeiro.
                </p>
              )}

              {/* Vehicle details card */}
              {selectedCar && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-lg border border-border bg-muted/30 overflow-hidden"
                >
                  <div className="flex gap-4 p-4">
                    {selectedCar.photos?.[0] ? (
                      <img
                        src={selectedCar.photos[0]}
                        alt={`${selectedCar.brand} ${selectedCar.model}`}
                        className="h-20 w-28 rounded-md object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-28 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                        <Car className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-foreground text-lg leading-tight">
                        {selectedCar.brand} {selectedCar.model}
                        {selectedCar.year && <span className="text-muted-foreground font-normal text-sm ml-1">({selectedCar.year})</span>}
                      </p>
                      <p className="font-mono text-sm text-muted-foreground mt-0.5">{selectedCar.plateNumber}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                        {selectedCar.color && <span>Cor: <span className="text-foreground">{selectedCar.color}</span></span>}
                        {selectedCar.fuelType && <span>Combustível: <span className="text-foreground">{selectedCar.fuelType}</span></span>}
                        {selectedCar.transmission && <span>Transmissão: <span className="text-foreground">{selectedCar.transmission}</span></span>}
                        {selectedCar.bodyType && <span>Tipo: <span className="text-foreground">{selectedCar.bodyType}</span></span>}
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
                    placeholder="Descreva o serviço realizado em detalhe..."
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
                    placeholder="Ex: Óleo 5W30 (4L), Filtro de óleo WIX 51516, Filtro de ar..."
                    className="mt-1"
                    rows={3}
                    value={formData.parts}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Cost & next service */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Custos e Próximo Serviço</h2>
                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cost">Custo Total (MZN)</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">MT</span>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="4500"
                      className="pl-10"
                      min={0}
                      value={formData.cost}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="nextServiceMileage">Próximo Serviço (km)</Label>
                  <div className="relative mt-1">
                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nextServiceMileage"
                      type="number"
                      placeholder={formData.km ? String(Number(formData.km) + 10000) : "95000"}
                      className="pl-10"
                      min={0}
                      value={formData.nextServiceMileage}
                      onChange={handleChange}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Km recomendada para o próximo serviço</p>
                </div>
              </div>
            </div>

            {/* Mechanic */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-accent" />
                <h2 className="font-display font-semibold text-foreground">Mecânico Responsável</h2>
                <span className="text-xs text-muted-foreground ml-1">(opcional)</span>
              </div>
              <select
                id="mechanicId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.mechanicId}
                onChange={handleChange}
              >
                <option value="">-- Sem mecânico atribuído --</option>
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.specialty ? ` — ${m.specialty}` : ""}
                  </option>
                ))}
              </select>
              {mechanics.length === 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Nenhum mecânico ativo. <Link to="/mecanicos" className="underline text-accent">Adicione aqui.</Link>
                </p>
              )}
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
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors bg-muted/30">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Adicionar</span>
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
              disabled={isLoading || !selectedCar || user?.verified === false}
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
