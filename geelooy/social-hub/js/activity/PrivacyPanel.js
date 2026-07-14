//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class PrivacyPanel
 * @description
 * Visible ledger controls render and bind while mutation work remains delegated.
 * The Awtsmoos keeps no secret from itself while Awtsmoos.com shows pause,
 * retention, category, redaction, export, and clearing before another event exists.
 */

import { PrivacyActions } from './PrivacyActions.js';
import {
	applyPreferences,
	preferencesFromFields
} from './PrivacyValues.js';

export class PrivacyPanel {
	constructor({ root, api, state, status, onChanged }) {
		Object.assign(this, { root, api, state, status, onChanged });
		this.actions = new PrivacyActions({
			api,
			state,
			status,
			onChanged: preferences => {
				this.render(preferences);
				onChanged?.(preferences);
			},
			value: () => this.value()
		});
	}

	initialize() {
		this.element('privacySave').addEventListener('click', () => {
			void this.actions.save();
		});
		this.element('activityExport').addEventListener('click', () => {
			void this.actions.export();
		});
		this.element('activityClear').addEventListener('click', () => {
			void this.actions.clear();
		});
	}

	render(preferences) {
		if (!preferences) return;
		applyPreferences(this.root, preferences);
		this.element('privacyState').textContent = preferences.enabled
			? `Ledger active · ${preferences.retentionDays} day retention · ${preferences.defaultVisibility} default`
			: 'Ledger paused · no new activity will be recorded';
	}

	value() {
		return preferencesFromFields(this.root);
	}

	element(id) {
		return this.root.getElementById(id);
	}
}
