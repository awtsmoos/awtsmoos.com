// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAiComposer.js
 * @description Mobile-first AI movie director surface shared by every movie-capable studio.
 * The Awtsmoos places a whole timeline beneath one thumb with room to grow; Awtsmoos.com keeps the UI light while the structured movie rivers flow.
 */
export class MovieAiComposer extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.builder = null;
	}

	connectedCallback() {
		this.render();
		this.shadowRoot.querySelector('form').addEventListener('submit', event => {
			this.submit(event);
		});
		this.shadowRoot.querySelector('[data-toggle]').addEventListener('click', () => {
			this.toggleAttribute('open');
		});
	}

	render() {
		const stylesheet = new URL('./MovieAiComposer.css', import.meta.url).href;
		this.shadowRoot.innerHTML = `
			<link rel="stylesheet" href="${stylesheet}">
			<button class="launcher" data-toggle type="button" aria-label="Open AI movie director">✦ AI Movie</button>
			<section class="sheet" aria-label="AI Movie Director">
				<header><div><small>${escapeHtml(this.appName || 'Movie Studio')}</small><strong>AI Movie Director</strong></div><button data-toggle type="button" aria-label="Close">×</button></header>
				<form>
					<label>Describe the movie<textarea name="prompt" required placeholder="A 3D character teaches gravity with animated shapes, text, charts and particles…"></textarea></label>
					<div class="grid"><label>Style<select name="mode"><option value="hybrid">Hybrid 2D + 3D</option><option value="cinematic">Cinematic</option><option value="character">Characters</option><option value="tutorial">Tutorial</option><option value="infographic">Infographic</option></select></label><label>Seconds<input name="seconds" type="number" min="15" max="600" value="60"></label></div>
					<button class="generate" type="submit">Generate editable movie</button>
					<output data-status>Ready for structured movie intent.</output>
				</form>
			</section>`;
	}

	async submit(event) {
		event.preventDefault();
		const output = this.shadowRoot.querySelector('[data-status]');
		const form = new FormData(event.currentTarget);
		output.textContent = 'Building scenes, timing, entities and camera intent…';
		try {
			const result = await this.builder?.({
				prompt: form.get('prompt'),
				mode: form.get('mode'),
				duration: Number(form.get('seconds')) * 1000
			});
			const count = result?.project?.scenes?.length || 0;
			output.textContent = `Created ${count} editable scenes. Project is available to ${this.appName}.`;
			this.dispatchEvent(new CustomEvent('awtsmoos:movie-project', { detail: result, bubbles: true, composed: true }));
		} catch (error) {
			output.textContent = `Movie generation failed: ${error.message}`;
		}
	}
}

export function mountMovieAiComposer(options = {}) {
	const composer = document.createElement('awtsmoos-movie-ai');
	composer.appName = options.appName;
	composer.builder = options.builder;
	document.body.append(composer);
	return composer;
}

function escapeHtml(value) {
	return String(value).replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character]));
}

if (!customElements.get('awtsmoos-movie-ai')) {
	customElements.define('awtsmoos-movie-ai', MovieAiComposer);
}
