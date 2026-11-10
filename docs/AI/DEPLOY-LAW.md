# Deploy Law — BH.sh eats dirty trees. Commit immediately.

Several agent sessions work in this one repo on the production server
(`/mnt/HC_Volume_102267213/git/awtsmoos.com`). Most deploy collisions are
self-inflicted. These are the rules that prevent them.

## Facts

- `BH.sh` runs `git reset --hard` + `git clean -fd` and the deploy worker
  **refuses a dirty repo**. Anything uncommitted — modified *or untracked* —
  is destroyed by a deploy, yours or anyone else's. This already happened:
  an uncommitted Drive fix was wiped by another session's BH.sh run and had
  to be redone (2026-11-10).
- Git push works via `/root/.git-credential-awtsmoos.sh` (token in
  `/root/.awtsmoos-secrets/github.env` — never print it, never commit it).
- The deployment truth is the running service's release SHA
  (`AWTSMOOS_RELEASE_SHA` / `systemctl show`). `version.json`'s build stamp
  is **not** updated by BH.sh; do not cite it as deploy state.
- Other sessions write to this repo minute-by-minute. A deploy can lose the
  clean-tree race mid-run (observed 2026-11-10: a first deploy attempt failed
  `canonical_repo_dirty` when another session rewrote a file during the run).

## The procedure

1. **Finish a change → commit and push it immediately, path-scoped**
   (`git add <your paths only>`). Uncommitted work in this repo is already
   lost; it just doesn't know it yet.
2. Before deploying: `git status --porcelain`. If the tree is dirty with
   files that are **not yours**, do not reset them away. Hash them
   (`sha256sum`), `git stash push -- <those paths only>`, run BH.sh **in the
   same command chain**, `git stash pop`, re-verify the hashes byte-for-byte.
   If another session rewrote a protected file mid-run, save its newer
   version aside before checkout and restore it after.
3. Back up any production file you replace outside git (nginx configs,
   systemd units, data files) to `/root/backups-<yyyymmdd>-<topic>/` first.
4. Restart `awtsmoos.service` **once** after a stash pop so the running
   process matches disk, then verify live: homepage 200, the routes you
   touched, and the release SHA.
5. **Never** run BH.sh while another session's import or long job is
   mid-flight without coordinating in chat — a restart loses the in-flight
   batch's unflushed writes (see `BULK-IMPORT-LAW.md`).
6. Never add images or other asset binaries to this repo (owner's hard rule).
   Assets live in the server's Drive storage system, not in git.
7. Rewrite complete files only; no partial in-place patch scripts against
   production sources (root `AGENTS.md` law).
