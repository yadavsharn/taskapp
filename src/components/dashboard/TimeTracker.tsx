import { useState, useEffect } from "react";
import { Clock, Smartphone, BookOpen, Gamepad2, Moon, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTodayTimeLog, useUpsertTimeLog } from "@/hooks/useTimeLog";
import { useToast } from "@/hooks/use-toast";

interface TimeEntry {
  id: string;
  label: string;
  icon: React.ElementType;
  key: keyof typeof defaultValues;
  color: string;
}

const defaultValues = {
  screen_time_hours: 0,
  focus_time_hours: 0,
  entertainment_hours: 0,
  sleep_hours: 0,
  unproductive_hours: 0,
};

const TimeTracker = () => {
  const { data: timeLog, isLoading } = useTodayTimeLog();
  const upsertTimeLog = useUpsertTimeLog();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [localValues, setLocalValues] = useState(defaultValues);

  useEffect(() => {
    if (timeLog) {
      setLocalValues({
        screen_time_hours: Number(timeLog.screen_time_hours) || 0,
        focus_time_hours: Number(timeLog.focus_time_hours) || 0,
        entertainment_hours: Number(timeLog.entertainment_hours) || 0,
        sleep_hours: Number(timeLog.sleep_hours) || 0,
        unproductive_hours: Number(timeLog.unproductive_hours) || 0,
      });
    }
  }, [timeLog]);

  const entries: TimeEntry[] = [
    { id: "screen", label: "Screen Time", icon: Smartphone, key: "screen_time_hours", color: "text-warning" },
    { id: "focus", label: "Focus Work", icon: BookOpen, key: "focus_time_hours", color: "text-success" },
    { id: "play", label: "Entertainment", icon: Gamepad2, key: "entertainment_hours", color: "text-chart-4" },
    { id: "sleep", label: "Sleep", icon: Moon, key: "sleep_hours", color: "text-primary" },
    { id: "waste", label: "Unproductive", icon: AlertCircle, key: "unproductive_hours", color: "text-destructive" },
  ];

  const totalHours = Object.values(localValues).reduce((sum, val) => sum + val, 0);
  const focusPercentage = totalHours > 0 
    ? Math.round((localValues.focus_time_hours / totalHours) * 100) 
    : 0;

  const updateHours = (key: keyof typeof defaultValues, hours: number) => {
    setLocalValues(prev => ({
      ...prev,
      [key]: Math.max(0, hours)
    }));
  };

  const handleSave = async () => {
    try {
      await upsertTimeLog.mutateAsync(localValues);
      setIsEditing(false);
      toast({
        title: "Time log saved",
        description: "Your daily time has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save time log",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-warning/10">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-card-foreground">Time Transparency</h3>
            <p className="text-sm text-muted-foreground">How you spent today</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={upsertTimeLog.isPending}
        >
          {upsertTimeLog.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            isEditing ? "Save" : "Edit"
          )}
        </Button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50 mb-6">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Focus Ratio</p>
          <p className="text-2xl font-display font-bold text-card-foreground">{focusPercentage}%</p>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Total Logged</p>
          <p className="text-2xl font-display font-bold text-card-foreground">{totalHours.toFixed(1)}h</p>
        </div>
      </div>

      {/* Time Entries */}
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30"
          >
            <entry.icon className={`w-5 h-5 ${entry.color}`} />
            <span className="flex-1 text-sm font-medium text-card-foreground">{entry.label}</span>
            {isEditing ? (
              <Input
                type="number"
                step="0.5"
                value={localValues[entry.key]}
                onChange={(e) => updateHours(entry.key, parseFloat(e.target.value) || 0)}
                className="w-20 h-8 text-right"
              />
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{localValues[entry.key]}h</span>
            )}
          </div>
        ))}
      </div>

      {/* Logged Status */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          {timeLog ? "⚡ Logged today • Visible to room peers" : "📝 Not yet logged today"}
        </p>
      </div>
    </div>
  );
};

export default TimeTracker;
