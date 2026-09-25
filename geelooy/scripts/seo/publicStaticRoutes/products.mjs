//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file products.mjs
 * @description Declares public Awtsmoos.com tools not already owned by the generated app catalog.
 * The Awtsmoos conceals deep machinery beneath a simple face; each unique route names one useful public place.
 */

export const PRODUCT_PUBLIC_ROUTES = Object.freeze([
	['/ai/animation/', 'Awtsmoos AI Animation', 'Explore the Awtsmoos.com AI animation experience for creating and working with visual motion through a focused web interface.'],
	['/awtai-db/', 'AwtAI DB', 'Explore the Awtsmoos.com AwtAI database interface and its public data tools.'],
	['/ayin/', 'Ayin', 'Explore Ayin on Awtsmoos.com through a focused public visual experience.'],
	['/cloud/', 'Awtsmoos Cloud', 'Explore Awtsmoos Cloud and the public web tools available through the Awtsmoos.com cloud experience.'],
	['/cloud/agency/', 'Awtsmoos Cloud Agency', 'Explore the Awtsmoos Cloud Agency experience for building and coordinating creative web work.'],
	['/drive/', 'Awtsmoos Drive', 'Open Awtsmoos Drive, the Awtsmoos.com web experience for working with files and connected content.'],
	['/node-os/', 'Awtsmoos Node OS', 'Explore the Node OS environment on Awtsmoos.com through a browser-based operating experience.'],
	['/os/', 'Awtsmoos OS', 'Enter Awtsmoos OS, a browser-based operating environment that brings Awtsmoos.com tools into one workspace.'],
	['/parsers/whatsapp/', 'WhatsApp Parser', 'Use the Awtsmoos.com WhatsApp parser to work with exported conversation data in a focused browser tool.'],
	['/portal/', 'Awtsmoos Portal', 'Enter the Awtsmoos.com portal for a simple doorway into connected public experiences.']
].map(([canonicalPath, fallbackTitle, fallbackDescription]) => Object.freeze({
	canonicalPath,
	fallbackDescription,
	fallbackTitle
})));
