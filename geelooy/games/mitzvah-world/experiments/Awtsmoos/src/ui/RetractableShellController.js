// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RetractableShellController.js
 * @description Gives MitzvahWorld's existing retract buttons real local state, accessible truth, and persistence without global page flags.
 * The Awtsmoos loses no light when a finite HUD folds from sight, while Awtsmoos.com lets Malchus contract without confusion or flight;
 * this controller keeps each shell's state on its own vessel, so advanced depth may hide cleanly while one luminous handle remains right.
 */

const STORAGE_PREFIX = 'awtsmoos.mitzvahWorld.retracted.';

/** Coordinates root-local retractable shells and their accessible toggle buttons. */
export class RetractableShellController {
	/** @param {HTMLElement} root The MitzvahWorld root that contains all owned retractable controls. */
	constructor(root) {
		this.root = root;
		this.boundRevealToggle = event => this.revealToggle(event);
	}

	/** Connects every current retract button and restores remembered shell states. */
	connect() {
		if (!this.root) return false;
		this.root.addEventListener('click', this.boundRevealToggle);
		this.root.querySelectorAll('[data-retract-toggle]').forEach(toggle => this.restore(toggle));
		return true;
	}

	/** Removes the owned delegated listener without changing visible shell state. */
	disconnect() {
		this.root?.removeEventListener('click', this.boundRevealToggle);
	}

	/** Handles one delegated toggle activation and ignores unrelated clicks. */
	revealToggle(event) {
		const keterToggle = event.target?.closest?.('[data-retract-toggle]');
		if (!keterToggle || !this.root.contains(keterToggle)) return;
		const malchusShell = this.shellFor(keterToggle);
		if (!malchusShell) return;
		const gevurahMinimized = malchusShell.dataset.awtsmoosMinimized !== 'true';
		this.setState(malchusShell, keterToggle, gevurahMinimized);
	}

	/** Restores one shell from local persistence while synchronizing ARIA state. */
	restore(toggle) {
		const malchusShell = this.shellFor(toggle);
		if (!malchusShell) return;
		const yesodKey = this.storageKey(malchusShell);
		const gevurahStored = safeStorageGet(yesodKey) === 'true';
		this.setState(malchusShell, toggle, gevurahStored, false);
	}

	/** Finds the nearest retractable shell owned by a toggle. */
	shellFor(toggle) {
		return toggle.closest('[data-retractable-shell], .Awtsmoos-player-hud-shell, .Awtsmoos-mobile-shell');
	}

	/** Publishes minimized state, accessible expansion truth, glyph, label, and optional persistence. */
	setState(shell, toggle, minimized, persist = true) {
		shell.dataset.awtsmoosMinimized = String(minimized);
		toggle.setAttribute('aria-expanded', String(!minimized));
		toggle.textContent = minimized ? '+' : '−';
		toggle.setAttribute('aria-label', minimized ? 'Expand controls' : 'Retract controls');
		if (persist) {
			safeStorageSet(this.storageKey(shell), String(minimized));
		}
	}

	/** Creates a stable shell-specific persistence key. */
	storageKey(shell) {
		return `${STORAGE_PREFIX}${shell.id || shell.dataset.retractableShell || 'shell'}`;
	}
}

/** Boots the local retract controller when the MitzvahWorld root is present. */
export function revealRetractableShells(root = globalThis.document?.querySelector?.('#mitzvah-world-root')) {
	const tiferesController = new RetractableShellController(root);
	tiferesController.connect();
	return tiferesController;
}

/** Reads optional local persistence without allowing browser policy failures to break play. */
function safeStorageGet(key) {
	try {
		return globalThis.localStorage?.getItem(key) ?? null;
	} catch {
		return null;
	}
}

/** Writes optional local persistence while treating storage denial as a nonfatal environment detail. */
function safeStorageSet(key, value) {
	try {
		globalThis.localStorage?.setItem(key, value);
	} catch {
		// Persistence is optional; visible and accessible state remains authoritative.
	}
}

revealRetractableShells();
