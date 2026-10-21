# 06: Render polish - 24h scroll, open-near-now, hover tooltip

**What to build:** The Calendar grid covers a full 24 hours and scrolls vertically so entries at any hour are reachable, and it opens scrolled near the current time so today's entries are visible without scrolling. Hovering a block shows the entry's description, its start and stop, and its Duration. These are render-layer concerns only; no new layout logic.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The grid represents a full 24-hour day and scrolls vertically.
- [ ] On opening, the grid is scrolled to roughly the current time rather than to midnight.
- [ ] Hovering a block shows a tooltip with the entry's description, start and stop, and Duration.
- [ ] A very short entry still renders as a legible block and its details are readable via the tooltip.
- [ ] No changes to the pure layout module are required by this ticket.
