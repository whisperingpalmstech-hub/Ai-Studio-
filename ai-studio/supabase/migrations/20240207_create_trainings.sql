-- Create Trainings Table
create table if not exists public.trainings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  type text not null check (type in ('lora', 'checkpoint')),
  trigger_word text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  dataset_url text, -- simplified for MVP, could be array of urls
  params jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.trainings enable row level security;

-- Policies
create policy "Users can view their own trainings" 
  on public.trainings for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own trainings" 
  on public.trainings for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own trainings" 
  on public.trainings for update
  using (auth.uid() = user_id);
