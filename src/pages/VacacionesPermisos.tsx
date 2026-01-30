import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const VacacionesPermisos = () => {
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Enlaces de descarga directa de Google Drive
  const DOWNLOAD_LINKS = {
    vacaciones: "https://drive.google.com/uc?export=download&id=1PpTixZg3VcuhHt5W8bTD1aMW_HmW9eUU",
    permisos: "https://docs.google.com/spreadsheets/d/1oEZbeVwNr0wGQNNNisqfG7ps2vKCBzLJ/export?format=xlsx"
  };

  const handleDownload = (url: string) => {
    // Abrir en nueva pestaña para forzar descarga
    window.open(url, '_blank');
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error("Error copying email:", err);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="border-b border-border bg-primary px-8 py-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/librerias")}
            className="text-foreground hover:bg-foreground/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vacaciones y Permisos</h1>
            <p className="text-sm text-foreground/80">
              Procedimientos y formatos para solicitudes de novedades
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8 max-w-4xl mx-auto">
        {/* Introducción */}
        <Card className="mb-6 bg-[#161A15] border-[#161A15]">
          <CardHeader>
            <CardTitle className="text-white">Información General</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-3">
            <p>
              Esta sección contiene los formatos oficiales requeridos para la solicitud de vacaciones
              y permisos. Es importante seguir el procedimiento establecido para garantizar el correcto
              procesamiento de tu solicitud.
            </p>
          </CardContent>
        </Card>

        {/* Formatos Disponibles */}
        <Card className="mb-6 bg-[#161A15] border-[#161A15]">
          <CardHeader>
            <CardTitle className="text-white">Formatos Requeridos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-300 mb-4">
              Descarga el formato correspondiente, complétalo con tus datos y envíalo a los correos indicados más abajo.
            </p>
            
            {/* Botones de descarga */}
            <Button
              variant="default"
              className="w-full justify-start mb-3"
              onClick={() => handleDownload(DOWNLOAD_LINKS.vacaciones)}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Formato Vacaciones (PDF)
            </Button>

            <Button
              variant="default"
              className="w-full justify-start"
              onClick={() => handleDownload(DOWNLOAD_LINKS.permisos)}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Formato Permiso (Excel)
            </Button>
          </CardContent>
        </Card>

        {/* Procedimiento */}
        <Card className="mb-6 bg-[#161A15] border-[#161A15]">
          <CardHeader>
            <CardTitle className="text-white">Procedimiento de Solicitud</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Descarga el formato</h3>
              <p>Selecciona el formato correspondiente según tu necesidad (Vacaciones o Permiso).</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">2. Completa la información</h3>
              <p>Llena todos los campos requeridos con información clara y precisa.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">3. Envía tu solicitud</h3>
              <p>Envía el formato completo a los correos indicados en la sección de contactos.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">4. Espera confirmación</h3>
              <p>Recibirás una respuesta sobre el estado de tu solicitud en un plazo máximo de 3 días hábiles.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contactos */}
        <Card className="bg-[#161A15] border-[#161A15]">
          <CardHeader>
            <CardTitle className="text-white">Correos de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-300 mb-4">
              Envía tus formatos completados a los siguientes correos:
            </p>
            
            <div className="space-y-3">
              {/* Correo Recursos Humanos */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Recursos Humanos</p>
                  <p className="text-white font-medium">rrhh@bukz.com.co</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyEmail("rrhh@bukz.com.co")}
                  className="text-white hover:bg-white/10"
                >
                  {copiedEmail === "rrhh@bukz.com.co" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Correo Administración */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Administración</p>
                  <p className="text-white font-medium">admin@bukz.com.co</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyEmail("admin@bukz.com.co")}
                  className="text-white hover:bg-white/10"
                >
                  {copiedEmail === "admin@bukz.com.co" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 <strong>Tip:</strong> Haz clic en el ícono de copiar para copiar rápidamente el correo a tu portapapeles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VacacionesPermisos;