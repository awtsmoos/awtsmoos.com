B"H
Boruch Hashem
Blessed is He

# Street 3 — Execution Security Amendment

> The Awtsmoos breaks a false vessel before remote fire enters it. Awtsmoos.com will not call a road safe merely because it is virtual; every property, callable, constructor, and global must prove that it cannot open a hidden door into the host browser.

## Why the original executor plan is superseded

The earlier Street 3 plan proposed native `AsyncFunction("globals", "with(globals){...}")` execution because existing `RuntimeAssembler.js` uses that pattern.

Fresh source inspection proved that is **not a security boundary for arbitrary remote pages**:
- `SyntheticBrowserRuntime` global proxy returns `false` from `has()` for unknown names,
- therefore unknown identifiers inside `with(globals)` may fall through toward the real lexical/global environment,
- native objects/functions can expose constructor/prototype chains.

Street 3 must not enable remote classic scripts through that path.

## Unsafe alternatives explicitly rejected

### Binary SANG runner with `DefaultMerkavaHost`
Rejected unchanged because `DefaultMerkavaHost.read()` falls back to `globalThis` and other operations construct/call native values from ambient host state.

### `NativeCapabilityBridge`
Rejected unchanged because its default capability set includes Node authority such as `fs`, `process`, `Buffer`, timers, crypto, and more.

### `MerkavaVmFileExecutor`
Rejected for untrusted page execution because its module fast path ultimately uses native `AsyncFunction` with `with(globals)`.

### Browser SDK `Merkava.run()` default context
Rejected unchanged because `merkava-sdk/core.js` `ContextBuilder` copies a wide set of real `self` built-ins, timers, crypto, browser document access, and other native capabilities into the VM context.

## Safe substrate discovered

The browser-native Merkava parser/compiler/VM is suitable **only with a strict context and hardened VM object/call boundaries**:

- `merkava-sdk.js` loads parser/compiler/VM directly in the user's browser.
- `MerkavaCompiler.Compiler` compiles identifiers to VM `LOAD_GLOBAL`, member access to VM `GET_PROP`, calls to VM `CALL`, and constructors to VM `NEW`.
- `merkava-vm/executors/stack.js` resolves globals only from thread environment, VM memory globals, and supplied VM context; unknown globals throw `ReferenceError`.
- There is no ambient global fallback in `LOAD_GLOBAL`.

This is the correct execution family.

## Remaining escape surface discovered

`merkava-vm/executors/objects.js` currently:
- performs raw `o[k]`,
- allows inherited `constructor`, `prototype`, `__proto__`,
- binds native methods,
- contains ambient `self.Object` and `CSSStyleDeclaration` compatibility branches.

`merkava-vm/executors/functions.js` currently:
- calls arbitrary native functions with `.apply`,
- defaults null call context to real global object,
- permits `new` on arbitrary native functions,
- uses ambient `Event` detection.

Therefore a strict global context alone is insufficient. Even a VM-created `{}` can expose `({}).constructor.constructor(...)` unless property/call boundaries are hardened universally.

## Hardened architecture

Add one small VM security policy module, loaded before object/function executors:

`geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-vm/security.js`

Responsibilities:
- define forbidden reflective property keys,
- recognize safe native callables explicitly marked by the host,
- mark explicitly permitted native constructors separately,
- validate native calls/constructors,
- expose safe helpers to opcode handlers,
- contain no ambient authority itself.

Forbidden reflective property set should include at minimum:
- `constructor`
- `prototype`
- `__proto__`
- `caller`
- `callee`
- `arguments`

Additional keys may be added only from concrete escape evidence.

## Existing VM files to rewrite fully

### `merkava-vm/executors/objects.js`
- reject forbidden property reads/writes/deletes before touching an object,
- remove ambient `self.Object` fallback from untrusted access path,
- avoid ambient `CSSStyleDeclaration` dependency by capability-neutral behavior,
- preserve ordinary array/object/property semantics,
- keep file <=120 lines.

### `merkava-vm/executors/functions.js`
- permit VM closures normally,
- permit native calls only when marked safe by the security policy,
- never default native call context to real global object,
- permit native construction only for explicitly marked safe constructors,
- preserve closure callback bridging for approved host methods,
- avoid ambient real `Event` dependency for capture decisions,
- keep file <=120 lines, splitting callback helpers if necessary.

## Strict remote-page VM bridge

After VM hardening, create a browser-side strict runner that bypasses SDK `ContextBuilder`:

`geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualClassicVm.js`

Responsibilities:
1. Use already-loaded `MerkavahParser` and `MerkavaCompiler.Compiler`.
2. Allocate a dedicated `MerkavaMemory.MemoryManager`.
3. Build a null-prototype context containing only explicitly wrapped virtual capabilities.
4. Set `window`, `self`, and `globalThis` to the same **virtual** capability facade.
5. Instantiate `MerkavaVM` directly with strict context + empty/explicit host API.
6. Never use SDK `ContextBuilder`.
7. Never allow raw module fallback fetch.
8. Execute classic scripts sequentially in the same VM/context so globals persist.

## Capability facade policy

Do not seed raw host browser globals.

Virtual capabilities may include:
- virtual `document`, through a facade,
- virtual `window` state through a facade,
- routed virtual `fetch`, marked as safe callable,
- virtual timers only if their callbacks and lifecycle are correctly bridged,
- safe console facade,
- safe primitive utility facades as required by tests.

Every native function exposed to the VM must be explicitly marked safe by the security module. Every native constructor exposed must be explicitly constructor-approved.

## New security tests required before page execution

Create focused VM tests proving all of these fail closed:

1. `missingName` -> ReferenceError.
2. `({}).constructor` -> blocked/undefined/error.
3. `([]).constructor` -> blocked/undefined/error.
4. `({}).__proto__` -> blocked.
5. `window.constructor` -> blocked.
6. `document.constructor` -> blocked.
7. `someSafeFunction.constructor` -> blocked.
8. `Object` is unavailable unless explicitly supplied as a safe facade.
9. `Function` is unavailable.
10. `eval` is unavailable.
11. `globalThis` resolves only to virtual facade.
12. unmarked native function invocation is rejected.
13. unmarked native constructor invocation is rejected.
14. approved virtual DOM method invocation still works.
15. approved routed fetch invocation still works.
16. VM-created object/array ordinary property operations still work.
17. classes/closures remain functional without constructor-chain access.

## Regression obligations

After hardening VM opcode handlers:
- run existing strict scope test,
- run browser VM/compiler tests,
- run relevant arbitrary-JS/VM stress suites,
- run Street 1/2 suites,
- run existing Merkava advanced runtime regression,
- line-count every touched source,
- scan for new ambient global/Function/eval authority.

## Revised Street 3 order

1. Inspect current line counts of security-sensitive VM files.
2. Create `merkava-vm/security.js`.
3. Fully rewrite `objects.js` to use it.
4. Fully rewrite/split `functions.js` to use it.
5. Add focused host-escape tests and run them before any remote page bridge.
6. Repair only proven compatibility regressions.
7. Create strict `VirtualClassicVm.js` using direct browser parser/compiler/VM with no default ContextBuilder.
8. Prove virtual DOM + routed fetch through explicit safe capabilities.
9. Only then implement classic page hydration/planning/lifecycle/controller.
10. Re-run all regression and closure gates.

## Decision

The earlier `16_STREET_3_FINAL_EXECUTION_PLAN.md` remains durable history but its native-AsyncFunction execution mechanism is **superseded by this security amendment**.

No remote classic JavaScript should be connected to the Geelooy OS browser until the property/call/constructor escape tests are green.
