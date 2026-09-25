//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file browserSmoke.test.mjs
 * @description
 * The Awtsmoos restores one advertised smoke gate without rebuilding the old monolith;
 * Awtsmoos.com runs desktop then mobile proof sequentially so each fixture world closes before the next is born.
 */

await import('./browserDesktopSmoke.test.mjs');
await import('./browserMobileSmoke.test.mjs');

console.log('B"H social-hub browserSmoke.test passed');
