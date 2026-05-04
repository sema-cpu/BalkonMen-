alter table public.menu_categories
  add column if not exists icon_name text not null default '';
