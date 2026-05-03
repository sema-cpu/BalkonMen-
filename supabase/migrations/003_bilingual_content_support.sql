alter table public.menu_categories
  add column if not exists name_tr text not null default '',
  add column if not exists description_tr text not null default '';

update public.menu_categories
set
  name_tr = case when trim(name_tr) = '' then name else name_tr end,
  description_tr = case when trim(description_tr) = '' then description else description_tr end;

alter table public.menu_items
  add column if not exists name_tr text not null default '',
  add column if not exists description_tr text not null default '';

update public.menu_items
set
  name_tr = case when trim(name_tr) = '' then name else name_tr end,
  description_tr = case when trim(description_tr) = '' then description else description_tr end;

alter table public.site_articles
  add column if not exists title_tr text not null default '',
  add column if not exists excerpt_tr text not null default '',
  add column if not exists content_tr text not null default '';

update public.site_articles
set
  title_tr = case when trim(title_tr) = '' then title else title_tr end,
  excerpt_tr = case when trim(excerpt_tr) = '' then excerpt else excerpt_tr end,
  content_tr = case when trim(content_tr) = '' then content else content_tr end;
