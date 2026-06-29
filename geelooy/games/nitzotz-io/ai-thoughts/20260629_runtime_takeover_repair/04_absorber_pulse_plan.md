B'H

# Polish Pass 3: Absorber Pulse Budget

## Evidence
Local medium after pass 2 stayed 128-141 commands. Public high was 167/171 at ready/start, but pulse jumped to 315. The likely source is `world.absorbers`, because absorber commands bypass `visibleObjects` and every absorbed object can become one or two render commands during suction.

## Safe target
Rewrite `js/renderList/objects.js` as a whole file again.

## Strategy
- Keep all visible object behavior from previous pass.
- Render absorbers through a sorted/capped helper.
- Prefer brighter/newer absorbers by life and sparks.
- Only shadow absorber echoes while there is quality headroom and fade is meaningful.

## Verification
- Smoke/import checks.
- Browser local/public pulse probe.
