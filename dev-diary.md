This document serves as a daily diary of my progress on TrackIt. The idea is to write down what I did at the end of each day/session, and ideas for the next steps. Then, next time I pick things up the context will be preserved; I can just read this, remember where I left off and get back to building.

## Jan 23rd, 2025 - 1 hr of building

Today, I implemented the functionality of editing time entry's start time (in a calendar pop-up, via input field). It works only locally, on blur of the input field - the new value gets validated (to make sure its a valid time input, e.g. 10:32 PM, and not sth random), and then the time entry's duration also gets updated (outside of a pop, in a row of the list).

I also took care of the case when user sets the start time to be after the end time - in that case, we bump the end time for +1 day, so things still make sense.

**Next steps:**
- do the same for the end time. Then see what we can extract from these two functions, as they should be fairly similar. Also take care of the "end time is before start time" case - see how Toggl handles it.
- Get rid of the "Save" button in a pop-up, and save everything to the db when the pop-up gets closed (there is an event handler from Headless-UI's Popover component I can use)

## Aug 19, 2026

Wow, coming back to this after a while. Fixed dark/light theme since latest Open SaaS uses tailwind and another theming system.

## Sep 17, 2026

Context: over the last stretch I migrated TrackIt from Wasp 0.15 to Wasp 0.25 + the latest Open SaaS template. Did it by spinning up a fresh template and porting my own code into it (Timer now lives in `src/timer/` instead of the old `demo-ai-app/` folder), rather than trying to patch the old template forward. That work lives on the `migrate-wasp-0.25` branch.

Today I reviewed that branch to get it ready to merge - walked through the ported Timer code (Headless UI v2 renames, the React 19 useRef change) plus the auth/nav/schema tweaks and the theming fix. While reviewing I caught a real bug: `updateTimeEntry` only checked that you were logged in, not that the entry was actually yours, so any logged-in user could edit anyone's time entries (classic IDOR). Fixed it by scoping the Prisma update to `where: { id, userId }` and returning a clean 404 via HttpError when nothing matches. Committed on its own so it's easy to trace (and could be cherry-picked to main if needed).

Branch is reviewed and ready to merge into `main`.

**Next steps:**
- Finish reviewing the migration commit (`2040606`). Reviewed so far: `TimerPage.tsx`, `operations.ts` (found+fixed the IDOR), `auth.wasp.ts`, `schema.prisma`, `timer.wasp.ts`, `main.wasp.ts`, `useRedirectIfLoggedIn.ts`. Still to review:
  - `src/server/emailSender.wasp.ts` - `defaultFrom` set to TrackIt
  - `src/client/components/NavBar/constants.ts` - nav items (Timer, File Upload, Pricing)
  - Then the theming commit `360c60b` (trivial: 11 class swaps in TimerPage + one `--card-subtle` value in `Main.css`)
  - Handy: `git show 2040606 -- <file>` for the new/customized ones; `git show 360c60b` for the theming commit.
- Merge `migrate-wasp-0.25` into `main`.

**After the merge:**
- Fix the login/signup redirect flicker. `useRedirectIfLoggedIn` redirects in a `useEffect`, so a logged-in user briefly sees the login form before being bounced. Fix = move it from a hook to a component-level guard that redirects during render (`if (isLoading) return null; if (user) return <Navigate to={...} replace/>; else render form`) - either a `RedirectIfLoggedIn` wrapper component or an HOC mirroring Wasp's `createAuthRequiredPage`. Replaces the hook; touches LoginPage + SignupPage. This is stock OpenSaaS behavior, so worth upstreaming too.
- (from earlier) Re-enable Google/GitHub auth once OAuth creds are in `.env.server`; the time-edit popover overflows at narrow widths.
- Optional: `@@index([userId])` on `TimeEntry` for the list query; `{ replace: true }` on the redirect navigate.

**Wasp exploration (spawned from the flicker discussion) - explore for a bit:**
- A Cell-like declarative async-render convention for Wasp. The flicker is a symptom of Wasp having no declarative loading/error/empty/success convention - every operation-backed component hand-rolls the `useQuery` isLoading/data/error ladder, which is where flicker (and forgotten states) sneak in. RedwoodJS Cells (export QUERY/Loading/Empty/Failure/Success, framework renders the right one) are the reference for this. Idea: a declarative wrapper around Wasp's `useQuery` with named states. Note the redirect/auth part is orthogonal (that's router-level, like `authRequired`/`createAuthRequiredPage`) - Cells only cover the loading-flash half. Same "make the safe thing the default" instinct as the auth issue (#4883).
