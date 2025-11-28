import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Loader2, Users as UsersIcon, Phone, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface User {
  id: string;
  name: string;
  mobile: string;
  createdAt: string;
  totalBMIRecords: number;
  latestBMI: {
    bmi: number;
    category: string;
    weight: number;
    height: number;
    timestamp: string;
  } | null;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    // Refresh every 60 seconds
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers() as { ok: boolean; users: User[] };
      
      if (response.ok && response.users) {
        setUsers(response.users);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.mobile.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  const totalUsers = users.length;
  const usersWithBMI = users.filter(u => u.totalBMIRecords > 0).length;
  const totalBMIRecords = users.reduce((sum, u) => sum + u.totalBMIRecords, 0);

  const getBMICategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('underweight')) {
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    } else if (categoryLower.includes('normal')) {
      return 'bg-success/10 text-success border-success/20';
    } else if (categoryLower.includes('overweight')) {
      return 'bg-warning/10 text-warning border-warning/20';
    } else if (categoryLower.includes('obese')) {
      return 'bg-danger/10 text-danger border-danger/20';
    }
    return 'bg-muted text-muted-foreground border-border';
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <h1 className="text-3xl font-bold text-foreground">Users</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all registered users and their BMI records
            </p>
          </div>
          <Button variant="outline" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users with BMI Data</p>
                <p className="text-2xl font-bold text-foreground">{usersWithBMI}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total BMI Records</p>
                <p className="text-2xl font-bold text-foreground">{totalBMIRecords}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, mobile, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Button variant="outline" className="w-full sm:w-auto sm:hidden">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Users Table */}
        {filteredUsers.length > 0 ? (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Latest BMI</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Weight / Height</TableHead>
                  <TableHead className="text-right">Total Records</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{user.mobile}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.latestBMI ? (
                        <div>
                          <span className="font-semibold text-foreground">
                            {user.latestBMI.bmi.toFixed(1)}
                          </span>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(user.latestBMI.timestamp)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.latestBMI ? (
                        <Badge className={getBMICategoryColor(user.latestBMI.category)}>
                          {user.latestBMI.category}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.latestBMI ? (
                        <div className="text-sm">
                          <div>{user.latestBMI.weight.toFixed(1)} kg</div>
                          <div className="text-muted-foreground">
                            {user.latestBMI.height.toFixed(0)} cm
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-semibold">
                        {user.totalBMIRecords}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border border-border rounded-lg">
            <UsersIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No users found" : "No users yet"}
            </p>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : "Users will appear here once they register and use the BMI system"}
            </p>
          </div>
        )}

        {/* Results count */}
        {filteredUsers.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {totalUsers} users
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;

