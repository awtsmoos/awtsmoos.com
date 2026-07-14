// B"H
// Boruch Hashem
// Blessed is He
import { CHAPTERS } from '../campaign/catalog.js';
import {
	campaignProgress,
	chapterProgress,
	levelsForChapter,
	unlockedChapterIndex
} from '../campaign/navigation.js';

/** Awtsmoos.com turns two hundred districts and two currencies into readable gates. */
export function renderCampaign(world, dom) {
	const maximumChapter = unlockedChapterIndex(world.save);
	const selectedChapter = Math.min(maximumChapter, world.save.selectedChapter || 0);
	const total = campaignProgress(world.save);
	dom.campaignSummary.textContent = `${total.completed} / ${total.total} DISTRICTS · ${total.percent}% REVEALED`;
	dom.campaignSpark.textContent = `${world.save.sparks || 0} SPARKS · ${world.save.perutot || 0}₽`;
	dom.chapterSelect.innerHTML = CHAPTERS.map((chapter, index) => {
		return chapterButton(world, chapter, index, selectedChapter, maximumChapter);
	}).join('');
	dom.levelSelect.innerHTML = levelsForChapter(selectedChapter).map(level => {
		return levelButton(world, level);
	}).join('');
}

function chapterButton(world, chapter, index, selectedChapter, maximumChapter) {
	const progress = chapterProgress(world.save, index);
	const locked = index > maximumChapter;
	const active = index === selectedChapter ? ' active' : '';
	const label = locked ? 'LOCKED' : `${progress.completed}/20 · ${progress.stars}★`;
	return `<button class="chapter-card${active}" data-chapter="${index}" ${locked ? 'disabled' : ''} aria-label="${chapter.name} chapter, ${label}"><b>${index + 1}</b><span>${chapter.name}</span><em>${label}</em></button>`;
}

function levelButton(world, level) {
	const locked = level.globalIndex > world.save.unlocked;
	const stars = world.save.stars[level.key] || 0;
	const record = world.save.levelRecords[level.key];
	const active = level.globalIndex === world.level.index ? ' active' : '';
	const mastery = record?.mastered ? ' · MASTERED' : '';
	const status = locked ? 'LOCKED' : `${starLine(stars)}${mastery}`;
	return `<button class="level-card${active}" data-level="${level.globalIndex}" ${locked ? 'disabled' : ''} aria-label="District ${level.globalIndex + 1}, ${level.name}, ${status}"><b>${level.globalIndex + 1}</b><span>${level.name}</span><small>${level.nodeType.toUpperCase()} · ${level.mechanic.replaceAll('-', ' ')}</small><em>${status}</em></button>`;
}

function starLine(count) {
	return `${'★'.repeat(count)}${'☆'.repeat(3 - count)}`;
}
