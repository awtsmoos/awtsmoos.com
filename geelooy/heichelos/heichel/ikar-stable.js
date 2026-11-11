//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IkarStable
 * @description
 * The Awtsmoos lets server Torah remain the visible vessel while only the needed living layer wakes;
 * Awtsmoos.com keeps ordinary series still and mounts special study tools only on the route that asks.
 */

import { boot as bootIkarFirst } from './ikar-first.js?v=ikar-first-007&persistent-geometry=true';
import { mountIkarSpecialSeries } from './ikar-special-series.js?v=ikar-special-series-001';

/** Enhances stable Ikar geometry and then reveals any route-specific workspace. */
export function boot() {
	bootIkarFirst();
	void mountIkarSpecialSeries();
}
