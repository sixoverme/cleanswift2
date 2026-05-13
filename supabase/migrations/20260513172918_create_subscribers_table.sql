create table public.subscribers (
  email                   text primary key,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  status                  text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger subscribers_set_updated_at
  before update on public.subscribers
  for each row execute procedure public.set_updated_at();

alter table public.subscribers enable row level security;
