<!-- B"H -->
# Dayuh code deployment and Git boundary
Database synchronization, Git publication, and remote code activation are three
separate operations. Verify each one independently.

## Database versus code
- `scripts/dayuh-sync.mjs` moves Dayuh Chadash database files.
- `scripts/dayuh-seed.mjs` replaces a remote database from an immutable snapshot.
- Git records source and documentation, not the production database.
- Restarting `awtsmoos.service` activates code already present remotely; it does
  not synchronize the database.
- A database push does not prove the remote server runs new code.

## Shared-worktree rule
Before Git work:
```bash
cd /Users/awtsmoos/work/awtsmoos.com
git status --short
git branch --show-current
git remote -v
```
The repository can contain changes from other agents. Do not reset, delete,
stash, stage, commit, or deploy files you do not own.

## Dangerous convenience commands
`npm run ship`, `npm run bh`, and `npm run ship:bh` invoke `scripts/ship.mjs`.
That script runs `git add .`, commits all staged work, and pushes. `npm run bh`
then opens the custom SSH session.

Do not run these commands in a dirty shared worktree unless the owner approved
every changed and untracked file.

Use this for SSH inspection without Git shipping:
```bash
npm run bh:ssh -- --command "systemctl is-active awtsmoos.service"
```

## Safe exact-file Git workflow
Only after explicit owner approval:
```bash
git status --short
git diff --check -- path/to/file-a path/to/file-b
git diff -- path/to/file-a path/to/file-b

git add -- path/to/file-a path/to/file-b
git diff --cached --name-only
git diff --cached --check
git diff --cached

git commit -m "B_H describe the exact operation"
git push
```
Require the cached file list to contain only approved paths. Never use
`git add .` as a substitute for review.

## Remote code verification
Inspect production through the custom SSH client:
```bash
npm run bh:ssh -- --command \
	"systemctl is-active awtsmoos.service; systemctl show awtsmoos.service -p MainPID"
```
Verify the process working directory:
```bash
npm run bh:ssh -- --command \
	'PID=$(systemctl show awtsmoos.service -p MainPID --value); readlink -f /proc/$PID/cwd'
```
Expected repository:
```text
/mnt/HC_Volume_102267213/git/awtsmoos.com
```
A Git push alone does not prove files reached that directory. Compare remote
hashes or inspect the remote commit when publication uses Git.

## Service restart
Restart only when deployed code requires it and a rollback path exists:
```bash
npm run bh:ssh -- --command \
	"systemctl restart awtsmoos.service && systemctl is-active awtsmoos.service"
```
After restart, verify:
1. a new live PID;
2. the expected working directory;
3. no deployment staging artifact;
4. the public RAG catalog;
5. a representative content API;
6. a browser test when frontend code changed.

## Static-file deployment
When files move outside Git, require:
- an explicit exact file list;
- local syntax and tests before transfer;
- a remote backup of every overwritten file;
- transfer through the custom SSH client;
- local/remote SHA-256 equality;
- atomic replacement;
- a rollback trap when restarting the service;
- public API and browser verification;
- retained backups until the owner accepts the release.

## Documentation status
These guides change the local Git worktree only. They are not published to Git
or copied to production until the owner explicitly requests that action. Report
their uncommitted status clearly.
