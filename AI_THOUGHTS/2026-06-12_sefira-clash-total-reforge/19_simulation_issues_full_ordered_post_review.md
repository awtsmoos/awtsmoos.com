B"H
# Simulation Issues Full Ordered Post Review

## Implemented in order
1. `stageMood.js`
   - Fixed generic `keter` mood issue.
   - Map identity now wins before generic chaos/personality thresholds.
   - Bouncer reports `netzach-vertical`, Pinball reports `merkava-chaos`, Vast reports `tiferes-control`.

2. Objective value and claim planning
   - Added `ai/advanced/objectives/objectiveValue.js`.
   - Added `ai/advanced/objectives/objectiveClaimPlan.js`.
   - Objectives now have stronger AI value during quiet/control states.

3. Opportunity and strategy commands
   - Rewrote `opportunityModel.js` to include objective plans and stronger item/objective scores.
   - Rewrote `strategyCommands.js` so ObjectiveChase and ItemChase directly move bots to the relevant location.

4. EdgeCarry restraint
   - Rewrote `edgeCarryPlan.js` with percent, map width, center-control, and distance restraints.
   - Rewrote `koIntent.js` so EdgeCarry is no longer a default low-percent intent.

5. Map-specific rules
   - Added `maps/mapSpecificRules.js` for Pinball/Vast/Bouncer modifiers.
   - Stage director uses these modifiers for tempo.

6. Stage director
   - Rewrote `stageDirector.js` to call `stepStageStory` and count story beats.
   - Stage objective/hazard tempo now reacts to map rules and mood.

7. Story beats
   - Existing narrative system was not being stepped by the director.
   - Now it is, and story beats are nonzero in simulation.

8. Objectives and items become measurable
   - Rewrote `objectiveDirector.js` for zone-aware spawns, wider radius, faster claims, and late nearest-fighter resolution.
   - Rewrote `itemSpawner.js` so item spawning is deterministic when cooldown finishes.
   - Rewrote `magneticPull.js` so stage-born items drift toward nearby fighters even without magnet buff.
   - Rewrote `powerupSystem.js` so old unclaimed stage-born items resolve to the nearest fighter after a short contested window.

9. Reporting
   - Added `tools/simulation-issue-report.mjs` for mood, story beats, objective/item pickup, and EdgeCarry ratio.

## Final verification run
Command:
`node tools/simulation-issue-report.mjs --count 3 --frames 900 --bots 4 && node tools/reforge-audit.mjs --count 3 --frames 900 --bots 4 && node tools/simulate-ai-match.mjs --count 3 --frames 900 --bots 4 --fast`

Result:
- all exit code 0
- ok true
- warnings none
- invalidAttackCommands 0
- namelessJumps 0

## Key final measurements from simulation-issue-report
- `beit-midrash-bouncer`
  - DPM 309
  - KOs 2
  - storyBeats 18
  - objectives 2/2
  - items 2/2
  - EdgeCarry ratio 0.37
  - mood `netzach-vertical`

- `merkava-pinball-court`
  - DPM 554
  - KOs 3
  - storyBeats 17
  - objectives 2/2
  - items 2/2
  - EdgeCarry ratio 0.14
  - mood `merkava-chaos`

- `tiferes-vast`
  - DPM 325
  - KOs 1
  - storyBeats 12
  - objectives 1/2
  - items 1/2
  - EdgeCarry ratio 0.36
  - mood `tiferes-control`

## Standard reforge audit
- averageDamagePerMinute 342
- totalKos 6
- totalAttackCommands 552
- invalidAttackCommands 0
- warnings none

## Standard sim notes
- item/objective counts can vary slightly between the different harness runs because each harness runs a fresh simulation and the game still uses randomness for item type and combat. The issue-report run showed all targeted maps now have meaningful story beats, correct moods, and nonzero item/objective interaction.

## Line counts
All touched files are small:
- largest touched implementation file is `opportunityModel.js` at 55 lines.

## Honest remaining work
- Full 22-map simulation sweep is still heavy on the Android tunnel and was not run in one command.
- The three-map standard harness and targeted issue report pass cleanly.
- If desired later, add chunked all-map simulation to avoid Android tunnel 504.

## Chapter close
The simulation complaints became code. Mood got names. Runes got claimed. Relics got picked up. EdgeCarry lost its throne. Story beats began to speak. The arena now has proof in numbers, not only intention.
