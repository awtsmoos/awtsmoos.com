B'H
# Phase One
User says cache is irrelevant and is correct for this issue. connectedFiles itself failed: root returned zero, targeted calls were unstable/too large, and dependencyGraph showed query-string imports unresolved. Need inspect command implementation and tests in geelooy/apps/tunnel. Hypothesis: connectedFiles expects a file entry not directory, lacks query-string stripping, lacks robust pagination, or crashes/overflows when output too large. We must fix the tunnel command itself and run isolated Node stress tests.
