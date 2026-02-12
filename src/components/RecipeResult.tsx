import { useMemo } from "react";

interface RecipeResultProps {
  content: string;
}

const RecipeResult = ({ content }: RecipeResultProps) => {
  const htmlContent = useMemo(() => {
    // Simple markdown to HTML conversion
    let html = content
      .replace(/^### (.+)$/gm, '<h3 class="font-display text-lg font-semibold text-primary mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="font-display text-xl font-bold text-foreground mt-6 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="font-display text-2xl font-bold text-foreground mt-6 mb-3">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-foreground/90">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-foreground/90">$2</li>')
      .replace(/\n\n/g, '<br/><br/>');
    return html;
  }, [content]);

  return (
    <div className="animate-fade-in-up">
      <div className="bg-card rounded-xl p-6 md:p-8 shadow-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">🍽️</span>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Ditt recept
          </h2>
        </div>
        <div
          className="prose prose-sm max-w-none text-foreground/90 leading-relaxed font-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

export default RecipeResult;
