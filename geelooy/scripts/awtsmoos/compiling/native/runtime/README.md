B"H
Boruch Hashem
Blessed is He

# Awtsmoos Native Runtime — Single Source of Truth

## Purpose

Every API emulated by `geelooy/apps/android-emulator/` MUST have a corresponding
C implementation here that the Awtsmoos C compiler turns into real ARM64 machine
code. Yaakov's directive: **"Anything emulated gets compiled."**

The JS emulation in `android-emulator/core/android/` is the *behavioral reference*.
The C code here is the *compilable truth*. They must agree byte-for-byte on
observable behavior. Conformance tests verify this.

## Layout

```
runtime/
  README.md            — this file
  AUDIT.md             — emulated API catalog vs compilable status
  include/             — Awtsmoos-owned headers (android/log.h, etc.)
  src/
    java_lang/         — java.lang.* C implementations
    java_util/         — java.util.* C implementations
    android_os/        — android.os.* C implementations
    android_util/      — android.util.* C implementations
    android_graphics/  — android.graphics.* C implementations
    ...                — one dir per Android package
  test/
    conformance/       — behavior-parity tests (JS emulation vs compiled C)
```

## Rules

1. **100% Awtsmoos code.** No NDK headers, no Bionic, no external libc.
   All declarations are written from scratch in `include/`.
2. **Every .c file compiles** with `compilePortableCLibrary` to a real `.so`.
   If the compiler can't handle a construct, that's a compiler bug to fix —
   not a reason to write uncompilable C.
3. **Behavioral parity.** Each module has a conformance test comparing the
   compiled C output against the JS emulation on identical inputs.
4. **No host dependencies** in pure modules. Host-dependent APIs (Activity,
   Surface, Window) go through the Awtsmoos-owned ABI in `include/android/`
   and are documented as requiring the host binding layer.

## Current compiler capability (2026-10-09)

The portable C compiler supports: scalar int functions, pointer dereference,
recursion, control flow, static locals.

It does NOT yet support: structs, array indexing, string literals, pointer
arithmetic, extern/imports, non-scalar globals. These are tracked compiler
gaps — see AUDIT.md. Runtime modules are written to be compilable TODAY where
possible, and staged for the gaps otherwise.
