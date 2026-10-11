B"H

# Awtsmoos.com — Agent Handoff Index

> **You are an AI agent. This file is your starting point.** It tells you where everything lives, how to authenticate, and how to do the two most common jobs: **import translated content** and **deploy code**. Every section links to a deeper README. Read the one you need — each is self-contained.

## The 30-second map

| I want to… | Read this | Run this |
|---|---|---|
| Import translated Hebrew/English posts | `geelooy/api/social/helper/routes/packed/README.md` | `node scripts/vmImportStaged.mjs --heichel <corpus> --posts-dir <dir>` |
| Deploy code to production | `scripts/README.md` | `node scripts/vmDeploySigned.mjs <files>` |
| Upload files / get public URLs (Drive) | `geelooy/apps/drive/README.md` | Drive API via `geelooy/apps/drive/js/api.js` |
| Serve/read imported posts (reader APIs) | `geelooy/api/social/helper/routes/posts/README.md` | `GET /api/social/heichelos/:heichel/series/:series/post/:post` |
| Understand packed storage | `geelooy/api/social/helper/packed/README.md` | — |
| Translate a new corpus end-to-end | `docs/TRANSLATION_WORKFLOW.md` | converters in `~/workspace/bulk-import-fix/` |
| CSS laws for tunnel agents | `~/workspace/tunnel-improvement-plan/TUNNEL_AGENT_CSS_LAWS.md` | `python3 ~/workspace/site-audit/css-validator.py` |

## Binding rules (never break these)

- **Hebrew is byte-exact.** Never normalize spelling variants (`שמתחייבי'` vs `שמתחייבים`, `ומהר"מ` vs `ומהר"ם`). Keep each occurrence's exact bytes.
- **Names are literal transliterations, never anglicized:** Yackov (not Jacob/Yaakov), Yisroel, Awtsmoos, Elokim, Havayah, El-Shaddai, G-d (hyphen, always). Never invent a transliteration — flag it instead.
- **CSS:** no `!important` ever, no hardcoded colors (tokens only), every text element needs explicit light+dark colors, 0 validator errors (`python3 ~/workspace/site-audit/css-validator.py`).
- **Never revert another agent's work.** Stay out of `geelooy/games/mitzvahWorld` unless that is your assigned task.
- **Deploy immediately** once work is verified. Verify from disk/API, never from logs alone.

## Auth at a glance

Two separate Ed25519 keypairs live on the VM (never in git, never in chat):

| Purpose | Private key | Public key baked in |
|---|---|---|
| Bulk import signing | `~/.awtsmoos/secure/import-signing-key` | `geelooy/api/social/helper/routes/packed/importSign.js` |
| Deploy signing | `~/.awtsmoos/secure/deploy-signing-key` | `geelooy/api/social/helper/routes/packed/deploySign.js` |

Both sign canonical JSON `{v:1, ts, op, heichelId, payloadHash}` with ±300s freshness and replay protection. Details in the per-API READMEs.

## Critical gotcha (read before importing)

The import CLI flag `--heichel` **must equal the `heichelId` inside your post JSONs**. The importer uses the raw doc's `heichelId` for storage but the CLI's `--heichel` for alias derivation — a mismatch writes posts with the wrong alias and verification fails with `PACKED_HASH_MISMATCH` on every post. Full explanation in `geelooy/api/social/helper/routes/packed/README.md` §7.

## Repo layout (top level)

- `geelooy/` — the web app (pages, styles, client JS, apps incl. Drive, API routes). **Deployable.**
- `scripts/` — VM ops tooling (deploy, import, tunnel clients). **Deployable.**
- `ops/` — ops configs. **Deployable.**
- `ayzarim/` — server-internal tooling. **NOT deployable** via the signed route.
- `docs/` — generated + curated documentation.
- `~/workspace/ikar-corpora/` (outside repo) — Hebrew sources, translations, translation queues.
- `~/workspace/bulk-import-fix/` (outside repo) — converters, staging dirs, import/verify clients.
