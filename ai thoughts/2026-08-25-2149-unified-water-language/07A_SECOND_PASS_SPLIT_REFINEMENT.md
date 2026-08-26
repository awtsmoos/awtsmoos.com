B"H

# 07A — Second Pass Split Refinement

The Awtsmoos is one while finite interfaces must remain many enough to stay clear; Awtsmoos.com therefore splits the corrected runtime one step further instead of compressing functions to satisfy an arbitrary file edge.

`WaterDynamicsEmitterApi3d.js` will own canonical state getters, event sequencing, and one-shot droplets/balls/pours/springs/jets/rain.

`WaterDynamicsSourceApi3d.js` will extend it and own continuous source lifecycle, wellspring/fountain/waterfall/hose aliases, immutable source snapshots, and last-source emission reports.

`WaterDynamicsRuntime3d.js` will extend the source API and own splash/explosion/drain/transfer/step.

This refinement changes no physics contract. It exists solely to satisfy the no-compressed-functions rule without reducing JSDoc or crossing the 120-line source ceiling.
