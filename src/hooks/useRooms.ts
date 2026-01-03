import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Room {
  id: string;
  name: string;
  description: string | null;
  type: "study" | "coding" | "fitness" | "startup" | "custom";
  created_by: string | null;
  is_public: boolean;
  max_members: number;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
  is_admin?: boolean;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  is_admin: boolean;
  joined_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    current_streak: number;
    productivity_points: number;
  };
}

export const useRooms = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data: rooms, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Get member counts
      const roomsWithCounts = await Promise.all(
        (rooms || []).map(async (room) => {
          const { count } = await supabase
            .from("room_members")
            .select("*", { count: "exact", head: true })
            .eq("room_id", room.id);
          
          let is_member = false;
          let is_admin = false;
          
          if (user) {
            const { data: membership } = await supabase
              .from("room_members")
              .select("is_admin")
              .eq("room_id", room.id)
              .eq("user_id", user.id)
              .maybeSingle();
            
            is_member = !!membership;
            is_admin = membership?.is_admin || false;
          }
          
          return {
            ...room,
            member_count: count || 0,
            is_member,
            is_admin,
          } as Room;
        })
      );
      
      return roomsWithCounts;
    },
  });
};

export const useUserRooms = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-rooms", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: memberships, error } = await supabase
        .from("room_members")
        .select(`
          is_admin,
          room:rooms (*)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      const rooms = await Promise.all(
        (memberships || []).map(async (membership) => {
          const room = membership.room as unknown as Room;
          
          const { count } = await supabase
            .from("room_members")
            .select("*", { count: "exact", head: true })
            .eq("room_id", room.id);
          
          return {
            ...room,
            member_count: count || 0,
            is_member: true,
            is_admin: membership.is_admin,
          } as Room;
        })
      );
      
      return rooms;
    },
    enabled: !!user?.id,
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("room_members")
        .insert({ room_id: roomId, user_id: user.id });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["user-rooms"] });
    },
  });
};

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (roomId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("room_members")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["user-rooms"] });
    },
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (room: { name: string; description?: string; type: Room["type"] }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("rooms")
        .insert({
          name: room.name,
          description: room.description,
          type: room.type,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-join as admin
      await supabase
        .from("room_members")
        .insert({ room_id: data.id, user_id: user.id, is_admin: true });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["user-rooms"] });
    },
  });
};
