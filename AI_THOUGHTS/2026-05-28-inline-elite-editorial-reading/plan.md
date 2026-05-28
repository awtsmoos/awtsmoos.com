B"H

# Inline Elite Editorial Reading Plan

## Mission
Improve the inline commentary system without damaging orchestration, duplicate safeguards, or existing tests.

## Current Observations
- UnifiedOrchestrator is already small and should remain untouched unless necessary.
- SparkFixer is the safest integration point for per-gate and per-card polish after anchors resolve.
- GuardianGate already supports summaries, counts, collapse, sidebar bridge, and ArrowDown to first card.
- ThreadIntelligence already provides previews, timestamps, reading focus, and anchor linking.
- CSS is modular and already imports several specialized inline layers.

## Weaknesses to Address
- Inline cards do not carry enough semantic metadata for reading mode, script direction, long-body handling, or insertion rhythm.
- Gate/list/card keyboard traversal can become mechanical once multiple comments cluster.
- Collapsed summaries can be made more scholarly with anchor labels and visual threading.
- Mixed Hebrew/English needs first-class direction markers at the actual card/gate level.
- Visual density and long comments need calmer, premium constraints.
- Motion should be measured and reduced-motion safe.

## Implementation Shape
1. Add a small complete module: inline/weaving/polish/EditorialReadingPolish.js.
2. Rewrite SparkFixer.js completely to import and call that module after gate/card creation.
3. Rewrite inline-intense.css completely to import a new CSS layer.
4. Add inline/elite-editorial-reading.css as a complete CSS module for premium typography, cluster rhythm, focus, RTL, reduced motion, and responsive behavior.
5. Run node --check on modified JS files.
6. Run the three verified node --test files.

## Safety
- No partial patches.
- No architecture replacement.
- No destructive commands.
- Existing duplicate prevention remains in SparkFixer.
- Existing tests remain the verification floor.
