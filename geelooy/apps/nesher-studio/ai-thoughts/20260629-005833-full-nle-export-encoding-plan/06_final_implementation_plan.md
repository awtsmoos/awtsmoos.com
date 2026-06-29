# B"H

Implement model/test layer first because it is safe and API-preserving. Add profile probing and export presets as pure modules. Add timeline/bin/project/export/audio tests that can run in Node. Add public API compatibility smoke that imports current app APIs and piano reference files. Add literal-free guard test for the forbidden browser recorder token. Then run node --check, requested tests 019-034, grep guard, piano syntax, and git status. If failures appear, rewrite full affected files only.
