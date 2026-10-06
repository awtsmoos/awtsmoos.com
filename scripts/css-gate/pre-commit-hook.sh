#!/bin/bash
# Pre-commit CSS gate: blocks commits that introduce new CSS conflicts/overrides/unstyled elements.
# Runs cssImmediateIssues against the baseline page and diffs vs scripts/css-gate/baseline.json.
# To bypass (not recommended): git commit --no-verify

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
if [ -z "$REPO_ROOT" ]; then
  echo "[css-gate] not in a git repo, skipping"
  exit 0
fi

GATE_RUNNER="$REPO_ROOT/scripts/css-gate/run.js"
if [ ! -f "$GATE_RUNNER" ]; then
  echo "[css-gate] runner not found, skipping"
  exit 0
fi

# Only run the gate if CSS/JS/page files are staged (avoid slowing unrelated commits)
STAGED_CSS=$(git diff --cached --name-only --diff-filter=ACM | grep -Ei '\.(css|scss|less|js|jsx|ts|tsx|html)$' | head -5)
if [ -z "$STAGED_CSS" ]; then
  exit 0
fi

echo "[css-gate] CSS/JS changes staged — running pre-commit CSS health gate..."
node "$GATE_RUNNER" --url https://awtsmoos.com/about --width 390 --height 844
GATE_EXIT=$?

if [ $GATE_EXIT -ne 0 ]; then
  echo ""
  echo "[css-gate] COMMIT BLOCKED: CSS gate failed (exit $GATE_EXIT)."
  echo "[css-gate] Fix the flagged CSS issues, or bypass with: git commit --no-verify"
  exit 1
fi

exit 0
