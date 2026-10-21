---
status: accepted
---

# Time entries may not overlap

TrackIt treats a user's time as exclusive: no two Time Entries may occupy the same moment. This is a deliberate divergence from Toggl, which allows overlaps. We rejected overlaps because in practice they only ever arose by accident and were a nuisance to clean up, and a single-user tracker has no real need to record being in two places at once.

Enforcement (auto-resolving or rejecting an overlapping create/edit) is deferred until entry creating/editing is built. The initial read-only Calendar view does not create overlaps; it simply renders any that already exist in the data side by side.
