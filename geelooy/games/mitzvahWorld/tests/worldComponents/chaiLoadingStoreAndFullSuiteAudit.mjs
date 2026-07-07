// B"H
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const loader = readFileSync('geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js','utf8');
const store = readFileSync('geelooy/libs/awtsmoosCinematicWorld/store/ChaiAssetStore.js','utf8');
const index = readFileSync('index.html','utf8');
const movie = readFileSync('tools/awtsmoosFullOneMinuteMitzvahWorldMovie.html','utf8');
const render = readFileSync('tools/renderMasaiOneMinuteJourneyMovie.mjs','utf8');
assert(loader.includes('DataTexture') && loader.includes('awtsmoosFallback') && loader.includes('onError'));
assert(store.includes('localStorage') && store.includes('preloadChaiAssets') && store.includes('storeMovieProof'));
assert(index.includes('ChaiAssetStore.js?compact=true&v=chai-store-fast-loading-20260707-bh1'));
assert(movie.includes('half:false') && movie.includes('count:220') && movie.includes('flowerCount:48') && movie.includes('rockCount:24'));
assert(movie.includes('fullResolutionTextures:true') && movie.includes('grassMeshSuite') && movie.includes('storeMovieProof'));
assert(render.includes('awtsmoos-full-suite-chai-forest-mitzvah-world.mp4') && render.includes('latest-awtsmoos-full-suite-chai-forest-proof'));
console.log(JSON.stringify({ok:true,test:'chaiLoadingStoreAndFullSuiteAudit'},null,2));
