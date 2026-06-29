B"H

# 49 remote desktop improvements: stepwise implementation plan

We cannot safely inject native OS behavior for every feature in one step. The right move is to make every idea a first-class policy object now, wire it into ask/risk/UI/tests, and mark native/streaming capabilities as planned where the agent cannot honestly enforce them yet.

Steps:
1. Add a 49-item feature catalog with id, category, stage, and enforcement status.
2. Add permission profile generation so each ask can carry requested, blocked, and planned protections.
3. Add risk scoring for mode, TTL, scope, contact, and requested protections.
4. Add actions for feature catalog, risk assessment, permission profile, trust memory, pause/resume, and session note.
5. Add UI buttons for catalog/risk/profile/pause/resume.
6. Add tests proving all 49 features are present and the better ask includes risk/profile data.
7. Update docs.

