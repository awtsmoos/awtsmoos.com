// B"H
/**
 * @file levelFetcher.js
 * @description Chapter 367: Fetching ladder JSON is one small verified act.
 */
import { LEVEL_BASE } from './domKit.js';
import { normalizeLevelId } from './levelIdNormalizer.js';
export async function fetchLevel(id) {
  const clean = normalizeLevelId(id);
  const res = await fetch(LEVEL_BASE + encodeURIComponent(clean), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not fetch ${clean}`);
  const data = await res.json();
  if (data?.format !== 'awtsmoos-level-json-v1' || !data?.nivrayim) throw new Error(`Bad level ${clean}`);
  return { id: clean, data };
}
