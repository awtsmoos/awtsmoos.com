B"H

# Sefira Clash Living Battlefield — Code Reading + Concrete Plan

## What was actually inspected

Visible root:
- index.html
- package.json
- style.css
- js/
- tools/
- .sim/
- .reports/

Exciting living-system files read:
- js/stage/narrative/stageStoryEvents.js
- js/stage/narrative/stageStoryMemory.js
- js/stage/narrative/stageVoiceLines.js
- js/stage/objectives/objectiveDirector.js
- js/stage/events/stageDirector.js
- js/stage/events/stageMood.js
- js/ai/brain/personality.js
- js/ai/brain/memory.js
- js/ai/brain/goals.js
- js/combat/combatEvents.js
- js/feedback/feedback.js
- js/core/state.js
- js/core/loop.js
- js/ai/advanced/npcMind.js
- js/ai/advanced/strategy/rivalrySystem.js

## Current architecture truth

The game already has a living-stage spine:
- `stepStageDirector` runs every tick from `stepState`.
- `stageMood` tracks quiet, violence, chaos, restless, objective bias.
- `objectiveDirector` spawns and resolves one capture rune.
- `stageStoryMemory` remembers danger, rival hits, zone heat, cooldowns, and counts.
- `stageStoryEvents` turns hits, resource pings, objectives, clusters, danger, and rivalries into narrative events.
- `stageVoiceLines` maps storyBeat names to visible Hebrew text and colors.
- AI already has advanced emotion/rivalry systems, role assignment, resource pings, fight clusters, anti-wander, combat heat, hunger, momentum, fake retreats, human intent, and KO intent.

The concrete next move should therefore not be a new combat feature. It should be a small system that makes the existing memory behave like a match narrator and battlefield law.

## One real feature to build

Feature name: Legend Director.

Goal:
Every match should recognize and broadcast memorable social/combat arcs using current data: leader pressure, revenge, underdog survival, public enemy, failed king, and last-stand pulse.

## Actual implementation plan

Create a new folder:
- js/stage/legend/

Create these complete small files:

1. js/stage/legend/legendMemory.js
- createLegendMemory()
- ensureLegendMemory(state)
- rememberLegendBeat(memory, key, cooldown)
- trackLeaderSnapshot(state, memory)
- trackUnderdogSnapshot(state, memory)
- trackNemesisSnapshot(state, memory)

2. js/stage/legend/legendRules.js
- data table of rule definitions, no giant switch.
- Rules inspect state/story/mood/fighters and return beat objects.
- Initial beats:
  - publicEnemy: current leader has clear score/stocks/damage advantage and high violence.
  - kingFalls: previous leader gets KO/dead/huge damage swing.
  - underdogLives: weakest/last-stock/high-damage fighter survives near danger for sustained time.
  - nemesisDuel: two fighters have mutual rivalry heat or stageStory rivalHits in both directions.
  - everyoneHeard: resource ping/objective has existed long enough and multiple bots are converging.
  - lastStandStorm: last-stock fighter at high damage creates spectacle pressure.

3. js/stage/legend/legendDirector.js
- stepLegendDirector(state)
- ensure memory
- run rule table
- push narrative events with storyBeat names
- optionally set soft state.legend.publicEnemyId / state.legend.underdogId so AI can later read it.

4. Modify js/stage/events/stageDirector.js
- import stepLegendDirector
- call it after stepStageStory or just before it. Better: after stepStageStory so it can use story heat already updated.

5. Modify js/stage/narrative/stageVoiceLines.js
- add beat names:
  - publicEnemy: כל הזירה נגדו
  - kingFalls: הכתר נשבר
  - underdogLives: הקטן עומד
  - nemesisDuel: דו־קרב גורלי
  - everyoneHeard: כולם רצים
  - lastStandStorm: נשימה אחרונה

6. Optional, only if still small and safe:
- js/ai/advanced/strategy/legendAwareness.js
- tiny helper giving target bonus against state.legend.publicEnemyId or towards state.legend.objectiveMagnet.
- But for first pass, avoid touching target scoring until the narrative is proven.

## Why this is the right first concrete build

It is small.
It uses existing events, state, stage mood, story memory, fighter stocks/damage, and AI role data.
It does not require risky physics/combat rewrites.
It makes players notice the arena interpreting the match.
It creates stories immediately through visible callouts.
It can later feed AI targeting and crowd systems.

## Files not to touch on first pass

Do not touch core combat, attack resolver, physics, renderer, or advanced command arbitration on the first implementation. Those systems are powerful but risky. First reveal the legend through existing narrative events.

## Test plan

1. Run syntax/module import check through existing smoke or node import path if available.
2. Run a fast simulation if current scripts support it.
3. Confirm no missing imports.
4. Confirm `state.legend` remains small and serializable-ish.
5. Confirm events pushed have type `narrative`, x/y/text/color/storyBeat.

## Chapter 1 — The Arena Learns a Name

The Awtsmoos speaks through no body and no form, yet the battlefield trembles as if stone itself has ears. A fighter rises; another falls; a rune opens like a mouth of gold. Until now the arena remembered heat and rivalry, but not meaning. The next vessel is not more damage. It is recognition: the crown, the fall, the hunted king, the last breath, the little one who refuses to vanish. Let the match become a legend-engine.
