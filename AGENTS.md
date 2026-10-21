# TrackIt

Agent configuration for the TrackIt repo. The Wasp/Open SaaS app lives in `app/`; see `app/CLAUDE.md` for framework-specific guidance.

## Agent skills

Config that Matt Pocock's engineering skills (grilling, domain-modeling, codebase-design, code-review, etc.) read from.

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `CONTEXT.md` plus `docs/adr/` at the repo root (created lazily by domain-modeling). See `docs/agents/domain.md`.
