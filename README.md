# Slotly

A simple scheduling app: a host publishes available time slots and anyone can book one with their name and email. Booked slots disappear from the list, so there are no double bookings.

Built for the TeamLift Product Engineer Internship Challenge.

- **Live app:** https://slotly-app-kappa.vercel.app
- **Repository:** https://github.com/emqqqqq/slotly-app

### Try it as the host

Creating slots needs the host account (guests can book without any account):

- Open `https://slotly-app-kappa.vercel.app/#manage`
- Email: `admin@admin.admin`
- Password: `adminadmin`

This is a demo account created only for this challenge.

---

## What it does

### Booking page (`/#book`)

- Browse available slots by date with a date navigator
- Pick a slot and book it with name and email
- Client-side validation with clear, friendly error messages
- If someone else books the slot first, the user is told and the list refreshes
- After booking, a short, friendly confirmation message written by an LLM (Gemini). If the AI is slow or unavailable, a static confirmation is shown instead, so a booking is never blocked by the AI.

### Manage page (`/#manage`)

- Host login using Supabase Authentication
- Only the designated host can create new time slots
- Create slots with a date, start time and duration
- Past times are rejected with a clear message
- See all upcoming slots with an Available / Booked status
- Filter slots by date and see available vs. booked counts
- Duplicate and overlapping slots are rejected with a clear message

---

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide icons
- **Backend and data:** Supabase (PostgreSQL), accessed through `supabase-js`
- **AI:** Supabase Edge Function `generate-confirmation`, which calls Gemini (Google AI Studio free tier)
- **Hosting:** Vercel (frontend), Supabase (database and Edge Function)

### Why Supabase instead of a custom API?

With a two-hour scope, I chose to put the important rules (no double booking, no overlapping slots, host-only slot creation) directly in PostgreSQL, using constraints and SQL functions exposed through Supabase RPC. This keeps those rules safe even if two people book at the same moment, and it let me spend more time on the user experience. If the product needs logic beyond the database, a NestJS API would be the next step.

---

## How the backend works

### Database

- **`slots`**: available time slots (date, start time, duration, booking status)
- **`bookings`**: booking details (slot, name, email)
- **`host_users`**: the UUID of the designated host account

### Database functions

- **`create_slot(p_date, p_start_time, p_duration_minutes)`**: checks that the user is the host, validates the input, and creates the slot.
- **`create_booking(p_slot_id, p_name, p_email)`**: validates the details and reserves the slot in one atomic step. A slot can never be booked twice.
- **Overlap prevention**: a PostgreSQL exclusion constraint blocks overlapping slots, and a unique constraint blocks duplicate start times on the same date.

Host authorization and booking rules are enforced by the database, not only by the frontend. Row Level Security (RLS) is enabled on all tables, and booking emails are not publicly readable.

### AI-powered confirmation

The `generate-confirmation` Edge Function calls the Gemini API to write a friendly booking confirmation. The API key is stored as a server-side Supabase secret and is never exposed in the frontend. The booking itself is saved independently, so if the AI quota is exceeded the booking still works.

### Frontend integration

The frontend talks to Supabase through `src/lib/slots-api.ts`, which centralizes all database calls and turns errors into user-friendly messages.

---

## Run it locally

### Prerequisites

- Node.js 20 or later
- npm
- A Supabase project

### 1. Clone and install

```bash
git clone https://github.com/emqqqqq/slotly-app
cd slotly-app
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your Supabase values (Project Settings → API):

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Use only the publishable key. Never put a Supabase secret or service-role key in frontend code.

### 3. Set up Supabase

**Database**

1. Run `supabase/schema.sql` in the Supabase SQL Editor. It creates the tables, constraints, functions and RLS policies.
2. In the Supabase Dashboard, open **Authentication → Users** and create the host account. Copy its UUID.
3. In the SQL Editor, run this query with the real UUID:

   ```sql
   INSERT INTO public.host_users (user_id)
   VALUES ('YOUR-HOST-USER-UUID');
   ```

Only the host account should be in `host_users`. Visitors book without an account.

**AI confirmation (Edge Function)**

This step is optional. Without it, the app still works and shows a static confirmation message.

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. In the Supabase Dashboard, open **Edge Functions → Deploy a new function → Via Editor**.
3. Name the function exactly `generate-confirmation`.
4. Paste the contents of `supabase/functions/generate-confirmation/index.ts` into the editor and click **Deploy**.
5. Open **Edge Functions → Secrets** and add a secret named `GEMINI_API_KEY` with your Google AI Studio key.

The Gemini model name is set at the top of the function (`GEMINI_MODEL`). If your key has no access to it, change it to a model available on your free tier.

### 4. Start the app

```bash
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

### Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Type-check and build for production
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

---

## Deployment

The frontend is deployed on Vercel. Add these environment variables in the Vercel project settings:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Routing uses the URL hash (`#book` / `#manage`), so no SPA rewrite rules are needed. The Supabase database and Edge Function are set up separately, as described above.

---

## Project structure

```text
src/
  components/
    book/        Hero, AvailableSlotsCard, SlotRow, BookingModal
    manage/      CreateSlotForm, SlotsTable
    ui/          Button, Field, DateNavigator, StatusBadge
  hooks/         useSlots (loading, error and refresh state)
  lib/           slots-api (all backend calls), format (date/time helpers)
  pages/         BookPage, ManagePage
  types.ts       shared types
supabase/
  schema.sql                         tables, constraints, functions, RLS
  functions/generate-confirmation/   Gemini Edge Function
```

---

## AI tools I used

I used **Claude** for most of the development: planning the structure, building and splitting the React components, the Supabase calls, and the Gemini confirmation message. I directed the work, tested the flow end to end, and read through the generated code so I can explain how the pieces fit together.

**Where I tested and stepped in:**

- **Gemini model:** the AI suggested a Gemini model name that did not work. I tested several models locally first, checked which ones actually returned a confirmation message on the free tier, and only then put the working one in the Edge Function.
- **Overlapping slots:** I tried many cases by hand (same start time, a slot starting inside another one, back-to-back slots, different durations) to make sure the database rejects real overlaps but still allows slots that only touch. This is why the rule lives in a PostgreSQL exclusion constraint and not only in the frontend.
- **Date picker:** the native date input only opened its calendar when I clicked the small icon. I fixed it so clicking anywhere on the field opens the picker (using `showPicker()`), which feels much more natural.

---

## Decisions I made

- Kept the "no double booking" rule in the database, because checking only in the browser is not safe when two people book at the same time.
- Treated the AI message as an enhancement: it has a timeout and a fallback message, so it can never block or break a booking.
- Added a separate host page with date filtering, so the flow works from both sides.
- Built accessible dialogs (focus trap, Escape to close, labelled controls, reduced-motion support).
- Added Supabase Authentication for the host while keeping guest bookings account-free.

---

## What I would improve with more time

- Show the host who booked each slot (an RLS policy and a "Booked by" column)
- Delete and edit slots, and cancel bookings
- Send the confirmation by email
- Time zone support instead of a single time zone
- Google Calendar integration to hide slots that clash with existing events
- Role-based access and multiple hosts
- Rate limiting or a captcha against spam bookings
- Automated tests for the booking flow, and a NestJS API if the product needs logic beyond the database