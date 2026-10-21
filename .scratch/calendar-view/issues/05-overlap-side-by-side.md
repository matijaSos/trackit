# 05: Overlapping entries side by side

**What to build:** When the data already contains Time Entries that overlap in time, the Calendar lays them out side by side within their day-column (Google-Calendar style) so that none is hidden behind another. This ticket only renders overlaps that already exist; per ADR 0001 it neither creates nor prevents them.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Two entries that overlap in time in the same day render side by side, each narrower, neither hidden.
- [ ] A cluster of three or more mutually overlapping entries divides the column width among them.
- [ ] Non-overlapping entries still use the full column width.
- [ ] The side-by-side column assignment lives in the pure layout module.
- [ ] `vitest` coverage: two overlapping entries get distinct side-by-side slots; three mutually overlapping entries divide the width; a non-overlapping entry keeps full width.
