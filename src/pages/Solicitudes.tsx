import { useNavigate } from "react-router-dom";
import { Calendar, UserCheck, Clock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Solicitudes = () => {
  const navigate = useNavigate();

  const solicitudes = [
    {
      id: "vacaciones",
      title: "Solicitud de Vacaciones",
      description: "Solicita tus vacaciones anuales",
      icon: Calendar,
      color: "bg-[#F7DC6F]", // Amarillo Bukz
      iconColor: "text-black", // Icono negro
      route: "/solicitudes/vacaciones"
    },
    {
      id: "permiso-remunerado",
      title: "Permiso Remunerado",
      description: "Solicita un permiso con goce de salario",
      icon: UserCheck,
      color: "bg-sidebar", // Gris del menú
      iconColor: "text-foreground", // Icono en color del texto
      route: "/solicitudes/permiso-remunerado",
      disabled: true
    },
    {
      id: "permiso-no-remunerado",
      title: "Permiso No Remunerado",
      description: "Solicita un permiso sin goce de salario",
      icon: Clock,
      color: "bg-sidebar", // Gris del menú
      iconColor: "text-foreground",
      route: "/solicitudes/permiso-no-remunerado",
      disabled: true
    },
    {
      id: "dia-cumpleaños",
      title: "Día de Cumpleaños",
      description: "Solicita tu día de cumpleaños",
      icon: Gift,
      color: "bg-[#F7DC6F]", // Amarillo Bukz
      iconColor: "text-black", // Icono negro
      route: "/solicitudes/cumpleanos"
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Sistema de Solicitudes
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tus solicitudes de vacaciones, permisos y días especiales
        </p>
      </div>

      {/* Información General */}
      <Card className="mb-5 bg-[#161A15] border-[#161A15]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white">Información General</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 text-sm">
          <p>
            Este sistema te permite gestionar tus solicitudes de vacaciones, permisos y días especiales
            de forma rápida y digital. Completa el formulario correspondiente y se enviará automáticamente
            a Recursos Humanos.
          </p>
        </CardContent>
      </Card>

      {/* Grid de Solicitudes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {solicitudes.map((solicitud) => {
          const Icon = solicitud.icon;
          return (
            <Card
              key={solicitud.id}
              className={`bg-[#161A15] border-[#161A15] transition-all ${
                solicitud.disabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
              }`}
              onClick={() => !solicitud.disabled && navigate(solicitud.route)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg ${solicitud.color}`}>
                    <Icon className={`h-5 w-5 ${solicitud.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                      {solicitud.title}
                      {solicitud.disabled && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                          Próximamente
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1 text-sm">
                      {solicitud.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {!solicitud.disabled ? (
                  <Button 
                    variant="default" 
                    className="w-full h-9 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(solicitud.route);
                    }}
                  >
                    Iniciar Solicitud
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="w-full h-9 text-sm" 
                    disabled
                  >
                    Disponible Pronto
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Nota Importante */}
      <Card className="mt-5 bg-[#F7DC6F]/10 border-[#F7DC6F]/30">
        <CardContent className="py-4">
          <p className="text-xs text-foreground">
            <strong>Nota:</strong> Todas las solicitudes deben contar con la aprobación de tu jefe inmediato.
            Una vez enviada la solicitud, recibirás confirmación por correo electrónico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Solicitudes;