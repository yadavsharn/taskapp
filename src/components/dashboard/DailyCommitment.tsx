import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Plus, Clock, Target, Loader2 } from "lucide-react";
import { useTodayCommitments, useAddCommitment, useUpdateCommitment, Commitment } from "@/hooks/useCommitments";
import { useToast } from "@/hooks/use-toast";

const DailyCommitment = () => {
  const { data: commitments = [], isLoading } = useTodayCommitments();
  const addCommitment = useAddCommitment();
  const updateCommitment = useUpdateCommitment();
  const [newTask, setNewTask] = useState("");
  const { toast } = useToast();

  const toggleTask = async (id: string, currentStatus: Commitment["status"]) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      await updateCommitment.mutateAsync({ id, status: newStatus });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update commitment",
        variant: "destructive",
      });
    }
  };

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        await addCommitment.mutateAsync({ title: newTask.trim() });
        setNewTask("");
        toast({
          title: "Commitment added",
          description: "Stay focused and complete it!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add commitment",
          variant: "destructive",
        });
      }
    }
  };

  const completedCount = commitments.filter(t => t.status === "completed").length;
  const completionRate = commitments.length > 0 
    ? Math.round((completedCount / commitments.length) * 100) 
    : 0;

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
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-card-foreground">Today's Commitments</h3>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {commitments.length} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-primary">{completionRate}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 rounded-full bg-secondary mb-6 overflow-hidden">
        <div 
          className="h-full gradient-primary transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      {/* Tasks */}
      <div className="space-y-3 mb-6 max-h-[280px] overflow-y-auto">
        {commitments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No commitments yet. Add your first one below!
          </p>
        ) : (
          commitments.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                task.status === "completed" 
                  ? "bg-success/5 border border-success/20" 
                  : "bg-secondary/50 border border-transparent hover:border-border"
              }`}
              onClick={() => toggleTask(task.id, task.status)}
            >
              {task.status === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={`flex-1 text-sm ${
                task.status === "completed" 
                  ? "text-muted-foreground line-through" 
                  : "text-card-foreground"
              }`}>
                {task.title}
              </span>
              {task.deadline && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {task.deadline}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Task */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a new commitment..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          className="flex-1"
        />
        <Button 
          onClick={addTask} 
          size="icon" 
          variant="default"
          disabled={addCommitment.isPending}
        >
          {addCommitment.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default DailyCommitment;
