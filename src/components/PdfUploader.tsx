import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

interface PdfUploaderProps {
  onTextExtracted: (text: string) => void;
}

const PdfUploader = ({ onTextExtracted }: PdfUploaderProps) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => item.str)
        .join(" ");
      pages.push(text);
    }

    return pages.join("\n\n");
  };

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Välj en PDF-fil!");
      return;
    }
    setFileName(file.name);
    setIsExtracting(true);

    try {
      const text = await extractTextFromPdf(file);
      if (text.trim().length < 10) {
        onTextExtracted(`Reklamblad: ${file.name} (kunde inte extrahera text, kan vara en bildbaserad PDF)`);
      } else {
        onTextExtracted(text);
      }
    } catch (err) {
      console.error("PDF extraction error:", err);
      onTextExtracted(`Reklamblad: ${file.name} (kunde inte läsa PDF:en)`);
    } finally {
      setIsExtracting(false);
    }
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
      className={`relative rounded-xl p-5 text-center transition-all duration-150 cursor-pointer border-2 border-dashed ${
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : fileName
          ? "border-secondary/40 bg-secondary/5"
          : "border-border hover:border-primary/40 hover:bg-muted/40"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isExtracting && fileInputRef.current?.click()}
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
        <div className="flex items-center justify-center gap-2.5">
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="font-body text-sm text-foreground">Läser {fileName}...</span>
            </>
          ) : (
            <>
              <span className="text-lg">📄</span>
              <span className="font-body text-sm font-medium text-foreground">{fileName}</span>
              <button
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="font-body text-sm font-medium text-foreground">
            Dra & släpp ett reklamblad
          </p>
          <p className="text-xs text-muted-foreground">
            eller klicka för att välja PDF
          </p>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
