-- Create enum for competition status
CREATE TYPE public.competition_status AS ENUM ('upcoming', 'active', 'completed');

-- Create competitions table
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  entry_fee NUMERIC NOT NULL DEFAULT 0,
  virtual_balance NUMERIC NOT NULL DEFAULT 10000,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status competition_status NOT NULL DEFAULT 'upcoming',
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competition_participants table
CREATE TABLE public.competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  virtual_balance NUMERIC NOT NULL,
  current_portfolio_value NUMERIC NOT NULL DEFAULT 0,
  rank INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- Create competition_trades table
CREATE TABLE public.competition_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_token TEXT NOT NULL,
  to_token TEXT NOT NULL,
  from_amount NUMERIC NOT NULL,
  to_amount NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competition_chat table
CREATE TABLE public.competition_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create competition_bets table
CREATE TABLE public.competition_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  bettor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  potential_payout NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nft_rewards table
CREATE TABLE public.nft_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rank INTEGER NOT NULL,
  token_uri TEXT,
  minted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for competitions (public read)
CREATE POLICY "Anyone can view competitions"
  ON public.competitions FOR SELECT
  USING (true);

-- RLS Policies for competition_participants
CREATE POLICY "Anyone can view participants"
  ON public.competition_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join competitions"
  ON public.competition_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON public.competition_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for competition_trades
CREATE POLICY "Anyone can view competition trades"
  ON public.competition_trades FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own trades"
  ON public.competition_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for competition_chat
CREATE POLICY "Anyone can view chat messages"
  ON public.competition_chat FOR SELECT
  USING (true);

CREATE POLICY "Users can send messages"
  ON public.competition_chat FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for competition_bets
CREATE POLICY "Anyone can view bets"
  ON public.competition_bets FOR SELECT
  USING (true);

CREATE POLICY "Users can place bets"
  ON public.competition_bets FOR INSERT
  WITH CHECK (auth.uid() = bettor_id);

-- RLS Policies for nft_rewards
CREATE POLICY "Anyone can view NFT rewards"
  ON public.nft_rewards FOR SELECT
  USING (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competition_bets;

-- Create trigger for updated_at
CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();