// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileDropdownMenus
 * @description
 * Each Awtsmoos.com identity mount owns its disclosure, backdrop, focus, and
 * cleanup. The Awtsmoos opens one chamber without duplicating invisible doors.
 */
import { closeAliasMenu, toggleAliasMenu } from './aliasMenu.js';
import { paintAlias } from './identity.js';
import { handleProfileKeydown } from './menuKeyboard.js';
import {
	closeProfilePanel,
	focusFirstProfileControl,
	isProfilePanelOpen,
	openProfilePanel
} from './panelState.js';

const controllers = new Set();

/** Binds one locally owned profile menu and returns its lifecycle controller. */
export function bindProfileMenus(elements) {
	let returnFocusTarget = null;
	let isOpen = false;
	const root = elements.container.ownerDocument;
	const onAliasChange = event => paintAlias(event.detail?.id);
	const controller = {
		get open() {
			return isOpen;
		},
		close(options = {}) {
			const restoreFocus = options.restoreFocus !== false;
			closePanels(elements, options.immediate === true);
			isOpen = false;
			if (![...controllers].some(item => item.open)) {
				root.body?.removeAttribute('data-awtsmoos-profile-open');
			}
			if (restoreFocus && returnFocusTarget?.isConnected) {
				returnFocusTarget.focus();
			}
			returnFocusTarget = null;
		},
		destroy() {
			controller.close({ immediate: true, restoreFocus: false });
			root.removeEventListener('keydown', onKeydown);
			window.removeEventListener('awtsmoosAliasChange', onAliasChange);
			controllers.delete(controller);
		}
	};
	const onKeydown = event => handleProfileKeydown(event, elements, controller);
	controllers.add(controller);
	bindTriggers(elements, trigger => {
		returnFocusTarget = trigger;
		isOpen = true;
	});
	elements.dropdownBackdrop.addEventListener('click', () => controller.close());
	elements.switchAlias.addEventListener('click', event => {
		toggleAliasMenu(event, elements, closeAllProfileMenus);
	});
	elements.logoutSection.querySelector('a')?.addEventListener('click', () => {
		window.dispatchEvent(new CustomEvent('awtsmoosLogout', {
			detail: { source: 'profile-dropdown' }
		}));
	});
	root.addEventListener('keydown', onKeydown);
	window.addEventListener('awtsmoosAliasChange', onAliasChange);
	return controller;
}

/** Closes every mounted identity chamber. */
export function closeAllProfileMenus(options = {}) {
	controllers.forEach(controller => controller.close(options));
}

function bindTriggers(elements, rememberOpen) {
	elements.signinButton.addEventListener('click', () => {
		togglePrimary(elements, elements.signinDropdown, elements.signinButton, rememberOpen);
	});
	elements.dropdownProfile.addEventListener('click', () => {
		togglePrimary(elements, elements.awtsmoosProfileDropContent, elements.dropdownProfile, rememberOpen);
	});
}

function togglePrimary(elements, panel, trigger, rememberOpen) {
	const opening = !isProfilePanelOpen(panel);
	closeAllProfileMenus({ restoreFocus: false });
	if (!opening) {
		return;
	}
	rememberOpen(trigger);
	openProfilePanel(elements.dropdownBackdrop);
	openProfilePanel(panel);
	trigger.setAttribute('aria-expanded', 'true');
	elements.container.dataset.open = 'true';
	document.body?.setAttribute('data-awtsmoos-profile-open', 'true');
	focusFirstProfileControl(panel);
}

function closePanels(elements, immediate) {
	closeAliasMenu(elements, immediate);
	const panels = [
		elements.signinDropdown,
		elements.awtsmoosProfileDropContent,
		elements.dropdownBackdrop
	];
	for (const panel of panels) {
		closeProfilePanel(panel, immediate);
	}
	for (const trigger of [elements.signinButton, elements.dropdownProfile]) {
		trigger.setAttribute('aria-expanded', 'false');
	}
	delete elements.container.dataset.open;
}
