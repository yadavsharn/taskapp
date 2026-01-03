import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Trophy, 
  Flame, 
  Star, 
  Award, 
  Calendar,
  TrendingUp,
  Settings,
  Share2,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUserRooms } from "@/hooks/useRooms";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: userRooms = [] } = useUserRooms();

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

  if (!user || !profile) {
    return null;
  }

  const achievements = [
    { id: "1", name: "First Commit", description: "Completed your first daily commitment", icon: Star, earned: profile.productivity_points > 0 },
    { id: "2", name: "Week Warrior", description: "7 day streak achieved", icon: Flame, earned: profile.best_streak >= 7 },
    { id: "3", name: "Month Master", description: "30 day streak achieved", icon: Trophy, earned: profile.best_streak >= 30 },
    { id: "4", name: "Century Club", description: "100 day streak achieved", icon: Award, earned: profile.best_streak >= 100 },
  ];

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="relative mb-8">
            {/* Cover */}
            <div className="h-48 rounded-2xl gradient-primary opacity-80" />
            
            {/* Profile Info */}
            <div className="absolute bottom-0 left-0 right-0 translate-y-1/2 px-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="w-24 h-24 rounded-2xl bg-card border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {profile.display_name || "User"}
                  </h1>
                  <p className="text-muted-foreground">
                    {profile.email} • Member since {memberSince}
                  </p>
                </div>
                <div className="flex gap-2 pb-2">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 mb-8">
            {[
              { label: "Productivity Points", value: profile.productivity_points.toLocaleString(), icon: Trophy, color: "text-primary" },
              { label: "Current Streak", value: `${profile.current_streak} days`, icon: Flame, color: "text-warning" },
              { label: "Best Streak", value: `${profile.best_streak} days`, icon: Star, color: "text-success" },
              { label: "Rooms Joined", value: userRooms.length.toString(), icon: Calendar, color: "text-accent" },
            ].map((stat, index) => (
              <div key={index} className="p-4 rounded-xl bg-card border border-border/50">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-display font-bold text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Achievements */}
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-warning/10">
                  <Award className="w-5 h-5 text-warning" />
                </div>
                <h2 className="font-display font-semibold text-lg">Achievements</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl border ${
                      achievement.earned 
                        ? "bg-secondary/50 border-primary/20" 
                        : "bg-secondary/20 border-border/50 opacity-50"
                    }`}
                  >
                    <achievement.icon className={`w-8 h-8 mb-2 ${
                      achievement.earned ? "text-primary" : "text-muted-foreground"
                    }`} />
                    <h3 className="font-medium text-sm text-card-foreground">{achievement.name}</h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-success/10">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <h2 className="font-display font-semibold text-lg">Your Rooms</h2>
              </div>

              {userRooms.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  You haven't joined any rooms yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {userRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30"
                    >
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{room.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {room.type} Room • {room.member_count} members
                        </p>
                      </div>
                      {room.is_admin && (
                        <span className="px-2 py-1 rounded-full bg-warning/10 text-warning text-xs font-medium">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
