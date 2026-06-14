B"H

Phase two plan:
1. Read nodeDomRuntime htmlPlan, htmlHydrate, moduleRunner, publicFetch, publicPath, values.
2. Create isolated tests where modules append DOM nodes and set document.title/body.className.
3. Test inline module, external module in files, external module by localhost URL collector.
4. If missing, identify whether script plan misses module scripts or value reader cannot read document/body.
5. Rewrite full files only and rerun tests.
