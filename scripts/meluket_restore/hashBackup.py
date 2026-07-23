#!/usr/bin/env python3
# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos compares each production-backup file byte for byte, preserving a
checkpoint after every file so an interrupted vessel may resume without doubt.
"""

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

SOURCE = Path('/Users/awtsmoos/Documents/awtsmoos/dayuhChadash')
BACKUP = Path('/Users/awtsmoos/Documents/awtsmoos/dayuhChadash-backups/meluket-before-restore-20260722T231242Z')
EVIDENCE = Path('/Users/awtsmoos/awtsmoos.com/ai_thoughts/2026-07-22-meluket-production-restoration')
JOURNAL = EVIDENCE / '19-backup-hash-journal.jsonl'
PROGRESS = EVIDENCE / '19-backup-hash-progress.json'
REPORT = EVIDENCE / '19-backup-hash-report.json'
PRODUCTION_REPORT = EVIDENCE / '19-production-backup.json'


def hash_file(path):
	digest = hashlib.sha256()
	with path.open('rb') as handle:
		for chunk in iter(lambda: handle.read(8 * 1024 * 1024), b''):
			digest.update(chunk)
	return digest.hexdigest()


def inventory(root):
	rows = []
	for current, directories, files in os.walk(root):
		directories.sort()
		files.sort()
		for name in files:
			rows.append(str((Path(current) / name).relative_to(root)))
	return rows


def load_rows():
	rows = {}
	if not JOURNAL.exists():
		return rows
	for line in JOURNAL.read_text().splitlines():
		if line.strip():
			row = json.loads(line)
			rows[row['path']] = row
	return rows


def write_progress(completed, total, current):
	PROGRESS.write_text(json.dumps({
		'completed': completed,
		'total': total,
		'current': current,
		'updatedAt': datetime.now(timezone.utc).isoformat(),
	}, indent=2))


def main():
	source_paths = inventory(SOURCE)
	backup_paths = inventory(BACKUP)
	if source_paths != backup_paths:
		raise SystemExit('Relative path inventory mismatch.')
	rows = load_rows()
	with JOURNAL.open('a') as journal:
		for index, relative in enumerate(source_paths, start=1):
			if relative in rows:
				continue
			source_path = SOURCE / relative
			backup_path = BACKUP / relative
			row = {
				'path': relative,
				'size': source_path.stat().st_size,
				'sourceSha256': hash_file(source_path),
				'backupSha256': hash_file(backup_path),
			}
			row['match'] = row['sourceSha256'] == row['backupSha256']
			journal.write(json.dumps(row, ensure_ascii=False) + '\n')
			journal.flush()
			os.fsync(journal.fileno())
			rows[relative] = row
			write_progress(len(rows), len(source_paths), relative)
	mismatches = [row for row in rows.values() if not row['match']]
	manifest = hashlib.sha256()
	for relative in source_paths:
		row = rows[relative]
		manifest.update(relative.encode('utf-8') + b'\0')
		manifest.update(str(row['size']).encode('ascii') + b'\0')
		manifest.update(row['sourceSha256'].encode('ascii') + b'\n')
	report = {
		'version': 1,
		'createdAt': datetime.now(timezone.utc).isoformat(),
		'source': str(SOURCE),
		'destination': str(BACKUP),
		'fileCount': len(source_paths),
		'logicalBytes': sum(row['size'] for row in rows.values()),
		'manifestSha256': manifest.hexdigest(),
		'mismatchCount': len(mismatches),
		'mismatches': mismatches[:100],
		'verified': not mismatches,
	}
	REPORT.write_text(json.dumps(report, indent=2))
	PRODUCTION_REPORT.write_text(json.dumps(report, indent=2))
	if mismatches:
		raise SystemExit(f'Hash mismatches: {len(mismatches)}')


if __name__ == '__main__':
	main()
