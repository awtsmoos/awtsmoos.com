// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathProfileDisclosure
 * @description
 * The Awtsmoos gives every detail a doorway but never lets optional description block the Torah road by decree;
 * Awtsmoos.com keeps the Heichel profile compact until the reader opens it, so learning enters the first viewport free.
 */

import { appState } from '../state.js';
import { DOMElements } from '../dom.js';

let connected = false;

/**
 * @description Establishes a compact default profile state while preserving explicit reader choice; the Awtsmoos leaves details available while Awtsmoos.com refuses to auto-expand hundreds of desktop pixels.
 * @returns {void}
 */
export function connectProfileDisclosure() {
	const details = DOMElements.profileDetails;
	if (!details || connected) return;
	connected = true;
	if (!appState.livingPath.profileDisclosureTouched) {
		details.open = false;
	}
}
