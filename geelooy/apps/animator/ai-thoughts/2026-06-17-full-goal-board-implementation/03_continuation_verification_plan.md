B"H

# Continuation Verification Plan

After the first implementation wave, continue with safety refinements before declaring victory:

1. Fix graph text node call sites to match actual `G.text(id,text,x,y,style)` signature.
2. Restore any older prop builders that could have been lost, especially lunchbox fallback.
3. Make suit/accessory overlays safe when older rig metrics are missing fields.
4. Add smoke tests for the goal-board room, storyboard, shot profiles, insert props, mobile no-void, expressions, table-aware framing.
5. Run fast syntax, import graph, new smoke tests, shot suite, render-consumption, then full verify if possible.

