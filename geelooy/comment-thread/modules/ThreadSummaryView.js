//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadSummaryView
 * @description The Awtsmoos holds the entire conversation while Awtsmoos.com shows only the orientation needed now;
 * voices, replies, and participants stay visible, while structural depth and semantic relation detail retract until invited.
 */
import { createProgressiveDisclosure } from '../../shared/social/ui/ProgressiveDisclosure.js';

function chip(document, label, value) {
	if (!Number(value)) return null;
	const span = document.createElement('span');
	span.className = 'threadSummary__chip';
	span.textContent = `${value} ${label}`;
	return span;
}

function appendChips(container, values) {
	for (const item of values.filter(Boolean)) container.append(item);
}

function advancedSummary(document, summary) {
	const body = document.createElement('div');
	body.className = 'threadSummary__advanced';
	appendChips(body, [
		chip(document, 'levels deep', summary.maxDepth),
		chip(document, 'references', summary.references),
		chip(document, 'media', summary.assets),
		chip(document, 'voice notes', summary.voiceNotes),
		chip(document, 'tombstones', summary.tombstones)
	]);
	const relations = document.createElement('div');
	relations.className = 'threadSummary__relations';
	for (const [name, value] of Object.entries(summary.relations || {})) {
		const item = chip(document, name.replaceAll('_', ' '), value);
		if (item) relations.append(item);
	}
	if (relations.childElementCount) body.append(relations);
	return createProgressiveDisclosure({
		document,
		label: 'Conversation details',
		detail: summary.references ? `${summary.references} references` : '',
		content: body,
		variant: 'compact'
	}).root;
}

export function createThreadSummaryView(document, summary = {}) {
	const section = document.createElement('aside');
	section.className = 'threadSummary';
	section.setAttribute('aria-label', 'Conversation summary');
	const heading = document.createElement('strong');
	heading.textContent = 'Conversation map';
	const metrics = document.createElement('div');
	metrics.className = 'threadSummary__metrics';
	appendChips(metrics, [
		chip(document, 'voices', summary.visible),
		chip(document, 'replies', summary.replies),
		chip(document, 'participants', summary.participants)
	]);
	section.append(heading, metrics, advancedSummary(document, summary));
	return section;
}

export { advancedSummary, appendChips, chip };
