// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelOsWorldPanel
 * @description
 * The Awtsmoos lets one live state illuminate both public profile and district
 * console without duplicating ownership inside Awtsmoos.com.
 */
import { districtCopy, districtTitle } from './world-data.js';
import { createWorldPanel } from './world-blueprints.js';

export function heichelWorldPanel(actions = {}) {
	return createWorldPanel({
		...actions,
		activateHeichelDistrict: actions.activateHeichelDistrict || activateDistrict
	});
}

export function renderHeichelWorldState({
	heichel = {},
	content = {},
	ownsIt = false,
	currentSeries = 'root'
} = {}) {
	const counts = {
		posts: count(content.posts),
		series: count(content.subSeries),
		followers: count(heichel.followers || heichel.members || heichel.subscribers),
		mode: ownsIt ? 'owner' : 'visitor',
		currentSeries
	};
	paintProfileCounts(counts);
	const root = document.querySelector('[data-heichel-os-world]');
	if (!root) return;
	setText(root, '[data-heichel-os-name]', heichel.name || heichel.title || 'Living Heichel');
	setText(root, '[data-heichel-os-desc]', heichel.description || 'Live knowledge, people, and source paths.');
	for (const [key, value] of Object.entries(counts)) {
		setText(root, `[data-heichel-os-count="${key}"]`, value);
	}
}

export function activateDistrict(name = 'overview') {
	const root = document.querySelector('[data-heichel-os-world]');
	if (!root) return;
	root.querySelectorAll('[data-heichel-district]').forEach(button => {
		button.classList.toggle('active', button.dataset.heichelDistrict === name);
	});
	setText(root, '[data-heichel-district-title]', districtTitle(name));
	const body = root.querySelector('[data-heichel-district-body]');
	if (body) body.replaceChildren(...districtCopy(name).map(paragraph));
}

function paintProfileCounts(counts) {
	for (const [key, value] of Object.entries(counts)) {
		const node = document.querySelector(`[data-heichel-profile-count="${key}"]`);
		if (node) node.textContent = compactNumber(value);
	}
}

function setText(root, selector, value) {
	const node = root.querySelector(selector);
	if (node) node.textContent = value;
}

function paragraph(text) {
	const node = document.createElement('p');
	node.textContent = text;
	return node;
}

function count(value) {
	if (Array.isArray(value)) return value.length;
	if (value && typeof value === 'object') return Object.keys(value).length;
	return Number(value || 0) || 0;
}

function compactNumber(value) {
	return new Intl.NumberFormat('en', {
		notation: 'compact',
		maximumFractionDigits: 1
	}).format(value);
}
