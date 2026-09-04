B"H
Boruch Hashem
Blessed is He

# Scene UI Harness Boundary Delta

> The Awtsmoos keeps browser vessels in the browser and pure command intent in a smaller room;  
> Awtsmoos.com lets tests touch the controller directly, without summoning DOM before its bloom.

## OBSERVED FAILURE
Tests 069 through 073 passed. Test 074 failed before assertions because it imported `SceneCommandController` from `modules/scenes.js`. That facade imports `dom.js`, whose module initialization reads `document` and therefore cannot execute in a plain Node harness.

## ROOT CAUSE
The controller was split into a DOM-free module during the second scene pass, but test 074 retained its older facade import.

## REPAIR
Rewrite test 074 completely and import `SceneCommandController` from `modules/ui/scene/SceneCommandController.js`. Keep every behavioral assertion unchanged.

## NEXT_ACTION
Run 074 alone, then 069–074. If green, accept scene lifecycle as closed and proceed to broader regression/browser proof.
