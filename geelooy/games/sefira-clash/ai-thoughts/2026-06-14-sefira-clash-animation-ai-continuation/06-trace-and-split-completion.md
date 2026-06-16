B"H

06 — TRACE AND SPLIT COMPLETION

What was traced:
- The old 6000-frame warning came from a health rule that only checked final damageEnd <= 0.
- A manual 6000-frame stock/damage trace wrote .sim/ai-6000-trace-damage-stock.json.
- The trace showed real combat and bot pressure: at frame 6000 there was live damage in the trace run, with attacks and KOs. In the later simulator run after the metric fix, the report showed peakDamage 884, damageFrames 5957, koCount 14, attackCommands 2483, activeAttackFrames 3113, and no warnings.
- Therefore the bug was not bot silence. The issue was simulator health semantics: final damage can be low/zero after stocks are lost or fresh survivors reset, even though damage happened throughout the match.

Metric fix:
- Added peakDamage and damageFrames to the simulator report.
- Changed zero damage warning to mean no observed damage history and no KO/attack proof, not merely low final damageEnd.
- Changed low damage warning so KO-heavy completed combat is not mislabeled as low damage merely because final surviving fighter damage is low.

AI action findings:
- Focused sim after split: all 3 maps ok true, no failures, no warnings.
- 6000 beit-midrash-bouncer after split: ok true, no failures, no warnings; peakDamage 884, damageFrames 5957, koCount 14.
- No direct AI behavioral patch was justified by the evidence. The bot action trace showed pressure and attacks were happening; the wrong part was health interpretation.

Architecture split completed:
Animation split modules:
- layers/LandingLayer.js
- layers/ShieldLayer.js
- layers/ComboLayer.js
- kick/GroundArc.js
- kick/AerialSnap.js
- kick/MeteorSpear.js
- launch/BaseLaunch.js
- launch/WallBounce.js
- launch/GroundBounce.js

Simulator split modules:
- sim/NeutralInput.js
- sim/ScenarioSetup.js
- sim/ReportHealth.js
- sim/ReportFactory.js
- sim/ReportFinish.js
- sim/FrameSample.js
- sim/FrameObserver.js

Line-count result:
- All touched animation/sim source modules checked were under 120 lines.

Verification:
- node --check passed for split simulator and animation gateway modules.
- node .sim/v3-animation-overhaul-probe.mjs passed, vocabulary 50.
- node .sim/v3-render-probe.mjs passed.
- node .sim/spectacle-probe.mjs passed.
- node .sim/v3-extra-animation-probe.mjs passed.
- .sim/ai-focused-after-metric-split.mjs passed 3 maps with no warnings/failures.
- .sim/ai-6000-after-metric-split.mjs passed 6000 frames with no warnings/failures.

Still not verified:
- Full 18000-frame all-map sim was not run to completion in this pass.
