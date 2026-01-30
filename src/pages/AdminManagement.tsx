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
import { Plus, Edit, Trash2, Loader2, X } from "lucide-react";
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
  assignedScreenIds?: string[];
  screenLimits?: { screenId: string; messageLimit: number | null }[];
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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "admin" as "admin" | "super_admin",
    totalMessageLimit: "" as string | number,
    screenIds: [] as string[],
    screenLimits: [] as { screenId: string; messageLimit: number | null }[],
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
      const screenLimits = admin.screenLimits ?? (admin.assignedScreenIds ?? []).map((screenId) => ({ screenId, messageLimit: null as number | null }));
      setFormData({
        email: admin.email,
        password: "",
        name: admin.name,
        role: admin.role,
        totalMessageLimit: admin.totalMessageLimit ?? "",
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

  const toggleScreen = (screenId: string) => {
    setFormData((prev) => {
      const newScreenIds = prev.screenIds.includes(screenId)
        ? prev.screenIds.filter((id) => id !== screenId)
        : [...prev.screenIds, screenId];
      const existingLimit = prev.screenLimits.find((s) => s.screenId === screenId)?.messageLimit ?? null;
      const newScreenLimits = newScreenIds.includes(screenId)
        ? prev.screenLimits.some((s) => s.screenId === screenId)
          ? prev.screenLimits
          : [...prev.screenLimits.filter((s) => newScreenIds.includes(s.screenId)), { screenId, messageLimit: existingLimit }]
        : prev.screenLimits.filter((s) => s.screenId !== screenId);
      return { ...prev, screenIds: newScreenIds, screenLimits: newScreenLimits };
    });
  };

  const setScreenMessageLimit = (screenId: string, value: number | null) => {
    setFormData((prev) => {
      const rest = prev.screenLimits.filter((s) => s.screenId !== screenId);
      return { ...prev, screenLimits: [...rest, { screenId, messageLimit: value }] };
    });
  };

  const getScreenLimit = (screenId: string) => formData.screenLimits.find((s) => s.screenId === screenId)?.messageLimit ?? null;

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
                <TableHead>Total message limit</TableHead>
                <TableHead>Assigned Screens</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {                admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
                        <span>{admin.totalMessageLimit}</span>
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
                    <Label htmlFor="totalMessageLimit">Total message limit</Label>
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
                      Total SMS/message limit for this admin. The admin can later divide this across their screens.
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
                                <div className="flex items-center gap-1">
                                  <Label className="text-xs text-muted-foreground whitespace-nowrap">Limit:</Label>
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
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    {formData.role === "admin" && formData.screenIds.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Optional: set message limit per screen here. The admin can change these later.
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
    </div>
  );
};

export default AdminManagement;













