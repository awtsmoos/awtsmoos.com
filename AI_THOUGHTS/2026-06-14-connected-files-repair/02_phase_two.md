B'H
# Phase Two
Files likely touched: geelooy/apps/tunnel/agent/tools/fs/connectedFiles.js and possibly its registration/schema if command expects old output. Tests will be new under geelooy/apps/tunnel/agent/tools/fs/test/connectedFiles.stress.test.mjs or .cjs. Whole-file rewrites only. Need preserve command API: p/path/entry, cursor/page/pageSize/maxFiles/maxChars/totalMaxChars, partial/nextRequest. Directory entry should discover import-bearing files and page over all connected results. File entries should strip ?v query fragments from imports.
