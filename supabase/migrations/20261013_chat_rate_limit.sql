-- Shared rate limiter for the concierge function. The function calls chat_rate_limit(bucket, limit, window_seconds)
-- with the public key; the table itself is unreachable directly (RLS on, no policies).
create table if not exists public.chat_rate_limits (
  bucket text primary key,
  count integer not null,
  window_end timestamptz not null
);
alter table public.chat_rate_limits enable row level security;

create or replace function public.chat_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  c integer;
begin
  if p_bucket is null or char_length(p_bucket) > 80 or p_limit < 1 or p_window_seconds < 1 or p_window_seconds > 86400 then
    return false;
  end if;
  insert into public.chat_rate_limits as t (bucket, count, window_end)
  values (p_bucket, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (bucket) do update
    set count = case when t.window_end < now() then 1 else t.count + 1 end,
        window_end = case when t.window_end < now() then now() + make_interval(secs => p_window_seconds) else t.window_end end
  returning count into c;
  -- Keep the table small: occasionally drop long-expired buckets.
  if random() < 0.02 then
    delete from public.chat_rate_limits where window_end < now() - interval '1 hour';
  end if;
  return c <= p_limit;
end;
$$;

revoke all on function public.chat_rate_limit(text, integer, integer) from public;
grant execute on function public.chat_rate_limit(text, integer, integer) to anon, authenticated;
