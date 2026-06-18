// B"H
/**
 * @file ResidencyDiff.js
 * @description Chapter 458: the desired revelation is compared to the current
 * one, and needless thrashing is denied by clear load, unload, and promotion.
 */
export function diffResidency(current, desired) {
  const load = [], unload = [], promote = [], keep = [];
  for (const [key, band] of desired) {
    const old = current.get(key);
    if (!old) load.push({ key, band });
    else if (old.name !== band.name) promote.push({ key, from:old, to:band });
    else keep.push({ key, band });
  }
  for (const [key, band] of current) if (!desired.has(key)) unload.push({ key, band });
  return { load, unload, promote, keep };
}
export function applyResidencyDiff(current, diff) {
  for (const item of diff.unload) current.delete(item.key);
  for (const item of diff.load) current.set(item.key, item.band);
  for (const item of diff.promote) current.set(item.key, item.to);
  return current;
}
