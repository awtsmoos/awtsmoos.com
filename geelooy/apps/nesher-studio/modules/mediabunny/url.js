/* B"H
Mediabunny URL vessel: one place for the CDN gate, so upgrades happen without scattering sparks.
*/
export const MEDIABUNNY_URL = 'https://esm.sh/mediabunny@1.46.0?bundle';
export function mediabunnyVersionHint() { return MEDIABUNNY_URL.match(/mediabunny@([^?]+)/)?.[1] || 'unknown'; }
