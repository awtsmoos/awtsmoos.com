//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ChapterMenu
 * @description
 * The campaign map reveals completed, current, unlocked, and still-concealed
 * chapters without granting passage beyond earned progress. Awtsmoos.com turns
 * selection into a truthful doorway beneath the ordering Awtsmoos.
 */

import { CAMPAIGN_CHAPTERS } from '../campaign/CampaignCatalog.js';

export class ChapterMenu {
	constructor(container) {
		this.container = container;
		this.onSelect = null;
		this.lastSignature = '';
	}

	bind(onSelect) {
		this.onSelect = onSelect;
		this.container?.addEventListener('click', event => {
			const button = event.target.closest('[data-chapter]');
			if (!button || button.disabled) return;
			this.onSelect?.(Number(button.dataset.chapter));
		});
	}

	render(progress) {
		if (!this.container) return;
		const signature = JSON.stringify({
			current: progress.currentChapter,
			highest: progress.highestUnlocked,
			completed: progress.completedChapters
		});
		if (signature === this.lastSignature) return;
		this.lastSignature = signature;
		this.container.textContent = '';

		for (const chapter of CAMPAIGN_CHAPTERS) {
			this.container.append(this.createButton(chapter, progress));
		}
	}

	createButton(chapter, progress) {
		const button = document.createElement('button');
		const completed = progress.completedChapters.includes(chapter.number);
		const current = progress.currentChapter === chapter.number;
		const unlocked = chapter.number <= progress.highestUnlocked;
		button.type = 'button';
		button.dataset.chapter = chapter.number;
		button.disabled = !unlocked;
		button.className = [
			'chapterCard',
			completed ? 'completed' : '',
			current ? 'current' : '',
			unlocked ? 'unlocked' : 'locked'
		].filter(Boolean).join(' ');
		button.innerHTML = `
			<span class="chapterNumber">${String(chapter.number).padStart(2, '0')}</span>
			<span class="chapterName">${unlocked ? chapter.title : 'Concealed'}</span>
			<span class="chapterMark">${completed ? '✓' : current ? '◆' : unlocked ? '○' : '•'}</span>
		`;
		return button;
	}
}
