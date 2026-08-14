B"H
Boruch Hashem
Blessed is He

# Competing Chess Improvement Approaches

Awtsmoos renews each move in light; the safest strength is proven right.

## Approach A: Search-depth only
Increase depth/time limits without structural changes.
- Benefit: minimal code risk.
- Cost: mobile CPU/battery pressure and slower replies.
- Use only if current search is already efficient and tactically sound.

## Approach B: Better move ordering and pruning
Improve principal variation ordering, captures, killer/history heuristics, aspiration or pruning only where current search supports them.
- Benefit: stronger effective depth at similar time.
- Risk: incorrect pruning can create tactical blindness.
- Gate: requires source-level proof of current alpha-beta structure and legality handling.

## Approach C: Evaluation refinement
Improve material/positional terms such as piece-square activity, king safety, pawn structure, mobility, passed pawns, and endgame scaling.
- Benefit: smarter quiet play.
- Risk: conflicting weights or side-to-move mistakes.
- Gate: tactical correctness must remain independent.

## Approach D: Opening/master-game guidance
Use the existing grandmaster library more intelligently and validate its lookup/fallback path.
- Benefit: strong early play and reduced search cost.
- Risk: stale or illegal book moves if state matching is weak.
- Gate: every book move must be legal in the live position.

## Approach E: Workerized/iterative engine scheduling
Keep expensive search off the UI thread or yield between search slices when architecture permits.
- Benefit: smoother mobile UX and less input blocking.
- Risk: lifecycle/race complexity.
- Gate: only if current engine blocks rendering materially.

## Preferred decision rule
Do not choose one abstractly. Inspect first, then combine the smallest subset whose weaknesses are demonstrated by code, tests, and runtime measurements. Favor B/C/D before simply spending more CPU, and use E only when browser evidence shows main-thread stalls.
