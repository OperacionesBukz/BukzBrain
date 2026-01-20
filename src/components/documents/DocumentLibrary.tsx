import { DocumentCard } from "./DocumentCard";

interface DocumentData {
  title: string;
  instructions: string;
  buttons: { label: string; href: string }[];
}

const libreriasDocuments: DocumentData[] = [
  {
    title: "Vacaciones y permisos",
    instructions: "Formatos requeridos para solicitud de novedades.",
    buttons: [
      { label: "Descargar Formato Vacaciones", href: "/documents/FORMATO_SOLICITUD_VACACIONES.pdf" },
      { label: "Descargar Formato Permiso", href: "/documents/FORMATO_SOLICITUD_DE_PERMISO.xlsx" },
    ],
  },
  {
    title: "Instructivo de manejo de caja",
    instructions: "Guía para el cierre y cuadre diario.",
    buttons: [{ label: "Descargar Instructivo", href: "#" }],
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
  const documents = section === "librerias" ? libreriasDocuments : operacionesDocuments;
  const sectionTitle = section === "librerias" ? "Administrativo y RRHH" : "Operaciones de Producto";

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {sectionTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.title}
              title={doc.title}
              instructions={doc.instructions}
              buttons={doc.buttons}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
