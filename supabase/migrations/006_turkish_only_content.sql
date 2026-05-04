update public.menu_categories
set
  name = case when trim(name_tr) <> '' then name_tr else name end,
  description = case when trim(description_tr) <> '' then description_tr else description end;

update public.menu_items
set
  name = case when trim(name_tr) <> '' then name_tr else name end,
  description = case when trim(description_tr) <> '' then description_tr else description end;

update public.site_articles
set
  title = case when trim(title_tr) <> '' then title_tr else title end,
  excerpt = case when trim(excerpt_tr) <> '' then excerpt_tr else excerpt end,
  content = case when trim(content_tr) <> '' then content_tr else content end;

update public.site_content_entries
set value = case
  when jsonb_typeof(value) = 'object' and (value ? 'tr' or value ? 'en')
    then coalesce(value -> 'tr', value -> 'en', '{}'::jsonb)
  else value
end;

alter table public.menu_categories
  drop column if exists name_tr,
  drop column if exists description_tr;

alter table public.menu_items
  drop column if exists name_tr,
  drop column if exists description_tr;

alter table public.site_articles
  drop column if exists title_tr,
  drop column if exists excerpt_tr,
  drop column if exists content_tr;
