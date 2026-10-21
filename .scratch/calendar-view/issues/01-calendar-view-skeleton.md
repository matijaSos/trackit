# 01: Calendar view skeleton - toggle + week grid with same-day blocks

**What to build:** A user on the timer page can switch between the List view and a new Calendar view, with the stopwatch bar unchanged above both. The Calendar view shows the current week as a seven-column grid, Monday to Sunday, with an hour ruler down the side. Each finished Time Entry that starts and stops on the same day renders as a block in its day-column, positioned by its start and sized by its Duration, showing its description. This ticket establishes the pure layout module that turns Time Entries plus a week into positioned blocks, and the thin render component that draws them.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] A List/Calendar toggle is visible on the timer page and switches the area below the stopwatch bar between the two views.
- [x] The stopwatch bar and its behavior are unchanged in both views.
- [x] The Calendar view shows seven day-columns, Monday through Sunday, for the current week, with an hour ruler.
- [x] A same-day finished Time Entry appears as a block in the correct day-column, vertically placed by its start and sized by its Duration, labeled with its description.
- [x] A week with no entries shows a clean, empty grid.
- [x] The layout logic lives in a pure module (no React, DB, or browser) that takes Time Entries and a target week and returns per-day positioned blocks.
- [x] The pure module has a `vitest` suite (run via `wasp test client`) covering same-day placement into the correct column, position, and size, and the empty-week case.

## Comments

- 2026-10-21: Implemented. Pure module at `app/src/timer/calendar/layout.ts` (weekStartFor + layoutWeek), tests in `layout.test.ts` (7 passing), render layer in `CalendarView.tsx`, List/Calendar toggle in `TimerPage.tsx`. Finished entries that cross midnight are skipped until ticket 04 splits them. Tests ran via `npx vitest run` (the running dev server holds the wasp project lock); re-run `wasp test client run` when the lock is free.
