// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileInlineActions
 * @description
 * The Awtsmoos raises one Profile action into a visible Awtsmoos.com sheet,
 * keeping Escape, focus return, loading truth, and opener state in one small law.
 */
import { buildProfileAction } from './profile-actions/content.js';
import { actionError, actionStatus, actionTitle } from './profile-actions/shared.js';

const drawer = () => document.querySelector('[data-profile-action-drawer]');

export function bindProfileInlineActions() {
	// B"H 2026-11-20 round 3: ONE delegated listener replaces per-button
	// binding. The settings panel "never opened" in the rendered re-check:
	// clicks landing before this deferred module loaded on a saturated
	// server hit unbound buttons and were lost (the inline capture in
	// index.html queues such clicks; the queue drains below), and
	// delegation also survives any later re-render of a button. Toggle
	// law (round 2): the expanded opener closes its drawer; × likewise.
	window.__profileActionsBound = true;
	document.addEventListener('click', event => {
		const button = event.target.closest?.('[data-profile-action]');
		if (button) {
			const panel = drawer();
			if (button.getAttribute('aria-expanded') === 'true' && panel && !panel.hidden) {
				closeAction(button);
				return;
			}
			openAction(button);
			return;
		}
		if (!event.target.closest?.('[data-close-profile-action]')) return;
		const opener = document.querySelector('[data-profile-action][aria-expanded="true"]');
		if (opener) closeAction(opener);
	});
	document.addEventListener('keydown', event => {
		if (event.key !== 'Escape') return;
		const opener = document.querySelector('[data-profile-action][aria-expanded="true"]');
		if (opener) closeAction(opener);
	});
	drainEarlyActionClicks();
}

/** Opens the last action a visitor clicked before this module loaded. */
function drainEarlyActionClicks() {
	const queued = Array.isArray(window.__profileActionEarlyClicks) ? window.__profileActionEarlyClicks.splice(0) : [];
	const kind = queued[queued.length - 1];
	if (!kind) return;
	const button = document.querySelector(`[data-profile-action="${kind}"]`);
	if (button) openAction(button);
}
async function openAction(opener) {
	const panel = drawer();
	if (!panel) return;
	collapseOtherOpeners(opener);
	const title = actionTitle(opener.dataset.profileAction);
	const { body, closeButton } = buildDrawerFrame(panel, title, opener);
	opener.setAttribute('aria-expanded', 'true');
	panel.hidden = false;
	body.append(actionStatus('Loading…', 'loading'));
	try {
		const content = await buildProfileAction(
			opener.dataset.profileAction,
			opener,
			() => closeAction(opener)
		);
		body.replaceChildren(content);
	} catch (error) {
		body.replaceChildren(actionError('Could not open this profile action.', error));
	}
	focusDrawer(body, closeButton);
}
function buildDrawerFrame(panel, title, opener) {
	panel.replaceChildren();
	panel.setAttribute('role', 'region');
	panel.setAttribute('aria-label', title);
	const head = document.createElement('div');
	head.className = 'profile-action-head';
	const heading = document.createElement('h2');
	heading.textContent = title;
	const closeButton = document.createElement('button');
	closeButton.type = 'button';
	closeButton.dataset.closeProfileAction = '';
	closeButton.setAttribute('aria-label', 'Close profile action');
	closeButton.textContent = '×';
	closeButton.addEventListener('click', () => closeAction(opener));
	head.append(heading, closeButton);
	const body = document.createElement('div');
	body.dataset.profileActionBody = '';
	panel.append(head, body);
	return { body, closeButton };
}
function closeAction(opener) {
	const panel = drawer();
	if (panel) {
		panel.hidden = true;
		panel.replaceChildren();
		panel.removeAttribute('role');
		panel.removeAttribute('aria-label');
	}
	opener?.setAttribute('aria-expanded', 'false');
	opener?.focus({ preventScroll: true });
}

function collapseOtherOpeners(active) {
	document.querySelectorAll('[data-profile-action][aria-expanded="true"]').forEach(button => {
		if (button !== active) button.setAttribute('aria-expanded', 'false');
	});
}

function focusDrawer(body, closeButton) {
	const target = body.querySelector('input, select, textarea, button, a') || closeButton;
	target.focus({ preventScroll: true });
}
