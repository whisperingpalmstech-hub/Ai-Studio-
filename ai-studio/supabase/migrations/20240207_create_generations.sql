-- Create Generations Table
create table if not exists public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  image_url text not null,
  prompt text not null,
  negative_prompt text,
  width int default 1024,
  height int default 1024,
  steps int default 20,
  guidance_scale float default 7.5,
  seed bigint default 0,
  model_id text,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.generations enable row level security;

-- Policies
create policy "Users can view their own generations" 
  on public.generations for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own generations" 
  on public.generations for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own generations" 
  on public.generations for delete
  using (auth.uid() = user_id);
