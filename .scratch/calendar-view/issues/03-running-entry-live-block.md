# 03: Running entry as a live block

**What to build:** The Running entry (the one Time Entry with no stop) appears on the Calendar as a block that runs from its start to the current moment and is visually distinct from finished entries. As time passes the block re-derives so it reflects "now" rather than a frozen point.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A Running entry renders as a block from its start to the current time in the correct day-column.
- [ ] The Running entry is visually distinguishable from finished entries.
- [ ] The block reflects the passage of time rather than staying frozen at the moment the view loaded.
- [ ] The layout module treats "now" as an injected input (not read from the ambient clock inside the module) so its behavior is deterministic under test.
- [ ] `vitest` coverage: a Running entry is laid out to the injected "now", and a day containing both a Running and a finished entry places both correctly.
