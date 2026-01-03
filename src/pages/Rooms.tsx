import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Users, 
  BookOpen, 
  Code, 
  Dumbbell, 
  Rocket, 
  Crown,
  TrendingUp,
  Filter,
  Loader2
} from "lucide-react";
import { useRooms, useJoinRoom, useLeaveRoom, Room } from "@/hooks/useRooms";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, React.ElementType> = {
  study: BookOpen,
  coding: Code,
  fitness: Dumbbell,
  startup: Rocket,
  custom: Users,
};

const Rooms = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const { data: rooms = [], isLoading } = useRooms();
  const joinRoom = useJoinRoom();
  const leaveRoom = useLeaveRoom();
  const { user } = useAuth();
  const { toast } = useToast();

  const filters = [
    { id: "all", label: "All Rooms" },
    { id: "study", label: "Study" },
    { id: "coding", label: "Coding" },
    { id: "fitness", label: "Fitness" },
    { id: "startup", label: "Startup" },
  ];

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesFilter = activeFilter === "all" || room.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleJoin = async (roomId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to join rooms.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await joinRoom.mutateAsync(roomId);
      toast({
        title: "Room joined!",
        description: "You're now part of this accountability room.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join room. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeave = async (roomId: string) => {
    try {
      await leaveRoom.mutateAsync(roomId);
      toast({
        title: "Left room",
        description: "You've left this room.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave room. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Accountability <span className="text-gradient">Rooms</span>
              </h1>
              <p className="text-muted-foreground">
                Find your tribe. Join rooms that match your goals.
              </p>
            </div>
            <Button variant="hero" disabled>
              <Plus className="w-4 h-4 mr-2" />
              Create Room (Coming Soon)
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="flex-shrink-0"
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No rooms found matching your criteria.</p>
            </div>
          ) : (
            /* Rooms Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => {
                const RoomIcon = iconMap[room.type] || Users;
                
                return (
                  <div
                    key={room.id}
                    className="p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Room Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                          <RoomIcon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-lg text-card-foreground">{room.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{room.type} Room</p>
                        </div>
                      </div>
                      {room.is_member && (
                        <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                          Joined
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {room.description || "No description available."}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-secondary/30">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-card-foreground">{room.member_count}</span>
                      </div>
                      {room.is_admin && (
                        <div className="flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-warning" />
                          <span className="text-sm text-card-foreground">Admin</span>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    {room.is_member ? (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          View Room
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleLeave(room.id)}
                          disabled={leaveRoom.isPending}
                        >
                          Leave
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => handleJoin(room.id)}
                        disabled={joinRoom.isPending || !user}
                      >
                        {joinRoom.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Join Room"
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Rooms;
