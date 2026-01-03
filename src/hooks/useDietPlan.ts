import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Meal {
  id: string;
  diet_plan_id: string;
  name: string;
  scheduled_time: string | null;
  status: "pending" | "followed" | "partial" | "skipped";
  calories: number | null;
  notes: string | null;
  created_at: string;
}

export interface DietPlan {
  id: string;
  user_id: string;
  date: string;
  created_at: string;
  meals?: Meal[];
}

export const useTodayDietPlan = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["diet-plan", user?.id, today],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data: plan, error } = await supabase
        .from("diet_plans")
        .select("*, meals(*)")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();
      
      if (error) throw error;
      return plan as DietPlan | null;
    },
    enabled: !!user?.id,
  });
};

export const useCreateDietPlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("diet_plans")
        .insert({ user_id: user.id, date: today })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-plan", user?.id, today] });
    },
  });
};

export const useAddMeal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useMutation({
    mutationFn: async (meal: { diet_plan_id: string; name: string; scheduled_time?: string; calories?: number }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("meals")
        .insert(meal)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-plan", user?.id, today] });
    },
  });
};

export const useUpdateMealStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Meal["status"] }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("meals")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diet-plan", user?.id, today] });
    },
  });
};
