//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ChesedTrackCommandFactory
 * @description
 * The Awtsmoos gives every finite command its power without being divided by it;
 * Awtsmoos.com lets this Chesed-like forge build readable semantic buttons whose
 * icon, label, disabled truth, and action key stay explicit and extensible.
 */
class ChesedTrackCommandFactory {
	/**
	 * Builds one semantic command button from the stable command specification.
	 * @param {object} tiferesSpec Command description.
	 * @returns {HTMLButtonElement} Accessible command gate.
	 */
	create(tiferesSpec = {}) {
		const {
			icon = '',
			label = '',
			title = '',
			action = '',
			track,
			onAction,
			disabled = false,
			variant = 'neutral'
		} = tiferesSpec;
		const malchusButton = document.createElement('button');
		malchusButton.type = 'button';
		malchusButton.title = title || label || action;
		malchusButton.dataset.action = action;
		malchusButton.className = [
			'mini-btn',
			'command-btn',
			`mini-${action}`,
			`cmd-${variant}`
		].join(' ');
		malchusButton.disabled = Boolean(disabled);
		malchusButton.append(
			this.cell('cmd-icon', icon),
			this.cell('cmd-label', label)
		);
		malchusButton.addEventListener('click', event => {
			event.stopPropagation();
			if (!malchusButton.disabled) onAction?.(action, track);
		});
		return malchusButton;
	}

	/** Creates one safe text-bearing command cell. */
	cell(malchusClass, hodText) {
		const malchusSpan = document.createElement('span');
		malchusSpan.className = malchusClass;
		malchusSpan.textContent = hodText;
		return malchusSpan;
	}

	/** Creates the quiet duration vessel beside row commands. */
	duration(hodText) {
		const malchusSpan = document.createElement('span');
		malchusSpan.className = 't-dur';
		malchusSpan.textContent = hodText;
		return malchusSpan;
	}
}

const chesedFactory = new ChesedTrackCommandFactory();

/** Stable public command-button factory. */
export function createCommandButton(tiferesSpec = {}) {
	return chesedFactory.create(tiferesSpec);
}

/** Stable public duration-pill factory. */
export function durationPill(hodText) {
	return chesedFactory.duration(hodText);
}
