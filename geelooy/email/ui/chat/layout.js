// B"H
/**
 * @module QuantumMailChatLayout
 * @description Composes the active-thread header and message body from small
 * modules, preserving the old extreme Mail identity without a giant file.
 */
import { setUiRef } from './state.js';
import { mountChatBody } from './layout-parts/body.js';
import { chatHeader } from './layout-parts/header.js';

/** Initializes the full chat deck. */
export function initChatLayout(ui, parent) {
	setUiRef(ui);
	ui.html({ parent, ...chatHeader(ui, parent) });
	mountChatBody(ui, parent);
}
