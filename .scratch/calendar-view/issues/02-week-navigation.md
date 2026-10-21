# 02: Week navigation - prev / next / Today

**What to build:** A user viewing the Calendar can move between weeks. Previous and next controls step the grid one week back or forward, and a "Today" control jumps back to the current week. The view opens on the current week. The week arithmetic (which week is current, stepping a week in either direction, all Monday-anchored) lives in pure helpers alongside the layout module.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The Calendar view opens on the current week.
- [ ] A previous-week control moves the grid back one Monday-to-Sunday week; a next-week control moves it forward one.
- [ ] The visible week is clearly labeled so the user knows which week they are looking at.
- [ ] A "Today" control returns to the current week and is unobtrusive or hidden when already on it.
- [ ] Entries render in the correct day-columns for whichever week is shown.
- [ ] Current-week detection and previous/next stepping are pure helpers with `vitest` coverage, including month- and year-boundary steps.
