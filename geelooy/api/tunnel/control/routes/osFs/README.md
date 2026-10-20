B"H

# osFs - Tunnel Virtual OS Filesystem Routes

Part of the awtsmoos.com tunnel control API
(`geelooy/api/tunnel/control/routes/osFs/`). These routes let an authorized
agent perform structured file operations inside a hosted virtual OS space:
read, write, delete, folders, and hash-guarded writes.

## Modules

- **writeOps.js** - The write choke point. `writeFile()` is the single
  funnel for every structured write action (write, writeIfHash,
  replaceRange, applyPatch). `makeFolder()`, `deletePath()`, and
  `writeIfHash()` live here too.
- **lineLimitGuard.js** - The coding-law guard (see below).
- **path.js** - Path cleaning and virtual-to-DB path resolution.
- **syntaxAfterWrite.js** - Post-write syntax reporting.
- **writeAccess.js** - Write authorization checks.
- **writeHashGuard.js** - Expected-hash inspection for guarded writes.
- **writeReceipts.js** - Change broadcasts and write receipts.

## The coding-law guard (lineLimitGuard.js)

Yaakov's law, enforced on EVERY structured write by `checkFileStandards()`:

1. **Line count** - any file over 120 lines is BLOCKED
   (`FILE_TOO_LONG_BLOCKED`). Split it into modules of 120 lines or fewer.
2. **B"H header (.js only)** - the first three lines of every .js file must
   be exactly `//B"H`, `//Blessed is He`, `//Boruch Hashem`, or the write is
   BLOCKED (`BAD_HEADER_BLOCKED`).
3. **Tab indentation (.js only)** - a sustained space-indentation pattern
   (more than 10 space-indented code lines) is BLOCKED
   (`BAD_INDENT_BLOCKED`). A few stray lines only produce a console warning.
4. **No minification (.js only)** - a single line longer than 500 characters
   of dense code is BLOCKED (`MINIFIED_BLOCKED`). Expand it into readable,
   normally-indented lines.

Binary (non-string) payloads are exempt from every check. Raw shell writes
do not pass through this guard; only structured tunnel actions do.

5. **No synchronous I/O in new `geelooy/api` code** - a write under
   `geelooy/api/**` whose content calls `readFileSync`, `writeFileSync`,
   `readdirSync`, `statSync`, `existsSync`, `openSync`/`readSync`/
   `writeSync`/`closeSync`, `appendFileSync`, `mkdirSync`, `lstatSync`,
   `realpathSync`, or `copyFileSync` is BLOCKED (`SYNC_IO_BLOCKED`).
   Sync I/O freezes the single event loop for every request — the
   2026-10-20 flap mechanism. Use `fs.promises` instead. 167 files
   predate the ban; they are warn-listed in `SYNC_IO_WARNLIST.md`
   (same folder), not grandfathered for new writes. Test files and
   the guard itself are exempt.

## AI safeguards

- Do NOT weaken, bypass, or special-case this guard without the user's
  explicit order. If a write is blocked, comply with the standard.
- When you split a file, keep each new module under 120 lines, give it the
  exact B"H header, tab indentation, full JSDoc, and expanded comments.
- `checkLineLimit()` remains exported for backwards compatibility; new
  callers should use `checkFileStandards()`.
