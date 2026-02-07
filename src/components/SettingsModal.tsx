import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0f0f0f] border-gray-200 dark:border-[#2a2a2a]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Configuración</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Personaliza la apariencia de la aplicación
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="dark-mode" className="text-sm font-medium text-gray-900 dark:text-white">
                Modo Oscuro
              </Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Reduce el brillo de la pantalla para mayor comodidad
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              className="data-[state=checked]:bg-[#F7DC6F] data-[state=unchecked]:bg-gray-300"
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-[#2a2a2a]">
          💡 Tip: La barra de navegación permanece en amarillo para mantener la identidad visual
        </div>
      </DialogContent>
    </Dialog>
  );
}
