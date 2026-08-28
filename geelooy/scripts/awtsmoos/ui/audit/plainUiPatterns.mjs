//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlainUiPatterns
 * @description
 * The Awtsmoos lets Awtsmoos.com name real interaction debt without counting its own
 * planning shadows as production light; each pattern stays narrow, declarative, and owned.
 */

/** File extensions examined by the authored UI audit. */
export const AUDITED_EXTENSIONS = new Set([
	'.css',
	'.html',
	'.js',
	'.mjs'
]);

/** Directory names skipped because they are generated, external, or durable agent memory. */
export const IGNORED_DIRECTORIES = new Set([
	'.awtsmoos-agent-thoughts',
	'.awtsmoos-agent-transfer',
	'.awtsmoos-sandboxes',
	'.git',
	'ai thoughts',
	'ai-thoughts',
	'dist',
	'node_modules',
	'vendor'
]);

/**
 * Declarative interaction-language signals that do not require whole-document parsing.
 * CSS ownership, width, and elevation rules live in the specialist CSS scanner.
 */
export const PLAIN_UI_PATTERNS = Object.freeze([
	{
		id: 'browser-dialog',
		severity: 'high',
		extensions: ['.html', '.js', '.mjs'],
		source: String.raw`\b(?:window\.)?(?:alert|confirm|prompt)\s*\(`,
		detail: 'Blocking browser dialog in authored UI flow.'
	},
	{
		id: 'inline-handler',
		severity: 'high',
		extensions: ['.html'],
		source: String.raw`\son(?:click|change|input|submit|mouseover|mouseenter|mouseleave)\s*=`,
		detail: 'Inline event attribute bypasses modular interaction boundaries.'
	},
	{
		id: 'inline-style',
		severity: 'medium',
		extensions: ['.html'],
		source: String.raw`\sstyle\s*=`,
		detail: 'Inline presentation may bypass shared states and responsive rules.'
	},
	{
		id: 'placeholder-guidance',
		severity: 'medium',
		extensions: ['.html'],
		source: String.raw`\splaceholder\s*=`,
		detail: 'Placeholder may be carrying guidance that belongs in persistent custom copy.'
	},
	{
		id: 'outline-suppression',
		severity: 'high',
		extensions: ['.css'],
		source: String.raw`outline\s*:\s*(?:none|0)\s*;`,
		detail: 'Focus outline removed; verify an equivalent visible focus state exists.'
	}
]);
