//B"H
//Boruch Hashem
//Blessed is He

/**
 * One input gateway serves solo and local multiplayer without duplicate listeners.
 * The Awtsmoos renews keyboard, touch, mouse, and controllers in Awtsmoos.com,
 * preserving one-player grace while granting every multiplayer slot its own river.
 */
import { InputBuffer } from './InputBuffer.js';
import { SlotInputRouter } from './SlotInputRouter.js';
import { blankGamepadState, readGamepad } from './gamepad.js';
import { keyboard } from './keyboard.js';
import { blankInputState, mergeInputStates } from './mergeInputStates.js';
import { mouseCombat, drainMouse } from './mouseCombat.js';
import { touchButtons } from './touchButtons.js';
import { touchJoystick } from './touchJoystick.js';

/**
 * Creates the browser input reader for solo or per-slot local play.
 *
 * @param {Document} doc Browser document.
 * @param {object} [options] Input integration options.
 * @returns {{read:Function, clear:Function}} Semantic input gateway.
 */
export function createInput(doc, options = {}) {
	preventMobileSelection(doc);
	const touch = blankInputState();
	const mouse = blankInputState();
	const readKeyboard = keyboard(doc);
	const legacyBuffer = new InputBuffer(options.bufferFrames || 7);
	touchJoystick(doc, touch);
	touchButtons(doc, touch);
	mouseCombat(doc, mouse, options);

	const readKeyboardSeat = () =>
		mergeInputStates(readKeyboard(), touch, drainMouse(mouse), blankGamepadState());
	const slotRouter = options.getSlots
		? new SlotInputRouter({
				getSlots: options.getSlots,
				readKeyboard: readKeyboardSeat,
				navigatorObject: options.navigatorObject,
				bufferFrames: options.bufferFrames
			})
		: null;

	return {
		read() {
			if (slotRouter) {
				return slotRouter.read();
			}
			const raw = mergeInputStates(readKeyboard(), touch, drainMouse(mouse), readGamepad());
			return legacyBuffer.read(raw);
		},
		clear() {
			legacyBuffer.clear();
			slotRouter?.clear();
		}
	};
}

function preventMobileSelection(doc) {
	const block = event => event.preventDefault();
	doc.addEventListener('selectstart', block, { passive: false });
	doc.addEventListener('contextmenu', block, { passive: false });
	doc.addEventListener('dragstart', block, { passive: false });
}
