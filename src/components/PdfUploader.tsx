import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfUploaderProps {
  onTextExtracted: (text: string) => void;
}

const PdfUploader = ({ onTextExtracted }: PdfUploaderProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Välj en PDF-fil!");
      return;
    }
    setFileName(file.name);
    // For now, we extract basic text. In production, use a PDF parser.
    // We'll send the file name as context
    const reader = new FileReader();
    reader.onload = () => {
      // Simple text extraction attempt
      const text = `Reklamblad: ${file.name} (uppladdad PDF)`;
      onTextExtracted(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setFileName(null);
    onTextExtracted("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.02]"
          : fileName
          ? "border-secondary bg-secondary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {fileName ? (
        <div className="flex items-center justify-center gap-3">
          <span className="text-2xl">📄</span>
          <span className="font-medium text-foreground">{fileName}</span>
          <button
            onClick={(e) => { e.stopPropagation(); clear(); }}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
          <p className="font-medium text-foreground">
            Dra & släpp ett reklamblad här
          </p>
          <p className="text-sm text-muted-foreground">
            eller klicka för att välja en PDF
          </p>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
