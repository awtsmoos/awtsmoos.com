B"H

# Continue all step by step

Now that style and nearby contracts pass, continue outward:
1. Discover remaining test files by area.
2. Run safe local tests in small groups.
3. Inspect the first failure with actual file reads.
4. Whole-file rewrite the failing owned file only.
5. Re-run that group.
6. End with syntax + diff.

Priority groups:
- profile scripts/modules
- email scripts/modules
- heichel app/modules
- post reader modules if tests exist
- os/social command center if runnable
