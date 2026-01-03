import { CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Join or Create a Room",
    description: "Find peers with similar goals. Study rooms, coding rooms, fitness rooms—your tribe awaits.",
    items: ["Browse existing rooms", "Create custom rooms", "Invite your friends"],
  },
  {
    number: "02",
    title: "Commit Before You Start",
    description: "Each morning, declare what you'll accomplish. This becomes your contract with yourself and peers.",
    items: ["Set daily tasks", "Define success criteria", "Lock in commitments"],
  },
  {
    number: "03",
    title: "Track Honestly",
    description: "At day's end, log your actual time usage, diet adherence, and schedule follow-through.",
    items: ["Log screen time", "Report diet adherence", "Mark task completion"],
  },
  {
    number: "04",
    title: "Earn & Grow",
    description: "Build streaks, earn points, climb leaderboards. Watch your consistency transform your life.",
    items: ["Gain productivity points", "Unlock achievements", "Redeem rewards"],
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 gradient-hero">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Four Steps to{" "}
            <span className="text-gradient">Transform Your Life</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple process, powerful results. Start your accountability journey today.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex gap-6 md:gap-10 pb-12 last:pb-0"
            >
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg text-primary-foreground font-display font-bold text-lg">
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-transparent mt-4" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-8">
                <h3 className="font-display font-bold text-2xl mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {step.description}
                </p>
                <ul className="space-y-2">
                  {step.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
