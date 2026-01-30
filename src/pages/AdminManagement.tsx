import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, X, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  isActive: boolean;
  totalMessageLimit?: number | null;
  totalWhatsAppLimit?: number | null;
  smsUsedCount?: number;
  whatsappUsedCount?: number;
  assignedScreenIds?: string[];
  screenLimits?: { screenId: string; messageLimit: number | null; whatsappLimit?: number | null }[];
  createdAt: string;
}

interface Screen {
  screenId: string;
  deviceName?: string;
  location?: string;
}

const AdminManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [adminToReset, setAdminToReset] = useState<Admin | null>(null);
  const [resetOptions, setResetOptions] = useState({
    resetSmsUsage: false,
    resetWhatsAppUsage: false,
    resetSmsLimit: false,
    resetWhatsAppLimit: false,
  });
  const [isResetting, setIsResetting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "admin" as "admin" | "super_admin",
    totalMessageLimit: "" as string | number,
    totalWhatsAppLimit: "" as string | number,
    screenIds: [] as string[],
    screenLimits: [] as { screenId: string; messageLimit: number | null; whatsappLimit?: number | null }[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "super_admin") {
      fetchAdmins();
      fetchScreens();
    }
  }, [user]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.getAllAdmins();
      setAdmins(response.admins || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch admins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchScreens = async () => {
    try {
      const response = await api.getAllPlayers() as { ok: boolean; players: any[] };
      if (response.ok && response.players) {
        setScreens(
          response.players.map((p: any) => ({
            screenId: p.screenId,
            deviceName: p.deviceName,
            location: p.location,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch screens:", error);
    }
  };

  const handleOpenDialog = (admin?: Admin) => {
    if (admin) {
      setIsEditMode(true);
      setSelectedAdmin(admin);
      const screenLimits = admin.screenLimits ?? (admin.assignedScreenIds ?? []).map((screenId) => ({ screenId, messageLimit: null as number | null, whatsappLimit: null as number | null }));
      setFormData({
        email: admin.email,
        password: "",
        name: admin.name,
        role: admin.role,
        totalMessageLimit: admin.totalMessageLimit ?? "",
        totalWhatsAppLimit: admin.totalWhatsAppLimit ?? "",
        screenIds: admin.assignedScreenIds || [],
        screenLimits,
      });
    } else {
      setIsEditMode(false);
      setSelectedAdmin(null);
      setFormData({
        email: "",
        password: "",
        name: "",
        role: "admin",
        totalMessageLimit: "",
        totalWhatsAppLimit: "",
        screenIds: [],
        screenLimits: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAdmin(null);
    setFormData({
      email: "",
      password: "",
      name: "",
      role: "admin",
      totalMessageLimit: "",
      totalWhatsAppLimit: "",
      screenIds: [],
      screenLimits: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditMode && selectedAdmin) {
        const updateData: any = {
          name: formData.name,
          role: formData.role,
          screenIds: formData.screenIds,
          screenLimits: formData.screenLimits.filter((s) => formData.screenIds.includes(s.screenId)),
        };
        if (formData.role === "admin" && formData.totalMessageLimit !== "") {
          updateData.totalMessageLimit = typeof formData.totalMessageLimit === "number" ? formData.totalMessageLimit : parseInt(String(formData.totalMessageLimit), 10);
        }
        if (formData.role === "admin" && formData.totalWhatsAppLimit !== "") {
          updateData.totalWhatsAppLimit = typeof formData.totalWhatsAppLimit === "number" ? formData.totalWhatsAppLimit : parseInt(String(formData.totalWhatsAppLimit), 10);
        }
        if (formData.email !== selectedAdmin.email) {
          updateData.email = formData.email;
        }
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.updateAdmin(selectedAdmin.id, updateData);
        toast({
          title: "Success",
          description: "Admin updated successfully",
        });
      } else {
        const registerData: any = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          screenIds: formData.screenIds,
        };
        if (formData.role === "admin" && formData.totalMessageLimit !== "") {
          registerData.totalMessageLimit = typeof formData.totalMessageLimit === "number" ? formData.totalMessageLimit : parseInt(String(formData.totalMessageLimit), 10);
        }
        if (formData.role === "admin" && formData.totalWhatsAppLimit !== "") {
          registerData.totalWhatsAppLimit = typeof formData.totalWhatsAppLimit === "number" ? formData.totalWhatsAppLimit : parseInt(String(formData.totalWhatsAppLimit), 10);
        }
        await api.registerAdmin(registerData);
        toast({
          title: "Success",
          description: "Admin created successfully",
        });
      }
      handleCloseDialog();
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save admin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.name}?`)) {
      return;
    }

    try {
      await api.deleteAdmin(admin.id);
      toast({
        title: "Success",
        description: "Admin deleted successfully",
      });
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete admin",
        variant: "destructive",
      });
    }
  };

  const handleResetUsage = (admin: Admin) => {
    setAdminToReset(admin);
    setResetOptions({
      resetSmsUsage: false,
      resetWhatsAppUsage: false,
      resetSmsLimit: false,
      resetWhatsAppLimit: false,
    });
    setIsResetDialogOpen(true);
  };

  const handleResetSubmit = async () => {
    if (!adminToReset) return;
    if (!resetOptions.resetSmsUsage && !resetOptions.resetWhatsAppUsage && !resetOptions.resetSmsLimit && !resetOptions.resetWhatsAppLimit) {
      toast({
        title: "No selection",
        description: "Please select at least one option to reset",
        variant: "destructive",
      });
      return;
    }
    setIsResetting(true);
    try {
      await api.resetAdminUsage(adminToReset.id, resetOptions);
      toast({
        title: "Success",
        description: "Admin usage and limits reset successfully",
      });
      setIsResetDialogOpen(false);
      setAdminToReset(null);
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const toggleScreen = (screenId: string) => {
    setFormData((prev) => {
      const newScreenIds = prev.screenIds.includes(screenId)
        ? prev.screenIds.filter((id) => id !== screenId)
        : [...prev.screenIds, screenId];
      const existing = prev.screenLimits.find((s) => s.screenId === screenId);
      const newScreenLimits = newScreenIds.includes(screenId)
        ? prev.screenLimits.some((s) => s.screenId === screenId)
          ? prev.screenLimits
          : [...prev.screenLimits.filter((s) => newScreenIds.includes(s.screenId)), { screenId, messageLimit: existing?.messageLimit ?? null, whatsappLimit: existing?.whatsappLimit ?? null }]
        : prev.screenLimits.filter((s) => s.screenId !== screenId);
      return { ...prev, screenIds: newScreenIds, screenLimits: newScreenLimits };
    });
  };

  const setScreenMessageLimit = (screenId: string, value: number | null) => {
    setFormData((prev) => {
      const rest = prev.screenLimits.filter((s) => s.screenId !== screenId);
      const existing = prev.screenLimits.find((s) => s.screenId === screenId);
      return { ...prev, screenLimits: [...rest, { screenId, messageLimit: value, whatsappLimit: existing?.whatsappLimit ?? null }] };
    });
  };

  const setScreenWhatsAppLimit = (screenId: string, value: number | null) => {
    setFormData((prev) => {
      const rest = prev.screenLimits.filter((s) => s.screenId !== screenId);
      const existing = prev.screenLimits.find((s) => s.screenId === screenId);
      return { ...prev, screenLimits: [...rest, { screenId, messageLimit: existing?.messageLimit ?? null, whatsappLimit: value }] };
    });
  };

  const getScreenLimit = (screenId: string) => formData.screenLimits.find((s) => s.screenId === screenId)?.messageLimit ?? null;
  const getScreenWhatsAppLimit = (screenId: string) => formData.screenLimits.find((s) => s.screenId === screenId)?.whatsappLimit ?? null;

  if (user?.role !== "super_admin") {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            Only super admins can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage admin accounts
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Admin
        </Button>
      </div>

      {loading ? (
        <div className="border rounded-lg p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
                <div className="h-12 w-24 bg-muted animate-pulse rounded" />
                <div className="h-12 w-32 bg-muted animate-pulse rounded" />
                <div className="h-12 w-20 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SMS limit</TableHead>
                <TableHead>SMS used</TableHead>
                <TableHead>WhatsApp limit</TableHead>
                <TableHead>WhatsApp used</TableHead>
                <TableHead>Assigned Screens</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {                admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No admins found
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>
                        {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.isActive ? "default" : "destructive"}>
                        {admin.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.role === "super_admin" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : admin.totalMessageLimit != null ? (
                        <div className="flex items-center gap-1">
                          <span>{admin.totalMessageLimit}</span>
                          {admin.smsUsedCount != null && admin.totalMessageLimit != null && admin.smsUsedCount >= admin.totalMessageLimit && (
                            <Badge variant="destructive" className="text-xs">⚠️</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.role === "super_admin" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : admin.totalMessageLimit != null ? (
                        <span className={admin.smsUsedCount != null && admin.totalMessageLimit != null && admin.smsUsedCount >= admin.totalMessageLimit ? "text-destructive font-semibold" : ""}>
                          {admin.smsUsedCount ?? 0}
                          {admin.totalMessageLimit != null && ` / ${admin.totalMessageLimit}`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.role === "super_admin" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : admin.totalWhatsAppLimit != null ? (
                        <div className="flex items-center gap-1">
                          <span>{admin.totalWhatsAppLimit}</span>
                          {admin.whatsappUsedCount != null && admin.totalWhatsAppLimit != null && admin.whatsappUsedCount >= admin.totalWhatsAppLimit && (
                            <Badge variant="destructive" className="text-xs">⚠️</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.role === "super_admin" ? (
                        <span className="text-muted-foreground">—</span>
                      ) : admin.totalWhatsAppLimit != null ? (
                        <span className={admin.whatsappUsedCount != null && admin.totalWhatsAppLimit != null && admin.whatsappUsedCount >= admin.totalWhatsAppLimit ? "text-destructive font-semibold" : ""}>
                          {admin.whatsappUsedCount ?? 0}
                          {admin.totalWhatsAppLimit != null && ` / ${admin.totalWhatsAppLimit}`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.role === "super_admin" ? (
                        <span className="text-muted-foreground">All screens</span>
                      ) : (
                        <span>{admin.assignedScreenIds?.length || 0} screen(s)</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {admin.id !== user?.id && admin.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetUsage(admin)}
                            title="Reset usage and limits"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {admin.id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(admin)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Admin" : "Create Admin"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update admin details and screen assignments"
                : "Create a new admin account and assign screens"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {isEditMode ? "(leave blank to keep current)" : "*"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!isEditMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "admin" | "super_admin",
                    })
                  }
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              {formData.role === "admin" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="totalMessageLimit">Total SMS message limit</Label>
                    <Input
                      id="totalMessageLimit"
                      type="number"
                      min={0}
                      placeholder="e.g. 1000"
                      value={formData.totalMessageLimit === "" ? "" : formData.totalMessageLimit}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormData({ ...formData, totalMessageLimit: v === "" ? "" : (parseInt(v, 10) >= 0 ? parseInt(v, 10) : formData.totalMessageLimit) });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Total SMS limit for this admin. The admin can later divide this across their screens.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalWhatsAppLimit">Total WhatsApp message limit</Label>
                    <Input
                      id="totalWhatsAppLimit"
                      type="number"
                      min={0}
                      placeholder="e.g. 500"
                      value={formData.totalWhatsAppLimit === "" ? "" : formData.totalWhatsAppLimit}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormData({ ...formData, totalWhatsAppLimit: v === "" ? "" : (parseInt(v, 10) >= 0 ? parseInt(v, 10) : formData.totalWhatsAppLimit) });
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Total WhatsApp limit for this admin. The admin can later divide this across their screens.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Screens</Label>
                    <ScrollArea className="h-64 border rounded-md p-4">
                      <div className="space-y-2">
                        {screens.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No screens available
                          </p>
                        ) : (
                          screens.map((screen) => (
                            <div
                              key={screen.screenId}
                              className="flex items-center gap-2 flex-wrap"
                            >
                              <Checkbox
                                id={screen.screenId}
                                checked={formData.screenIds.includes(screen.screenId)}
                                onCheckedChange={() => toggleScreen(screen.screenId)}
                              />
                              <Label
                                htmlFor={screen.screenId}
                                className="text-sm font-normal cursor-pointer flex-1 min-w-0"
                              >
                                {screen.deviceName || screen.screenId}
                                {screen.location && (
                                  <span className="text-muted-foreground ml-2">
                                    ({screen.location})
                                  </span>
                                )}
                              </Label>
                              {formData.screenIds.includes(screen.screenId) && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-1">
                                    <Label className="text-xs text-muted-foreground whitespace-nowrap">SMS:</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="w-20 h-8"
                                      placeholder="—"
                                      value={getScreenLimit(screen.screenId) ?? ""}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setScreenMessageLimit(screen.screenId, v === "" ? null : Math.max(0, parseInt(v, 10) || 0));
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Label className="text-xs text-muted-foreground whitespace-nowrap">WhatsApp:</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      className="w-20 h-8"
                                      placeholder="—"
                                      value={getScreenWhatsAppLimit(screen.screenId) ?? ""}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setScreenWhatsAppLimit(screen.screenId, v === "" ? null : Math.max(0, parseInt(v, 10) || 0));
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    {formData.role === "admin" && formData.screenIds.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional: set SMS and WhatsApp limits per screen here. The admin can change these later.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Usage & Limits</DialogTitle>
            <DialogDescription>
              Reset usage counts and/or limits for {adminToReset?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resetSmsUsage"
                  checked={resetOptions.resetSmsUsage}
                  onCheckedChange={(checked) =>
                    setResetOptions({ ...resetOptions, resetSmsUsage: checked === true })
                  }
                />
                <Label htmlFor="resetSmsUsage" className="cursor-pointer">
                  Reset SMS usage count (set to 0)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resetWhatsAppUsage"
                  checked={resetOptions.resetWhatsAppUsage}
                  onCheckedChange={(checked) =>
                    setResetOptions({ ...resetOptions, resetWhatsAppUsage: checked === true })
                  }
                />
                <Label htmlFor="resetWhatsAppUsage" className="cursor-pointer">
                  Reset WhatsApp usage count (set to 0)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resetSmsLimit"
                  checked={resetOptions.resetSmsLimit}
                  onCheckedChange={(checked) =>
                    setResetOptions({ ...resetOptions, resetSmsLimit: checked === true })
                  }
                />
                <Label htmlFor="resetSmsLimit" className="cursor-pointer">
                  Clear SMS limit (set to null)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resetWhatsAppLimit"
                  checked={resetOptions.resetWhatsAppLimit}
                  onCheckedChange={(checked) =>
                    setResetOptions({ ...resetOptions, resetWhatsAppLimit: checked === true })
                  }
                />
                <Label htmlFor="resetWhatsAppLimit" className="cursor-pointer">
                  Clear WhatsApp limit (set to null)
                </Label>
              </div>
            </div>
            {adminToReset && (
              <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
                <p>
                  Current: SMS {adminToReset.smsUsedCount ?? 0}
                  {adminToReset.totalMessageLimit != null && ` / ${adminToReset.totalMessageLimit}`}
                  {adminToReset.totalMessageLimit != null && adminToReset.smsUsedCount != null && adminToReset.smsUsedCount >= adminToReset.totalMessageLimit && (
                    <span className="text-destructive ml-2">⚠️ Limit reached</span>
                  )}
                </p>
                <p>
                  Current: WhatsApp {adminToReset.whatsappUsedCount ?? 0}
                  {adminToReset.totalWhatsAppLimit != null && ` / ${adminToReset.totalWhatsAppLimit}`}
                  {adminToReset.totalWhatsAppLimit != null && adminToReset.whatsappUsedCount != null && adminToReset.whatsappUsedCount >= adminToReset.totalWhatsAppLimit && (
                    <span className="text-destructive ml-2">⚠️ Limit reached</span>
                  )}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResetDialogOpen(false);
                setAdminToReset(null);
              }}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button onClick={handleResetSubmit} disabled={isResetting}>
              {isResetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;













