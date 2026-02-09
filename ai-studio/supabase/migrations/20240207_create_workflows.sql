-- Create Workflows Table
create table if not exists public.workflows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text,
  nodes jsonb not null default '[]',
  edges jsonb not null default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.workflows enable row level security;

-- Create Policies
create policy "Users can view their own workflows" 
on public.workflows for select 
using (auth.uid() = user_id);

create policy "Users can insert their own workflows" 
on public.workflows for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own workflows" 
on public.workflows for update 
using (auth.uid() = user_id);

create policy "Users can delete their own workflows" 
on public.workflows for delete 
using (auth.uid() = user_id);

-- Add index for performance
create index workflows_user_id_idx on public.workflows(user_id);
