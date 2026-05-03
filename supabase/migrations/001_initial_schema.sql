create extension if not exists "pgcrypto";

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.menu_categories (id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  display_order integer not null default 0,
  is_featured boolean not null default false,
  is_available boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.menu_item_tags (
  item_id uuid not null references public.menu_items (id) on delete cascade,
  tag text not null check (tag in ('vegan', 'vegetarian', 'spicy', 'containsNuts', 'glutenFree', 'bestseller')),
  primary key (item_id, tag)
);

create index if not exists menu_categories_display_order_idx on public.menu_categories (display_order);
create index if not exists menu_items_category_id_idx on public.menu_items (category_id);
create index if not exists menu_items_available_featured_idx on public.menu_items (is_available, is_featured);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_admin_profiles_updated_at on public.admin_profiles;
create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_menu_categories_updated_at on public.menu_categories;
create trigger set_menu_categories_updated_at
before update on public.menu_categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_menu_items_updated_at on public.menu_items;
create trigger set_menu_items_updated_at
before update on public.menu_items
for each row
execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_item_tags enable row level security;

drop policy if exists "Public can read active categories" on public.menu_categories;
create policy "Public can read active categories"
on public.menu_categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read available items" on public.menu_items;
create policy "Public can read available items"
on public.menu_items
for select
to anon, authenticated
using (is_available = true);

drop policy if exists "Public can read tags for visible items" on public.menu_item_tags;
create policy "Public can read tags for visible items"
on public.menu_item_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.menu_items
    where public.menu_items.id = public.menu_item_tags.item_id
      and public.menu_items.is_available = true
  )
);

drop policy if exists "Admins can manage categories" on public.menu_categories;
create policy "Admins can manage categories"
on public.menu_categories
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

drop policy if exists "Admins can manage items" on public.menu_items;
create policy "Admins can manage items"
on public.menu_items
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

drop policy if exists "Admins can manage tags" on public.menu_item_tags;
create policy "Admins can manage tags"
on public.menu_item_tags
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
