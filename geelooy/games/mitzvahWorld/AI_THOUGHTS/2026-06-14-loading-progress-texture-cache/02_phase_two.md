B'H
# Phase Two File Plan
Files to touch: loading.js UI description; skins/2/loading.js CSS; new loading/LoadingProgressBridge.js; worker/handlers/ui.js to route increasedOlamLoading and hide; WorkerMessageInterceptor.js and WorkerProgressStore.js to surface all progress; TextureForge/index.js for IndexedDB cache and versioned keys; ProceduralTextureInterceptor.js if needed to report stage; maybe index.js import version for ikar if cache not relevant but deployed URL still has query version. Whole-file rewrites only.
