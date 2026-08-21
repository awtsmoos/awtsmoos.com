//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProgressiveDisclosure
 * @description The Awtsmoos contains endless detail without forcing every vessel into sight;
 * Awtsmoos.com uses one native-details grammar so advanced power stays keyboard-safe, retractable, and light.
 */
function nodes(value) {
	if (Array.isArray(value)) return value.filter(Boolean);
	return value ? [value] : [];
}

function createSummary(document, label, detailText = '') {
	const summary = document.createElement('summary');
	summary.className = 'awtsmoosDisclosure__summary';
	const labelNode = document.createElement('span');
	labelNode.className = 'awtsmoosDisclosure__label';
	labelNode.textContent = label;
	const detail = document.createElement('span');
	detail.className = 'awtsmoosDisclosure__detail';
	detail.textContent = detailText;
	const chevron = document.createElement('span');
	chevron.className = 'awtsmoosDisclosure__chevron';
	chevron.setAttribute('aria-hidden', 'true');
	chevron.textContent = '⌄';
	summary.append(labelNode, detail, chevron);
	return { summary, detail };
}

export function createProgressiveDisclosure({
	document = globalThis.document,
	label = 'More',
	detail = '',
	content = [],
	open = false,
	variant = 'compact',
	className = '',
	onToggle = null
} = {}) {
	const root = document.createElement('details');
	const summaryParts = createSummary(document, label, detail);
	const body = document.createElement('div');
	root.className = `awtsmoosDisclosure awtsmoosDisclosure--${variant} ${className}`.trim();
	root.open = Boolean(open);
	root.dataset.expanded = String(root.open);
	body.className = 'awtsmoosDisclosure__body';
	body.append(...nodes(content));
	root.append(summaryParts.summary, body);
	root.addEventListener('toggle', () => {
		root.dataset.expanded = String(root.open);
		onToggle?.(root.open);
	});
	return {
		root,
		body,
		summary: summaryParts.summary,
		detail: summaryParts.detail
	};
}

export { createSummary, nodes };
