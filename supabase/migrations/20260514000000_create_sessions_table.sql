create table public.sessions (
  id                text primary key,
  email             text not null,
  access_token      text not null,
  refresh_token     text,
  token_expires_at  timestamptz not null,
  created_at        timestamptz not null default now(),
  expires_at        timestamptz not null
);

alter table public.sessions enable row level security;
