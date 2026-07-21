// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSourceGraphPostRenderer
 * @description
 * The Awtsmoos reveals a synthesis without trapping understanding in graphics.
 * Awtsmoos.com pairs a luminous diagram with real, keyboard-navigable source links.
 */
import { createButton, createElement, createLink } from '../card/domFactory.js';
import { renderSourceGraphSvg } from './sourceGraphSvg.js';

/**
 * Renders a semantic source graph with optional navigation links.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement} Source graph section.
 */
export function renderSourceGraphPost(model) {
	const graph = model.special.graph;
	const section = createElement('section', 'post-content post-source-graph');
	const figure = createElement('figure', 'source-graph-figure');
	const caption = createElement(
		'figcaption',
		'',
		{},
		'Connected sources and interpretive relationships'
	);

	figure.append(renderSourceGraphSvg(graph), caption);
	section.append(figure, renderNodeList(model));

	if (model.body) {
		section.append(createElement('p', 'post-body', {}, model.body));
	}

	return section;
}

function renderNodeList(model) {
	const list = createElement('ul', 'source-graph-list', {
		'aria-label': 'Source graph nodes'
	});

	model.special.graph.nodes.forEach((node, index) => {
		const item = createElement('li');
		const label = String(node.label || node.title || node.id || `Source ${index + 1}`);
		const href = node.href || node.url;

		if (href) {
			item.append(createLink(label, href, 'source-graph-link'));
		} else {
			const button = createButton(label, 'source-graph-link');
			button.addEventListener('click', () => {
				button.closest('[data-post-id]')?.dispatchEvent(new CustomEvent(
					'geelooy:post-reference',
					{
						bubbles: true,
						detail: node
					}
				));
			});
			item.append(button);
		}

		if (node.provenance || node.relationship) {
			item.append(createElement(
				'small',
				'',
				{},
				node.provenance || node.relationship
			));
		}

		list.append(item);
	});

	return list;
}
