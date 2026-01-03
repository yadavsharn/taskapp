import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Commitment {
  id: string;
  user_id: string;
  room_id: string | null;
  title: string;
  description: string | null;
  deadline: string | null;
  status: "pending" | "completed" | "incomplete";
  date: string;
  created_at: string;
  completed_at: string | null;
}

export const useTodayCommitments = () => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["commitments", user?.id, today],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("daily_commitments")
        .select("*")
        .eq("user_id", user.id)
        .eq("date", today)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as Commitment[];
    },
    enabled: !!user?.id,
  });
};

export const useAddCommitment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useMutation({
    mutationFn: async (commitment: { title: string; deadline?: string; room_id?: string }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("daily_commitments")
        .insert({
          user_id: user.id,
          title: commitment.title,
          deadline: commitment.deadline,
          room_id: commitment.room_id,
          date: today,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commitments", user?.id, today] });
    },
  });
};

export const useUpdateCommitment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Commitment["status"] }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const updates: Partial<Commitment> = { status };
      if (status === "completed") {
        updates.completed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from("daily_commitments")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commitments", user?.id, today] });
    },
  });
};

export const useDeleteCommitment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("daily_commitments")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commitments", user?.id, today] });
    },
  });
};
