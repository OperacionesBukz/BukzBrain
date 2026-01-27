import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const VacacionesPermisos = () => {
  const navigate = useNavigate();
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleDownload = (href: string) => {
    if (href === "#") return;
    const link = document.createElement("a");
    link.href = href;
    link.download = href.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              onClick={() => handleDownload("./documents/FORMATO_SOLICITUD_VACACIONES.pdf")}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Formato Vacaciones
            </Button>

            <Button
              variant="default"
              className="w-full justify-start"
              onClick={() => handleDownload("/documents/FORMATO_SOLICITUD_DE_PERMISO.xlsx")}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Formato Permiso
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
              <h3 className="font-semibold text-white mb-2">4. Espera la aprobación</h3>
              <p>Recibirás una respuesta por correo electrónico sobre el estado de tu solicitud.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contactos */}
        <Card className="bg-[#161A15] border-[#161A15]">
          <CardHeader>
            <CardTitle className="text-white">Enviar Solicitud A:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-300 mb-4">
              Una vez completes el formato, envíalo a los siguientes correos electrónicos:
            </p>

            <Button
              variant="outline"
              className="w-full justify-between bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
              onClick={() => handleCopyEmail("operaciones@bukz.co")}
            >
              <span className="flex items-center gap-2">
                {copiedEmail === "operaciones@bukz.co" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Operaciones
              </span>
              <span className="text-xs text-gray-400">
                {copiedEmail === "operaciones@bukz.co" ? "¡Copiado!" : "operaciones@bukz.co"}
              </span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
              onClick={() => handleCopyEmail("rh@bukz.co")}
            >
              <span className="flex items-center gap-2">
                {copiedEmail === "rh@bukz.co" ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Recursos Humanos
              </span>
              <span className="text-xs text-gray-400">
                {copiedEmail === "rh@bukz.co" ? "¡Copiado!" : "rh@bukz.co"}
              </span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VacacionesPermisos;
