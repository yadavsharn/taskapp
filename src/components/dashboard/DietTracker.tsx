import { useState } from "react";
import { Utensils, Check, X, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTodayDietPlan, useCreateDietPlan, useAddMeal, useUpdateMealStatus, Meal } from "@/hooks/useDietPlan";
import { useToast } from "@/hooks/use-toast";

const DietTracker = () => {
  const { data: dietPlan, isLoading } = useTodayDietPlan();
  const createDietPlan = useCreateDietPlan();
  const addMeal = useAddMeal();
  const updateMealStatus = useUpdateMealStatus();
  const { toast } = useToast();
  const [newMeal, setNewMeal] = useState("");
  const [showAddMeal, setShowAddMeal] = useState(false);

  const meals = dietPlan?.meals || [];

  const handleCreatePlan = async () => {
    try {
      await createDietPlan.mutateAsync();
      toast({
        title: "Diet plan created",
        description: "Add your meals for today!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create diet plan",
        variant: "destructive",
      });
    }
  };

  const handleAddMeal = async () => {
    if (newMeal.trim() && dietPlan) {
      try {
        await addMeal.mutateAsync({ 
          diet_plan_id: dietPlan.id, 
          name: newMeal.trim() 
        });
        setNewMeal("");
        setShowAddMeal(false);
        toast({
          title: "Meal added",
          description: "Track your adherence at the end of the day.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add meal",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: Meal["status"]) => {
    try {
      await updateMealStatus.mutateAsync({ id, status });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update meal status",
        variant: "destructive",
      });
    }
  };

  const getStatusStyles = (status: Meal["status"]) => {
    switch (status) {
      case "followed":
        return { bg: "bg-success/10 border-success/30", icon: Check, iconColor: "text-success" };
      case "partial":
        return { bg: "bg-warning/10 border-warning/30", icon: Minus, iconColor: "text-warning" };
      case "skipped":
        return { bg: "bg-destructive/10 border-destructive/30", icon: X, iconColor: "text-destructive" };
      default:
        return { bg: "bg-secondary/50 border-transparent", icon: null, iconColor: "" };
    }
  };

  const followedCount = meals.filter(m => m.status === "followed").length;
  const partialCount = meals.filter(m => m.status === "partial").length;
  const adherencePercent = meals.length > 0 
    ? Math.round(((followedCount * 1) + (partialCount * 0.5)) / meals.length * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-success/10">
            <Utensils className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-card-foreground">Diet Plan</h3>
            <p className="text-sm text-muted-foreground">Track your meal adherence</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No diet plan for today yet.</p>
          <Button onClick={handleCreatePlan} disabled={createDietPlan.isPending}>
            {createDietPlan.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create Today's Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-success/10">
            <Utensils className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-card-foreground">Diet Plan</h3>
            <p className="text-sm text-muted-foreground">Today's meal adherence</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-display font-bold text-success">{adherencePercent}%</p>
          <p className="text-xs text-muted-foreground">Adherence</p>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3 max-h-[200px] overflow-y-auto">
        {meals.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No meals added yet.
          </p>
        ) : (
          meals.map((meal) => {
            const styles = getStatusStyles(meal.status);
            const StatusIcon = styles.icon;
            
            return (
              <div
                key={meal.id}
                className={`p-3 rounded-xl border ${styles.bg} transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {StatusIcon && <StatusIcon className={`w-4 h-4 ${styles.iconColor}`} />}
                    <span className="text-sm font-medium text-card-foreground">{meal.name}</span>
                  </div>
                  {meal.scheduled_time && (
                    <span className="text-xs text-muted-foreground">{meal.scheduled_time}</span>
                  )}
                </div>
                
                {meal.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 h-7 text-xs border-success/30 hover:bg-success/10 hover:text-success"
                      onClick={() => handleUpdateStatus(meal.id, "followed")}
                    >
                      <Check className="w-3 h-3 mr-1" /> Followed
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 h-7 text-xs border-warning/30 hover:bg-warning/10 hover:text-warning"
                      onClick={() => handleUpdateStatus(meal.id, "partial")}
                    >
                      <Minus className="w-3 h-3 mr-1" /> Partial
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 h-7 text-xs border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleUpdateStatus(meal.id, "skipped")}
                    >
                      <X className="w-3 h-3 mr-1" /> Skipped
                    </Button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Meal */}
      {showAddMeal ? (
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Meal name..."
            value={newMeal}
            onChange={(e) => setNewMeal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMeal()}
            className="flex-1"
          />
          <Button onClick={handleAddMeal} size="icon" disabled={addMeal.isPending}>
            {addMeal.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full mt-4" 
          onClick={() => setShowAddMeal(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Meal
        </Button>
      )}
    </div>
  );
};

export default DietTracker;
