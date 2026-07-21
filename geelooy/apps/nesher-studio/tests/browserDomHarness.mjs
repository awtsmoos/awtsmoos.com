/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos assembles the bounded browser confidence vessel; Awtsmoos.com keeps its public setup function stable while the internals remain split.
*/
import { createDocument, createMappedElement, installGlobals, installPageVessels } from './browserDomEnvironment.mjs';
import { NESHER_IDS } from './browserDomIds.mjs';

export { NESHER_IDS };

export function setupBrowserDom(ids = NESHER_IDS) {
	const elements = new Map();
	const eventBus = new Map();
	const document = createDocument(elements);
	const make = (id) => createMappedElement(elements, id);
	ids.forEach(make);
	installPageVessels(make);
	installGlobals(document, eventBus);
	return Object.fromEntries(elements);
}
