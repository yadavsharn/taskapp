-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin');

-- Create room_type enum
CREATE TYPE public.room_type AS ENUM ('study', 'coding', 'fitness', 'startup', 'custom');

-- Create meal_status enum
CREATE TYPE public.meal_status AS ENUM ('pending', 'followed', 'partial', 'skipped');

-- Create task_status enum  
CREATE TYPE public.task_status AS ENUM ('pending', 'completed', 'incomplete');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  productivity_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type room_type NOT NULL DEFAULT 'custom',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  max_members INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create room_members table (junction table)
CREATE TABLE public.room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create daily_commitments table
CREATE TABLE public.daily_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIME,
  status task_status DEFAULT 'pending',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create time_logs table
CREATE TABLE public.time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  screen_time_hours DECIMAL(4,2) DEFAULT 0,
  focus_time_hours DECIMAL(4,2) DEFAULT 0,
  entertainment_hours DECIMAL(4,2) DEFAULT 0,
  sleep_hours DECIMAL(4,2) DEFAULT 0,
  unproductive_hours DECIMAL(4,2) DEFAULT 0,
  social_media_hours DECIMAL(4,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create diet_plans table
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create meals table
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_plan_id UUID REFERENCES public.diet_plans(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  scheduled_time TIME,
  status meal_status DEFAULT 'pending',
  calories INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create daily_scores table
CREATE TABLE public.daily_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  task_score INTEGER DEFAULT 0,
  time_score INTEGER DEFAULT 0,
  diet_score INTEGER DEFAULT 0,
  schedule_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  required_value INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check room membership
CREATE OR REPLACE FUNCTION public.is_room_member(_user_id UUID, _room_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_members
    WHERE user_id = _user_id AND room_id = _room_id
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles policies (read-only for users, admin-only write)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Rooms policies
CREATE POLICY "Anyone can view public rooms" ON public.rooms
  FOR SELECT USING (is_public = true OR public.is_room_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creator can update room" ON public.rooms
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Room creator can delete room" ON public.rooms
  FOR DELETE USING (auth.uid() = created_by);

-- Room members policies
CREATE POLICY "Room members can view members" ON public.room_members
  FOR SELECT USING (public.is_room_member(auth.uid(), room_id));

CREATE POLICY "Users can join public rooms" ON public.room_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND is_public = true)
  );

CREATE POLICY "Users can leave rooms" ON public.room_members
  FOR DELETE USING (auth.uid() = user_id);

-- Daily commitments policies
CREATE POLICY "Users can view own commitments" ON public.daily_commitments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Room members can view room commitments" ON public.daily_commitments
  FOR SELECT USING (room_id IS NOT NULL AND public.is_room_member(auth.uid(), room_id));

CREATE POLICY "Users can create own commitments" ON public.daily_commitments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own commitments" ON public.daily_commitments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own commitments" ON public.daily_commitments
  FOR DELETE USING (auth.uid() = user_id);

-- Time logs policies
CREATE POLICY "Users can view own time logs" ON public.time_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time logs" ON public.time_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time logs" ON public.time_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Diet plans policies
CREATE POLICY "Users can view own diet plans" ON public.diet_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own diet plans" ON public.diet_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diet plans" ON public.diet_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diet plans" ON public.diet_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Meals policies
CREATE POLICY "Users can view own meals" ON public.meals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.diet_plans WHERE id = diet_plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create own meals" ON public.meals
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.diet_plans WHERE id = diet_plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update own meals" ON public.meals
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.diet_plans WHERE id = diet_plan_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own meals" ON public.meals
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.diet_plans WHERE id = diet_plan_id AND user_id = auth.uid())
  );

-- Daily scores policies
CREATE POLICY "Users can view own scores" ON public.daily_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON public.daily_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON public.daily_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_logs_updated_at
  BEFORE UPDATE ON public.time_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, required_value) VALUES
  ('First Commit', 'Completed your first daily commitment', 'star', 1),
  ('Week Warrior', '7 day streak achieved', 'flame', 7),
  ('Month Master', '30 day streak achieved', 'trophy', 30),
  ('Century Club', '100 day streak achieved', 'award', 100),
  ('Early Bird', 'Logged 5 days of 6AM wake ups', 'sun', 5),
  ('Focus Champion', 'Logged 50 hours of focus time', 'brain', 50),
  ('Diet Disciple', 'Achieved 100% diet adherence for 7 days', 'utensils', 7),
  ('Point Master', 'Earned 1000 productivity points', 'zap', 1000);

-- Insert some sample public rooms
INSERT INTO public.rooms (name, description, type, is_public) VALUES
  ('DSA Grinders', 'Daily LeetCode problems, system design discussions, and interview prep.', 'study', true),
  ('6AM Club', 'Wake up early, work out hard. No excuses, just results.', 'fitness', true),
  ('Indie Hackers', 'Build in public, ship fast, help each other grow.', 'startup', true),
  ('Full Stack Focus', 'Web development accountability. React, Node, and everything in between.', 'coding', true),
  ('UPSC Warriors', 'India''s toughest exam. Daily targets, weekly tests, peer reviews.', 'study', true),
  ('Marathon Runners', 'Training for marathons. Daily runs, nutrition tracking, injury prevention.', 'fitness', true);