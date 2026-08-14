B"H
Boruch Hashem
Blessed is He

# Review Court — Source-Specific Execution Plan

> The Awtsmoos does not make judgment vague. Awtsmoos.com already possesses a bounded legal action matrix; this pass makes that matrix visible before a reviewer crosses it.

## Direct evidence
- `ReviewDetail.allowedActions()` is the current legal action source:
	- reviewer + submitted/triaged → triage, assign, changes, approve, reject
	- reviewer + approved → schedule, publish, reject
	- reviewer + scheduled → publish, reject
	- author + submitted/triaged → withdraw
	- author + changes_requested → resubmit
- `ReviewApi.decide()` sends all decisions through one POST endpoint with action, note, assignedAliasId, scheduledAt.
- `ReviewDecisionFlow` currently reports working/success/error but leaves every decision button active while the POST is in flight.
- Assignment and schedule fields are always visible even when the current state cannot use those actions.
- Current styles already distinguish positive/warning/danger colors, but the interface does not explain consequence before activation.
- Semantic evidence and raw payload auditability are already strong and should remain intact.

## Rewrite set
1. CREATE `geelooy/heichel-review/js/ReviewActionPolicy.js`
	- Pure immutable metadata for the existing legal actions only.
	- Categories: organization, revision, approval, publication, destructive, author.
	- Truthful consequence copy derived only from current action/state semantics.
	- Unknown actions return an explicit unknown policy and cannot be submitted by the client flow.
2. CREATE `geelooy/heichel-review/js/ReviewConsequences.js`
	- Dynamically inserts a “Before you act” consequence surface.
	- Focus/hover on an allowed action previews its exact consequence.
	- Adds `aria-describedby` and `data-review-kind` to legal buttons.
	- Hides assignment field unless assign is legal.
	- Hides schedule field unless schedule is legal.
	- Shows current state + legal-action count without recommending a verdict.
3. REWRITE `geelooy/heichel-review/js/ReviewDetail.js`
	- Preserve heading/history/summary/raw payload/legal matrix.
	- Compute allowed actions once and pass them to both buttons and consequence surface.
4. REWRITE `geelooy/heichel-review/js/ReviewDecisionFlow.js`
	- Reject unknown client actions before POST.
	- Use human action labels in status.
	- Mark decision panel aria-busy and disable all review-action buttons while POST is in flight.
	- Re-enable in `finally`; server-returned state remains source of truth.
5. CREATE `geelooy/heichel-review/styles/consequences.css`
	- Consequence panel, contextual fields, and category-specific action hierarchy.
6. REWRITE `geelooy/heichel-review/style.css`
	- Import consequence module through existing route gateway.
7. After full reread, CREATE `geelooy/heichel-review/tests/reviewActionPolicy.test.mjs`.

## Non-goals
- No endpoint changes.
- No invented note requirements.
- No invented irreversibility guarantee.
- No series structure/reorder changes; current “Series policy” is governance only.
- No replacement of semantic summary, history, or audit payload.

## Verification
- Reread all new/rewritten Review files.
- Keep every source module below 120 lines.
- Node syntax checks.
- Existing `reviewContract`, `reviewSummary`, `governanceContract` plus new policy test.
- Browser-check consequence preview, field visibility, action busy state, focus/mobile hierarchy.
