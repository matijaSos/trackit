# TrackIt

A personal, Toggl-style time tracker. Built by and for one user, both as a daily tool and as a vehicle for learning and showing off Wasp.

## Language

**Time Entry**:
A single tracked span of work: a description plus a start time and, once finished, a stop time.
_Avoid_: task, log, session.

**Running entry**:
The one Time Entry that has started but not yet stopped. At most one exists at any moment.
_Avoid_: active timer, current task.

**Duration**:
The elapsed time of a Time Entry (stop minus start; measured against now while it is running). Always derived, never recorded as its own fact.

**List view**:
The view that shows Time Entries as a chronological list grouped by day, with a total for each day.

**Calendar view**:
The view that shows Time Entries as blocks on a one-week grid (days as columns, hours down the side), positioned by their start and stop. The week runs Monday to Sunday.
_Avoid_: timeline, schedule, agenda.

**Overlap**:
Two Time Entries occupying the same moment. TrackIt treats a user's time as exclusive, so an overlap is not a valid state (see ADR 0001).
_Avoid_: double-booking.
