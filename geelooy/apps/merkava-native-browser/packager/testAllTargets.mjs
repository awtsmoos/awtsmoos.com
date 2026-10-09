// B"H
// Cross-platform native target tests: one source -> ELF + EXE + APP + APK.

import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { compileToElf, compileToExe, compileToApp, compileToApk } = require('./TargetPackager.cjs');

const HELLO = {
	html: '<div id="app"><h1 id="t">Hello Native</h1><p id="sub">One source, four binaries.</p></div>',
	css: '#t { color: navy; } #sub { color: gray; }',
	js: 'document.getElementById("t").textContent = "Hello Native!";'
};

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => {
	if (cond) { pass++; console.log(`PASS ${name}`); }
	else { fail++; console.log(`FAIL ${name} ${detail}`); }
};

// ---- ELF ----
try {
	const r = await compileToElf(HELLO.html, HELLO.css, HELLO.js, 'HelloNative');
	ok('elf-built', fs.existsSync(r.binary));
	ok('elf-magic', r.elfMagic === '\x7fELF', JSON.stringify(r.elfMagic));
	ok('elf-container', fs.existsSync(r.container));
	// Launch headless under Xvfb: must open window (timeout kill = success, error exit = fail).
	try {
		execFileSync('xvfb-run', ['-a', 'timeout', '4', r.binary, r.container], { stdio: 'pipe', timeout: 15000 });
		ok('elf-opens', false, 'exited immediately, expected to block in event loop');
	} catch (e) {
		// timeout kills it (exit 124) => window opened and sat in loop. Other exits => real failure.
		const code = e.status;
		ok('elf-opens', code === 124, `exit=${code} ${e.message.slice(0, 120)}`);
	}
} catch (e) { ok('elf-built', false, e.message.slice(0, 200)); }

// ---- EXE ----
try {
	const r = await compileToExe(HELLO.html, HELLO.css, HELLO.js, 'HelloNative');
	ok('exe-built', fs.existsSync(r.binary));
	ok('exe-mz', r.mzMagic === 'MZ', JSON.stringify(r.mzMagic));
	const fileOut = execFileSync('file', [r.binary]).toString();
	ok('exe-pe', /PE32\+?.*Windows/.test(fileOut), fileOut.slice(0, 80));
} catch (e) { ok('exe-built', false, e.message.slice(0, 200)); }

// ---- APP (macOS bundle skeleton; binary only on darwin) ----
try {
	const r = await compileToApp(HELLO.html, HELLO.css, HELLO.js, 'HelloNative');
	ok('app-bundle', fs.existsSync(r.bundle));
	ok('app-plist', fs.existsSync(r.bundle + '/Contents/Info.plist'));
	ok('app-container', fs.existsSync(r.bundle + '/Contents/Resources/app.merkava'));
	console.log(`  (app binaryBuilt=${r.binaryBuilt} — full binary requires macOS host)`);
} catch (e) { ok('app-bundle', false, e.message.slice(0, 200)); }

// ---- APK ----
try {
	const r = await compileToApk(HELLO.html, HELLO.css, HELLO.js, 'HelloNative');
	ok('apk-built', fs.existsSync(r.apk));
	const bt = process.env.ANDROID_BUILD_TOOLS || null;
	console.log(`  apk=${r.apk} package=${r.packageName}`);
} catch (e) { ok('apk-built', false, e.message.slice(0, 200)); }

console.log(`\n==== ${pass} pass, ${fail} fail ====`);
process.exit(fail ? 1 : 0);
