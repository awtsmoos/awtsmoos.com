// B"H
/** Verifies the extreme visual system stays modular and reaches every main route. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

function filesUnder(directory) {
	return readdirSync(directory).flatMap(name => {
		const target = path.join(directory, name);
		return statSync(target).isDirectory() ? filesUnder(target) : [target];
	});
}

const cssFiles = [
	...filesUnder('geelooy/style/geelooy-app'),
	...filesUnder('geelooy/style/auth'),
	...filesUnder('geelooy/style/social/profile-dropdown'),
	...filesUnder('geelooy/email/css/quantum'),
	'geelooy/style/forms.css',
	'geelooy/email/css/core.css',
	'geelooy/email/css/sidebar.css',
	'geelooy/email/css/chat.css',
	'geelooy/email/css/composer.css',
	'geelooy/email/css/fx.css',
	'geelooy/email/css/social-shell.css',
	'geelooy/email/css/hypermail.css'
].filter(file => file.endsWith('.css'));

for (const file of cssFiles) {
	const source = readFileSync(file, 'utf8');
	assert.ok(source.split('\n').length <= 121, `${file} exceeds 120 source lines`);
	assert.ok(source.includes('B"H'), `${file} missing B"H header`);
}

const entry = readFileSync('geelooy/style/geelooy-app/index.css', 'utf8');
for (const module of ['tokens.css', 'base.css', 'header/index.css', 'shell.css', 'surfaces.css', 'home.css', 'pages.css', 'responsive.css']) {
	assert.ok(entry.includes(module), `app CSS entry missing ${module}`);
}

const headerCss = filesUnder('geelooy/style/geelooy-app/header').map(file => readFileSync(file, 'utf8')).join('\n');
for (const token of ['.g-unusual-header', '.g-bh-jewel', '.g-header-search', '.g-search-orb', '.g-constellation-menu']) {
	assert.ok(headerCss.includes(token), `restored header CSS missing ${token}`);
}

const quantumCss = filesUnder('geelooy/email/css/quantum').map(file => readFileSync(file, 'utf8')).join('\n');
for (const token of ['--mail-gold', '--mail-cyan', '.mail-quantum-frame', '.sender-group-card', '.msg-row.me', '.composer-box']) {
	assert.ok(quantumCss.includes(token), `Quantum Mail CSS missing ${token}`);
}
assert.ok(!quantumCss.includes('no spectacle'), 'Quantum Mail must not restore the flattening override');

for (const file of ['index.html', 'email/index.html', 'notifications/index.html', 'mawgawl/sefarim/index.html', 'apps/index.html', 'profile/index.html', 'heichelos/_awtsmoos.index.html', 'about/index.html']) {
	const source = readFileSync(`geelooy/${file}`, 'utf8');
	assert.ok(source.includes('/style/geelooy-app/index.css'), `${file} missing unified app CSS`);
	assert.ok(source.includes('/scripts/awtsmoos/social/shell/boot.js'), `${file} missing shell boot`);
}
console.log('B"H geelooyAppQuality.test passed');
