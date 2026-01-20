import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DownloadButton {
  label: string;
  href: string;
}

interface DocumentCardProps {
  title: string;
  instructions: string;
  buttons: DownloadButton[];
}

export function DocumentCard({ title, instructions, buttons }: DocumentCardProps) {
  const handleDownload = (href: string, label: string) => {
    if (href === "#") {
      console.log(`No file available for: ${label}`);
      return;
    }
    // Create a temporary anchor element to trigger download
    const link = document.createElement("a");
    link.href = href;
    link.download = href.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="card-hover-shadow border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {instructions}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {buttons.map((button, index) => (
          <Button
            key={index}
            variant="download"
            className="w-full justify-start"
            onClick={() => handleDownload(button.href, button.label)}
          >
            <Download className="h-4 w-4" />
            {button.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
