# B"H
# Virtual OS — Public GitHub source import

The hosted Virtual OS now has a bounded `gitClone` action for public GitHub
**source snapshots**. This is a real source import into the authenticated user's
persistent Virtual OS filesystem; it is **not** a full Git checkout. No
`.git` history, private repository credentials, GitHub push, or unrestricted
Hetzner shell execution are available through this action.

## From the Virtual OS desktop

Open **Git Control**. Enter a public repository URL, branch, destination within
an alias you own, and a scoped `tunnel.write` API key. The key is sent in an HTTP
header once, never embedded in a URL or persisted by the Git Control window.
Click **Import GitHub sources**.

Example:
- Repository: `https://github.com/octocat/Hello-World`
- Branch: `master`
- Destination: `my-owned-alias/repos/hello-world`

## Tool/API call

```http
POST /api/tunnel/control/fs/awtsmoos-os
Content-Type: application/json
x-awtsmoos-api-key: <authorized-key-with-tunnel.write>
```

```json
{
  "action": "gitClone",
  "url": "https://github.com/octocat/Hello-World",
  "ref": "master",
  "destination": "my-owned-alias/repos/hello-world"
}
```

Responses identify `source`, `ref`, `destination`, `filesImported`,
`sourceSha256`, `partial`, `skippedBinary`, `fullGitHistory:false`,
`nativeShell:false`, elapsed time, and per-stage timing receipts. The VFS
stores an `.awtsmoos-clone.json` record after a successful import. A matching
repeated call returns `alreadyImported:true` without rewriting files.

Security and performance:
- HTTPS public `github.com` URLs only; only public `codeload.github.com`
  tarball requests, DNS pinned to validated public IP addresses.
- The destination alias must belong to the authenticated account.
- A signed browser session or read-only API key alone cannot import; a scoped
  OAuth/API-key credential with `tunnel.write` or `tunnel.admin` is required.
- Existing nonempty destinations are not overwritten. Symlinks, archive
  traversal, corrupt tar headers, oversized payloads, and unsupported tar
  entry types fail closed.
- Maximum compressed archive: 4 MiB; maximum expanded archive: 12 MiB;
  maximum 150 files; 2 MiB UTF-8 text content, 300 KiB per file.
- Binary files are explicitly reported as skipped; the receipt marks
  `partial:true`. Use a native authorized Git client for full binary/history
  clones.
- Imports write at most four independent files concurrently. One active
  import per account and at most three per controller process.
- Validation and download complete before any VFS files are written. A
  write failure reports its stage and partially written paths instead of
  hiding a partial import. Never blindly retry a failed mutable import.
- Lightweight commands remain separate from repository imports. GitHub
  downloads and VFS writes are bounded bulk work and are not advertised as
  completing under four seconds for arbitrarily sized repositories.

This limited capability doesn't imply native Git support on the browser's
client-only simulated Virtual OS, nor does it run Git subprocesses on Hetzner.

## Fast source-snapshot status (read-only)

Use `gitCloneStatus` to read an account-owned imported snapshot receipt:

```http
GET /api/tunnel/control/fs/awtsmoos-os?action=gitCloneStatus&path=my-owned-alias/repos/hello-world
```

A logged-in account session or credential with `tunnel.read` may inspect its
own snapshot receipt. This does not retry a mutable import or shell out to Git.
A successful response includes the original source, branch/ref, number of
imported files, skipped binaries, SHA-256 of the source archive, and import
moment. The status describes the import receipt, **not** whether each source
file remains unchanged today.
