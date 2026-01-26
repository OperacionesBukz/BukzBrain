import { useParams } from "react-router-dom";
import { DocumentLibrary } from "@/components/documents/DocumentLibrary";
import { Library, ClipboardList } from "lucide-react";

const Documents = () => {
  const { section } = useParams<{ section: "librerias" | "operaciones" }>();
  
  // Por defecto usar librerías si no hay sección
  const activeSection = section || "librerias";

  const headerConfig = {
    librerias: {
      title: "Biblioteca de Documentos",
      description: "Descarga formatos, guías e instructivos oficiales de la empresa.",
      icon: Library,
    },
    operaciones: {
      title: "Operaciones",
      description: "Guías y procedimientos para gestión operativa.",
      icon: ClipboardList,
    },
  };

  const { title, description, icon: Icon } = headerConfig[activeSection];

  return (
    <>
      {/* Header with yellow background */}
      <header className="border-b border-border bg-primary px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-foreground/80">
              {description}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        <DocumentLibrary section={activeSection} />
      </div>
    </>
  );
};

export default Documents;
