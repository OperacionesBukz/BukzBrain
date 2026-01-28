import { DocumentLibrary } from "@/components/documents/DocumentLibrary";

// ✅ COMPONENTE CORRECTO PARA LIBRERÍAS
// Este componente debe mostrar los documentos de libreriasDocuments:
// - Vacaciones y permisos
// - Instructivo de manejo de caja

const Librerias = () => {
  return (
    <div className="p-8">
      {/* La prop section="librerias" hace que DocumentLibrary muestre libreriasDocuments */}
      <DocumentLibrary section="librerias" />
    </div>
  );
};

export default Librerias;