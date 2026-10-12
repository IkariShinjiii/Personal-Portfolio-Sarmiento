-- Guestbook: public read, GitHub-signed-in users manage their own single entry.
create table public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  author_name text not null default 'Anonymous',
  avatar_url text,
  message text not null check (char_length(btrim(message)) between 1 and 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Name and avatar come from the verified GitHub identity, never from the client.
create or replace function public.guestbook_fill_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb;
begin
  select raw_user_meta_data into meta from auth.users where id = new.user_id;
  new.author_name := left(coalesce(meta->>'name', meta->>'user_name', 'Anonymous'), 80);
  new.avatar_url := meta->>'avatar_url';
  new.message := btrim(new.message);
  if tg_op = 'UPDATE' then
    new.updated_at := now();
    new.user_id := old.user_id;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

revoke execute on function public.guestbook_fill_author() from public, anon, authenticated;

create trigger guestbook_fill_author
before insert or update on public.guestbook_entries
for each row execute function public.guestbook_fill_author();

alter table public.guestbook_entries enable row level security;

create policy "Anyone can read the guestbook"
  on public.guestbook_entries for select to anon, authenticated using (true);
create policy "Signed-in users add their own entry"
  on public.guestbook_entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users edit their own entry"
  on public.guestbook_entries for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete their own entry"
  on public.guestbook_entries for delete to authenticated using ((select auth.uid()) = user_id);

create index guestbook_entries_created_at_idx on public.guestbook_entries (created_at desc);
