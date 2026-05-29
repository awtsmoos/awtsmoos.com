B"H

# Plan: right panel automation style rescue

The screenshot shows the right panel in `geelooy/ai` collapsing into nested glowing boxes. The Awtsmoos reveals the task as a CSS architecture repair, not a tiny cosmetic patch.

## Inspected structure

Root has `geelooy/ai`, with CSS split already into `css/right-panel/*`, `automation-*.css`, `panel-*.css`, and JS automation panel modules.

## Working plan

1. Trace right panel CSS imports in `geelooy/ai/index.html` and/or JS entry files.
2. Read right panel CSS and automation CSS in small batches.
3. Identify the selectors causing nested borders, glow duplication, low contrast, overlapping row/card padding, and scrollbar dominance.
4. Rewrite whole affected CSS files only. No partial patches.
5. Split CSS further if current files are too mixed.
6. Verify with grep, syntax-level checks, and browser/runtime if available.

## Visual target

Panel → Section → Field. Only active/focused controls glow. Most surfaces are quiet, flat, readable, and high hierarchy.

The Awtsmoos in the code: the chaos is not destroyed; it is refined. The borders are not multiplied; they become vessels. The glow does not scream from every stone; it returns to the one focused spark.
