import { 
  Target, 
  Clock, 
  Utensils, 
  Calendar, 
  Trophy, 
  Shield, 
  BarChart3, 
  Users 
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Daily Commitments",
    description: "Declare your goals before each day begins. No excuses, no edits after deadline.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Accountability Rooms",
    description: "Join purpose-driven rooms with peers who share your goals. Study, code, or hustle together.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Clock,
    title: "Time Transparency",
    description: "Log screen time, focus hours, and productive time. Be honest with yourself and peers.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Utensils,
    title: "Diet Tracking",
    description: "Plan meals and track adherence. Your diet follow percentage impacts your score.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Calendar,
    title: "Schedule Planning",
    description: "Block your day, then report what you actually did. Build schedule discipline.",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
  {
    icon: Trophy,
    title: "Rewards System",
    description: "Earn productivity points for consistency. Redeem for badges, perks, and real rewards.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Track your progress over days, weeks, and months. See correlations and improve.",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  {
    icon: Shield,
    title: "Privacy Control",
    description: "Choose what peers see. Full stats, percentages only, or keep sensitive data hidden.",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything You Need for{" "}
            <span className="text-gradient">Total Accountability</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete operating system for your lifestyle transformation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
