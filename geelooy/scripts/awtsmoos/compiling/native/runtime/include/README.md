# Awtsmoos Android NDK ABI Headers

B"H

## What this directory is

`runtime/include/android/` holds **declarations only** — no code, no bodies.
Each header is an Awtsmoos clean-room declaration of one slice of the Android
NDK ABI (native activity, native window, bitmap, configuration, input, EGL,
GLES, logging).

These exist because of Yaakov's standing rule: **anything emulated gets
compiled.** The emulator
(`geelooy/apps/android-emulator/core/android/`, 186 emulated API classes)
can run guest code in JavaScript, but 34 of those classes are inherently
host-dependent (Activity, Surface, Window, GL context, pixel buffers, input
events...). To compile that guest code into a real APK, the Awtsmoos native
compiler must be able to *name* the platform functions the code will call —
that is what these headers provide.

## What these headers are NOT

- They are **not copied** from the NDK. Every file is written from scratch by
  Awtsmoos. Only public ABI facts (function names, enumerator names and
  values, struct field order, signatures) are declared, in our own wording.
- They contain **no implementations**. Compiling against them produces
  object code with unresolved symbols — that is intentional.

## How binding works

There are two link targets, and the same compiled guest code can run against
either one:

1. **On device (real Android).** At APK load time the declared symbols
   (`__android_log_print`, `ANativeActivity_onCreate`,
   `AndroidBitmap_lockPixels`, `eglSwapBuffers`, `glDrawArrays`, ...) resolve
   against the real platform libraries (`liblog`, `libandroid`,
   `libjnigraphics`, `libEGL`, `libGLESv2`) exactly as NDK-built code does.

2. **In the emulator.** During emulation there is no Android OS, so the
   declared calls are routed to the emulator's JS shims instead. Each header
   carries a comment naming the JS files that form the behavioral spec for
   that slice (e.g. `frameworkAndroidBitmaps.js` + friends for `bitmap.h`,
   `activityLifecycle*.js` for `native_activity.h`). The shim and the header
   describe the same contract from opposite sides: the header is what compiled
   code calls, the shim is what answers while emulating.

## Adding a new header

- Keep it declarations-only (`extern` functions, opaque typedefs, enums).
- Add the clean-room comment at the top (copy the wording pattern from
  `log.h`).
- Cross-reference the JS emulation files that form the behavioral spec.
- Provide the canonical ABI alias names (e.g. `ANDROID_LOG_WARN`) as
  `#define`s so guest code ported from NDK sources compiles unchanged; the
  alias names are ABI facts, the surrounding file is ours.
- Test: `gcc -fsyntax-only -Wall -std=c11` on the header before committing.
