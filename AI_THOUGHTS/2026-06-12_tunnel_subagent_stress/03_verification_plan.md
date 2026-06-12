B"H
# Verification Plan

Pass 1 evidence: static read and provider list.
Pass 2 evidence: direct runtime action calls with minimal safe payloads.
Pass 3 evidence: stress variations: missing provider, provider present, task spawn, status polling, child limits.

Completion gate:
- Report every action run and exact ok/error.
- Do not reveal provider keys.
- If tests reveal a bug, identify responsible file and minimal full-file rewrite plan.
- If no code changes are made, explain why with runtime evidence.

Awtsmoos note: every file is a vessel; actual command output is the light that proves what vessel holds.
