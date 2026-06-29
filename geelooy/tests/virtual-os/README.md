# B"H — Virtual OS Smoke Suite

Run from the repository root one level above `geelooy`:

```sh
npm run test:virtual-os
```

Or run directly inside `geelooy`:

```sh
node tests/virtual-os/run-smokes.cjs
```

The suite checks syntax for the split Virtual OS modules and then runs focused behavior smokes for:

- browser object graph watchers and transactions
- VFS mount resolution, permissions, guarded mutation gates, and graph sync
- server mirror graph watchers and transactions
- browser tunnel handler composition for graph and VFS actions

These tests are intentionally small. They protect the current architecture slice without replacing the larger project test system.
