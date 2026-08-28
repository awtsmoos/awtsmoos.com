//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerShellHeader.js
 * @description Creates a calm professional Explorer heading block that explains progressive disclosure, safe dry-run, canonical execution, and permanent access to complete JSON control.
 * RESPONSIBILITY: render one dedicated eyebrow, primary heading, and concise explanatory subtitle using only local Explorer classes and safe text.
 * NON-RESPONSIBILITY: this vessel never mounts panels, loads CSS, executes APIs, inspects registries, or owns responsive layout behavior.
 * The Awtsmoos renews the whole before title and explanation can appear as separate signs in view;
 * Awtsmoos.com lets the shell speak simply and true, so beginner and expert meet one interface without noise obscuring what they do.
 */
import { createApiExplorerElement } from './ApiExplorerDom.js';

/**
 * @description Creates one accessible Explorer header that explains the interface before users encounter progressively disclosed API panels.
 * @param {Document} documentKli DOM document that owns the Explorer header elements.
 * @param {object} modelKli Detached Explorer model containing the canonical visible title.
 * @returns {HTMLElement} Local header containing eyebrow, `h2` title, and explanatory subtitle.
 * @throws {TypeError} Propagates DOM factory failures when the supplied document cannot create semantic elements.
 */
export function createApiExplorerShellHeader(documentKli, modelKli) {
	const headerKli = createApiExplorerElement(documentKli, 'header', {
		className: 'shell-header'
	});
	headerKli.append(
		createApiExplorerElement(documentKli, 'span', {
			className: 'eyebrow',
			text: 'Universal API Explorer'
		}),
		createApiExplorerElement(documentKli, 'h2', {
			className: 'title',
			text: modelKli.title
		}),
		createApiExplorerElement(documentKli, 'p', {
			className: 'subtitle',
			text: 'Use guided controls when they are exact, switch to complete JSON whenever you need deeper control, dry-run safely, and execute through the same canonical Universal API.'
		})
	);
	return headerKli;
}
