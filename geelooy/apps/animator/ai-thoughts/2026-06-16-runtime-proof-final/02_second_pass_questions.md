B"H

# Second Pass Questions

What could still defeat the new scene?

1. Browser loads a different entry file.
2. Browser caches old JS modules.
3. `DefaultSceneInstaller` is never called.
4. State persistence rehydrates old scene after install.
5. SceneComposer receives missing sceneData and falls back legacy.
6. Render graph ignores SceneComposer output.
7. App path uses an older bundled copy.
8. HTTP server cache headers hold old modules.

Countermeasure: put proof markers in both boot and render branch, and ensure any missing/legacy scene style is forced to authored mode inside SceneComposer when debug flag is on.
