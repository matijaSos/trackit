# Spec: Calendar view (read-only week grid)

Status: ready-for-agent

## Problem Statement

I track my time in TrackIt as a stopwatch and read it back as a day-grouped List view. That list tells me *what* I did and for *how long*, but it does not let me see the *shape* of my day or week: when things happened, where the gaps are, how a day actually filled up. In Toggl I rely on the Calendar view for exactly this, and its absence is the main reason TrackIt is not yet my daily tracker.

## Solution

Add a **Calendar view** to TrackIt: a one-week grid, days as columns (Monday to Sunday) and hours down the side, where each Time Entry renders as a block positioned by its start and stop. It sits beside the existing List view as a second, switchable lens on the same data, with the stopwatch bar unchanged above both.

This first increment is **read-only**: the calendar shows entries but is not yet a place to create or edit them. It is the first step toward a fully interactive Toggl-style calendar; later increments add drag-to-move, drag-to-resize, and drag-to-create.

## User Stories

1. As a TrackIt user, I want to switch between the List view and the Calendar view, so that I can choose the lens that fits what I am trying to see.
2. As a TrackIt user, I want the stopwatch bar to stay in place when I switch to the Calendar view, so that I can keep starting and stopping entries regardless of which view I am in.
3. As a TrackIt user, I want to see one week at a time as a grid of seven day-columns, so that I can take in a whole week at a glance.
4. As a TrackIt user, I want the week to run Monday to Sunday, so that it matches how I think about my week.
5. As a TrackIt user, I want hours laid out down the side of the grid, so that I can read when in the day each entry happened.
6. As a TrackIt user, I want each Time Entry to appear as a block positioned by its start and stop and sized by its Duration, so that I can see both when it happened and how long it took.
7. As a TrackIt user, I want to see each entry's description on or within its block, so that I can tell entries apart without extra clicks.
8. As a TrackIt user, I want the Calendar view to open on the current week, so that I see today's context first.
9. As a TrackIt user, I want to move to the previous or next week, so that I can review past weeks or look ahead.
10. As a TrackIt user, I want a "Today" control that jumps back to the current week, so that I can return to now after navigating away.
11. As a TrackIt user, I want the grid to cover a full 24 hours and scroll vertically, so that entries at any hour are reachable.
12. As a TrackIt user, I want the grid to open scrolled near the current time, so that today's entries are visible without scrolling.
13. As a TrackIt user, I want the Running entry to appear as a live block growing from its start to now, visually distinct from finished entries, so that I can see my in-progress work on the grid.
14. As a TrackIt user, I want an entry that crosses midnight to appear as two segments, one in each day-column it touches, so that overnight work is shown where it actually happened rather than hidden.
15. As a TrackIt user, I want two entries that happen to overlap in time to be laid out side by side within their day-column, so that neither is hidden behind the other.
16. As a TrackIt user, I want hovering a block to show its description, its start and stop, and its Duration, so that I can read an entry's details without an editing step.
17. As a TrackIt user, I want a very short entry to still render as a legible block, so that brief entries are not invisible.
18. As a TrackIt user, I want a week with no entries to show an empty grid cleanly, so that the view is not confusing when there is nothing to show.
19. As a TrackIt user, I want days with entries and days without to be equally readable, so that a sparse week is as clear as a full one.
20. As a TrackIt user, I want the Calendar view to reflect changes made via the stopwatch or the List view, so that all three stay consistent.

## Implementation Decisions

- **New view, not a replacement.** The List view stays. The Calendar view is a second view, switchable via a List/Calendar toggle, with the shared stopwatch bar above both. The view toggle is local UI state, not a route decision this spec mandates.
- **The pure layout module is the heart of the feature.** A single pure module turns the inputs (the user's Time Entries and a target week) into the output (per day-column, a set of positioned blocks). "Positioned" means: which day-column, vertical offset and height derived from start/stop within the day, and the horizontal split when entries overlap. This module holds every non-trivial rule below and has no dependency on React, the database, or the browser.
- **Overnight entries split at midnight.** An entry whose span crosses one or more midnights is emitted as multiple segments, one per day it touches, each clipped to that day's bounds. The segments refer back to the same underlying Time Entry.
- **The running entry extends to now.** An entry with no stop is laid out as if it stopped at the current moment, and is marked as running so the render layer can distinguish it. Its block is naturally re-derived as time passes.
- **Overlaps are laid out side by side; they are never prevented here.** Per ADR 0001, time is intended to be exclusive, but enforcement belongs to the future create/edit increment. This read-only view never creates an overlap; when the data already contains one, the layout places the overlapping blocks side by side within the day-column (Google-Calendar style) so none is hidden.
- **Week math is pure too.** Determining the current week (Monday-anchored), and moving to the previous or next week, are small pure helpers alongside the layout module, so navigation state is computed, not hand-rolled in the component.
- **The render layer is thin.** The React component consumes the computed layout and draws it: the hour ruler, the day-columns, the blocks, the hover tooltip, the 24-hour vertical scroll, the initial scroll near the current time, and the prev/next/Today controls. It makes no layout decisions of its own.
- **No schema or server changes.** The feature reads existing Time Entries through the existing query. No new entities, fields, or operations. Rendering in the user's local time follows the existing List view's behavior.

## Testing Decisions

- **What makes a good test here:** it exercises external behavior of the pure layout module - given a set of Time Entries and a week, assert the blocks that come out (their day-column, relative position and size, split segments, side-by-side columns, running flag). Tests assert the shape of the returned layout, not internal helper calls or React internals.
- **What gets tested:** the pure layout module and the week-math helpers. These are the seam. Concretely, cover: a simple same-day entry; an entry that crosses one midnight (two segments) and one that crosses two; the running entry extending to now (with a fixed, injected "now"); two overlapping entries placed side by side; a zero-or-near-zero-Duration entry; an empty week; entries landing in the correct Monday-to-Sunday columns; current-week detection and previous/next-week stepping.
- **Determinism:** "now" and the notion of "today/current week" are passed in, never read from the ambient clock inside the module, so tests are deterministic.
- **Prior art:** there are no unit tests in `app/src` yet, so this introduces the first `vitest` suite there (run via `wasp test client`). The repo's Playwright e2e tests are the only existing automated tests and are not a model for this, since they drive the browser; the layout module is tested directly instead.
- **The render layer** is intentionally left to a possible later e2e smoke test (view toggles, blocks appear), out of scope for this increment's required tests.

## Out of Scope

- Any creating or editing of entries from the calendar: drag-to-move, drag-to-resize, drag-to-create, click-to-edit. The later increments toward full Toggl.
- Enforcing the no-overlap invariant from ADR 0001 (belongs with create/edit).
- A single-day grid view, and any view longer than a week (month, etc.).
- Configurable week start; it is fixed to Monday.
- Projects, tags, colors-by-category, or any grouping of entries beyond their position in time.
- Cleaning up the unused Open SaaS models and features, and hosting. Both are separate efforts that follow this one.

## Further Notes

- This is increment one of a multi-step march toward a fully interactive Toggl-style calendar. The layout module is deliberately shaped so that the create/edit increments extend it rather than replace it.
- Vocabulary follows `CONTEXT.md` (Time Entry, Running entry, Duration, List view, Calendar view, Overlap). The overlap handling here is consistent with ADR 0001.
