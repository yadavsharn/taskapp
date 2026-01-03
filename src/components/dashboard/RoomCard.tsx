import { Users, Crown, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RoomCardProps {
  id: string;
  name: string;
  type: string;
  memberCount: number;
  isAdmin?: boolean;
  yourRank?: number;
  activeNow?: number;
}

const RoomCard = ({ id, name, type, memberCount, isAdmin, yourRank, activeNow }: RoomCardProps) => {
  return (
    <Link
      to={`/rooms/${id}`}
      className="block p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-200 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-card-foreground">{name}</h4>
              {isAdmin && <Crown className="w-3.5 h-3.5 text-warning" />}
            </div>
            <p className="text-xs text-muted-foreground">{type}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>{memberCount} members</span>
        </div>
        {activeNow && (
          <div className="flex items-center gap-1.5 text-xs text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>{activeNow} active</span>
          </div>
        )}
        {yourRank && (
          <div className="text-xs text-primary font-medium ml-auto">
            Rank #{yourRank}
          </div>
        )}
      </div>
    </Link>
  );
};

export default RoomCard;
