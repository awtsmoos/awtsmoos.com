# B"H — Mockup Converter Step Implementation

## User command
Do the converter plan step by step.

## Implementation sequence
1. Add converter files that encode target mockup proportions/material/depth.
2. Add sculpted body modules for helmet, visor, chest, shoulders, arms, legs, gloves, boots, highlights.
3. Add keyframe files for idle/run/jump/punch/kick/stun and timeline selection.
4. Rewrite hero pose and renderer to use converter + sculpted body + keyframes.
5. Add probes for silhouette/material/keyframes.
6. Run full verification and repair failures.

## Done condition
The game no longer depends on generic capsule part drawing for the primary visual. Hero renderer must use sculpted parts and keyframe targets as first-class modules.
