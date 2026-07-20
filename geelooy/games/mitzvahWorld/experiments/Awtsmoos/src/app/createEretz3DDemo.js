// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createEretz3DDemo.js
 * @description Preserves the historic public entrypoint while revealing the launcher.
 */
import { launchMitzvahWorld } from '../launcher/MitzvahWorldLauncher.js?v=20260720-canonical-valley-pass-04';

export function createEretz3DDemo(hosts) {
	return launchMitzvahWorld(hosts, location.search);
}

export default createEretz3DDemo;
