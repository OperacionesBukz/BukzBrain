import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InstructivoCaja = () => {
  const navigate = useNavigate();

  const handleDownload = (href: string) => {
    if (href === "#") {
      alert("Este documento estará disponible próximamente");
      return;
    }
    const link = document.createElement("a");
    link.href = href;
    link.download = href.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <h1 className="text-2xl font-bold text-foreground">Instructivo de Manejo de Caja</h1>
            <p className="text-sm text-foreground/80">
              Guía completa para el cierre y cuadre diario
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
              Este instructivo contiene los procedimientos necesarios para realizar correctamente
              el cierre y cuadre de caja al finalizar el día. Es fundamental seguir cada paso
              para garantizar la exactitud de la información financiera.
            </p>
          </CardContent>
        </Card>

        {/* Descargar Instructivo */}
        <Card className="mb-6 bg-[#161A15] border-[#161A15]">
          <CardHeader>
            <CardTitle className="text-white">Documento Oficial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-300 mb-4">
              Descarga el instructivo completo en formato PDF para tener acceso a todos los procedimientos detallados.
            </p>
            
            <Button
              variant="default"
              className="w-full justify-start"
              onClick={() => handleDownload("#")}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Instructivo
            </Button>
            
            <p className="text-xs text-gray-400 mt-2">
              * Este documento estará disponible próximamente
            </p>
          </CardContent>
        </Card>

        {/* Pasos Generales */}
        <Card className="mb-6 bg-[#161A15] border-[#161A15]">
          <CardHeader>
            <CardTitle className="text-white">Procedimiento General</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <div>
              <h3 className="font-semibold text-white mb-2">1. Preparación</h3>
              <p>Reúne todos los documentos necesarios: facturas, recibos, comprobantes de pago y registro de transacciones del día.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">2. Conteo de Efectivo</h3>
              <p>Realiza el conteo físico del dinero en caja, separando por denominación (billetes y monedas).</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">3. Verificación de Transacciones</h3>
              <p>Compara el efectivo contado con los registros de ventas y transacciones del sistema.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">4. Cuadre de Caja</h3>
              <p>Completa el formato de cuadre de caja, registrando todas las entradas y salidas de dinero.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">5. Reporte de Diferencias</h3>
              <p>Si existe alguna diferencia entre el efectivo y los registros, documéntala y reporta inmediatamente.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">6. Cierre y Archivo</h3>
              <p>Guarda el efectivo de forma segura y archiva todos los documentos del día según el procedimiento establecido.</p>
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones */}
        <Card className="bg-[#161A15] border-[#161A15]">
          <CardHeader>
            <CardTitle className="text-white">Recomendaciones Importantes</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-3">
            <ul className="list-disc list-inside space-y-2">
              <li>Realiza el conteo en un lugar seguro y libre de distracciones</li>
              <li>Verifica dos veces el conteo de efectivo para evitar errores</li>
              <li>Mantén todos los documentos organizados y en orden cronológico</li>
              <li>Reporta cualquier irregularidad de inmediato a tu supervisor</li>
              <li>No salgas del área de caja sin cerrar completamente el turno</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default InstructivoCaja;
