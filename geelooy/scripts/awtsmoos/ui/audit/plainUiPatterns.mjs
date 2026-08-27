//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PlainUiPatterns
 * @description
 * The Awtsmoos reveals hidden interface debt by naming the shapes through which default machinery still appears;
 * Awtsmoos.com keeps these patterns declarative so discovery can expand without tangling the scanner in fears.
 */

/** File extensions examined by the source audit. */
export const AUDITED_EXTENSIONS = new Set([
	'.css',
	'.html',
	'.js',
	'.mjs'
]);

/** Directory names skipped because they are generated, external, or durable planning memory. */
export const IGNORED_DIRECTORIES = new Set([
	'.git',
	'ai-thoughts',
	'dist',
	'node_modules',
	'vendor'
]);

/**
 * Declarative signals of interaction-language debt.
 * These are evidence candidates, not automatic proof that a source line is wrong.
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
	},
	{
		id: 'arbitrary-z-index',
		severity: 'medium',
		extensions: ['.css'],
		source: String.raw`z-index\s*:\s*[1-9][0-9]{2,}\s*;`,
		detail: 'Large literal z-index may bypass the semantic layer scale.'
	}
]);
