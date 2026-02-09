-- Credit deduction function
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_job_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF v_current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Deduct credits
  v_new_balance := v_current_credits - p_amount;
  
  UPDATE public.profiles
  SET credits = v_new_balance, updated_at = NOW()
  WHERE id = p_user_id;

  -- Log transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    job_id,
    balance_after
  ) VALUES (
    p_user_id,
    -p_amount,
    'usage',
    'Generation credit usage',
    p_job_id,
    v_new_balance
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credits function (for purchases, bonuses, etc.)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT NULL,
  p_stripe_payment_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits + p_amount, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Log transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    stripe_payment_id,
    balance_after
  ) VALUES (
    p_user_id,
    p_amount,
    p_type,
    p_description,
    p_stripe_payment_id,
    v_new_balance
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset monthly credits for subscription renewal
CREATE OR REPLACE FUNCTION public.reset_monthly_credits(
  p_user_id UUID,
  p_credits INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = p_credits, updated_at = NOW()
  WHERE id = p_user_id
  RETURNING credits INTO v_new_balance;

  IF v_new_balance IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Log transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    balance_after
  ) VALUES (
    p_user_id,
    p_credits,
    'subscription',
    'Monthly credit reset',
    v_new_balance
  );

  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
