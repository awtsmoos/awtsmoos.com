// B"H
// Boruch Hashem
// Blessed be He

/**
 * Merkava cross-platform native packager.
 *
 * One web source (HTML+CSS+JS) -> four native binaries, all running Merkava
 * bytecode on the native C runtime. No WebView anywhere in the chain.
 *
 *   compileToElf(html, css, js, appName) -> Linux ELF (X11/GLX + OpenGL)
 *   compileToExe(html, css, js, appName) -> Windows PE (Win32 + WGL)
 *   compileToApp(html, css, js, appName) -> macOS .app bundle (Cocoa)
 *   compileToApk(html, css, js, appName) -> Android APK (NativeActivity + GLES3)
 *
 * Every target embeds:
 *   - the compiled .mapp bytecode (HTML/CSS/JS pre-compiled to opcodes)
 *   - packed as app.merkava (canonical MKV1 container)
 *   - executed by the native C launcher, which opens a real window, inits GL,
 *     decodes the bytecode and renders frames via GPU.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BINARY_DIR = path.resolve(__dirname, '../../../scripts/awtsmoos/MerkavaExecutor/merkava-binary');
const NATIVE_DIR = path.resolve(__dirname, '../native');
const DIST = process.env.MERKAVA_DIST || path.resolve(__dirname, '../dist/apps');
const MERKAVA_LOGO = process.env.MERKAVA_LOGO || '/home/hatch/workspace/merkava-screenshots/media-generation-merkava-browser-logo-0-e85bddef-6b2d-409f-be92-a0794486954e.webp';

const { compileNativeApp, compileNativeMWB4, packMerkavaContainer } = require(path.join(BINARY_DIR, 'NativeAppCompiler.js'));
const { encodeAssetsSection } = require(path.join(BINARY_DIR, 'AssetCompiler.js'));

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); return p; }
function run(cmd, args, opts = {}) {
	return execFileSync(cmd, args, { stdio: 'pipe', ...opts }).toString();
}

/** Compiles web source to .mapp + MWB4 + MKV1 container. Shared by all targets. */
async function compileAppPackage({ html = '', css = '', js = '', appName = 'MerkavaApp', assets = null } = {}) {
	const compiled = await compileNativeApp({ html, css, js, appName, assets });
	const { mwb4 } = await compileNativeMWB4({ html, css, appName });
	const assetsSection = compiled.assets ? encodeAssetsSection(compiled.assets) : null;
	const container = packMerkavaContainer(compiled.binary, mwb4, { appName }, assetsSection);
	return { ...compiled, mwb4, container };
}

/**
 * Generates Android mipmap icons from the Merkava logo (or a custom icon).
 * @param {string} logoPath Source image.
 * @param {string} resDir   res/ directory to populate.
 */
function generateMipmapIcons(logoPath, resDir) {
	const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
	for (const [density, size] of Object.entries(densities)) {
		const dir = ensureDir(path.join(resDir, `mipmap-${density}`));
		const out = path.join(dir, 'ic_launcher.png');
		execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open(${JSON.stringify(logoPath)}).convert("RGBA")
im = im.resize((${size}, ${size}), Image.LANCZOS)
im.save(${JSON.stringify(out)}, "PNG", optimize=True)
`], { stdio: 'pipe' });
	}
	return resDir;
}

function appDistDir(appName) {
	const dir = ensureDir(path.join(DIST, appName));
	return dir;
}

/**
 * Linux ELF: builds the X11/GLX launcher with the host gcc, writes
 * <appName>/<appName> (ELF) + app.merkava next to it.
 */
async function compileToElf(html, css, js, appName = 'MerkavaApp') {
	const pkg = await compileAppPackage({ html, css, js, appName });
	const dir = appDistDir(appName + '-linux');
	const binPath = path.join(dir, appName);
	const mkvPath = path.join(dir, 'app.merkava');
	fs.writeFileSync(mkvPath, Buffer.from(pkg.container));

	const plat = path.join(NATIVE_DIR, 'platform/linux');
	const canonical = path.join(NATIVE_DIR, 'canonical');
	const common = path.join(NATIVE_DIR, 'platform/common');
	run('cc', [
		'-std=c11', '-O2', '-fPIC',
		`-I${canonical}`, `-I${common}`,
		path.join(canonical, 'merkava_container.c'),
		path.join(canonical, 'merkava_directory.c'),
		path.join(canonical, 'merkava_crc32.c'),
		path.join(canonical, 'merkava_source_archive.c'),
		path.join(common, 'merkava_file_loader.c'),
		path.join(plat, 'merkava_linux_main.c'),
		'-lX11', '-lGL',
		'-o', binPath
	]);
	fs.chmodSync(binPath, 0o755);
	const elfMagic = fs.readFileSync(binPath).slice(0, 4).toString('binary');
	return { target: 'elf', binary: binPath, container: mkvPath, elfMagic, meta: pkg.meta };
}

/**
 * Windows EXE: cross-compiles the Win32/WGL launcher with mingw-w64.
 */
async function compileToExe(html, css, js, appName = 'MerkavaApp') {
	const pkg = await compileAppPackage({ html, css, js, appName });
	const dir = appDistDir(appName + '-windows');
	const exePath = path.join(dir, `${appName}.exe`);
	const mkvPath = path.join(dir, 'app.merkava');
	fs.writeFileSync(mkvPath, Buffer.from(pkg.container));

	const cc = process.env.MINGW_CC || 'x86_64-w64-mingw32-gcc';
	try { run(cc, ['--version']); }
	catch { throw new Error(`missing_windows_cross_compiler:${cc}`); }
	const plat = path.join(NATIVE_DIR, 'platform/windows');
	const canonical = path.join(NATIVE_DIR, 'canonical');
	run(cc, [
		'-std=c11', '-O2',
		`-I${canonical}`, `-I${path.join(NATIVE_DIR, 'platform/common')}`,
		path.join(canonical, 'merkava_container.c'),
		path.join(canonical, 'merkava_directory.c'),
		path.join(canonical, 'merkava_crc32.c'),
		path.join(NATIVE_DIR, 'platform/common/merkava_file_loader.c'),
		path.join(plat, 'merkava_windows_main.c'),
		'-lopengl32', '-lgdi32', '-luser32',
		'-o', exePath
	]);
	const mz = fs.readFileSync(exePath).slice(0, 2).toString('binary');
	return { target: 'exe', binary: exePath, container: mkvPath, mzMagic: mz, meta: pkg.meta };
}

/**
 * macOS .app: assembles the bundle skeleton with the MKV1 container and a
 * launcher built on macOS (build-macos.sh). On non-macOS hosts the bundle is
 * created with the container + Info.plist and the binary slot documented.
 */
async function compileToApp(html, css, js, appName = 'MerkavaApp') {
	const pkg = await compileAppPackage({ html, css, js, appName });
	const bundle = ensureDir(path.join(appDistDir(appName + '-macos'), `${appName}.app`));
	const contents = ensureDir(path.join(bundle, 'Contents'));
	const macos = ensureDir(path.join(contents, 'MacOS'));
	const resources = ensureDir(path.join(contents, 'Resources'));
	fs.writeFileSync(path.join(resources, 'app.merkava'), Buffer.from(pkg.container));
	fs.writeFileSync(path.join(contents, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleName</key><string>${appName}</string>
<key>CFBundleIdentifier</key><string>com.merkava.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}</string>
<key>CFBundleVersion</key><string>1.0.0</string>
<key>CFBundleExecutable</key><string>${appName}</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>LSMinimumSystemVersion</key><string>12.0</string>
</dict></plist>
`);
	let binaryBuilt = false;
	if (process.platform === 'darwin') {
		const script = path.join(NATIVE_DIR, 'platform/macos/build-macos.sh');
		run('sh', [script, path.join(macos, appName)]);
		binaryBuilt = true;
	}
	return { target: 'app', bundle, binaryBuilt, meta: pkg.meta };
}

/**
 * Android APK: compiles the NativeActivity+GLES3 launcher with the NDK,
 * packages with aapt2, aligns with zipalign, signs with apksigner.
 * Requires ANDROID_HOME with build-tools and an extracted NDK.
 */
async function compileToApk(html, css, js, appName = 'MerkavaApp') {
	const pkg = await compileAppPackage({ html, css, js, appName });
	const androidHome = process.env.ANDROID_HOME || path.join(os.homedir(), 'workspace/android-sdk');
	const buildTools = process.env.ANDROID_BUILD_TOOLS || newestBuildTools(androidHome);
	const ndk = process.env.ANDROID_NDK_HOME || findNdk(androidHome);
	const androidJar = process.env.ANDROID_JAR || findAndroidJar(androidHome);
	if (!buildTools) throw new Error('missing_android_build_tools');
	if (!ndk) throw new Error('missing_android_ndk');
	if (!androidJar) throw new Error('missing_android_jar');

	const dir = appDistDir(appName + '-android');
	const packageName = `com.merkava.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
	const libName = 'merkava';

	// 1. Compile native .so with the NDK.
	const ndkBin = path.join(ndk, 'toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android26-clang');
	const glue = path.join(ndk, 'sources/android/native_app_glue');
	const soDir = ensureDir(path.join(dir, 'lib/arm64-v8a'));
	const soPath = path.join(soDir, `lib${libName}.so`);
	const androidPlat = path.join(NATIVE_DIR, 'platform/android');
	const canonical = path.join(NATIVE_DIR, 'canonical');
	run(ndkBin, [
		'-std=c11', '-O2', '-fPIC', '-shared',
		`-I${canonical}`, `-I${glue}`,
		path.join(canonical, 'merkava_container.c'),
		path.join(canonical, 'merkava_directory.c'),
		path.join(canonical, 'merkava_crc32.c'),
		path.join(glue, 'android_native_app_glue.c'),
		path.join(androidPlat, 'merkava_android_asset.c'),
		path.join(androidPlat, 'merkava_android_egl.c'),
		path.join(androidPlat, 'merkava_android_mwb4.c'),
		path.join(androidPlat, 'merkava_android_text.c'),
		path.join(androidPlat, 'merkava_android_main.c'),
		'-landroid', '-llog', '-lEGL', '-lGLESv3',
		'-o', soPath
	]);

	// 2. Package with aapt2: manifest + assets (no resources, no dex needed —
	//    android.app.NativeActivity is a framework class).
	const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="${packageName}" android:versionCode="1" android:versionName="1.0">
<uses-sdk android:minSdkVersion="26" android:targetSdkVersion="34"/>
<uses-feature android:glEsVersion="0x00030000" android:required="true"/>
<application android:label="${appName}" android:hasCode="false" android:icon="@mipmap/ic_launcher">
<activity android:name="android.app.NativeActivity" android:exported="true" android:configChanges="orientation|keyboardHidden|screenSize">
<meta-data android:name="android.app.lib_name" android:value="${libName}"/>
<intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter>
</activity>
</application>
</manifest>
`;
	fs.writeFileSync(path.join(dir, 'AndroidManifest.xml'), manifestXml);
	// App icons: Merkava logo at all densities.
	const resDir = ensureDir(path.join(dir, 'res'));
	generateMipmapIcons(process.env.MERKAVA_ICON || MERKAVA_LOGO, resDir);
	const aapt2 = path.join(buildTools, 'aapt2');
	run(aapt2, ['compile', '--dir', resDir, '-o', path.join(dir, 'res.zip')]);
	const unsignedApk = path.join(dir, `${appName}-unsigned.apk`);
	const assetsDir = ensureDir(path.join(dir, 'assets'));
	fs.writeFileSync(path.join(assetsDir, 'app.merkava'), Buffer.from(pkg.container));
	run(path.join(buildTools, 'aapt2'), ['link', '-o', unsignedApk,
		'--manifest', path.join(dir, 'AndroidManifest.xml'),
		'-I', androidJar,
		'--target-sdk-version', '34', '--min-sdk-version', '26',
		'-A', assetsDir, path.join(dir, 'res.zip')]);
	// Inject the native lib as STORED+aligned (aapt2 link takes no libs).
	injectZipEntry(unsignedApk, 'lib/arm64-v8a/libmerkava.so', fs.readFileSync(soPath));

	// 3. Align + sign.
	const alignedApk = path.join(dir, `${appName}-aligned.apk`);
	run(path.join(buildTools, 'zipalign'), ['-f', '4', unsignedApk, alignedApk]);
	const keystore = ensureDebugKeystore(dir);
	run(path.join(buildTools, 'apksigner'), ['sign', '--ks', keystore, '--ks-pass', 'pass:android', '--key-pass', 'pass:android', '--out', path.join(dir, `${appName}.apk`), alignedApk]);

	return { target: 'apk', apk: path.join(dir, `${appName}.apk`), packageName, meta: pkg.meta };
}

function findAndroidJar(androidHome) {
	const plats = path.join(androidHome, 'platforms');
	if (fs.existsSync(plats)) {
		for (const e of fs.readdirSync(plats).sort().reverse()) {
			const jar = path.join(plats, e, 'android.jar');
			if (fs.existsSync(jar)) return jar;
		}
	}
	return null;
}

function newestBuildTools(androidHome) {
	const bt = path.join(androidHome, 'build-tools');
	if (!fs.existsSync(bt)) return null;
	const versions = fs.readdirSync(bt).sort().reverse();
	return versions.length ? path.join(bt, versions[0]) : null;
}

function findNdk(androidHome) {
	for (const cand of [process.env.ANDROID_NDK_HOME, path.join(androidHome, 'ndk'), path.join(os.homedir(), 'workspace/android-sdk/ndk')]) {
		if (cand && fs.existsSync(cand)) return cand;
	}
	// extracted ndk dir
	const sdk = path.join(os.homedir(), 'workspace/android-sdk');
	if (fs.existsSync(sdk)) {
		for (const e of fs.readdirSync(sdk)) {
			if (/^android-ndk/.test(e) && fs.statSync(path.join(sdk, e)).isDirectory()) return path.join(sdk, e);
		}
	}
	return null;
}

function ensureDebugKeystore(dir) {
	const ks = path.join(dir, 'debug.keystore');
	if (!fs.existsSync(ks)) {
		run('keytool', ['-genkeypair', '-v', '-keystore', ks, '-storepass', 'android',
			'-alias', 'androiddebugkey', '-keypass', 'android', '-keyalg', 'RSA', '-keysize', '2048',
			'-validity', '10000', '-dname', 'CN=Android Debug,O=Android,C=US']);
	}
	return ks;
}

/** Adds the native .so as STORED (uncompressed) via the zip tool, then relies
 * on zipalign for 4-byte alignment. */
function injectZipEntry(apkPath, entryName, data) {
	const { execFileSync } = require('child_process');
	const fs = require('fs');
	const os = require('os');
	const path = require('path');
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mkv-apk-'));
	const dest = path.join(tmp, entryName);
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.writeFileSync(dest, data);
	// -0 = store only, -j junk paths handled by cd, -X strip extra fields
	execFileSync('zip', ['-0', '-X', '-q', apkPath, entryName], { cwd: tmp, stdio: 'pipe' });
	fs.rmSync(tmp, { recursive: true, force: true });
}

module.exports = { compileToElf, compileToExe, compileToApp, compileToApk, compileAppPackage };
