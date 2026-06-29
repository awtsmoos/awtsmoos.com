B"H

# Phase 4 — After History Inspection

The accidental merge is `c2d25a199`, with first parent `9c2e3ef31`. It altered 52 Heichelos / Heichel style / scroll-sovereignty files relative to the first parent. Since the user explicitly says the merge was accidental and Heichelos is the scope to repair, the safest correction is to restore those Heichelos-scoped paths to the first-parent versions, while leaving mitzvahWorld and other unrelated dirty files untouched.

Execution plan:
- For each `M` file in the affected list, rewrite the complete file from `c2d25a199^1:<path>`.
- For each `A` file introduced by the accidental merge, remove the complete file.
- Do not touch `geelooy/games/mitzvahWorld/**`.
- Then rerun route/css/heichelos quality tests and live Heichel browser/API checks.

This is not a generic revert of the whole repository. It is a scoped Heichelos recovery from the merge parent that existed immediately before the bad merge.
