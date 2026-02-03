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
      color: "bg-blue-500",
      route: "/solicitudes/vacaciones"
    },
    {
      id: "permiso-remunerado",
      title: "Permiso Remunerado",
      description: "Solicita un permiso con goce de salario",
      icon: UserCheck,
      color: "bg-green-500",
      route: "/solicitudes/permiso-remunerado",
      disabled: true
    },
    {
      id: "permiso-no-remunerado",
      title: "Permiso No Remunerado",
      description: "Solicita un permiso sin goce de salario",
      icon: Clock,
      color: "bg-orange-500",
      route: "/solicitudes/permiso-no-remunerado",
      disabled: true
    },
    {
      id: "dia-cumpleaños",
      title: "Día de Cumpleaños",
      description: "Solicita tu día de cumpleaños",
      icon: Gift,
      color: "bg-purple-500",
      route: "/solicitudes/cumpleanos"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Sistema de Solicitudes
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus solicitudes de vacaciones, permisos y días especiales
        </p>
      </div>

      {/* Información General */}
      <Card className="mb-6 bg-[#161A15] border-[#161A15]">
        <CardHeader>
          <CardTitle className="text-white">Información General</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-3">
          <p>
            Este sistema te permite gestionar tus solicitudes de vacaciones, permisos y días especiales
            de forma rápida y digital. Completa el formulario correspondiente y se enviará automáticamente
            a Recursos Humanos.
          </p>
        </CardContent>
      </Card>

      {/* Grid de Solicitudes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${solicitud.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white flex items-center gap-2">
                      {solicitud.title}
                      {solicitud.disabled && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                          Próximamente
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-2">
                      {solicitud.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!solicitud.disabled ? (
                  <Button 
                    variant="default" 
                    className="w-full"
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
                    className="w-full" 
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
      <Card className="mt-6 bg-blue-500/10 border-blue-500/20">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-300">
            <strong>Nota:</strong> Todas las solicitudes deben contar con la aprobación de tu jefe inmediato.
            Una vez enviada la solicitud, recibirás confirmación por correo electrónico.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Solicitudes;
