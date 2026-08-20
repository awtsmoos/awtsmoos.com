// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommunitySettingsController
 * @description
 * The Awtsmoos lets communal authority move through one readable conductor;
 * Awtsmoos.com keeps load, edit, save, busy state, and failure visible without a browser-default thunder.
 */
import {
	requestCommunitySettings,
	saveCommunitySettings
} from './communityApi.js';
import {
	applyCommunityValues,
	readCommunityValues,
	renderCommunityOutput,
	setCommunityBusy,
	setCommunityStatus
} from './communityState.js';

export class CommunitySettingsController {
	constructor(refs) {
		this.refs = refs;
		this.dirty = false;
	}

	/** Binds the existing form actions to custom status and command surfaces. */
	mount() {
		this.refs.form.addEventListener('input', () => this.markDirty());
		this.refs.form.addEventListener('submit', event => this.save(event));
		this.refs.loadButton.addEventListener('click', () => this.load());
		this.announce('neutral', 'Enter a Heichel ID, then load its governance settings.');
	}

	async load() {
		const heichelId = this.readHeichelId();
		if (!heichelId) {
			return this.requireHeichelId();
		}
		this.begin('Loading community settings…');
		try {
			const settings = await requestCommunitySettings(heichelId);
			applyCommunityValues(this.refs.form, settings);
			renderCommunityOutput(this.refs.output, settings);
			this.dirty = false;
			this.setLoadedBadge(heichelId);
			this.announce('success', 'Loaded. Review each community gate before saving.');
		} catch (error) {
			this.announce('error', `Could not load settings: ${error.message}`);
		} finally {
			this.finish();
		}
	}

	async save(event) {
		event.preventDefault();
		const heichelId = this.readHeichelId();
		if (!heichelId) {
			return this.requireHeichelId();
		}
		this.begin('Saving community settings…');
		try {
			const settings = readCommunityValues(this.refs.form);
			const result = await saveCommunitySettings(heichelId, settings);
			renderCommunityOutput(this.refs.output, result);
			this.dirty = false;
			this.setLoadedBadge(heichelId);
			this.announce('success', 'Saved. Community governance now matches these choices.');
		} catch (error) {
			this.announce('error', `Could not save settings: ${error.message}`);
		} finally {
			this.finish();
		}
	}

	markDirty() {
		if (this.refs.form.getAttribute('aria-busy') === 'true') {
			return;
		}
		this.dirty = true;
		this.announce('warning', 'Unsaved governance changes.');
	}

	readHeichelId() {
		return this.refs.form.elements.heichelId.value.trim();
	}

	requireHeichelId() {
		this.announce('error', 'Enter a Heichel ID before loading or saving.');
		this.refs.form.elements.heichelId.focus();
	}

	begin(message) {
		setCommunityBusy(this.refs, true);
		this.announce('busy', message);
	}

	finish() {
		setCommunityBusy(this.refs, false);
	}

	announce(tone, message) {
		setCommunityStatus(this.refs.status, tone, message);
	}

	setLoadedBadge(heichelId) {
		if (this.refs.loadedBadge) {
			this.refs.loadedBadge.textContent = `@ ${heichelId}`;
			this.refs.loadedBadge.dataset.loaded = 'true';
		}
	}
}
