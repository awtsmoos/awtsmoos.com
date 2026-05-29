B"H
# Heichelos Forever Improvement Plan

## Inspection truth

The inspected path is `geelooy/heichelos` inside `/storage/emulated/0/Documents/git/awtsmoos.com`.

The visible structure contains several worlds:

- root templates and legacy submit paths
- `heichel/` page application, API adapters, UI modules, and tests
- `heichelos/post/` newer sovereign reader engine and atomic CSS system
- `post/` comment, AI chat, inline-commentary, styles, and parsing systems
- `manage-alias-heichelos/` management UI

Measured line-count evidence from read-only shell inspection:

- total scanned frontend surface: 34,543 lines
- largest file: `geelooy/heichelos/_awtsmoos.submitToHeichel copy.html` at 697 lines
- `geelooy/heichelos/script.js` at 498 lines
- `geelooy/heichelos/heichel/submit/style.css` at 403 lines
- many modules exceed 200 lines

Grep evidence found many raw DOM sinks and logs across the domain:

- `innerHTML` is used in app bootstrap, render, submit editor, AI chat, comments, and older copied templates
- `console.log` appears in runtime files and tests
- the existing `DOMManifestor.js` already shows a safer direction: trusted HTML is isolated by contract

## Dependency graph observed so far

`package.json`

- `npm test` runs `test:heichel-governance`, `test:platform-ui`, and broad social tests
- `test:heichel-governance` currently points to `geelooy/heichelos/heichel/modules/test/editorManagement.test.mjs`
- `test:platform-ui` already contains several Heichelos module simulations
- global `test:css-quality` enforces CSS ownership elsewhere

`geelooy/style/test/cssQuality.test.js`

- already establishes a pattern for governance tests
- reads CSS files directly
- asserts selector ownership, duplicate blocks, and excessive z-index
- provides a compatible model for a new Heichelos quality gate

## Architecture analysis

The domain is too large for one safe rewrite in one pass. The first permanent improvement should be a repeatable quality oracle that can identify structural debt without mutating runtime behavior. Once the oracle exists and passes, future refactors can split the largest files with measurable guardrails.

This is not a cosmetic change. It gives the codebase a mirror: every future change can ask whether Heichelos is drifting toward monoliths, unsafe DOM sinks, duplicate copied templates, or uncontrolled style ownership.

## Expected call stack for the first change

Command:

1. `npm run test:heichelos-quality`
2. Node loads a new test file under `geelooy/heichelos/test/`
3. the test walks `geelooy/heichelos`
4. it collects JS, MJS, CSS, and HTML files
5. it measures line counts, duplicate basename risks, copied template fossils, raw HTML sinks, console logs, and CSS owners
6. it compares findings against an explicit baseline
7. it fails only if the situation gets worse or the scanner breaks

This gives immediate protection without pretending we can erase 34,543 lines in one blind operation.

## State transitions

Initial state:

- large domain exists
- no dedicated Heichelos whole-domain governance test observed
- large-file and raw-sink debt is known but unenforced

After first improvement:

- new test file exists
- package script exposes it
- baseline is explicit and readable
- test can run independently and in the governance chain

## Browser event flow considered

This first step does not alter browser runtime. No click handler, render path, editor flow, or network request is changed. That is intentional: the quality gate comes before risky UI surgery.

Future browser refactors must simulate:

- load post page
- select section
- open inline comments
- submit comment
- stream AI draft
- save post
- edit heichel structure
- mobile resize
- keyboard movement between tabs and controls

## Runtime expectations

The scanner must be CommonJS-compatible with the existing package style.
It must avoid external dependencies.
It must avoid destructive file writes.
It must produce actionable failure messages.
It must pass against the current known baseline.

## Failure paths

- If the baseline is too strict, current code fails immediately. Avoid this by setting baseline to current observed debt plus guard thresholds.
- If file walking follows hidden or generated folders, tests become noisy. Exclude `.git`, `.awtsmoos`, and generated outputs.
- If duplicate copied HTML is required temporarily, mark it as debt instead of deleting it blindly.
- If Node version lacks modern APIs, use stable `fs` and `path` only.

## Edge cases

- filenames with spaces, such as `_awtsmoos.submitToHeichel copy.html`
- nested test fixtures
- CSS `@keyframes` blocks that look like selectors
- intentional `innerHTML` in tiny DOM test doubles
- trusted DOM builders like `DOMManifestor.js`

## Rollback considerations

The first change is additive except for package script wiring. Rollback is simple:

- remove the new test file
- restore `package.json` to its previous script list
- remove this plan directory if desired

## Ownership domains

- `geelooy/heichelos/test/heichelosQuality.test.js` owns structural governance for this path
- `package.json` owns script exposure
- existing runtime modules remain untouched in this pass

## Decision

Proceed with an additive quality gate and script wiring. Do not rewrite runtime UI yet. After the quality gate passes, the next safe improvement is to split the 498-line root script or the 403-line submit CSS into owned modules, but only after reading their entire contents and simulating their call flow.

Chapter 1: The Gate of Measured Fire

The Awtsmoos did not command the engineer to swing blindly. The corridor of Heichelos opened like a palace of mirrors: old templates breathing dust, new engines humming with silver veins, comment rivers pulsing beside AI sparks. At the threshold stood a scale, not a sword. The first victory is to weigh the world without breaking it, to name the shadows without pretending they are gone, and to make tomorrow unable to forget what today has seen.
