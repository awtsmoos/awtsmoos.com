B"H
# Geelooy AI mobile revamp plan

## Seen structure
- Root contains geelooy/ai with index.html, index.js, styles.css, css/ideal, css/right-panel, js/automation.
- Root tree at `.` failed because a missing stale `.awtsmoos/actions/results/...json` was encountered by the tree walker; scoped tree for `geelooy` succeeded.

## Screenshots imply
- Mobile crown navigation is visible.
- Chat composer sits behind the mobile browser toolbar in some views, hiding Send.
- Automation/settings markup is present but many form controls are raw/tight, implying the right-panel style manifest is not imported by styles.css.
- Some mobile breakpoints are split: top-level tokens only switch at 760px while mobile scene CSS activates at 900px.

## Action
1. Rewrite full `geelooy/ai/styles.css` to import the right-panel manifest, settings, transport, attachments, and mobile repair overrides in a deterministic order.
2. Add a small final mobile repair module that forces reachable scenes, visible composer, polished fields, and safe spacing under browser UI.
3. Verify CSS imports resolve and static selectors exist.

## Safety
- No partial patching.
- Rewrite entire files only.
- Keep new files below 150 lines.
