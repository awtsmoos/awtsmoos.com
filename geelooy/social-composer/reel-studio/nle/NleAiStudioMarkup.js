// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAiStudioMarkup
 * @description
 * Creative intention, complete JSON, and catalog-generated actions share one dialog;
 * the Awtsmoos gives speech, structure, and deed without API/UI separation.
 */

export function mountNleAiStudio(dialog) {
	dialog.innerHTML = /*html*/`
		<article class="nle-ai-studio" data-ai-panel="brief">
			<header class="nle-ai-header"><div><small>AI movie contract</small><h2>Direct, build, and exchange a complete movie</h2><p>Every action below also exists on <code>AwtsmoosMovie.actions</code>.</p></div><button type="button" data-ai-close aria-label="Close AI movie workspace">×</button></header>
			<nav class="nle-ai-tabs" aria-label="AI movie workspace"><button type="button" data-ai-tab="brief" aria-current="page">Creative brief</button><button type="button" data-ai-tab="actions">Actions</button><button type="button" data-ai-tab="json">Complete JSON</button></nav>
			<section class="nle-ai-body">
				<div class="nle-ai-brief" data-ai-view="brief">
					<section class="nle-ai-hero"><small>Logline</small><strong data-ai-logline></strong><p data-ai-subject></p></section>
					<div class="nle-ai-brief-grid"><section><small>World</small><p data-ai-environment></p></section><section><small>Visual language</small><p data-ai-visual></p></section><section><small>Camera</small><p data-ai-camera></p></section><section><small>Lighting</small><p data-ai-lighting></p></section><section><small>Sound</small><p data-ai-sound></p></section></div>
					<div class="nle-ai-lists"><section><small>Continuity</small><ul data-ai-continuity></ul></section><section><small>Requested assets</small><ul data-ai-assets></ul></section><section><small>Never invent</small><ul data-ai-constraints></ul></section></div>
				</div>
				<div class="nle-ai-actions-view" data-ai-view="actions"><header><small>Exact API/UI parity</small><strong>Ready movie actions</strong><p>Cards and public methods come from one immutable catalog.</p></header><div data-ai-action-panel></div></div>
				<div class="nle-ai-json" data-ai-view="json"><label><span>Complete envelope or movie package</span><textarea spellcheck="false" data-ai-json aria-label="Complete AI movie JSON"></textarea></label><p>Apply validates timing, bounds, graphs, assets, and the canonical project before one undoable change.</p></div>
			</section>
			<footer class="nle-ai-actions"><span data-ai-status>Current movie is ready for a human or connected agent.</span><div><button type="button" data-ai-starter>Load starter</button><button type="button" data-ai-current>Use current</button><button type="button" data-ai-schema>Copy schema</button><button type="button" data-ai-copy>Copy JSON</button><button type="button" data-ai-download>Download</button><button type="button" class="nle-ai-apply" data-ai-apply>Apply JSON</button></div></footer>
		</article>`;
	return collect(dialog);
}

export function renderNleAiBrief(view, envelope) {
	const brief = envelope.creativeBrief || {};
	set(view.logline, brief.logline); set(view.subject, brief.subject); set(view.environment, brief.environment);
	set(view.visual, brief.visualLanguage); set(view.camera, brief.cameraLanguage); set(view.lighting, brief.lighting); set(view.sound, brief.sound);
	list(view.continuity, brief.continuity); list(view.assets, brief.assetRequests); list(view.constraints, brief.negativeConstraints);
}

function collect(root) {
	const query = selector => root.querySelector(selector);
	return {
		actionPanel: query('[data-ai-action-panel]'), apply: query('[data-ai-apply]'), assets: query('[data-ai-assets]'), camera: query('[data-ai-camera]'), close: query('[data-ai-close]'),
		constraints: query('[data-ai-constraints]'), continuity: query('[data-ai-continuity]'), copy: query('[data-ai-copy]'), current: query('[data-ai-current]'), download: query('[data-ai-download]'),
		environment: query('[data-ai-environment]'), json: query('[data-ai-json]'), lighting: query('[data-ai-lighting]'), logline: query('[data-ai-logline]'), schema: query('[data-ai-schema]'),
		sound: query('[data-ai-sound]'), starter: query('[data-ai-starter]'), status: query('[data-ai-status]'), subject: query('[data-ai-subject]'), tabs: [...root.querySelectorAll('[data-ai-tab]')], visual: query('[data-ai-visual]')
	};
}
function set(element, value) { element.textContent = String(value || 'Not specified.'); }
function list(element, values) {
	element.replaceChildren(...(Array.isArray(values) && values.length ? values : ['None specified.']).map(value => {
		const item = document.createElement('li'); item.textContent = String(value); return item;
	}));
}
