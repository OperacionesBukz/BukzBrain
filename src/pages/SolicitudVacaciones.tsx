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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { sendEmail, getVacacionesTemplate } from "@/services/emailService";

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
    jefe_inmediato: "",
    email_destinatario: ""
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
    if (!formData.solicitante || !formData.cargo || !formData.sede || !formData.documento || !formData.jefe_inmediato || !formData.email_destinatario) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos del formulario",
        variant: "destructive"
      });
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_destinatario)) {
      toast({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
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
      // Preparar datos para la plantilla
      const templateData = {
        solicitante: formData.solicitante,
        cargo: formData.cargo,
        sede: formData.sede,
        documento: formData.documento,
        fecha_inicio: format(fechaInicio, "dd/MM/yyyy", { locale: es }),
        fecha_fin: format(fechaFin, "dd/MM/yyyy", { locale: es }),
        fecha_reingreso: format(fechaReingreso, "dd/MM/yyyy", { locale: es }),
        jefe_inmediato: formData.jefe_inmediato
      };

      // Generar HTML de la plantilla
      const htmlContent = getVacacionesTemplate(templateData);

      // Enviar correo con Brevo
      await sendEmail({
        to: formData.email_destinatario,
        subject: `Solicitud de Vacaciones - ${formData.solicitante}`,
        htmlContent
      });

      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud de vacaciones ha sido enviada correctamente",
        variant: "default"
      });

      // Limpiar formulario
      setFormData({
        solicitante: "",
        cargo: "",
        sede: "",
        documento: "",
        jefe_inmediato: "",
        email_destinatario: ""
      });
      setFechaInicio(undefined);
      setFechaFin(undefined);
      setFechaReingreso(undefined);

      // Redirigir después de 2 segundos
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error("Error al enviar:", error);
      toast({
        title: "Error al enviar",
        description: error instanceof Error ? error.message : "Ocurrió un error al enviar la solicitud",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] p-4 md:p-8">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <Card className="max-w-2xl mx-auto border-[#30363d] bg-[#161b22]">
        <CardHeader className="border-b border-[#30363d]">
          <CardTitle className="text-white text-2xl">Solicitud de Vacaciones</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos Personales */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Datos Personales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="solicitante" className="text-gray-300">
                    Nombre Completo
                  </Label>
                  <Input
                    id="solicitante"
                    name="solicitante"
                    value={formData.solicitante}
                    onChange={handleInputChange}
                    className="bg-[#0d1117] border-[#30363d] text-white"
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento" className="text-gray-300">
                    Documento
                  </Label>
                  <Input
                    id="documento"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className="bg-[#0d1117] border-[#30363d] text-white"
                    placeholder="Tu documento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo" className="text-gray-300">
                    Cargo
                  </Label>
                  <Input
                    id="cargo"
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleInputChange}
                    className="bg-[#0d1117] border-[#30363d] text-white"
                    placeholder="Tu cargo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sede" className="text-gray-300">
                    Sede
                  </Label>
                  <Input
                    id="sede"
                    name="sede"
                    value={formData.sede}
                    onChange={handleInputChange}
                    className="bg-[#0d1117] border-[#30363d] text-white"
                    placeholder="Tu sede"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jefe_inmediato" className="text-gray-300">
                  Jefe Inmediato
                </Label>
                <Input
                  id="jefe_inmediato"
                  name="jefe_inmediato"
                  value={formData.jefe_inmediato}
                  onChange={handleInputChange}
                  className="bg-[#0d1117] border-[#30363d] text-white"
                  placeholder="Nombre de tu jefe inmediato"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email_destinatario" className="text-gray-300">
                  Email para enviar solicitud
                </Label>
                <Input
                  id="email_destinatario"
                  name="email_destinatario"
                  type="email"
                  value={formData.email_destinatario}
                  onChange={handleInputChange}
                  className="bg-[#0d1117] border-[#30363d] text-white"
                  placeholder="ejemplo@empresa.com"
                />
              </div>
            </div>

            {/* Fechas de Vacaciones */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300">Fechas de Vacaciones</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Fecha de Inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#0d1117] border-[#30363d]",
                          !fechaInicio && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaInicio
                          ? format(fechaInicio, "dd/MM/yyyy", { locale: es })
                          : "Selecciona fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fechaInicio}
                        onSelect={setFechaInicio}
                        disabled={(date) =>
                          date > new Date("2099-01-01") ||
                          date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Fecha de Finalización</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#0d1117] border-[#30363d]",
                          !fechaFin && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaFin
                          ? format(fechaFin, "dd/MM/yyyy", { locale: es })
                          : "Selecciona fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fechaFin}
                        onSelect={setFechaFin}
                        disabled={(date) =>
                          date > new Date("2099-01-01") ||
                          date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Fecha de Reingreso</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-[#0d1117] border-[#30363d]",
                          !fechaReingreso && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaReingreso
                          ? format(fechaReingreso, "dd/MM/yyyy", { locale: es })
                          : "Selecciona fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fechaReingreso}
                        onSelect={setFechaReingreso}
                        disabled={(date) =>
                          date > new Date("2099-01-01") ||
                          date < new Date("2000-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1 border-[#30363d] text-gray-300 hover:bg-[#0d1117]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Solicitud
                  </>
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