// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleAiStudio
 * @description
 * Brief, JSON, package exchange, and catalog-generated actions remain one validated,
 * undoable movie workspace shared by humans, public API clients, and connected agents.
 */

import { createAiMovieEnvelope } from './NleAiContract.js';
import { decodeAiMovieSource } from './NleAiProjectCodec.js';
import { NleAiStudioExchange } from './NleAiStudioExchange.js';
import { mountNleAiStudio, renderNleAiBrief } from './NleAiStudioMarkup.js';
import { NleMovieActionPanel } from './NleMovieActionPanel.js';

export class NleAiStudio {
	constructor({ actionExecutor, dialog, io, notify, state }) {
		Object.assign(this, { dialog, io, notify, state });
		this.view = mountNleAiStudio(dialog);
		this.exchange = new NleAiStudioExchange(this);
		this.actionPanel = new NleMovieActionPanel({
			executor: actionExecutor,
			onResult: (result, action) => this.showActionResult(result, action),
			onStatus: (message, error) => this.setStatus(message, error),
			root: this.view.actionPanel
		});
		this.dirty = false;
		this.bind();
	}

	bind() {
		this.view.close.addEventListener('click', () => this.close());
		this.view.tabs.forEach(button => button.addEventListener('click', () => this.setPanel(button.dataset.aiTab)));
		this.view.json.addEventListener('input', () => { this.dirty = true; });
		this.view.current.addEventListener('click', () => this.loadEnvelope(this.exportEnvelope()));
		this.view.starter.addEventListener('click', () => void this.loadStarter().catch(() => {}));
		this.view.schema.addEventListener('click', () => void this.exchange.copySchema().catch(error => this.setStatus(error.message, true)));
		this.view.copy.addEventListener('click', () => void this.exchange.copyJson().catch(error => this.setStatus(error.message, true)));
		this.view.download.addEventListener('click', () => this.run(() => this.exchange.download()));
		this.view.apply.addEventListener('click', () => this.run(() => this.applySource(this.view.json.value)));
		this.dialog.addEventListener('click', event => { if (event.target === this.dialog) this.close(); });
	}

	open() { if (!this.dirty) this.loadEnvelope(this.exportEnvelope()); if (!this.dialog.open) this.dialog.showModal(); this.setPanel('brief'); }
	close() { if (this.dialog.open) this.dialog.close(); }
	render(snapshot, reason = 'change') {
		if (!this.dialog.open || this.dirty || ['playhead', 'transport', 'rendering'].includes(reason)) return;
		this.loadEnvelope(createAiMovieEnvelope(snapshot.project));
	}
	exportEnvelope() { return createAiMovieEnvelope(this.state.project); }
	applySource(source) {
		const project = decodeAiMovieSource(source);
		this.state.replace(project, 'ai-project'); this.dirty = false; this.loadEnvelope(createAiMovieEnvelope(project));
		this.setStatus('Validated movie applied. Undo remains available.'); this.notify('Movie applied to the complete NLE.');
		return this.exportEnvelope();
	}
	async loadStarter() {
		try {
			const project = await this.io.loadStarter(); this.state.replace(project, 'ai-starter'); this.dirty = false;
			this.loadEnvelope(createAiMovieEnvelope(project)); this.setStatus('Cinematic village loaded. Undo remains available.'); return this.exportEnvelope();
		} catch (error) { this.setStatus(error.message, true); throw error; }
	}
	loadSchema() { return this.io.loadSchema(); }
	loadEnvelope(envelope) { this.view.json.value = JSON.stringify(envelope, null, 2); renderNleAiBrief(this.view, envelope); this.dirty = false; }
	setPanel(panel) { this.dialog.querySelector('.nle-ai-studio').dataset.aiPanel = panel; this.view.tabs.forEach(button => button.toggleAttribute('aria-current', button.dataset.aiTab === panel)); }
	setStatus(message, error = false) { this.view.status.textContent = message; this.view.status.toggleAttribute('data-error', error); }
	showActionResult(result, action) {
		if (!result || typeof result !== 'object') return;
		if (action.category === 'AI agent' || action.category === 'Package') {
			this.view.json.value = JSON.stringify(result.request || result, null, 2); this.dirty = true; this.setPanel('json');
		}
	}
	run(operation) { try { return operation(); } catch (error) { this.setStatus(error.message, true); return null; } }
}
