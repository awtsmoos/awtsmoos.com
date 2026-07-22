#!/bin/zsh
OUT="/tmp/meluket_backup_locator.json"
/usr/bin/python3 - <<'PY' > "$OUT"
import json
import os
import subprocess
from pathlib import Path

representative_ids = [
	"BH_POST_1749792440863_theRebbe_116",
	"BH_POST_1766518919556_theRebbe_605",
	"BH_POST_1766518920368_theRebbe_469",
]

result = {
	"mode": "read_only",
	"representativeIds": representative_ids,
	"spotlight": {},
	"candidateDirectories": [],
	"filenameMatches": [],
	"mountedVolumes": [],
	"errors": [],
}

def run(command, timeout=30):
	try:
		completed = subprocess.run(command, capture_output=True, text=True, timeout=timeout)
		return {
			"returncode": completed.returncode,
			"stdout": completed.stdout.splitlines(),
			"stderr": completed.stderr.splitlines(),
		}
	except Exception as error:
		return {"error": f"{type(error).__name__}: {error}"}

for post_id in representative_ids:
	result["spotlight"][post_id] = run(["/usr/bin/mdfind", post_id], timeout=30)

home = Path("/Users/awtsmoos")
volume_root = Path("/Volumes")

candidate_terms = (
	"dayuh",
	"chadash",
	"backup",
	"snapshot",
	"archive",
	"restore",
	"old",
	"copy",
)

for base in [home, volume_root]:
	if not base.exists():
		continue
	try:
		for current_root, directories, files in os.walk(base):
			path = Path(current_root)
			parts = set(path.parts)
			if any(part in {"node_modules", ".git", ".npm", ".cache", "Library", ".Trash"} for part in path.parts):
				directories[:] = []
				continue
			lower_name = path.name.lower()
			if any(term in lower_name for term in candidate_terms) and len(path.parts) <= 9:
				try:
					stats = path.stat()
					result["candidateDirectories"].append({
						"path": str(path),
						"mtime": stats.st_mtime,
					})
				except Exception:
					pass
			for name in files:
				if any(post_id in name for post_id in representative_ids):
					file_path = path / name
					try:
						stats = file_path.stat()
						result["filenameMatches"].append({
							"path": str(file_path),
							"size": stats.st_size,
							"mtime": stats.st_mtime,
						})
					except Exception as error:
						result["errors"].append({"path": str(file_path), "error": str(error)})
			if len(result["candidateDirectories"]) > 5000:
				break
	except Exception as error:
		result["errors"].append({"base": str(base), "error": f"{type(error).__name__}: {error}"})

if volume_root.exists():
	for path in sorted(volume_root.iterdir()):
		try:
			stats = path.stat()
			result["mountedVolumes"].append({"path": str(path), "mtime": stats.st_mtime})
		except Exception as error:
			result["mountedVolumes"].append({"path": str(path), "error": str(error)})

result["candidateDirectories"] = sorted(
	{item["path"]: item for item in result["candidateDirectories"]}.values(),
	key=lambda item: item["path"],
)
print(json.dumps(result, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_backup_locator.done
