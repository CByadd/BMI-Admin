import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, MessageSquare } from "lucide-react";

interface ScreenLimit {
  screenId: string;
  messageLimit: number | null;
  whatsappLimit?: number | null;
}

interface ScreenInfo {
  screenId: string;
  deviceName?: string;
  location?: string;
}

const MessageLimits = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [totalLimit, setTotalLimit] = useState<number | null>(null);
  const [totalWhatsAppLimit, setTotalWhatsAppLimit] = useState<number | null>(null);
  const [screenLimits, setScreenLimits] = useState<ScreenLimit[]>([]);
  const [screens, setScreens] = useState<ScreenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role === "admin" && user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [meRes, screensRes] = await Promise.all([
        api.getCurrentUser(),
        api.getAdminScreens(user.id),
      ]);
      const me = (meRes as { user?: { totalMessageLimit?: number | null; totalWhatsAppLimit?: number | null } }).user;
      setTotalLimit(me?.totalMessageLimit ?? null);
      setTotalWhatsAppLimit(me?.totalWhatsAppLimit ?? null);
      const screensList = (screensRes as { screens?: ScreenLimit[] }).screens ?? [];
      setScreenLimits(screensList);

      const playersRes = await api.getAllPlayers() as { ok: boolean; players?: any[] };
      if (playersRes.ok && playersRes.players) {
        const assignedIds = (screensRes as { screenIds?: string[] }).screenIds ?? screensList.map((s) => s.screenId);
        setScreens(
          playersRes.players
            .filter((p: any) => assignedIds.includes(p.screenId))
            .map((p: any) => ({
              screenId: p.screenId,
              deviceName: p.deviceName,
              location: p.location,
            }))
        );
      } else {
        setScreens(screensList.map((s) => ({ screenId: s.screenId })));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load message limits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLimitForScreen = (screenId: string) => screenLimits.find((s) => s.screenId === screenId)?.messageLimit ?? null;
  const getWhatsAppLimitForScreen = (screenId: string) => screenLimits.find((s) => s.screenId === screenId)?.whatsappLimit ?? null;

  const setLimitForScreen = (screenId: string, value: number | null) => {
    setScreenLimits((prev) => {
      const rest = prev.filter((s) => s.screenId !== screenId);
      const existing = prev.find((s) => s.screenId === screenId);
      return [...rest, { screenId, messageLimit: value, whatsappLimit: existing?.whatsappLimit ?? null }];
    });
  };

  const setWhatsAppLimitForScreen = (screenId: string, value: number | null) => {
    setScreenLimits((prev) => {
      const rest = prev.filter((s) => s.screenId !== screenId);
      const existing = prev.find((s) => s.screenId === screenId);
      return [...rest, { screenId, messageLimit: existing?.messageLimit ?? null, whatsappLimit: value }];
    });
  };

  const totalAllocated = screenLimits.reduce((sum, s) => sum + (s.messageLimit ?? 0), 0);
  const totalCap = totalLimit ?? 0;
  const totalWhatsAppAllocated = screenLimits.reduce((sum, s) => sum + (s.whatsappLimit ?? 0), 0);
  const totalWhatsAppCap = totalWhatsAppLimit ?? 0;
  const isValid = (totalCap === 0 || totalAllocated <= totalCap) && (totalWhatsAppCap === 0 || totalWhatsAppAllocated <= totalWhatsAppCap);

  const handleSave = async () => {
    if (!user?.id) return;
    if (totalCap > 0 && totalAllocated > totalCap) {
      toast({
        title: "Invalid allocation",
        description: `SMS total allocated (${totalAllocated}) cannot exceed your total SMS limit (${totalCap}).`,
        variant: "destructive",
      });
      return;
    }
    if (totalWhatsAppCap > 0 && totalWhatsAppAllocated > totalWhatsAppCap) {
      toast({
        title: "Invalid allocation",
        description: `WhatsApp total allocated (${totalWhatsAppAllocated}) cannot exceed your total WhatsApp limit (${totalWhatsAppCap}).`,
        variant: "destructive",
      });
      return;
    }
    try {
      setSaving(true);
      const payload = screens.map((screen) => ({
        screenId: screen.screenId,
        messageLimit: getLimitForScreen(screen.screenId),
        whatsappLimit: getWhatsAppLimitForScreen(screen.screenId),
      }));
      await api.setAdminScreenLimits(user.id, payload);
      toast({
        title: "Success",
        description: "SMS and WhatsApp limits updated successfully",
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || error.message || "Failed to save",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (user?.role === "super_admin") {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          Super admins do not have a message limit. Use Admin Management to set limits for admin accounts.
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Message limits
        </h1>
        <p className="text-muted-foreground mt-1">
          Allocate your total message (SMS) limit across your screens. The sum of per-screen limits cannot exceed your total.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className={totalCap === 0 ? "opacity-75" : ""}>
          <CardHeader>
            <CardTitle>Total SMS limit</CardTitle>
            <CardDescription>
              {totalCap === 0
                ? "SMS is disabled for your account. Ask super admin to set a total SMS limit for you."
                : "Set by the super admin. Divide across screens below."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {totalLimit != null && totalLimit > 0 ? totalLimit : "—"}
              {totalLimit != null && totalLimit > 0 && <span className="text-muted-foreground text-base font-normal ml-2">SMS</span>}
            </p>
          </CardContent>
        </Card>
        <Card className={totalWhatsAppCap === 0 ? "opacity-75" : ""}>
          <CardHeader>
            <CardTitle>Total WhatsApp limit</CardTitle>
            <CardDescription>
              {totalWhatsAppCap === 0
                ? "WhatsApp is disabled for your account. Ask super admin to set a total WhatsApp limit for you."
                : "Set by the super admin. Divide across screens below."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {totalWhatsAppLimit != null && totalWhatsAppLimit > 0 ? totalWhatsAppLimit : "—"}
              {totalWhatsAppLimit != null && totalWhatsAppLimit > 0 && <span className="text-muted-foreground text-base font-normal ml-2">WhatsApp</span>}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allocate to screens</CardTitle>
          <CardDescription>
            Set SMS and WhatsApp limits per screen (only for channels enabled for your account). SMS total must not exceed {totalCap}. WhatsApp total must not exceed {totalWhatsAppCap}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {screens.length === 0 ? (
            <p className="text-muted-foreground">You have no assigned screens.</p>
          ) : (
            <div className="space-y-3">
              {screens.map((screen) => (
                <div
                  key={screen.screenId}
                  className="flex items-center gap-4 flex-wrap border-b border-border pb-3 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{screen.deviceName || screen.screenId}</p>
                    {screen.location && (
                      <p className="text-sm text-muted-foreground">{screen.location}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className={`flex items-center gap-2 ${totalCap === 0 ? "opacity-50 pointer-events-none" : ""}`}>
                      <Label className="text-sm whitespace-nowrap">SMS:</Label>
                      <Input
                        type="number"
                        min={0}
                        className="w-24"
                        placeholder="0"
                        value={getLimitForScreen(screen.screenId) ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setLimitForScreen(screen.screenId, v === "" ? null : Math.max(0, parseInt(v, 10) || 0));
                        }}
                        disabled={totalCap === 0}
                      />
                    </div>
                    <div className={`flex items-center gap-2 ${totalWhatsAppCap === 0 ? "opacity-50 pointer-events-none" : ""}`}>
                      <Label className="text-sm whitespace-nowrap">WhatsApp:</Label>
                      <Input
                        type="number"
                        min={0}
                        className="w-24"
                        placeholder="0"
                        value={getWhatsAppLimitForScreen(screen.screenId) ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          setWhatsAppLimitForScreen(screen.screenId, v === "" ? null : Math.max(0, parseInt(v, 10) || 0));
                        }}
                        disabled={totalWhatsAppCap === 0}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {screens.length > 0 && (
            <div className="pt-4 flex items-center justify-between flex-wrap gap-4">
              <p className="text-sm text-muted-foreground">
                SMS: <strong>{totalAllocated}</strong>{totalCap > 0 && <span className={totalAllocated > totalCap ? " text-destructive" : ""}> / {totalCap}</span>}
                {totalCap === 0 && <span className="text-muted-foreground"> (disabled)</span>}
                {" · "}
                WhatsApp: <strong>{totalWhatsAppAllocated}</strong>{totalWhatsAppCap > 0 && <span className={totalWhatsAppAllocated > totalWhatsAppCap ? " text-destructive" : ""}> / {totalWhatsAppCap}</span>}
                {totalWhatsAppCap === 0 && <span className="text-muted-foreground"> (disabled)</span>}
              </p>
              <Button onClick={handleSave} disabled={saving || !isValid}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save allocation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageLimits;
