import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users as UsersIcon, Loader2, Activity, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import * as XLSX from "xlsx";

interface User {
  id: string;
  name: string;
  mobile: string;
  createdAt: string;
  totalBMIRecords?: number;
  latestBMI?: {
    bmi: number;
    category: string;
    timestamp: string;
    screenId: string;
  } | null;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers() as { ok: boolean; users: User[]; total: number };
      if (response.ok && response.users) {
        setUsers(response.users);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load users",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobile.includes(searchQuery)
  );

  const getBMICategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'underweight':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'normal':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'overweight':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'obese':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const exportToExcel = () => {
    try {
      setExporting(true);

      // Prepare data for export
      const exportData = filteredUsers.map((user, index) => ({
        '#': index + 1,
        'Name': user.name,
        'Mobile': user.mobile,
        'Joined Date': new Date(user.createdAt).toLocaleDateString(),
        'BMI Records': user.totalBMIRecords || 0,
        'Latest BMI': user.latestBMI ? user.latestBMI.bmi.toFixed(1) : '-',
        'BMI Category': user.latestBMI ? user.latestBMI.category : '-',
        'Screen ID': user.latestBMI ? user.latestBMI.screenId : '-',
        'Last Updated': user.latestBMI ? new Date(user.latestBMI.timestamp).toLocaleDateString() : '-',
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 },   // #
        { wch: 20 },  // Name
        { wch: 15 },  // Mobile
        { wch: 15 },  // Joined Date
        { wch: 12 },  // BMI Records
        { wch: 12 },  // Latest BMI
        { wch: 15 },  // BMI Category
        { wch: 20 },  // Screen ID
        { wch: 15 },  // Last Updated
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Users');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `users_export_${date}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);

      toast({
        title: "Export successful",
        description: `Exported ${exportData.length} users to ${filename}`,
      });
    } catch (error: any) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export users data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-card rounded-lg border border-border">
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="border rounded-lg p-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
                  <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
                  <div className="h-12 flex-1 bg-muted animate-pulse rounded" />
                  <div className="h-12 w-24 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and view all registered users
            </p>
          </div>
          <Button
            onClick={exportToExcel}
            disabled={exporting || filteredUsers.length === 0}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export to Excel</span>
                <span className="sm:hidden">Export</span>
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {users.reduce((sum, u) => sum + (u.totalBMIRecords || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total BMI Records</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {filteredUsers.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchQuery ? "Filtered Results" : "All Users"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          {filteredUsers.length === 0 ? (
            <div className="p-12">
              <div className="text-center">
                <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No users found matching your search" : "No users found"}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs sm:text-sm min-w-[750px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px] px-2 py-2">#</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Name</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap">Mobile</TableHead>
                    <TableHead className="px-2 py-2 whitespace-nowrap hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="px-2 py-2 text-center whitespace-nowrap hidden sm:table-cell">BMI Records</TableHead>
                    <TableHead className="px-2 py-2 text-center whitespace-nowrap">BMI</TableHead>
                    <TableHead className="px-2 py-2 text-center whitespace-nowrap">Category</TableHead>
                    <TableHead className="px-2 py-2 text-center whitespace-nowrap hidden md:table-cell">Screen ID</TableHead>
                    <TableHead className="px-2 py-2 text-center whitespace-nowrap hidden xl:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="px-2 py-2 font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-2 py-2">
                        <div className="font-semibold text-foreground whitespace-nowrap">{user.name}</div>
                      </TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap text-muted-foreground">
                        {user.mobile}
                      </TableCell>
                      <TableCell className="px-2 py-2 whitespace-nowrap text-muted-foreground hidden lg:table-cell">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-center hidden sm:table-cell">
                        {user.totalBMIRecords !== undefined ? (
                          <Badge variant="secondary" className="font-semibold text-xs px-1.5 py-0.5">
                            {user.totalBMIRecords}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-center">
                        {user.latestBMI ? (
                          <Badge variant="outline" className="font-semibold text-xs px-1.5 py-0.5">
                            {user.latestBMI.bmi.toFixed(1)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-center">
                        {user.latestBMI ? (
                          <Badge
                            variant="outline"
                            className={`font-semibold text-xs px-1.5 py-0.5 ${getBMICategoryColor(user.latestBMI.category)}`}
                          >
                            {user.latestBMI.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-center hidden md:table-cell">
                        {user.latestBMI ? (
                          <Badge variant="outline" className="font-mono text-xs px-1.5 py-0.5">
                            {user.latestBMI.screenId}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-2 py-2 text-center whitespace-nowrap text-muted-foreground hidden xl:table-cell">
                        {user.latestBMI ? (
                          new Date(user.latestBMI.timestamp).toLocaleDateString()
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Users;
