# Merkava Android Browser — Continuation Handoff

**Status as of 2026-10-09 ~17:06 EDT:** ALL APK work dropped per Yaakov's order. v2 still crashed on his Pixel 6 Pro; true cause unknown. This doc is everything the next agent needs to pick up.

## 1. What was built

A native browser shell for Android — no WebView, no Chrome inside:

- **Entry:** `native/platform/android/merkava_android_main.c` — `ANativeActivity_onCreate`, main loop, lifecycle.
- **Rendering:** own GLES renderer (`merkava_android_egl.c`, `merkava_android_text.c`, `merkava_android_ttf.c`).
- **Networking:** fetches pages over HTTP(S) on a **background pthread worker** via JNI → `java/net/HttpURLConnection` (`native/platform/android/merkava_android_net.c`, worker `fetch_worker` in `merkava_browser.c:307`).
- **Engine:** own HTML parser + CSS parser + layout + paint in `native/platform/common/` (`merkava_html.c`, `merkava_css.c`). The parser **skips `<script>`/`<noscript>` contents** (`skipDepth`) — NO page JavaScript yet. That's the v3 milestone.
- **Browser chrome:** tabs (new/close/switch, `awts_browser_new_tab`), address bar with on-screen keyboard (`keyboardOpen`), URL normalization (`awts_browser_normalize_url`), link-tap navigation, drag scroll — all in `native/platform/android/merkava_browser.c`.
- **Permissions:** `INTERNET`, `ACCESS_NETWORK_STATE`. Package `com.awtsmoos.merkava`.

## 2. Test results (on-device, real Pixel 6 Pro, 2026-10-09)

| Build | Result |
|---|---|
| Hello shell APK (`Merkava-signed.apk`, same package lineage) | Installed and launched fine. Blue screen, "Hello from Merkava", native renderer proven on-device. |
| v1 (`MerkavaBrowser-v1.apk`, versionCode 3) | **Crashed on launch** — "Merkava keeps stopping". |
| v2 (`MerkavaBrowser-v2.apk`, versionCode 4) | **Crashed on launch too** — same symptom. |

Static verification passed for both (apksigner SIG OK, aapt badging clean). Neither was ever install-tested in an emulator — the UML Android oracle was shut down before it completed.

## 3. Crash diagnosis — HONEST

**v1's suspected cause** was the JNI network layer in `native/platform/android/merkava_android_net.c`:
1. Unconditional `DetachCurrentThread` at the `done:` label — detached the app thread even when it was already attached before the call.
2. `FindClass` results never NULL-checked before `GetMethodID` — a failed lookup would segfault immediately.
3. Network fetch ran on the main (android_main) thread.

**v2 fixed all three** (verified in source):
- `GetEnv` first; only `Attach` if detached, only `Detach` if this call attached (`attachedHere`, lines 42–50, 199–200).
- `if (!urlCls || !connCls || !streamCls || !baosCls)` guard (line 64).
- Fetch moved to a background pthread worker (`fetch_worker`, `merkava_browser.c:307`).

**v2 STILL crashed.** So the true cause is NOT yet found. Stated plainly: the JNI theory did not survive contact with the device.

**Suspects not yet ruled out** — anything in the startup path that only runs on-device:
- Real EGL init on his GPU (host tests stub all GL).
- Real font loading (`merkava_android_ttf.c`, `merkava_android_text.c` — device font paths).
- Real JNI class resolution from the attached worker thread (FindClass behavior with no Java frames on the stack).
- Anything in `boot_vm` / first-frame render that the stubs mask.

## 4. How to continue

**Host-test pattern (works, keep using it):** `/tmp/btest/` compiles the REAL `merkava_browser.c` + `merkava_html.c` + `merkava_css.c` for x86_64 with stubbed GL/JNI (`stubs.c`, `fakeinc/`). All 39 checks pass; real `https://example.com/` HTML (577 bytes, fetched 2026-10-09) parses clean with no crash. Rebuild it with:
```
NAT=~/workspace/mw-repo/geelooy/apps/merkava-native-browser/native
gcc -std=c11 -D_GNU_SOURCE -Wall -g -o test_browser test_browser.c stubs.c \
  $NAT/platform/android/merkava_browser.c \
  $NAT/platform/common/merkava_html.c \
  $NAT/platform/common/merkava_css.c \
  -I$NAT/platform/android -I$NAT/platform/common -I fakeinc -lm
```

**The untested-on-host code is ONLY:** the JNI network layer (`merkava_android_net.c`) and the real-GL / real-font paths. Everything else is proven on the VM.

**Single most valuable next step:** get an on-device `logcat` crash stack (or a working emulator). Without the actual stack trace, further fixes are guessing. Do not ship another "fix" APK without it.

**Build pipeline:** NDK 27 at `~/workspace/.android-sdk`, packager `~/workspace/apk-browser/build-apk.sh <ver> <libmerkava.so> <out.apk>`, debug keystore `~/workspace/apk-build/debug.keystore` (pass: android).

## 5. Commits touching `geelooy/apps/merkava-native-browser/`

```
27284e855 B"H Merkava browser v2: crash fix + tabs + address bar
0b0d3f84a B"H CSS audit: 0 errors across all pages
721a1ef1d B"H Fix-forward: main.c used removed isHeading/isButton members — use packed AWTS_VM_FLAG bits (b35b8421a packed them into flags byte)
b37be20f0 B"H Startup: lazy-load Mode2JsBinary (~120ms saved for scriptless pages)
446b1976a B"H RAM pass 2: slice->u32 indices (render readers, ~1.3MB saved)
5d727d5b1 B"H Startup: lazy canvas/WebGL load (~160ms saved), fast single-pass JS encode (8x->1x)
c1be507be B"H RAM pass 2: slice->u32 indices (vm readers)
1c7f27943 B"H Extreme text optimization: fix cache key bug + ASCII fast path + batched quads
5f5a55497 B"H RAM pass 2: slice->u32 string indices (writers)
12bbaf3f7 B"H Text: 94x faster fallback renderer (direct pixel stamps, no per-pixel fill_rect calls)
fa625b30b B"H RAM pass 2: remove dead mwb4 static extractor (338 lines, zero callers)
231ead5e8 B"H Native layout: O(N) child/style indexes, packed boxes, arena, cache, 10k pages
705087dfb B"H CSS style resolution: fused single-pass + scratch-indexed resolve (96x faster, zero persistent RAM)
b35b8421a B"H RAM: most-efficient-browser pass 1 — VM node 104→88B, tag interning, arenas, packed glyph cache, lazy Hebrew fonts
f55dcffe3 B"H Native Merkava VM: live DOM, events, touch input, lifecycle
```
(Get the full list with `git log --oneline -- geelooy/apps/merkava-native-browser/`.)

## 6. APK artifacts

- `~/workspace/apk-browser/MerkavaBrowser-v1.apk` — v1, versionCode 3, crashes on launch.
- `~/workspace/apk-browser/MerkavaBrowser-v2.apk` — v2, versionCode 4, crash fix + tabs + address bar, still crashes on launch. Cause unknown.
- `~/workspace/apk-browser/build-apk.sh` — packager (reuses proven NDK pipeline).
- `~/workspace/apk-build2/Merkava-signed.apk` — hello shell, versionCode 2, **installs and launches fine** (the last known-good).
- `~/workspace/apk-build2/` — manifest, res, assets, pipeline pieces.
- Package for all: `com.awtsmoos.merkava`.
