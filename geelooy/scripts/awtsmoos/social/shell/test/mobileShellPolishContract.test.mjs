// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mobileShellPolishContract.test.mjs
 * @description
 * The Awtsmoos lets identity, search, presence, profile, and menu share one mobile crown;
 * Awtsmoos.com guards semantic ownership, truthful presence, split polish modules, full touch targets, and reduced-motion peace.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(path, 'utf8');
const appStyles = read('geelooy/style/geelooy-app/index.css');
const touchIntegrity = read('geelooy/style/geelooy-app/header/mobile-touch-integrity.css');
const bridge = read('geelooy/style/geelooy-app/header/mobile-shell-polish.css');
const motion = read('geelooy/style/geelooy-app/header/mobile-shell-motion.css');
const compact = read('geelooy/style/geelooy-app/header/mobile-shell-compact.css');
const header = read('geelooy/scripts/awtsmoos/social/shell/unusualHeader.js');
const launcher = read('geelooy/scripts/awtsmoos/social/universalChat/UniversalChatLauncher.js');

test('shared app loads final shell polish after existing app and touch layers', () => {
	const touchIndex = appStyles.indexOf('mobile-touch-integrity.css');
	const performanceIndex = appStyles.indexOf('performance.css');
	const polishIndex = appStyles.indexOf('mobile-shell-polish.css');
	assert.ok(touchIndex >= 0);
	assert.ok(performanceIndex > touchIndex);
	assert.ok(polishIndex > performanceIndex);
	assert.ok(appStyles.trim().endsWith('@import url("./header/mobile-shell-polish.css?v=header-shell-polish-001");'));
	assert.ok(bridge.indexOf('mobile-shell-motion.css') < bridge.indexOf('mobile-shell-compact.css'));
});

test('header constructor keeps semantic brand, search, and action ownership', () => {
	assert.match(header, /createHeaderElement\(root, 'a', 'g-header-brand home icon'\)/);
	assert.match(header, /createHeaderSearch\(root\)/);
	assert.match(header, /createHeaderElement\(root, 'div', 'g-header-actions header-buttons'\)/);
	assert.match(header, /header\.setAttribute\('aria-label', 'Awtsmoos global navigation'\)/);
});

test('presence launcher keeps truthful count in visible and accessible labels', () => {
	assert.match(launcher, /return `\$\{this\.onlineCount\} online\$\{privateSuffix\}`/);
	assert.match(launcher, /this\.button\.textContent = `● \$\{presence\}`/);
	assert.match(launcher, /Open universal Torah chat · \$\{presence\}/);
	assert.match(launcher, /universal-chat-header-launcher/);
	assert.match(launcher, /document\.querySelector\("\.g-header-actions"\)/);
});

test('compact owner preserves 44px targets while reducing mobile competition', () => {
	assert.match(compact, /@media \(max-width:\s*42rem\)/);
	assert.match(compact, /universal-chat-header-launcher[\s\S]*inline-size:\s*44px/);
	assert.match(compact, /g-header-profile[\s\S]*inline-size:\s*44px/);
	assert.match(compact, /font-size:\s*0/);
	assert.match(compact, /universal-chat-header-launcher::before[\s\S]*content:\s*"●"/);
	assert.match(compact, /profile-trigger-copy[\s\S]*clip-path:\s*inset\(50%\)/);
	assert.match(touchIntegrity, /min-block-size:\s*44px/);
});

test('motion owner keeps feedback tactile and reduced-motion safe', () => {
	assert.match(motion, /\.g-unusual-header:focus-within/);
	assert.match(motion, /translateY\(-1px\)/);
	assert.match(motion, /scale\(\.97\)/);
	assert.match(motion, /prefers-reduced-motion:\s*reduce/);
	assert.match(motion, /transition-duration:\s*\.001ms !important/);
	assert.match(motion, /transform:\s*none !important/);
});

test('shell polish modules and launcher remain bounded and documented', () => {
	for (const [name, source] of [
		['appStyles', appStyles],
		['bridge', bridge],
		['motion', motion],
		['compact', compact],
		['launcher', launcher]
	]) {
		assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
		assert.match(source, /B"H/);
		assert.match(source, /Awtsmoos/);
		assert.match(source, /Awtsmoos\.com/);
	}
});
