create table if not exists public.site_content_entries (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_articles (
  id uuid primary key default gen_random_uuid(),
  page text not null default 'home' check (page in ('home', 'about')),
  title text not null,
  excerpt text not null default '',
  content text not null,
  image_url text,
  author text not null default 'Balkon Café Team',
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_articles_page_order_idx on public.site_articles (page, display_order);
create index if not exists site_articles_published_idx on public.site_articles (is_published);

drop trigger if exists set_site_content_entries_updated_at on public.site_content_entries;
create trigger set_site_content_entries_updated_at
before update on public.site_content_entries
for each row
execute function public.set_updated_at();

drop trigger if exists set_site_articles_updated_at on public.site_articles;
create trigger set_site_articles_updated_at
before update on public.site_articles
for each row
execute function public.set_updated_at();

insert into public.site_content_entries (key, value)
values
  ('home', '{}'::jsonb),
  ('about', '{}'::jsonb),
  ('contact', '{}'::jsonb)
on conflict (key) do nothing;

alter table public.site_content_entries enable row level security;
alter table public.site_articles enable row level security;

drop policy if exists "Public can read site content entries" on public.site_content_entries;
create policy "Public can read site content entries"
on public.site_content_entries
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read published site articles" on public.site_articles;
create policy "Public can read published site articles"
on public.site_articles
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admins can manage site content entries" on public.site_content_entries;
create policy "Admins can manage site content entries"
on public.site_content_entries
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where public.admin_profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where public.admin_profiles.id = auth.uid()
  )
);

drop policy if exists "Admins can manage site articles" on public.site_articles;
create policy "Admins can manage site articles"
on public.site_articles
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where public.admin_profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where public.admin_profiles.id = auth.uid()
  )
);
