-- Helper functions for RakGame database operations

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, currency, language)
  VALUES (
    NEW.id,
    NEW.email,
    'THB',
    'th'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get spending analytics for a user
CREATE OR REPLACE FUNCTION public.get_user_spending_analytics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COALESCE(SUM(price), 0),
    'gameCount', COUNT(*),
    'byPlatform', (
      SELECT json_object_agg(platform, total)
      FROM (
        SELECT platform, SUM(price) as total
        FROM public.games
        WHERE user_id = user_uuid
        GROUP BY platform
      ) platform_totals
    ),
    'bySeller', (
      SELECT json_object_agg(seller_name, total)
      FROM (
        SELECT 
          COALESCE(s.name, 'Unknown') as seller_name,
          SUM(g.price) as total
        FROM public.games g
        LEFT JOIN public.sellers s ON g.seller_id = s.id
        WHERE g.user_id = user_uuid
        GROUP BY s.name
      ) seller_totals
    ),
    'byMonth', (
      SELECT json_object_agg(month, total)
      FROM (
        SELECT 
          TO_CHAR(purchase_date, 'YYYY-MM') as month,
          SUM(price) as total
        FROM public.games
        WHERE user_id = user_uuid
        GROUP BY TO_CHAR(purchase_date, 'YYYY-MM')
        ORDER BY month DESC
      ) month_totals
    )
  ) INTO result
  FROM public.games
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for duplicate games
CREATE OR REPLACE FUNCTION public.check_duplicate_game(
  user_uuid UUID,
  game_title TEXT,
  game_platform TEXT,
  exclude_game_id UUID DEFAULT NULL
)
RETURNS TABLE(id UUID, title TEXT, platform TEXT, purchase_date DATE, price NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.title, g.platform, g.purchase_date, g.price
  FROM public.games g
  WHERE g.user_id = user_uuid
    AND LOWER(g.title) = LOWER(game_title)
    AND g.platform = game_platform
    AND (exclude_game_id IS NULL OR g.id != exclude_game_id)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get games with seller information
CREATE OR REPLACE FUNCTION public.get_games_with_sellers(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  platform TEXT,
  type TEXT,
  price NUMERIC,
  purchase_date DATE,
  region TEXT,
  condition TEXT,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  seller_id UUID,
  seller_name TEXT,
  seller_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.title,
    g.platform,
    g.type,
    g.price,
    g.purchase_date,
    g.region,
    g.condition,
    g.notes,
    g.image_url,
    g.created_at,
    g.seller_id,
    s.name as seller_name,
    s.url as seller_url
  FROM public.games g
  LEFT JOIN public.sellers s ON g.seller_id = s.id
  WHERE g.user_id = user_uuid
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_spending_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_duplicate_game(UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_games_with_sellers(UUID) TO authenticated;
