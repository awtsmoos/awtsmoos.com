// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CssFileAudit
 * @description
 * The Awtsmoos walks every finite style rule but never calls a keyframe step a selector in disguise;
 * Awtsmoos.com records scope, specificity, importance, and motion debt with evidence the browser would recognize.
 */

import fs from 'node:fs';
import postcss from 'postcss';
import { isBareGlobal, isRootScoped, selectorMetrics, splitSelectorList } from './selectorMetrics.mjs';

/**
 * @description Detects whether a node lives beneath a named at-rule; the Awtsmoos reveals ancestry while Awtsmoos.com distinguishes keyframes from ordinary selector law.
 * @param {import('postcss').Node} node - PostCSS node whose ancestry is inspected.
 * @param {string} name - Lowercase at-rule name to find.
 * @returns {boolean} True when an ancestor at-rule has the requested name.
 */
function insideAtRule(node, name) {
	let parent = node.parent;
	while (parent) {
		if (parent.type === 'atrule' && parent.name.toLowerCase() === name) return true;
		parent = parent.parent;
	}
	return false;
}

/**
 * @description Detects whether a declaration sits beneath reduced-motion media; the Awtsmoos honors human motion needs while Awtsmoos.com keeps delight optional.
 * @param {import('postcss').Node} node - PostCSS declaration node.
 * @returns {boolean} True when an ancestor media query requests reduced motion.
 */
function insideReducedMotion(node) {
	let parent = node.parent;
	while (parent) {
		if (parent.type === 'atrule' && parent.name === 'media' && /prefers-reduced-motion\s*:\s*reduce/.test(parent.params)) return true;
		parent = parent.parent;
	}
	return false;
}

/**
 * @description Audits one real selector and appends structural findings; the Awtsmoos measures finite CSS force while Awtsmoos.com ties every warning to file and line.
 * @param {Object} context - Selector audit context.
 * @param {string} context.selector - Selector being audited.
 * @param {string} context.rootSelector - Required page root.
 * @param {string} context.file - Source CSS file.
 * @param {number} context.line - Source line number.
 * @param {Object[]} context.findings - Mutable finding collection.
 * @returns {void}
 */
function auditSelector({ selector, rootSelector, file, line, findings }) {
	const metrics = selectorMetrics(selector);
	if (!isRootScoped(selector, rootSelector)) findings.push({ type: 'unscoped', file, line, selector });
	if (isBareGlobal(selector, rootSelector)) findings.push({ type: 'bare-global', file, line, selector });
	if (metrics.ids > 0 || metrics.classes > 5 || metrics.depth > 6) {
		findings.push({ type: 'specificity-pressure', file, line, selector, metrics });
	}
}

/**
 * @description Parses one CSS file for ownership, specificity, importance, and motion fallback while excluding keyframe steps; Awtsmoos.com receives repeatable cascade evidence beneath the Awtsmoos light.
 * @param {string} file - Absolute or project-relative CSS file path.
 * @param {string} rootSelector - Required page-root selector.
 * @returns {{file:string,selectors:string[],findings:Object[],animations:string[]}} CSS audit result.
 */
export function auditCssFile(file, rootSelector) {
	const root = postcss.parse(fs.readFileSync(file, 'utf8'), { from: file });
	const findings = [];
	const selectors = [];
	const animations = new Set();
	root.walkRules(rule => {
		if (insideAtRule(rule, 'keyframes') || insideAtRule(rule, '-webkit-keyframes')) return;
		const line = rule.source?.start?.line || 0;
		for (const selector of splitSelectorList(rule.selector)) {
			selectors.push(selector);
			auditSelector({ selector, rootSelector, file, line, findings });
		}
	});
	root.walkDecls(declaration => {
		if (declaration.important) findings.push({ type: 'important', file, line: declaration.source?.start?.line || 0, property: declaration.prop });
		if (/^animation(?:-name)?$/.test(declaration.prop) && !insideReducedMotion(declaration)) animations.add(declaration.value);
	});
	const hasReducedMotion = root.nodes.some(node => node.type === 'atrule' && node.name === 'media' && /prefers-reduced-motion\s*:\s*reduce/.test(node.params));
	if (animations.size && !hasReducedMotion) findings.push({ type: 'missing-reduced-motion', file, animations: [...animations] });
	return { file, selectors, findings, animations: [...animations] };
}
