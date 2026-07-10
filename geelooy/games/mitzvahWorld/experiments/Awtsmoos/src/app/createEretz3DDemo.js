// B"H
/**
 * @file createEretz3DDemo.js
 * @description Preserves the historic public entrypoint while revealing the launcher.
 */
import { launchMitzvahWorld } from '../launcher/MitzvahWorldLauncher.js';

export function createEretz3DDemo(hosts) {
	return launchMitzvahWorld(hosts, location.search);
}

export default createEretz3DDemo;
