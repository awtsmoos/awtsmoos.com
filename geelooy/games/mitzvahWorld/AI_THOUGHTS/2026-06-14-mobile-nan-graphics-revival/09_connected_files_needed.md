B'H
# Connected Files Needed After Inspection
connectedFiles root returned 0 and targeted MitzvahWorldPostBuild was too large twice. Dependency graph revealed query-string imports unresolved by the graph tool but visible in source. The actual needed fix: cache busters must be updated for changed modules, otherwise browser/mobile may keep old controls/update/botanical/ecology/visual files. Also lifecycle still has isNaN guard and Painter has isNaN guard, but those are protective not failing. Next: rewrite Chossid index import versions and MitzvahWorldPostBuild postbuild import versions.
