#B"H
#Boruch Hashem
#Blessed is He
"""
The Awtsmoos carries each shard through one unchanged measured frame;
Awtsmoos.com preserves the evidence so truth and source remain the same.
This temporary driver orchestrates tests only and never changes emulator behavior.
"""
from datetime import datetime
import hashlib
import json
import subprocess

from awtsmoosStableRuntimeSupport import EVIDENCE
from awtsmoosStableRuntimeSupport import PROJECT
from awtsmoosStableRuntimeSupport import REPO
from awtsmoosStableRuntimeSupport import SOURCE_SHARDS
from awtsmoosStableRuntimeSupport import create_run_directory
from awtsmoosStableRuntimeSupport import next_evidence_number
from awtsmoosStableRuntimeSupport import parse_total
from awtsmoosStableRuntimeSupport import require_manifest
from awtsmoosStableRuntimeSupport import resolve_test_paths


def run_shard(run, index):
	"""Run one deterministic shard and freeze its authentic TAP evidence immediately."""
	label = f"{index:02d}"
	require_manifest(f"before_shard_{label}")
	entries = (run / f"shard_{label}.list").read_text().splitlines()
	paths = resolve_test_paths(entries)
	print(f"=== SHARD {label} START files={len(paths)} ===", flush=True)
	result = subprocess.run(["node", "--test", *paths], cwd=PROJECT, capture_output=True, text=True)
	text = result.stdout + result.stderr
	log = run / f"shard_{label}.log"
	log.write_text(text)
	payload = {
		"shard": label,
		"exitCode": result.returncode,
		"fileCount": len(paths),
		"tests": parse_total(text, "tests"),
		"passed": parse_total(text, "pass"),
		"failed": parse_total(text, "fail"),
		"cancelled": parse_total(text, "cancelled"),
		"skipped": parse_total(text, "skipped"),
		"todo": parse_total(text, "todo"),
		"log": log.name,
		"logSha256": hashlib.sha256(text.encode()).hexdigest(),
		"finishedAt": datetime.now().isoformat(),
	}
	(run / f"shard_{label}.exit.json").write_text(json.dumps(payload, indent=2) + "\n")
	print("SHARD_RESULT", json.dumps(payload, sort_keys=True), flush=True)
	require_manifest(f"after_shard_{label}")
	return payload


def summarize(run, shards):
	"""Gather every frozen shard into one deterministic completion verdict."""
	summary = {
		"runDirectory": run.name,
		"shardCount": len(shards),
		"fileCount": sum(item["fileCount"] for item in shards),
		"tests": sum(item["tests"] or 0 for item in shards),
		"passed": sum(item["passed"] or 0 for item in shards),
		"failed": sum(item["failed"] or 0 for item in shards),
		"cancelled": sum(item["cancelled"] or 0 for item in shards),
		"skipped": sum(item["skipped"] or 0 for item in shards),
		"todo": sum(item["todo"] or 0 for item in shards),
		"green": all(item["exitCode"] == 0 and item["failed"] == 0 and item["cancelled"] == 0 for item in shards),
		"completedAt": datetime.now().isoformat(),
		"shards": shards,
	}
	(run / "summary.json").write_text(json.dumps(summary, indent=2) + "\n")
	return summary


def main():
	"""Verify one stable 515-file universe from first shard through final verdict."""
	current_tests = sorted(str(path.relative_to(REPO)) for path in (PROJECT / "test").glob("*.test.mjs"))
	expected_tests = SOURCE_SHARDS.joinpath("all_files.txt").read_text().splitlines()
	if current_tests != expected_tests:
		print("RUNTIME_TEST_UNIVERSE_CHANGED", flush=True)
		raise SystemExit(43)
	require_manifest("pre_runtime")
	run = create_run_directory()
	print(f"RUNTIME_RUN_DIR={run} files={len(current_tests)}", flush=True)
	shards = [run_shard(run, index) for index in range(16)]
	summary = summarize(run, shards)
	status = EVIDENCE / f"{next_evidence_number():04d}_stable_full_runtime_shards_status.json"
	with status.open("x") as handle:
		handle.write(json.dumps(summary, indent=2) + "\n")
	require_manifest("post_runtime")
	visible = {key: value for key, value in summary.items() if key != "shards"}
	print("RUNTIME_SUMMARY", json.dumps(visible, sort_keys=True), flush=True)
	print(f"RUNTIME_STATUS={status}", flush=True)
	raise SystemExit(0 if summary["green"] else 2)


if __name__ == "__main__":
	main()
