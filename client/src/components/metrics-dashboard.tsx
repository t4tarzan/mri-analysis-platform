import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Target, Eye, Clock } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  progress: number;
  description: string;
  icon: React.ReactNode;
  color: "accent" | "primary" | "secondary" | "muted";
  testId: string;
}

function MetricCard({ title, value, progress, description, icon, color, testId }: MetricCardProps) {
  const colorClasses = {
    accent: "bg-accent/5 border-accent/20 text-accent",
    primary: "bg-primary/5 border-primary/20 text-primary", 
    secondary: "bg-secondary/5 border-secondary/20 text-secondary",
    muted: "bg-muted/50 border-border text-foreground"
  };

  const progressColors = {
    accent: "bg-accent",
    primary: "bg-primary",
    secondary: "bg-secondary", 
    muted: "bg-muted-foreground"
  };

  return (
    <Card className={colorClasses[color]} data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {icon}
        </div>
        <div className="space-y-2">
          <p className={`text-3xl font-bold ${color !== "muted" ? `text-${color}` : "text-foreground"}`}>
            {value}
          </p>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`${progressColors[color]} h-2 rounded-full transition-all duration-300`} 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetricsDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Risk Score"
        value="7.8"
        progress={78}
        description="High priority attention required"
        icon={<AlertTriangle className="h-5 w-5 text-accent" />}
        color="accent"
        testId="metric-risk-score"
      />
      
      <MetricCard
        title="Detection Accuracy" 
        value="94%"
        progress={94}
        description="Machine learning confidence"
        icon={<Target className="h-5 w-5 text-primary" />}
        color="primary"
        testId="metric-detection-accuracy"
      />
      
      <MetricCard
        title="Image Quality"
        value="8.9"
        progress={89}
        description="Resolution and clarity score" 
        icon={<Eye className="h-5 w-5 text-secondary" />}
        color="secondary"
        testId="metric-image-quality"
      />
      
      <MetricCard
        title="Processing Time"
        value="2.4s"
        progress={45}
        description="Total analysis duration"
        icon={<Clock className="h-5 w-5 text-muted-foreground" />}
        color="muted"
        testId="metric-processing-time"
      />
    </div>
  );
}
