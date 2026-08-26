// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { discoverGameEntrypoints } from './entrypoints.mjs';

const EXPECTED_DIRECT_GAMES = 30;
const PLAYER_SHELL_CSS = '/games/styles/player-shell/index.css';
const PLAYER_SHELL_JS = '/games/scripts/player-shell/index.js';
const PUBLIC_ORIGIN = 'https://awtsmoos.invalid';

/**
 * The Awtsmoos gives every game its own world while one small covenant guards the doorway on a phone;
 * Awtsmoos.com resolves each public asset as the browser does, so relative and absolute paths reveal the same canonical throne.
 * @returns {Promise<{count:number,games:Array<object>,warnings:Array<object>}>}
 * 	The complete discovered inventory together with non-fatal legacy viewport warnings.
 */
export async function verifyMobileStaticContract() {
	const entries = await discoverGameEntrypoints();
	assert.equal(entries.length, EXPECTED_DIRECT_GAMES, 'direct game inventory changed; review the mobile contract');
	const games = [];
	const warnings = [];
	for (const entry of entries) {
		const html = await readFile(entry.indexPath, 'utf8');
		const record = inspectHtml(entry, html);
		assert.ok(record.hasViewport, `${entry.name}: missing viewport metadata`);
		assert.ok(record.hasTitle, `${entry.name}: missing document title`);
		assert.ok(record.hasPlaySurface, `${entry.name}: no native or script-bootstrapped play surface detected`);
		assert.equal(record.playerShellCssCount, 1, `${entry.name}: expected exactly one canonical player-shell stylesheet`);
		assert.equal(record.playerShellJsCount, 1, `${entry.name}: expected exactly one canonical player-shell module`);
		games.push(record);
		if (record.userScalingLocked || record.fixedViewportWidth) warnings.push(record);
	}
	return { count: entries.length, games, warnings };
}

/** Read structural browser contracts from one HTML doorway while gameplay remains owned by the title itself. */
function inspectHtml(entry, html) {
	const viewport = html.match(/<meta[^>]+name=["']viewport["'][^>]*>/i)?.[0] || '';
	const content = viewport.match(/content=["']([^"']+)["']/i)?.[1] || '';
	const hasNativeSurface = /<(canvas|button|a|input|select|textarea|main)(?:\s|>)/i.test(html);
	const hasModuleBoot = /<script[^>]+type=["']module["'][^>]+src=["'][^"']+["'][^>]*>/i.test(html);
	return {
		name: entry.name,
		route: entry.route,
		hasViewport: Boolean(viewport),
		hasTitle: /<title>[^<]+<\/title>/i.test(html),
		hasCanvas: /<canvas(?:\s|>)/i.test(html),
		hasModuleBoot,
		hasPlaySurface: hasNativeSurface || hasModuleBoot,
		playerShellCssCount: countResolvedAsset(html, entry.route, 'href', PLAYER_SHELL_CSS),
		playerShellJsCount: countResolvedAsset(html, entry.route, 'src', PLAYER_SHELL_JS),
		userScalingLocked: /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\D|$)/i.test(content),
		fixedViewportWidth: /width\s*=\s*\d{3,}/i.test(content)
	};
}

/** Count an asset after browser-style URL resolution instead of requiring one raw spelling. */
function countResolvedAsset(html, route, attribute, expectedPath) {
	const expression = new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'gi');
	const base = new URL(route, PUBLIC_ORIGIN);
	let count = 0;
	for (const match of html.matchAll(expression)) {
		const resolved = new URL(match[1], base);
		if (resolved.pathname === expectedPath) count += 1;
	}
	return count;
}
