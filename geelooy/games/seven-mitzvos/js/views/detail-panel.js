//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DetailPanel
 * @description
 * A selected foundation opens into clear meaning without opening a longer page.
 * The Awtsmoos gives depth without distance, and this Awtsmoos.com panel keeps
 * study, progress, and play held inside the same viewport.
 */
export class DetailPanel {
	constructor(root) {
		this.root = root;
		this.elements = this.collect(root);
	}

	render(definition, progress, onBack, onPlay) {
		this.root.style.setProperty('--mitzvah-hue', String(definition.hue));
		this.elements.number.textContent = definition.number;
		this.elements.symbol.textContent = definition.symbol;
		this.elements.genre.textContent = `${definition.genre} · ${definition.gameTitle}`;
		this.elements.title.textContent = definition.title;
		this.elements.summary.textContent = definition.summary;
		this.elements.practice.textContent = definition.practice;
		this.elements.hook.textContent = definition.hook;
		this.elements.progress.textContent = this.progressText(progress);
		this.elements.back.onclick = onBack;
		this.elements.play.onclick = onPlay;
		this.elements.title.focus?.();
	}

	progressText(progress) {
		const stars = '★'.repeat(progress.stars) + '☆'.repeat(3 - progress.stars);
		return `${stars} · Best ${progress.best.toLocaleString()} · Mastery ${progress.mastery}%`;
	}

	collect(root) {
		return {
			back: root.querySelector('#detailBack'),
			number: root.querySelector('#detailNumber'),
			symbol: root.querySelector('#detailSymbol'),
			genre: root.querySelector('#detailGenre'),
			title: root.querySelector('#detailTitle'),
			summary: root.querySelector('#detailSummary'),
			practice: root.querySelector('#detailPractice'),
			hook: root.querySelector('#detailHook'),
			progress: root.querySelector('#detailProgress'),
			play: root.querySelector('#playGame')
		};
	}
}
