import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentData {
  title: string;
  instructions: string;
  buttons?: { label: string; href: string }[];
  link?: string; // Nueva propiedad para páginas dedicadas
}

const libreriasDocuments: DocumentData[] = [
  {
    title: "Vacaciones y permisos",
    instructions: "Formatos requeridos para solicitud de novedades.",
    link: "/librerias/vacaciones-permisos",
  },
  {
    title: "Instructivo de manejo de caja",
    instructions: "Guía para el cierre y cuadre diario.",
    link: "/librerias/instructivo-caja",
  },
];

const operacionesDocuments: DocumentData[] = [
  {
    title: "Creación de productos",
    instructions: "Paso a paso para ingresar nuevas referencias al sistema.",
    buttons: [{ label: "Descargar Plantilla Creación", href: "/documents/Creacion_productos.xlsx" }],
  },
  {
    title: "Actualización de productos",
    instructions: "Proceso para modificar precios, stock o detalles de items existentes.",
    buttons: [{ label: "Descargar Plantilla Actualización", href: "/documents/Plantilla_Actualizacion_Productos.xlsx" }],
  },
  {
    title: "Instructivo de creación individual",
    instructions: "Guía paso a paso para creación unitaria en Shopify.",
    buttons: [{ label: "Descargar Instructivo Shopify", href: "/documents/Creacion_Productos_Shopify_1.pdf" }],
  },
];

interface DocumentLibraryProps {
  section: "librerias" | "operaciones";
}

export function DocumentLibrary({ section }: DocumentLibraryProps) {
  const navigate = useNavigate();
  const documents = section === "librerias" ? libreriasDocuments : operacionesDocuments;
  const sectionTitle = section === "librerias" ? "Administrativo y RRHH" : "Operaciones de Producto";

  const handleDownload = (href: string) => {
    if (href === "#") return;
    const link = document.createElement("a");
    link.href = href;
    link.download = href.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {sectionTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {documents.map((doc) => (
            <Card 
              key={doc.title} 
              className={`card-hover-shadow border-[#161A15] bg-[#161A15] ${doc.link ? 'cursor-pointer' : ''}`}
              onClick={() => doc.link && navigate(doc.link)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-white">
                  {doc.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-300">
                  {doc.instructions}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Si tiene link, mostrar botón de ver más */}
                {doc.link && (
                  <Button
                    variant="default"
                    className="w-full justify-between"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(doc.link!);
                    }}
                  >
                    Ver más información
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}

                {/* Si tiene botones de descarga, mostrarlos */}
                {doc.buttons && doc.buttons.map((button, index) => (
                  <Button
                    key={index}
                    variant="default"
                    className="w-full justify-start"
                    onClick={() => handleDownload(button.href)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {button.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}