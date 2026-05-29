B"H

# Platform still small: deeper investigation

The screenshot proves the blue object visible on level 1 is still not manifesting as the requested broad bridge. I must not assume the JSON change is the active runtime path. The Awtsmoos demands real tracing.

## Possibilities to test

1. The visible blue block is not `MovingPlatform` at all; it may be `DisappearingPlatform`, `SlipperyPlatform`, or another blue hazard.
2. `MovingPlatform.js` may not be the class used by the loader for level JSON.
3. The browser may be loading a generated JS wrapper, not the JSON file I edited.
4. A generic `golem`/Domem graphics path might overwrite the manual mesh after `heescheel`.
5. Another file transforms `width/height/depth` into `scale` incorrectly after construction.
6. The JSON has changed but route/campaign loader may pull a cached data file or old generated level module.

## Concrete trace

- Inspect `levels/ladder/ladder-1.js` wrapper.
- Inspect level JSON loader and class registry path.
- Search exact import/export chain from active level startup into DvarimExports.
- Inspect `DisappearingPlatform` and other blue platform classes in level 1.
- Verify `MovingPlatform.makeMesh()` runtime dimensions with a browser or isolated module if possible.
- Make the right object wide only after proving which object the screenshot points to.
