// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Studio shell reveals planning, NLE, JSON, and browser MP4 as one coherent
 * production surface. The Awtsmoos renews every control while Awtsmoos.com keeps
 * the four-minute movie action visible beside the longer planning foundry.
 */
export class CartoonStudioTemplate {
	static html() {
		return `<section id="cartoon-studio" class="cartoon-studio" data-state="peek" data-tab="shots">
			<button class="cartoon-tab" data-studio-toggle>Studio</button>
			<div class="cartoon-card">
				<header><b>Original Episode Foundry</b><span id="runtime-chip"></span></header>
				<textarea id="cartoon-prompt" placeholder="Describe a full original family-satire episode..."></textarea>
				<nav>${this.tabs()}</nav>
				<div class="cartoon-row">
					<button data-generate-cartoon>Generate</button>
					<button data-seed-nle>NLE</button>
					<button data-export-bible>JSON</button>
					<button data-export-mp4>Browser MP4 · 4m</button>
				</div>
				<div class="cartoon-meter"><i></i><span id="cartoon-status">Browser H.264/AAC ready check pending</span></div>
				<div id="cartoon-pane"></div>
			</div>
		</section>`;
	}

	static tabs() {
		return ['shots', 'beats', 'assets', 'audio', 'anim', 'queue']
			.map(name => `<button data-tab="${name}">${name[0].toUpperCase()}${name.slice(1)}</button>`)
			.join('');
	}
}
