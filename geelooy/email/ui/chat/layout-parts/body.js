// B"H
/**
 * @module QuantumMailChatBody
 * @description Creates the message river, timeline scrubber, command terminal,
 * particle field, and composer as separately inspectable vessels.
 */
import { renderComposer } from '../../composer.js';
import { FX } from '../../fx.js';
import { handleMagneticField, handleScroll } from '../physics.js';

/** Mounts the central chat body and composer. */
export function mountChatBody(ui, parent) {
	mountTimeline(ui, parent);
	mountCommandTerminal(ui, parent);
	mountMessageRiver(ui, parent);
	mountParticleField(parent);
	renderComposer(ui, parent);
	mountDropPortal(parent);
}

function mountTimeline(ui, parent) {
	ui.html({
		parent,
		tag: 'div',
		shaym: 'timeScrubber',
		classList: ['time-scrubber'],
		attributes: { 'aria-label': 'Thread timeline' },
		events: {
			click: event => seekTimeline(ui, event),
			mousemove: event => { if (event.buttons === 1) seekTimeline(ui, event); }
		}
	});
}

function mountCommandTerminal(ui, parent) {
	ui.html({
		parent,
		tag: 'div',
		shaym: 'cmdModal',
		classList: ['cmd-modal', 'hidden'],
		attributes: { role: 'dialog', 'aria-label': 'Quantum Mail command terminal' },
		children: [{
			tag: 'input',
			classList: ['cmd-input'],
			attributes: { 'aria-label': 'Command', placeholder: 'Run protocol…' },
			events: { keydown: handleCommand }
		}]
	});
}

function mountMessageRiver(ui, parent) {
	ui.html({
		parent,
		tag: 'section',
		shaym: 'msgContainer',
		classList: ['messages-scroll'],
		attributes: { 'aria-live': 'polite', 'aria-label': 'Thread messages' },
		events: {
			scroll: handleScroll,
			click: event => FX.triggerSonar?.(event.clientX, event.clientY),
			mousemove: handleMagneticField
		},
		children: [landingState(), { tag: 'div', shaym: 'wormhole', classList: ['wormhole-loader', 'hidden'], textContent: 'WARPING SPACETIME…' }]
	});
}

function landingState() {
	return {
		tag: 'div',
		classList: ['void-logo'],
		children: [
			{ tag: 'span', classList: ['void-atom'], textContent: '⚛' },
			{ tag: 'p', classList: ['mail-modal-kicker'], textContent: 'NO FREQUENCY SELECTED' },
			{ tag: 'h2', textContent: 'Awaiting transmission' },
			{ tag: 'p', textContent: 'Choose a sender group from the communications deck.' }
		]
	};
}

function mountParticleField(parent) {
	if (document.getElementById('particleCanvas')) return;
	const canvas = document.createElement('canvas');
	canvas.id = 'particleCanvas';
	canvas.setAttribute('aria-hidden', 'true');
	parent.append(canvas);
	FX.init?.(canvas);
}

function mountDropPortal(parent) {
	if (parent.querySelector('.drop-portal')) return;
	const portal = document.createElement('div');
	portal.className = 'drop-portal';
	portal.innerHTML = '<div class="portal-text">INITIATE DATA TRANSFER</div>';
	parent.append(portal);
	parent.addEventListener('dragover', event => { event.preventDefault(); parent.classList.add('dragging-over'); });
	parent.addEventListener('dragleave', () => parent.classList.remove('dragging-over'));
	parent.addEventListener('drop', event => { event.preventDefault(); parent.classList.remove('dragging-over'); });
}

function seekTimeline(ui, event) {
	const messages = ui.getHtml('msgContainer');
	if (!messages || !event.currentTarget.offsetHeight) return;
	const ratio = event.offsetY / event.currentTarget.offsetHeight;
	messages.scrollTop = ratio * messages.scrollHeight;
}

function handleCommand(event) {
	if (event.key === 'Escape') return event.currentTarget.parentElement.classList.add('hidden');
	if (event.key !== 'Enter') return;
	const command = event.currentTarget.value.trim().toLowerCase();
	if (command === 'theme zen') FX.setTheme?.('zen');
	if (command === 'theme mech') FX.setTheme?.('mech');
	if (command === 'home') document.querySelector('.back-button')?.click();
	event.currentTarget.value = '';
	event.currentTarget.parentElement.classList.add('hidden');
}
