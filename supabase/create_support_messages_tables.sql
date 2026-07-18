-- Create support threads and messages tables for admin messaging

create table if not exists support_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  username text,
  topic text,
  status text default 'open',
  created_at timestamptz default now()
);

create table if not exists support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references support_threads(id) on delete cascade,
  sender text not null,
  message text not null,
  attachments text[],
  created_at timestamptz default now()
);

create index if not exists idx_support_threads_user_id on support_threads (user_id);
create index if not exists idx_support_messages_thread_id on support_messages (thread_id);
