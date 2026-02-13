import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { sendEmail } from "@/services/emailService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SolicitudVacaciones = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    solicitante: "",
    cargo: "",
    sede: "",
    documento: "",
    jefe_inmediato: ""
  });

  const [fechaInicio, setFechaInicio] = useState<Date>();
  const [fechaFin, setFechaFin] = useState<Date>();
  const [fechaReingreso, setFechaReingreso] = useState<Date>();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.solicitante || !formData.cargo || !formData.sede || !formData.documento || !formData.jefe_inmediato) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos del formulario",
        variant: "destructive"
      });
      return;
    }

    if (!fechaInicio || !fechaFin || !fechaReingreso) {
      toast({
        title: "Fechas incompletas",
        description: "Por favor selecciona todas las fechas requeridas",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Construir HTML del correo
      const htmlContent = `
        <h2>Solicitud de Vacaciones</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Solicitante</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.solicitante}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Documento</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.documento}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Cargo</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.cargo}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Sede</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.sede}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Fecha Inicio</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${format(fechaInicio, "dd/MM/yyyy", { locale: es })}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Fecha Fin</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${format(fechaFin, "dd/MM/yyyy", { locale: es })}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Fecha Reingreso</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${format(fechaReingreso, "dd/MM/yyyy", { locale: es })}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Jefe Inmediato</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formData.jefe_inmediato}</td></tr>
        </table>
      `;

      // Enviar correo con Brevo via Supabase Edge Function
      await sendEmail({
        to: "operaciones@bukz.co",
        subject: `Solicitud de Vacaciones - ${formData.solicitante}`,
        htmlContent,
      });

      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud de vacaciones ha sido enviada exitosamente a Recursos Humanos",
      });

      // Limpiar formulario
      setFormData({
        solicitante: "",
        cargo: "",
        sede: "",
        documento: "",
        jefe_inmediato: ""
      });
      setFechaInicio(undefined);
      setFechaFin(undefined);
      setFechaReingreso(undefined);

      // Volver después de 2 segundos
      setTimeout(() => {
        navigate("/solicitudes");
      }, 2000);

    } catch (error) {
      console.error("Error al enviar:", error);
      toast({
        title: "Error al enviar",
        description: "Hubo un problema al enviar tu solicitud. Por favor intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card className="bg-[#161A15] border-[#161A15]">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/solicitudes")}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          <CardTitle className="text-white text-xl">Solicitud de Vacaciones</CardTitle>
          <p className="text-gray-400 text-sm mt-1">
            Completa el formulario para solicitar tus vacaciones
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Datos Personales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="solicitante" className="text-gray-300 text-sm">
                  Nombre Completo *
                </Label>
                <Input
                  id="solicitante"
                  name="solicitante"
                  value={formData.solicitante}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez"
                  className="bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="documento" className="text-gray-300 text-sm">
                  Documento de Identidad *
                </Label>
                <Input
                  id="documento"
                  name="documento"
                  value={formData.documento}
                  onChange={handleInputChange}
                  placeholder="Ej: 1234567890"
                  className="bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cargo" className="text-gray-300 text-sm">
                  Cargo *
                </Label>
                <Input
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  placeholder="Ej: Analista"
                  className="bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sede" className="text-gray-300 text-sm">
                  Sede *
                </Label>
                <Input
                  id="sede"
                  name="sede"
                  value={formData.sede}
                  onChange={handleInputChange}
                  placeholder="Ej: Medellín"
                  className="bg-white"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="jefe_inmediato" className="text-gray-300 text-sm">
                  Jefe Inmediato *
                </Label>
                <Input
                  id="jefe_inmediato"
                  name="jefe_inmediato"
                  value={formData.jefe_inmediato}
                  onChange={handleInputChange}
                  placeholder="Ej: María González"
                  className="bg-white"
                  required
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="space-y-3 pt-3 border-t border-gray-700">
              <h3 className="text-base font-semibold text-white">Período de Vacaciones</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fecha Inicio */}
                <div className="space-y-1.5">
                  <Label className="text-gray-300 text-sm">Fecha de Inicio *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white",
                          !fechaInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fechaInicio}
                        onSelect={setFechaInicio}
                        locale={es}
                        initialFocus
                        weekStartsOn={1}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fecha Fin */}
                <div className="space-y-1.5">
                  <Label className="text-gray-300 text-sm">Fecha de Finalización *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white",
                          !fechaFin && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaFin ? format(fechaFin, "PPP", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fechaFin}
                        onSelect={setFechaFin}
                        locale={es}
                        disabled={(date) => fechaInicio ? date < fechaInicio : false}
                        initialFocus
                        weekStartsOn={1}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Fecha Reingreso */}
                <div className="space-y-1.5">
                  <Label className="text-gray-300 text-sm">Fecha de Reingreso *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white",
                          !fechaReingreso && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaReingreso ? format(fechaReingreso, "PPP", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fechaReingreso}
                        onSelect={setFechaReingreso}
                        locale={es}
                        disabled={(date) => fechaFin ? date <= fechaFin : false}
                        initialFocus
                        weekStartsOn={1}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/solicitudes")}
                className="flex-1 h-10"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Enviar Solicitud
                  </span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolicitudVacaciones;