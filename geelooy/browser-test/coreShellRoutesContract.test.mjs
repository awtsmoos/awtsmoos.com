// B"H
/** Verifies every main route shares the new shell while deep content stays intact. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const unified = [
	['geelooy/index.html', 'data-home-dashboard-page'],
	['geelooy/profile/index.html', 'geelooy-profile-shell'],
	['geelooy/heichelos/_awtsmoos.index.html', 'data-heichelos-index'],
	['geelooy/email/index.html', 'data-mail-page'],
	['geelooy/notifications/index.html', 'data-notifications-page'],
	['geelooy/mawgawl/sefarim/index.html', 'data-sefarim-search-page'],
	['geelooy/apps/index.html', 'data-apps-page'],
	['geelooy/about/index.html', 'g-about-article']
];

for (const [file, marker] of unified) {
	const html = readFileSync(file, 'utf8');
	assert.ok(html.includes(marker), `${file} missing route marker ${marker}`);
	assert.ok(html.includes('/style/geelooy-app/index.css'), `${file} missing unified app CSS`);
	assert.ok(html.includes('/scripts/awtsmoos/social/shell/boot.js'), `${file} missing shell boot`);
}

for (const [file, marker] of [
	['geelooy/heichelos/_awtsmoos.submitToHeichel.html', 'data-geelooy-create-page'],
	['geelooy/heichelos/_awtsmoos.heichel.html', 'data-heichel-page']
]) {
	const html = readFileSync(file, 'utf8');
	assert.ok(html.includes(marker), `${file} missing preserved deep-route marker`);
}
console.log('B"H coreShellRoutesContract.test passed');
