B"H

# Sync-I/O warn list — geelooy/api (safeguards Phase 3, 2026-10-20)

## The rule

`lineLimitGuard.js` now BLOCKS any NEW structured write under
`geelooy/api/**` whose content calls a synchronous fs API
(`readFileSync`, `writeFileSync`, `readdirSync`, `statSync`,
`existsSync`, `openSync`, `readSync`, `writeSync`, `closeSync`,
`appendFileSync`, `mkdirSync`, `lstatSync`, `realpathSync`,
`copyFileSync`). One sync call freezes the single event loop for
every request — the mechanism behind the 2026-10-20 flap.

Exempt: test files (`*.test.*`, `*.spec.*`, any `/test/` path)
and the guard file itself.

## Existing offenders: warn-listed, NOT grandfathered for edits

167 files already contained sync I/O when the ban landed
(measured 2026-10-20). They keep running — this list is the
work queue, not a breakage. Rules for agents:

1. Do NOT add NEW sync calls to any file under `geelooy/api`.
2. When you edit a warn-listed file, converting its sync calls
   to `fs.promises` equivalents is welcome but not required;
   never let the conversion expand the edit's blast radius.
3. Hot request-path directories first: `helper/routes/packed`
   (14), `helper/packed` (9), `helper/search/rag` (19),
   `tunnel/control/core` (9).

## Offenders by directory (file counts, 2026-10-20)

| Files | Directory |
| ---: | --- |
| 19 | geelooy/api/social/helper/search/rag |
| 16 | geelooy/api/social/helper/search/rag/test |
| 14 | geelooy/api/social/helper/routes/packed |
| 9 | geelooy/api/tunnel/control/core |
| 9 | geelooy/api/social/helper/packed |
| 8 | geelooy/api/social/helper/comments/test |
| 7 | geelooy/api/tunnel/install/tools |
| 6 | geelooy/api/social/helper/books |
| 6 | geelooy/api/social/helper/assets |
| 5 | geelooy/api/tunnel/control/routes |
| 4 | geelooy/api/tunnel/lanes/simple |
| 4 | geelooy/api/social/helper/drive/browser |
| 4 | geelooy/api/social/helper/comments/imported |
| 3 | geelooy/api/wallet/tests |
| 3 | geelooy/api/social/helper/packed/scripts |
| 3 | geelooy/api/social/helper/drive/test |
| 3 | geelooy/api/social/helper/comments |
| 3 | geelooy/api/social/helper/books/test |
| 3 | geelooy/api/social/helper/awtsmoosDb |
| 3 | geelooy/api/oauth/core |
| 2 each | social/helper/test, search/lexicon/test, search, platform/jobs, imports/ayinBeis(+test), assets/test |
| 1 each | youtube/core, wallet/core/commerce/platform, tunnel/install, tunnel/hetzner, tunnel/control/routes/test, tunnel/control/routes/osFs, tunnel/control/core/tunnelSecurity, social/test/routeCoverage, social/helper/series, search/test, search/tanach(+test), search/lexicon |

## Regenerate the exact file list

```
grep -rln 'readFileSync\|writeFileSync\|readdirSync\|statSync\|existsSync\|openSync\|readSync\|writeSync\|closeSync\|appendFileSync\|mkdirSync\|lstatSync\|realpathSync\|copyFileSync' geelooy/api --include='*.js'
```
