import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import StatsCard from "@/components/dashboard/StatsCard";
import DailyCommitment from "@/components/dashboard/DailyCommitment";
import TimeTracker from "@/components/dashboard/TimeTracker";
import DietTracker from "@/components/dashboard/DietTracker";
import ConsistencyScore from "@/components/dashboard/ConsistencyScore";
import RoomCard from "@/components/dashboard/RoomCard";
import { Flame, Trophy, Star, Users, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUserRooms } from "@/hooks/useRooms";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userRooms = [], isLoading: roomsLoading } = useUserRooms();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = profile?.display_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Good morning, <span className="text-gradient">{displayName}</span> 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to crush another day? Your consistency score is trending up.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Current Streak"
              value={profile?.current_streak || 0}
              subtitle="days strong"
              icon={Flame}
              trend={profile?.current_streak ? { value: 10, positive: true } : undefined}
              color="warning"
            />
            <StatsCard
              title="Productivity Points"
              value={profile?.productivity_points?.toLocaleString() || "0"}
              subtitle="earned so far"
              icon={Trophy}
              color="primary"
            />
            <StatsCard
              title="Best Streak"
              value={profile?.best_streak || 0}
              subtitle="days achieved"
              icon={Star}
              color="success"
            />
            <StatsCard
              title="Active Rooms"
              value={userRooms.length}
              subtitle={`${userRooms.reduce((sum, r) => sum + (r.member_count || 0), 0)} peers total`}
              icon={Users}
              color="accent"
            />
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Daily Commitment & Time */}
            <div className="lg:col-span-2 space-y-6">
              <DailyCommitment />
              <div className="grid md:grid-cols-2 gap-6">
                <TimeTracker />
                <DietTracker />
              </div>
            </div>

            {/* Right Column - Score & Rooms */}
            <div className="space-y-6">
              <ConsistencyScore />
              
              {/* Rooms Section */}
              <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-lg text-card-foreground">Your Rooms</h3>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/rooms">
                      <Plus className="w-4 h-4 mr-1" />
                      Join
                    </Link>
                  </Button>
                </div>
                
                {roomsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : userRooms.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">You haven't joined any rooms yet.</p>
                    <Button variant="outline" asChild>
                      <Link to="/rooms">Browse Rooms</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userRooms.slice(0, 3).map((room) => (
                      <RoomCard 
                        key={room.id} 
                        id={room.id}
                        name={room.name}
                        type={room.type.charAt(0).toUpperCase() + room.type.slice(1) + " Room"}
                        memberCount={room.member_count || 0}
                        isAdmin={room.is_admin}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
