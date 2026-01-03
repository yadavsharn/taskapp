import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TimeLog {
  id: string;
  user_id: string;
  date: string;
  screen_time_hours: number;
  focus_time_hours: number;
  entertainment_hours: number;
  sleep_hours: number;
  unproductive_hours: number;
  social_media_hours: number;
  created_at: string;
  updated_at: string;
}

export const useTodayTimeLog = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["time-log", user?.id, today],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("time_logs")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();
      
      if (error) throw error;
      return data as TimeLog | null;
    },
    enabled: !!user?.id,
  });
};

export const useUpsertTimeLog = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useMutation({
    mutationFn: async (timeLog: Partial<Omit<TimeLog, "id" | "user_id" | "date" | "created_at" | "updated_at">>) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("time_logs")
        .upsert({
          user_id: user.id,
          date: today,
          ...timeLog,
        }, { onConflict: "user_id,date" })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-log", user?.id, today] });
    },
  });
};
