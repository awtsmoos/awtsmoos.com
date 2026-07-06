B"H

# Fix it all step by step

Step 1: verify changed surfaces and find remaining obvious page families.
Step 2: run static tests that already exist for home, profile, email, spaces, submit.
Step 3: repair failing contracts by whole-file rewrite only.
Step 4: align route CSS manifests so every changed page actually loads the new styles.
Step 5: re-run syntax and contract checks.

Focus pages now:
- Home
- Profile
- Email
- Heichelos spaces index
- Create/submit
- Heichel detail shell if reachable through existing CSS contracts
