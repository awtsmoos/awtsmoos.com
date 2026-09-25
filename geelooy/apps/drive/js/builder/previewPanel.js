//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreviewPanel
 * @description
 * The Awtsmoos lets source become visible without pretending the vision is publication;
 * Awtsmoos.com keeps one sandboxed iframe alive while preview readiness becomes a real transient witness and canonical URLs remain a separate covenant.
 *
 * Sibling auto-link: when previewing an .html file, sibling *.css / *.js files in
 * the same folder are auto-injected (same-basename first, then the rest).
 * Note: inside a sandboxed srcdoc iframe there is no resolvable base URL for
 * sibling files (private Drive paths are not addressable, and the sandbox
 * blocks network loads), so siblings are inlined as <style>/<script> blocks
 * tagged with data-autolink="<file>". This is functionally equivalent for
 * preview and keeps the iframe exactly as sandboxed as before.
 */

import { markPreviewed, setPreviewMode } from './builderState.js';

const MAX_AUTOLINK_FILES = 8;

export function installPreviewPanel(service, code, actions = {}) {
	const frame = document.querySelector('#builder-preview-frame');
	const shell = document.querySelector('#builder-preview-shell');
	const status = document.querySelector('#builder-preview-status');
	let inventoryFiles = [];
	for (const button of document.querySelectorAll('[data-preview-mode]')) {
		button.addEventListener('click', () => setMode(button.dataset.previewMode));
	}
	document.querySelector('#builder-preview-refresh').addEventListener('click', () => settle(refresh));
	return { refresh, open: refresh, status: previewStatus, update };

	async function refresh() {
		const current = code.inspect();
		const source = current.path === 'index.html' ? current : await service.readFile('index.html');
		const siblings = await collectSiblings('index.html', current);
		frame.srcdoc = previewDocument(source.content, shell.dataset.canonicalUrl, siblings);
		markPreviewed();
		status.textContent = current.path === 'index.html' && current.dirty
			? 'Local preview · unsaved index.html draft'
			: 'Local preview · saved Drive index.html';
		actions.previewed?.();
		return previewStatus();
	}

	async function collectSiblings(htmlRelativePath, current) {
		const siblings = { css: [], js: [] };
		const dir = dirname(htmlRelativePath);
		const base = basename(htmlRelativePath);
		const css = [];
		const js = [];
		for (const file of inventoryFiles) {
			const rel = file?.relativePath || '';
			if (!rel || dirname(rel) !== dir) continue;
			if (/\.css$/i.test(rel)) css.push(rel);
			else if (/\.m?js$/i.test(rel)) js.push(rel);
		}
		for (const rel of orderSiblingAssets(css, base).slice(0, MAX_AUTOLINK_FILES)) {
			const content = await siblingContent(rel, current);
			if (content != null) siblings.css.push({ name: rel.split('/').pop(), content });
		}
		for (const rel of orderSiblingAssets(js, base).slice(0, MAX_AUTOLINK_FILES)) {
			const content = await siblingContent(rel, current);
			if (content != null) siblings.js.push({ name: rel.split('/').pop(), content });
		}
		return siblings;
	}

	async function siblingContent(relativePath, current) {
		if (current && current.path === relativePath) {
			return current.content;
		}
		try {
			const file = await service.readFile(relativePath);
			return file?.content ?? null;
		} catch {
			return null;
		}
	}

	function setMode(mode) {
		shell.dataset.previewMode = mode || 'mobile';
		setPreviewMode(mode);
		for (const button of document.querySelectorAll('[data-preview-mode]')) {
			button.setAttribute('aria-pressed', String(button.dataset.previewMode === mode));
		}
	}

	function update(snapshot) {
		shell.dataset.canonicalUrl = snapshot?.canonicalUrl || '';
		inventoryFiles = Array.isArray(snapshot?.source?.files) ? snapshot.source.files : [];
		document.querySelector('#builder-preview-canonical').textContent = snapshot?.canonicalUrl
			? `Published assets resolve against ${snapshot.canonicalUrl}`
			: 'No canonical URL yet. This preview remains local source only.';
	}

	function previewStatus() {
		return {
			mode: shell.dataset.previewMode || 'mobile',
			sourcePath: 'index.html',
			canonicalUrl: shell.dataset.canonicalUrl || '',
			label: status.textContent
		};
	}

	async function settle(action) {
		try {
			await action();
		} catch (error) {
			actions.error?.(error);
		}
	}
}

/**
 * Orders sibling asset paths: same-basename matches first (in stable order),
 * then everything else alphabetically. Pure and unit-testable.
 * @param {string[]} files relative asset paths
 * @param {string} htmlFileName the previewed html file name (e.g. "index.html")
 */
export function orderSiblingAssets(files, htmlFileName = 'index.html') {
	const stem = stemOf(htmlFileName);
	const same = [];
	const rest = [];
	for (const file of files || []) {
		if (isSameBasename(stemOf(file), stem)) same.push(file);
		else rest.push(file);
	}
	rest.sort((a, b) => String(a).localeCompare(String(b)));
	return [...same, ...rest];
}

function stemOf(fileName) {
	return String(fileName).split('/').pop().replace(/\.[^.]+$/, '').toLowerCase();
}

function isSameBasename(stem, baseStem) {
	return stem === baseStem || ['.', '-', '_'].some(sep => stem.startsWith(baseStem + sep));
}

/**
 * Injects sibling css/js contents into an HTML string. Styles go into <head>,
 * scripts go just before </body>; each block is tagged with its file name.
 * Pure and unit-testable. Never touches the sandbox.
 * @param {string} html
 * @param {{css?:Array<{name:string,content:string}>, js?:Array<{name:string,content:string}>}} siblings
 */
export function autolinkSiblings(html, siblings = {}) {
	const css = (siblings.css || []).filter(file => file && file.content);
	const js = (siblings.js || []).filter(file => file && file.content);
	if (css.length === 0 && js.length === 0) {
		return String(html || '');
	}
	let out = String(html || '');
	if (css.length > 0) {
		const styles = css.map(file =>
			`<style data-autolink="${attributeText(file.name)}">\n${file.content}\n</style>`).join('\n');
		if (/<\/head\s*>/i.test(out)) {
			out = out.replace(/<\/head\s*>/i, `${styles}\n</head>`);
		} else if (/<head[\s>]/i.test(out)) {
			out = out.replace(/<head([^>]*)>/i, `<head$1>${styles}`);
		} else {
			out = `<head>${styles}</head>${out}`;
		}
	}
	if (js.length > 0) {
		const scripts = js.map(file =>
			`<script data-autolink="${attributeText(file.name)}">\n${file.content}\n</script>`).join('\n');
		if (/<\/body\s*>/i.test(out)) {
			out = out.replace(/<\/body\s*>/i, `${scripts}\n</body>`);
		} else {
			out = `${out}\n${scripts}`;
		}
	}
	return out;
}

export function previewDocument(content, canonicalUrl = '', siblings = null) {
	const base = canonicalUrl ? `<base href="${attributeText(canonicalUrl)}">` : '';
	const linked = siblings ? autolinkSiblings(content, siblings) : String(content || '');
	if (!base) {
		return linked;
	}
	if (/<head[\s>]/i.test(linked)) {
		return linked.replace(/<head([^>]*)>/i, `<head$1>${base}`);
	}
	return `${base}${linked}`;
}

function dirname(relativePath) {
	const parts = String(relativePath || '').split('/');
	parts.pop();
	return parts.join('/');
}

function basename(relativePath) {
	return String(relativePath || '').split('/').pop();
}

function attributeText(value) {
	return String(value || '')
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
