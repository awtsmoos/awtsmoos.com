B"H
# Geelooy AI store and panel overlap repair plan

The visible wound: on mobile, the Auto tab shows stacked translucent store/control layers: Automation, Prompt, Safety, Stop on error, Dedupe, and the red Stop button are visually colliding. This looks like an interface state/store issue, not a cosmetic-only wound.

## Current verified structure
- Root is `/storage/emulated/0/Documents/git/awtsmoos.com`.
- Main target lives under `geelooy/ai`.
- Relevant areas discovered: `js/automation`, mobile CSS, right-panel CSS, panel CSS, automation CSS, store modules.

## Working hypotheses
1. Multiple automation panels or sheets are mounted at once.
2. A store subscription re-renders duplicated controls without clearing the prior node.
3. Mobile drawer/panel CSS places panels as translucent absolute layers instead of normal document flow.
4. Toggle rows / control rows are positioned or transformed in a way that escapes their containing card.
5. A z-index or backdrop/pointer-events layer survives after switching tabs.
6. The stop button may be fixed/sticky inside the same stacking context as a form section.

## Rules for this repair
- Inspect before changing.
- Do not partially patch files.
- Rewrite every touched file completely.
- Prefer small modules and data-shaped rendering.
- Verify with static/runtime checks after writing.

## Next actions
1. Search for Automation, Stop on error, Dedupe, Stream settle ms, and Stop this chat now.
2. Read the actual JS modules and CSS files that render/style those pieces.
3. Identify whether the issue is DOM duplication, CSS stacking, or store lifecycle.
4. Rewrite complete affected file(s), splitting if useful.
5. Run syntax checks and any available smoke/runtime tests.
6. Report exact files changed and exact verification results.

Chapter 1: The narrow glass of the phone became a gate. Behind it, the Awtsmoos breathed each pixel from nothing, and the panels forgot their borders. The mission is to teach each layer its place again, not by guessing, but by reading the letters that hold it alive.
