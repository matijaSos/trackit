# 01: Calendar view skeleton - toggle + week grid with same-day blocks

**What to build:** A user on the timer page can switch between the List view and a new Calendar view, with the stopwatch bar unchanged above both. The Calendar view shows the current week as a seven-column grid, Monday to Sunday, with an hour ruler down the side. Each finished Time Entry that starts and stops on the same day renders as a block in its day-column, positioned by its start and sized by its Duration, showing its description. This ticket establishes the pure layout module that turns Time Entries plus a week into positioned blocks, and the thin render component that draws them.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A List/Calendar toggle is visible on the timer page and switches the area below the stopwatch bar between the two views.
- [ ] The stopwatch bar and its behavior are unchanged in both views.
- [ ] The Calendar view shows seven day-columns, Monday through Sunday, for the current week, with an hour ruler.
- [ ] A same-day finished Time Entry appears as a block in the correct day-column, vertically placed by its start and sized by its Duration, labeled with its description.
- [ ] A week with no entries shows a clean, empty grid.
- [ ] The layout logic lives in a pure module (no React, DB, or browser) that takes Time Entries and a target week and returns per-day positioned blocks.
- [ ] The pure module has a `vitest` suite (run via `wasp test client`) covering same-day placement into the correct column, position, and size, and the empty-week case.
