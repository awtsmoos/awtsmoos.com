# Merkava Android Browser — Build Pipeline

B"H

Handoff document. Yaakov ordered all APK work dropped on 2026-10-09; this file
exists so another agent can rebuild the APKs later from the same pipeline.

## 1. NDK / SDK location

`~/workspace/.android-sdk/` — verified on disk 2026-10-09:

- NDK: `ndk/27.2.12479018`
- Build-tools: `build-tools/35.0.0` (aapt2, apksigner, zipalign)
- Platform: `platforms/android-35` (android.jar)
- Java: `java/jdk-17.0.11+9-jre` (required on PATH for apksigner/aapt2)
- Compiler used: `ndk/27.2.12479018/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android26-clang`

**This directory lives OUTSIDE git. Never commit it, never put it in the repo,
never put it in any build path of Awtsmoos code.** It is the authorized interim
path only; the self-hosted Awtsmoos compiler remains the long-term project.

## 2. APK packager

`~/workspace/apk-browser/build-apk.sh` (outside git, workspace scratch).

Usage:

```bash
build-apk.sh <version-name> <libmerkava.so> <out-apk>
# example:
build-apk.sh v2 /tmp/b2/libmerkava.so ~/workspace/apk-browser/MerkavaBrowser-v2.apk
```

What it does, in order:

1. `aapt2 compile --dir ~/workspace/apk-build2/res -o compiled-res.zip`
2. `aapt2 link -o base.apk -I <android.jar> --manifest ~/workspace/apk-build2/AndroidManifest.xml --min-sdk-version 26 --target-sdk-version 34 -A ~/workspace/apk-build2/assets compiled-res.zip`
3. Unpacks base.apk, copies the given `.so` to `lib/arm64-v8a/libmerkava.so`,
   ensures `assets/app.merkava` is present.
4. Re-zips (`zip -0 -X`, sorted file order), then `zipalign -f -p 4`.
5. `apksigner sign --ks ~/workspace/apk-build/debug.keystore --ks-pass pass:android --out <out-apk> aligned.apk`
   - Keystore: `~/workspace/apk-build/debug.keystore` (outside git), password `android`,
     cert DN `CN=Merkava, O=Awtsmoos, C=US`.
6. Prints `apksigner verify --print-certs` (first 2 lines) and the `aapt dump badging`
   `package:` line for the finished APK.

The manifest, resources (`res/mipmap-*` launcher icons), and assets
(`assets/app.merkava`, the demo fallback page) all come from `~/workspace/apk-build2/`.

## 3. Manifest

`~/workspace/apk-build2/AndroidManifest.xml` (outside git):

- package: `com.awtsmoos.merkava`
- versionCode history: **2** = hello shell, **3** = browser v1, **4** = browser v2
  (versionName 1.0 for code 2–3, 2.0 for code 4)
- `android.app.NativeActivity`, exported, `android.app.lib_name = "merkava"`,
  MAIN/LAUNCHER intent filter, label `Merkava`
- minSdk 26, targetSdk 34, `uses-feature android:glEsVersion 0x00030000`
- Permissions: `android.permission.INTERNET` and
  `android.permission.ACCESS_NETWORK_STATE` (added for the browser builds;
  the hello shell had none)

## 4. Native source

Repo path: `geelooy/apps/merkava-native-browser/native/`

Android platform code (`native/platform/android/`):

- `merkava_android_main.c` — `ANativeActivity_onCreate`, main loop, lifecycle
- `merkava_android_egl.c` — EGL/GLESv3 context
- `merkava_android_text.c`, `merkava_android_ttf.c` — text renderer, device fonts
- `merkava_android_vm.c` — demo VM fallback page
- `merkava_android_asset.c` — asset loading
- `merkava_android_net.c` — page fetch via JNI → `java/net/HttpURLConnection`
  (runs on a background pthread in v2; attach/detach guarded with `GetEnv`)
- `merkava_browser.c` — browser: tabs (new/close/switch), address bar,
  URL normalization, touch/scroll, link navigation

Shared code (`native/platform/common/`): `merkava_html.c` (HTML parser),
`merkava_css.c` (CSS parser). Also `native/canonical/`, `native/render/`,
`native/vm/` for the wider native runtime.

### Compiling the browser .so (the exact command the v2 builder used)

```bash
NDK=~/workspace/.android-sdk/ndk/27.2.12479018
NAT=geelooy/apps/merkava-native-browser/native   # repo-relative
GLUE=$NDK/sources/android/native_app_glue
$NDK/toolchains/llvm/prebuilt/linux-x86_64/bin/aarch64-linux-android26-clang \
  -std=c11 -Wall -fPIC -shared -O2 -o libmerkava.so \
  -I$NAT/canonical -I$NAT -I$NAT/platform/android -I$NAT/platform/common -I$GLUE \
  -DANDROID -D__ANDROID_API__=26 \
  $NAT/canonical/merkava_container.c \
  $NAT/canonical/merkava_directory.c \
  $NAT/canonical/merkava_crc32.c \
  $NAT/platform/android/merkava_android_main.c \
  $NAT/platform/android/merkava_android_egl.c \
  $NAT/platform/android/merkava_android_asset.c \
  $NAT/platform/android/merkava_android_text.c \
  $NAT/platform/android/merkava_android_ttf.c \
  $NAT/platform/android/merkava_android_vm.c \
  $NAT/platform/android/merkava_browser.c \
  $NAT/platform/android/merkava_android_net.c \
  $NAT/platform/common/merkava_html.c \
  $NAT/platform/common/merkava_css.c \
  $GLUE/android_native_app_glue.c \
  -landroid -llog -lEGL -lGLESv3
```

Then feed the resulting `libmerkava.so` to `build-apk.sh`.

A simpler canonical-only variant exists at
`native/platform/android/build-android-native.sh` (compiles a smaller file
list; not what the browser APKs used).

Host-side testing (how v2's logic was verified without a device): compile the
`platform/common` + `merkava_browser.c` sources with host `gcc` against stub
GL/JNI shims and run navigate/parse/render/CSS checks. The builder's harness
lived in `/tmp/btest` (ephemeral); the real example.com HTML was fetched with
curl and fed through `awts_html_parse` + `awts_css_parse` with no crash.

## 5. Verification commands

```bash
export PATH=~/workspace/.android-sdk/java/jdk-17.0.11+9-jre/bin:$PATH
BT=~/workspace/.android-sdk/build-tools/35.0.0
$BT/apksigner verify --print-certs <apk>
$BT/aapt dump badging <apk> | grep -E "^package|uses-permission|launchable"
```

Good output looks like (v2, verified 2026-10-09):

```text
Signer #1 certificate DN: CN=Merkava, O=Awtsmoos, C=US
package: name='com.awtsmoos.merkava' versionCode='4' versionName='2.0' ...
uses-permission: name='android.permission.INTERNET'
uses-permission: name='android.permission.ACCESS_NETWORK_STATE'
```

`apksigner verify` exiting 0 with the `CN=Merkava, O=Awtsmoos, C=US` signer =
signed correctly. Static verification is NOT an install test; Yaakov's rule
was that no APK reaches him before installing in real Android, but on
2026-10-09 he explicitly superseded that gate and ordered the APKs sent
directly (the UML Android install oracle was shut down before completing).

## 6. APKs built (2026-10-09)

| APK | Location | versionCode | Result on real device |
|---|---|---|---|
| Hello shell | `~/workspace/apk-build2/Merkava-signed.apk` (168,823 bytes; `libmerkava.so` 70,488 bytes) | 2 | **Installed and launched OK on Pixel 6 Pro.** Blue screen: "Hello from Merkava / Native C renderer. No WebView." + `merkava vm: 3 nodes, 0 events`. |
| Browser v1 | `~/workspace/apk-browser/MerkavaBrowser-v1.apk` (193,399 bytes; `libmerkava.so` 92,888 bytes) | 3 | **Crashed on launch** ("Merkava keeps stopping"). Native browser shell: background-thread fetch was missing; JNI layer detached threads unconditionally and never NULL-checked `FindClass` results. |
| Browser v2 | `~/workspace/apk-browser/MerkavaBrowser-v2.apk` (213,879 bytes; `libmerkava.so` 115,192 bytes) | 4 | **Crashed on launch.** Contains the diagnosed v1 fixes (GetEnv-guarded attach/detach, FindClass NULL checks, fetch on background pthread) plus tabs (new/close/switch) and address bar — but the fix is unproven on-device. |

All three are `com.awtsmoos.merkava`, ARM64-only (`lib/arm64-v8a/libmerkava.so`),
signed with the debug keystore above.

Historical note: the very first attempt, `~/workspace/apk-build/MerkavaNdk.apk`
(160,631 bytes, package `com.merkava.helloapk`), failed with "App not installed"
on the phone — likely a signature/package collision with an older APK of the
same package name. The rebuild under the fresh `com.awtsmoos.merkava` identity
installed fine. Do not reuse the `com.merkava.helloapk` package name.

## 7. Commits

Browser v2 source is committed on main as `27284e855`
("B\"H Merkava browser v2: crash fix + tabs + address bar").
This doc is committed alongside it. The APK files themselves, the NDK/SDK,
the keystore, and the `~/workspace/apk-*` build dirs are outside git by design.
