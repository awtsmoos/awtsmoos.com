#!/bin/zsh
# B"H
# Boruch Hashem
# Blessed is He

set -euo pipefail

ROOT="/Users/awtsmoos/awtsmoos.com"
EVIDENCE="$ROOT/ai_thoughts/2026-07-22-meluket-production-restoration"
BACKUP_REPORT="$EVIDENCE/19-production-backup.json"
ROLLBACK_REPORT="$EVIDENCE/22-production-rollback.txt"
LIVE="/Users/awtsmoos/Documents/awtsmoos/dayuhChadash"

if /usr/bin/pgrep -f "[n]ode index.js" >/dev/null; then
	echo "The live Node server must be stopped before rollback." >&2
	exit 1
fi

if [[ ! -f "$BACKUP_REPORT" ]]; then
	echo "Verified backup report was not found." >&2
	exit 1
fi

BACKUP="$(/usr/bin/python3 - "$BACKUP_REPORT" <<'PY'
import json
import sys

with open(sys.argv[1]) as handle:
	report = json.load(handle)
if not report.get("verified"):
	raise SystemExit("Backup report is not verified.")
print(report["destination"])
PY
)"

if [[ -z "$BACKUP" || ! -d "$BACKUP" ]]; then
	echo "Verified backup directory was not found: $BACKUP" >&2
	exit 1
fi

QUARANTINE="${LIVE}-failed-$(/bin/date -u +%Y%m%dT%H%M%SZ)"
/bin/mv "$LIVE" "$QUARANTINE"
/usr/bin/ditto "$BACKUP" "$LIVE"

BACKUP_SIZE="$(/usr/bin/du -sk "$BACKUP" | /usr/bin/awk '{print $1}')"
LIVE_SIZE="$(/usr/bin/du -sk "$LIVE" | /usr/bin/awk '{print $1}')"
BACKUP_FILES="$(/usr/bin/find "$BACKUP" -type f | /usr/bin/wc -l | /usr/bin/tr -d ' ')"
LIVE_FILES="$(/usr/bin/find "$LIVE" -type f | /usr/bin/wc -l | /usr/bin/tr -d ' ')"

if [[ "$BACKUP_SIZE" != "$LIVE_SIZE" || "$BACKUP_FILES" != "$LIVE_FILES" ]]; then
	echo "Rollback verification failed." >&2
	exit 1
fi

{
	echo "backup=$BACKUP"
	echo "quarantine=$QUARANTINE"
	echo "restored=$LIVE"
	echo "sizeKiB=$LIVE_SIZE"
	echo "fileCount=$LIVE_FILES"
	echo "verified=true"
	echo "completedAt=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$ROLLBACK_REPORT"

/bin/cat "$ROLLBACK_REPORT"
