import { Brain, Activity, FileText, Settings, User, Home, BarChart3, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useScans, useCurrentScan } from "@/hooks/use-scan-data";

interface MedicalSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onScanSelect?: (scanId: string) => void;
}

export default function MedicalSidebar({ currentView, onViewChange, onScanSelect }: MedicalSidebarProps) {
  const { data: scans } = useScans();
  const { scanId: currentScanId } = useCurrentScan();
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "scans", label: "MRI Scans", icon: Brain },
    { id: "analysis", label: "Analysis", icon: Activity },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "metrics", label: "Metrics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="medical-sidebar w-80 h-full flex flex-col border-r border-border">
      {/* Header with NeuroScan branding */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">NeuroScan</h1>
            <p className="text-sm text-muted-foreground">MRI Analysis Platform</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          v2.1.4 | Research Mode
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 p-4 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Navigation
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`medical-nav-item w-full justify-start h-10 ${
                isActive ? "active" : ""
              }`}
              onClick={() => onViewChange(item.id)}
              data-testid={`nav-${item.id}`}
            >
              <Icon className="w-4 h-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <Separator className="mx-4" />

      {/* Recent Scans */}
      <div className="flex-1 p-4 space-y-2 max-h-80 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Scans
        </div>
        {scans && scans.length > 0 ? (
          <div className="space-y-2">
            {[...scans]
              .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
              .slice(0, 8)
              .map((scan) => {
                const isSelected = scan.id === currentScanId;
                const uploadDate = new Date(scan.uploadedAt);
                const timeAgo = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60)); // minutes
                const timeDisplay = timeAgo < 60 ? 
                  `${timeAgo}m ago` : 
                  timeAgo < 1440 ? `${Math.floor(timeAgo / 60)}h ago` : 
                  `${Math.floor(timeAgo / 1440)}d ago`;

                const getStatusInfo = (status: string) => {
                  switch (status) {
                    case 'pending':
                      return { color: 'bg-yellow-500', icon: Clock };
                    case 'processing':
                      return { color: 'bg-blue-500', icon: Activity };
                    case 'completed':
                      return { color: 'bg-green-500', icon: CheckCircle };
                    case 'failed':
                      return { color: 'bg-red-500', icon: AlertCircle };
                    default:
                      return { color: 'bg-gray-500', icon: Clock };
                  }
                };

                const statusInfo = getStatusInfo(scan.processingStatus);
                const StatusIcon = statusInfo.icon;

                return (
                  <Button
                    key={scan.id}
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start h-auto p-3 ${
                      isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => {
                      if (onScanSelect) {
                        onScanSelect(scan.id);
                      }
                      // Switch to analysis view when selecting a scan
                      if (currentView !== "analysis") {
                        onViewChange("analysis");
                      }
                    }}
                    data-testid={`scan-history-${scan.id}`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className={`w-2 h-2 rounded-full ${statusInfo.color} flex-shrink-0`}></div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-medium text-xs truncate">
                          {scan.originalName || scan.filename}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          <span>{scan.processingStatus}</span>
                          <span>•</span>
                          <span>{timeDisplay}</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic text-center py-4">
            No scans available
          </div>
        )}
      </div>

      <Separator className="mx-4" />

      {/* System Status */}
      <div className="p-4">
        <Card className="medical-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Storage</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-medical-success"></div>
                <span className="text-xs text-foreground">Online</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Analysis Engine</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-medical-success"></div>
                <span className="text-xs text-foreground">Active</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">3D Renderer</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span className="text-xs text-foreground">Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Actions
        </div>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start h-8 text-xs"
            data-testid="quick-upload"
          >
            <FileText className="w-3 h-3 mr-2" />
            Upload New Scan
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start h-8 text-xs"
            data-testid="quick-report"
          >
            <BarChart3 className="w-3 h-3 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground truncate">
              Dr. Research
            </div>
            <div className="text-xs text-muted-foreground">
              Neurologist
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}