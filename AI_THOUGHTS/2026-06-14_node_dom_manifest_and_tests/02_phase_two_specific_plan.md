B"H

Plan:
1. Inspect package/test scripts around tunnel agent tests and manifest builder.
2. Run node geelooy/apps/tunnel/agent/rebuild-manifest.cjs or documented builder.
3. Run isolated Node tests specifically for node-dom runtime.
4. Run direct simulateNodeDomRuntime after rebuild.
5. If failures reveal more issues, fix with full-file rewrites only and rerun.
