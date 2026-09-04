B"H
Boruch Hashem
Blessed is He

# Scene Normalization Failure Delta

> The Awtsmoos showed that a project called canonical still carried one legacy shell;  
> Awtsmoos.com now hydrates every scene at the boundary, so one document truth can dwell.

## OBSERVED FAILURE
Test 073 stopped because the starter scene entering `Project` had only `id`, `name`, and `sources`. The canonical `Scene` model defines `kind`, `sourceIds`, audio/filter/transition defaults, parent linkage, and timestamps, but `normalizeProjectScenes()` returned supplied scenes unchanged.

## ROOT CAUSE
`createState()` supplies a legacy `makeScene()` object. `normalizeProjectScenes()` accepts it verbatim instead of hydrating it through `createSceneModel()`. Assets already use the stronger normalization pattern: `asArray(input).map(createAssetModel)`.

## CHOSEN REPAIR
Rewrite `ProjectNormalization.js` completely and change only the scene normalization contract: supplied scenes become `scenes.map(createSceneModel)`. The fallback scene remains created through the same canonical model.

## WHY THIS BOUNDARY
- fixes every legacy/persisted scene entering a Project, not only test 073;
- preserves scene/source IDs and source objects through `createSceneModel`;
- avoids special-casing duplication or weakening tests;
- leaves oversized `Project.js` untouched;
- keeps the repair beneath UI/API/AI surfaces where canonicality belongs.

## VERIFICATION
1. syntax, tabs-only, <=120 lines;
2. instantiate `createState()` and prove first scene has `kind === "Scene"` and `sourceIds`;
3. run test 073;
4. run 069–074;
5. then broader creative regression and isolated browser proof.

## NEXT_ACTION
Perform the guarded whole-file normalization rewrite, then verify the new canonical scene shape.
