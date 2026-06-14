B'H
# Phase Three
Final: read implementation, design deterministic parser, export internals for tests if needed, then rewrite full connectedFiles.js. It must never silently return zero for a directory with import files; must say why if none; must page by edges/files and byte budgets; must strip URL query/hash; must include unresolved imports; must stress test: query-string imports, directory entry, pageSize 1 pagination, max char budget, circular graph, missing file, and large graph.
