-- 1. Tables

create table public.slots (
      id bigint generated always as identity primary key,
      date date not null,
      start_time time not null,
      duration_minutes integer not null default 30,
      is_booked boolean not null default false,
      created_at timestamptz not null default now(),
      unique (date, start_time)
);

create table public.bookings (
     id bigint generated always as identity primary key,
     slot_id bigint not null unique
         references public.slots(id),
     name text not null,
     email text not null,
     created_at timestamptz not null default now()
);

create table public.host_users (
     user_id uuid primary key
     references auth.users(id) on delete cascade
);

-- 2. Enable Row Level Security

alter table public.slots enable row level security;
alter table public.bookings enable row level security;
alter table public.host_users enable row level security;

-- 3. Prevent overlapping time slots

create extension if not exists btree_gist;

alter table public.slots
    add constraint slots_no_time_overlap
    exclude using gist (
  (
    tsrange(
      date + start_time,
      date + start_time
        + duration_minutes * interval '1 minute',
      '[)'
    )
  ) with &&
);

-- 4. Allow public users to view slots

create policy "Anyone can view all slots"
on public.slots
for select
to anon, authenticated
using (true);


-- 5. Create a slot

create or replace function public.create_slot(
  p_date date,
  p_start_time time,
  p_duration_minutes integer
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
v_slot_id bigint;
begin
  if auth.uid() is null
     or not exists (
       select 1
       from public.host_users
       where user_id = auth.uid()
     )
  then
    raise exception 'Only the host can create slots';
end if;

  if p_date is null or p_date < current_date then
    raise exception 'Please choose a valid date';
end if;

  if p_start_time is null then
    raise exception 'Start time is required';
end if;

  if p_duration_minutes is null
     or p_duration_minutes < 5
     or p_duration_minutes > 480 then
    raise exception 'Duration must be between 5 and 480 minutes';
end if;

insert into public.slots (
    date,
    start_time,
    duration_minutes,
    is_booked
)
values (
           p_date,
           p_start_time,
           p_duration_minutes,
           false
       )
    returning id into v_slot_id;

return pg_catalog.json_build_object(
        'id', v_slot_id,
        'date', p_date,
        'start_time', p_start_time,
        'duration_minutes', p_duration_minutes
       );
end;
$$;

revoke all on function public.create_slot(date, time, integer)
    from public;

grant execute on function public.create_slot(date, time, integer)
to anon, authenticated;


-- 6. Book a slot

create or replace function public.create_booking(
  p_slot_id bigint,
  p_name text,
  p_email text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
v_booking_id bigint;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Name is required';
end if;

  if p_email is null
     or length(trim(p_email)) < 5
     or trim(p_email) not like '%_@_%._%' then
    raise exception 'A valid email is required';
end if;

update public.slots
set is_booked = true
where id = p_slot_id
  and is_booked = false;

if not found then
    raise exception 'This slot is no longer available';
end if;

insert into public.bookings (slot_id, name, email)
values (
           p_slot_id,
           trim(p_name),
           lower(trim(p_email))
       )
    returning id into v_booking_id;

return pg_catalog.json_build_object(
        'booking_id', v_booking_id,
        'slot_id', p_slot_id
       );
end;
$$;

revoke all on function public.create_booking(bigint, text, text)
    from public;

grant execute on function public.create_booking(bigint, text, text)
to anon, authenticated;

-- 7. Insert a host
-- First, create a host account in Supabase Authentication → Users.
-- Copy the user's UUID and replace the placeholder below.
-- Then execute this query separately in the Supabase SQL Editor.

-- INSERT INTO public.host_users (user_id)
-- VALUES ('YOUR-HOST-USER-UUID');