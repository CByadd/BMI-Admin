import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ScreenCardSkeleton = () => {
  return (
    <Card className="p-6 border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Details */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Flow Type */}
        <div className="space-y-2 pt-2 border-t border-border">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Stats */}
        <div className="flex gap-4 pt-4 border-t border-border">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </Card>
  );
};

export default ScreenCardSkeleton;

