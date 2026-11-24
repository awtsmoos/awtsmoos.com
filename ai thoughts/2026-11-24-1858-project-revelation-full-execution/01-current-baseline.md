# B"H — 01 Current baseline (2026-11-24 18:58 UTC, refreshed 19:15 UTC)

Repo: /mnt/HC_Volume_102267213/git/awtsmoos.com — branch main.
HEAD at start: fd94be763 (Torah Ohr corpus). HEAD after this session: 3057b51c7 (see 07).
Working tree at start: 285 modified/untracked entries from many concurrent sessions (piano, code app, rebbe, composer, tunnel, ai thoughts). At end: 294 (other sessions still active). NOTHING outside this session's scoped commit was touched, stashed, reset, or cleaned.
Server: nginx active; local app http://127.0.0.1:8080 -> 200. Public https://awtsmoos.com/social/ /profile/ /heichelos/ /social-composer/ all 200 text/html.
Running service: awtsmoos.service MainPID 1185175, AWTSMOOS_RELEASE_SHA=32901bb29ead8bc7276eab12ec76eb6225de6093 (immutable-release drop-ins). Static frontend files are served from the working tree (verified: new files appear live without a service restart).
Machine: 2 CPUs. Load average during session: 10-12 (severe multi-session saturation). Disks: / 89-90% used (~4 GB free), data volume 94% used (~4.2 GB free). /tmp 3.5 GB.
Tunnel: agent pid 1006187 up 4.5 days, connection-state "registered", tunnelId tun_QAoR7i_ZzaqrUuDBpQuEpBcq, name awt-root-73967, runtimeVersion 1.0.724.
Deploy law read (docs/AI/DEPLOY-LAW.md): BH.sh reset --hard + clean -fd, deploy worker refuses dirty repo; commit path-scoped + push immediately; never deploy over another session's in-flight work.
Workflow read (.github/workflows/main.yml): quality job runs tunnel api-smoke, backend-certification, tunnel-predeploy-browser, AND (working-tree change by an earlier session, still uncommitted) social-css-check.sh; deploy job SSHes remote-deploy-entry.sh with EXPECTED_SHA, 3 bounded attempts, then tunnel-public-verify.sh.
