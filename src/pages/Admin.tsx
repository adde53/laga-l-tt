import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft, Send, FileEdit, CheckCircle, XCircle, RefreshCw,
  Loader2, Shield, Calendar, Clock, Mail
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Draft {
  id: string;
  subject: string;
  content: string;
  status: string;
  scheduled_for: string;
  sent_at: string | null;
  created_at: string;
}

interface Settings {
  id: string;
  send_day: number;
  send_hour: number;
}

const dayNames = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Check admin role
  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      setIsAdmin(data && (data as any[]).length > 0);
    };
    checkAdmin();
  }, [user]);

  // Load data
  useEffect(() => {
    if (!isAdmin) return;
    loadDrafts();
    loadSettings();
    loadSubscriberCount();
  }, [isAdmin]);

  const loadDrafts = async () => {
    const { data } = await supabase
      .from("newsletter_drafts" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setDrafts((data as any as Draft[]) || []);
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from("newsletter_settings" as any)
      .select("*")
      .limit(1)
      .single();
    if (data) setSettings(data as any as Settings);
  };

  const loadSubscriberCount = async () => {
    const { count } = await supabase
      .from("newsletter_subscribers" as any)
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    setSubscriberCount(count || 0);
  };

  const generateDraft = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("generate-newsletter-draft", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      toast.success("Nytt utkast genererat!");
      loadDrafts();
    } catch (e: any) {
      toast.error(e.message || "Kunde inte generera utkast");
    } finally {
      setGenerating(false);
    }
  };

  const updateDraftStatus = async (draftId: string, status: string) => {
    await supabase
      .from("newsletter_drafts" as any)
      .update({ status } as any)
      .eq("id", draftId);
    toast.success(status === "approved" ? "Godkänt!" : "Avvisat");
    loadDrafts();
  };

  const saveDraftEdit = async () => {
    if (!editingDraft) return;
    await supabase
      .from("newsletter_drafts" as any)
      .update({ subject: editSubject, content: editContent } as any)
      .eq("id", editingDraft.id);
    toast.success("Utkast uppdaterat");
    setEditingDraft(null);
    loadDrafts();
  };

  const sendNewsletter = async (draftId: string) => {
    setSending(draftId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("send-newsletter", {
        body: { draftId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw res.error;
      const result = res.data;
      toast.success(`Skickat till ${result.sentCount} prenumeranter!`);
      loadDrafts();
    } catch (e: any) {
      toast.error(e.message || "Kunde inte skicka");
    } finally {
      setSending(null);
    }
  };

  const updateSettings = async (field: string, value: number) => {
    if (!settings) return;
    await supabase
      .from("newsletter_settings" as any)
      .update({ [field]: value, updated_by: user?.id } as any)
      .eq("id", settings.id);
    setSettings({ ...settings, [field]: value });
    toast.success("Inställning sparad");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Shield className="w-16 h-16 text-destructive mx-auto" />
        <h1 className="font-display text-2xl font-bold">Ingen åtkomst</h1>
        <p className="text-muted-foreground">Du har inte administratörsrättigheter.</p>
        <Link to="/"><Button variant="outline">Tillbaka till startsidan</Button></Link>
      </div>
    </div>
  );

  // Editing view
  if (editingDraft) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto px-5 py-8">
          <Button variant="ghost" onClick={() => setEditingDraft(null)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Tillbaka
          </Button>
          <h1 className="font-display text-2xl font-bold mb-6">Redigera nyhetsbrev</h1>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Ämnesrad</label>
              <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Innehåll (HTML)</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="mt-1 w-full h-96 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Förhandsvisning</label>
              <div className="border rounded-lg p-4 bg-card" dangerouslySetInnerHTML={{ __html: editContent }} />
            </div>
            <div className="flex gap-3">
              <Button onClick={saveDraftEdit}>Spara ändringar</Button>
              <Button variant="outline" onClick={() => setEditingDraft(null)}>Avbryt</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Nyhetsbrev Admin</h1>
              <p className="text-sm text-muted-foreground">
                <Mail className="w-3 h-3 inline mr-1" />{subscriberCount} aktiva prenumeranter
              </p>
            </div>
          </div>
          <Button onClick={generateDraft} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {generating ? "Genererar..." : "Generera nytt utkast"}
          </Button>
        </div>

        {/* Schedule settings */}
        <div className="rounded-xl border bg-card p-5 mb-8">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Utskicksschema
          </h2>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Dag</label>
              <Select
                value={String(settings?.send_day ?? 1)}
                onValueChange={(v) => updateSettings("send_day", parseInt(v))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((name, i) => (
                    <SelectItem key={i} value={String(i)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Tid</label>
              <Select
                value={String(settings?.send_hour ?? 8)}
                onValueChange={(v) => updateSettings("send_hour", parseInt(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>{String(i).padStart(2, "0")}:00</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Drafts list */}
        <h2 className="font-display text-lg font-bold mb-4">Utkast & skickade</h2>
        {drafts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Inga utkast ännu. Klicka "Generera nytt utkast" för att skapa ett.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={draft.status} />
                      <span className="text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(draft.created_at).toLocaleDateString("sv-SE")}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-foreground truncate">{draft.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Schemalagd: {new Date(draft.scheduled_for).toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" })}
                      {draft.sent_at && ` · Skickat: ${new Date(draft.sent_at).toLocaleDateString("sv-SE")}`}
                    </p>
                  </div>
                  {draft.status !== "sent" && (
                    <div className="flex gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingDraft(draft);
                          setEditSubject(draft.subject);
                          setEditContent(draft.content);
                        }}
                      >
                        <FileEdit className="w-4 h-4" />
                      </Button>
                      {draft.status !== "approved" && (
                        <Button size="sm" variant="ghost" className="text-primary" onClick={() => updateDraftStatus(draft.id, "approved")}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {draft.status !== "rejected" && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateDraftStatus(draft.id, "rejected")}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {(draft.status === "approved" || draft.status === "draft") && (
                        <Button
                          size="sm"
                          onClick={() => sendNewsletter(draft.id)}
                          disabled={sending === draft.id}
                        >
                          {sending === draft.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                          Skicka
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Utkast", className: "bg-muted text-muted-foreground" },
    approved: { label: "Godkänt", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
    sent: { label: "Skickat", className: "bg-primary/10 text-primary" },
    rejected: { label: "Avvisat", className: "bg-destructive/10 text-destructive" },
  };
  const c = config[status] || config.draft;
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.className}`}>{c.label}</span>;
};

export default Admin;
