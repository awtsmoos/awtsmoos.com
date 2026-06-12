B"H

# Legend Director Implementation Phases

## Phase 1 — Read the living spine
Already read the exact files that carry combat events, stage story, stage mood, objectives, feedback, AI rivalry, state creation, and loop integration. The truth is clear: the game already has a battlefield mouth. It needs a battlefield memory of status.

## Phase 2 — Split the system, do not bloat existing files
Add a `js/stage/legend` folder with small modules:

- `legendBeats.js`: data table of beat presentation and exported beat names.
- `legendMemory.js`: creates/ensures match-level memory, leader snapshots, underdog snapshots, rivalry snapshots, and cooldowns.
- `legendScores.js`: pure fighter scoring helpers.
- `legendEventFactory.js`: converts a detected legend beat into a normal narrative event.
- `legendRules.js`: data-driven rules that inspect state and memory.
- `legendDirector.js`: single public step function used by stage director.

This creates more files, but each file is small and complete.

## Phase 3 — Touch existing files carefully, by complete rewrite only
Rewrite full files:

- `js/stage/events/stageDirector.js`
  - import `stepLegendDirector`
  - call it after `stepStageStory`
  - keep all existing behavior intact

- `js/stage/narrative/stageVoiceLines.js`
  - add legend beat lines to `STORY_LINES`
  - retain every existing line

Possibly rewrite:
- `js/core/state.js`
  - not required; legend can lazily attach `state.legend`

## Phase 4 — Behavioral design
Legend beats should not spam. Each rule uses cooldowns and minimum frame intervals.

Rules:
1. Public enemy — a fighter becomes obviously ahead; everyone can see the arena hates the throne.
2. King falls — previous leader dies, loses stock, or suffers huge damage jump.
3. Underdog lives — worst-position fighter survives high damage/last stock for sustained time.
4. Nemesis duel — mutual rivalry in stage story or AI mind creates a visible destiny beat.
5. Everyone rushes — objective/resource ping has multiple converging fighters.
6. Last stand storm — last-stock fighter with high damage creates final-breath drama.
7. Crown stolen — a new leader overtakes the old one after a meaningful gap.
8. Arena chooses witness — human-proximity dramatic event when the human is near a legend beat.

## Phase 5 — Verification
Run:
- node .awtsmoos-ai2-smoke.mjs
- possibly a direct dynamic import of `legendDirector.js`
- maybe a small headless synthetic test if smoke is insufficient

## Chapter 2 — The Crown Learns to Bleed
The Awtsmoos, without body or form, renews the arena from nothing every instant. The platforms do not merely hold feet; they hold accusations. A crown is not a number. It is a pressure that bends enemies toward the wearer. A last stock is not merely a counter. It is a candle in a storm, trembling, refusing extinction. The Legend Director will not create combat. It will reveal what combat already means.
