# 04: Overnight entries split at midnight

**What to build:** A Time Entry whose span crosses midnight appears as more than one block: one segment in each day-column it touches, each clipped to that day's bounds. The segments represent the same underlying Time Entry, so its description and identity are preserved across them.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] An entry crossing one midnight renders as two segments, one ending at midnight in the first day and one starting at midnight in the next.
- [ ] An entry spanning more than one midnight renders a segment in each day it touches.
- [ ] Each segment shows the entry's description and is clearly part of the same entry.
- [ ] The layout module emits per-day segments for multi-day entries; single-day entries are unaffected.
- [ ] `vitest` coverage: an entry crossing one midnight yields two correctly clipped segments, and an entry crossing two midnights yields three.
