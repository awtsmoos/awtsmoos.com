/* B"H
Granular sound is a desert of sparks, each grain a miniature universe.
*/
export function granularPlan(buffer, grainMs=80, density=12) { return { buffer, grainMs, density, ready: !!buffer }; }
