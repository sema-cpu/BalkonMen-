alter table public.menu_items
  add column if not exists doneness_rating text
  check (
    doneness_rating is null
    or doneness_rating in ('rare', 'mediumRare', 'medium', 'mediumWell', 'wellDone')
  );
