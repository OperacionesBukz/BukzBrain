import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface DownloadButton {
  label: string;
  href: string;
}

interface EmailButton {
  label: string;
  email: string;
}

interface DocumentCardProps {
  title: string;
  instructions: string;
  buttons: DownloadButton[];
  emails?: EmailButton[];
}

export function DocumentCard({ title, instructions, buttons, emails }: DocumentCardProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleDownload = (href: string, label: string) => {
    if (href === "#") {
      console.log(`No file available for: ${label}`);
      return;
    }
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
    <Card className="card-hover-shadow border-[#161A15] bg-[#161A15]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-gray-300">
          {instructions}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {buttons.map((button, index) => (
          <Button
            key={index}
            variant="default"
            className="w-full justify-start"
            onClick={() => handleDownload(button.href, button.label)}
          >
            <Download className="h-4 w-4 mr-2" />
            {button.label}
          </Button>
        ))}
        
        {emails && emails.length > 0 && (
          <div className="pt-2 border-t border-gray-700 mt-3">
            <p className="text-xs text-gray-400 mb-2">Enviar solicitud a:</p>
            {emails.map((emailBtn, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-between mb-2 last:mb-0 bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
                onClick={() => handleCopyEmail(emailBtn.email)}
              >
                <span className="flex items-center gap-2">
                  {copiedEmail === emailBtn.email ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {emailBtn.label}
                </span>
                <span className="text-xs text-gray-400">
                  {copiedEmail === emailBtn.email ? "¡Copiado!" : emailBtn.email}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}