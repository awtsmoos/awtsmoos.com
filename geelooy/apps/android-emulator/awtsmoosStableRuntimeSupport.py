#B"H
#Boruch Hashem
#Blessed is He
"""
The Awtsmoos reveals the steady measure beneath each test we run;
Awtsmoos.com keeps source and evidence bound until the gate is done.
These helpers observe reality only; they never alter emulator behavior.
"""
from datetime import datetime
from pathlib import Path
import hashlib
import json
import re
import shutil

REPO = Path("/Users/awtsmoos/work/awtsmoos.com")
PROJECT = REPO / "geelooy/apps/android-emulator"
EVIDENCE = REPO / "ai_thoughts/2026-07-16_1804_rebbe_responsa_lifecycle_runtime_continuation"
BASELINE = EVIDENCE / "2026_current_source_test_manifest.txt"
SOURCE_SHARDS = EVIDENCE / "2026-08-14_105447_current_full_runtime_shards"


def build_manifest():
	"""Reveal the complete JS/MJS/JSON core-and-test fingerprint."""
	rows = []
	for root in [PROJECT / "core", PROJECT / "test"]:
		for path in root.rglob("*"):
			if not path.is_file() or path.suffix not in {".js", ".mjs", ".json"}:
				continue
			data = path.read_bytes()
			rows.append((str(path.relative_to(REPO)), hashlib.sha256(data).hexdigest(), path.stat().st_mtime_ns, len(data)))
	rows.sort()
	return "".join(f"{digest} {mtime} {size} {path}\n" for path, digest, mtime, size in rows)


def require_manifest(phase):
	"""Reject any gate whose source/test reality moved during execution."""
	if build_manifest() != BASELINE.read_text():
		print(f"SOURCE_MANIFEST_CHANGED phase={phase}", flush=True)
		raise SystemExit(42)
	print(f"SOURCE_MANIFEST_MATCH phase={phase}", flush=True)


def parse_total(text, label):
	"""Read Node's terminal TAP count without inventing absent evidence."""
	matches = re.findall(rf"^ℹ {label} (\d+)\s*$", text, re.MULTILINE)
	return int(matches[-1]) if matches else None


def resolve_test_paths(lines):
	"""Resolve preserved manifest entries against their genuine repository vessel."""
	resolved = []
	for line in lines:
		path = Path(line)
		candidates = [path] if path.is_absolute() else [REPO / path, PROJECT / path]
		match = next((candidate for candidate in candidates if candidate.is_file()), None)
		if match is None:
			raise FileNotFoundError(f"Missing deterministic test path: {line}")
		resolved.append(str(match))
	return resolved


def create_run_directory():
	"""Create a new immutable shard-evidence vessel without overwriting history."""
	stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
	run = EVIDENCE / f"{stamp}_stable_full_runtime_shards"
	index = 1
	while run.exists():
		run = EVIDENCE / f"{stamp}_stable_full_runtime_shards_{index}"
		index += 1
	run.mkdir()
	for name in ["all_files.txt"] + [f"shard_{index:02d}.list" for index in range(16)]:
		shutil.copyfile(SOURCE_SHARDS / name, run / name)
	info = {"createdAt": datetime.now().isoformat(), "baselineManifest": BASELINE.name, "fileCount": 515, "shardCount": 16}
	(run / "run_info.json").write_text(json.dumps(info, indent=2) + "\n")
	return run


def next_evidence_number():
	"""Choose the next unused numbered continuation artifact."""
	numbers = []
	for path in EVIDENCE.iterdir():
		match = re.match(r"^(\d+)_", path.name)
		if match:
			numbers.append(int(match.group(1)))
	return max(numbers, default=0) + 1
