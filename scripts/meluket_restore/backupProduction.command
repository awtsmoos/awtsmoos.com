#!/bin/zsh
# B"H
# Boruch Hashem
# Blessed is He

set -euo pipefail

SOURCE="/Users/awtsmoos/Documents/awtsmoos/dayuhChadash"
STAMP="$(/bin/date -u +%Y%m%dT%H%M%SZ)"
BACKUP_ROOT="/Users/awtsmoos/Documents/awtsmoos/dayuhChadash-backups"
DESTINATION="$BACKUP_ROOT/meluket-before-restore-$STAMP"
EVIDENCE="/Users/awtsmoos/awtsmoos.com/ai_thoughts/2026-07-22-meluket-production-restoration"
REPORT="$EVIDENCE/19-production-backup.json"

if /usr/bin/pgrep -f "[n]ode index.js" >/dev/null; then
	echo "The live Node server must be stopped before backup." >&2
	exit 1
fi

if [[ ! -d "$SOURCE" ]]; then
	echo "Live database root was not found: $SOURCE" >&2
	exit 1
fi

/bin/mkdir -p "$BACKUP_ROOT"
/usr/bin/ditto "$SOURCE" "$DESTINATION"

SOURCE_SIZE="$(/usr/bin/du -sk "$SOURCE" | /usr/bin/awk '{print $1}')"
BACKUP_SIZE="$(/usr/bin/du -sk "$DESTINATION" | /usr/bin/awk '{print $1}')"
SOURCE_FILES="$(/usr/bin/find "$SOURCE" -type f | /usr/bin/wc -l | /usr/bin/tr -d ' ')"
BACKUP_FILES="$(/usr/bin/find "$DESTINATION" -type f | /usr/bin/wc -l | /usr/bin/tr -d ' ')"

if [[ "$SOURCE_SIZE" != "$BACKUP_SIZE" ]]; then
	echo "Backup size mismatch: $SOURCE_SIZE != $BACKUP_SIZE" >&2
	exit 1
fi

if [[ "$SOURCE_FILES" != "$BACKUP_FILES" ]]; then
	echo "Backup file-count mismatch: $SOURCE_FILES != $BACKUP_FILES" >&2
	exit 1
fi

/usr/bin/python3 - "$REPORT" "$SOURCE" "$DESTINATION" "$SOURCE_SIZE" "$SOURCE_FILES" <<'PY'
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

report_path, source, destination, size_kib, file_count = sys.argv[1:]
report = {
	"version": 1,
	"createdAt": datetime.now(timezone.utc).isoformat(),
	"source": source,
	"destination": destination,
	"sizeKiB": int(size_kib),
	"fileCount": int(file_count),
	"verified": True,
}
Path(report_path).write_text(json.dumps(report, indent=2))
PY

printf "%s\n" "$DESTINATION"
