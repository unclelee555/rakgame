-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'THB' CHECK (currency IN ('THB', 'AUD', 'USD', 'EUR', 'GBP', 'JPY')),
  language TEXT NOT NULL DEFAULT 'th' CHECK (language IN ('en', 'th')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sellers table
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  platform TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Disc', 'Digital')),
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  purchase_date DATE NOT NULL,
  region TEXT,
  condition TEXT CHECK (condition IN ('New', 'Used', NULL)),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON public.sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_name ON public.sellers(user_id, name);

CREATE INDEX IF NOT EXISTS idx_games_user_id ON public.games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_seller_id ON public.games(seller_id);
CREATE INDEX IF NOT EXISTS idx_games_platform ON public.games(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_games_purchase_date ON public.games(user_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_games_title ON public.games(user_id, LOWER(title));
CREATE INDEX IF NOT EXISTS idx_games_type ON public.games(user_id, type);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for sellers table
CREATE POLICY "Users can view own sellers"
  ON public.sellers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sellers"
  ON public.sellers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sellers"
  ON public.sellers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sellers"
  ON public.sellers FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for games table
CREATE POLICY "Users can view own games"
  ON public.games FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own games"
  ON public.games FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own games"
  ON public.games FOR DELETE
  USING (auth.uid() = user_id);
