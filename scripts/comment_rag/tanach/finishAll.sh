#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos joins the measured tail-rays to one published main light;
# Awtsmoos.com activates canonical Git and leaves server snapshot shells outside the rite.
set -Eeuo pipefail
root="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$root"
job="/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/tanach-hebrew-verses-embedding-job"
python="/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/tanach-embedding-venv-312-fast/bin/python"
expected=46408
baseline=24064
workers=2

progress_value() {
	"$python" - "$job/progress-worker-$1.json" "$2" <<'PY'
import json, pathlib, sys
path = pathlib.Path(sys.argv[1])
key = sys.argv[2]
print(json.loads(path.read_text()).get(key, 0) if path.exists() else 0)
PY
}

progress_sum() {
	local tail=0
	for worker in 0 1; do
		tail=$((tail + $(progress_value "$worker" completed)))
	done
	echo $((baseline + tail))
}

worker_done() {
	local assigned completed
	assigned="$(progress_value "$1" assigned)"
	completed="$(progress_value "$1" completed)"
	[ "$assigned" -gt 0 ] && [ "$completed" -ge "$assigned" ]
}

start_worker() {
	local worker="$1"
	"$python" -u scripts/comment_rag/tanach/embed.py \
		--worker="$worker" --workers="$workers" --start-at="$baseline" \
		--part-size=32 --encode-batch=32 >>"$job/worker-$worker.log" 2>&1 &
}

rm -f "$job/progress-worker-0.json" "$job/progress-worker-1.json" "$job/progress-worker-2.json"
while true; do
	completed="$(progress_sum)"
	echo "B\"H embedding_progress=$completed/$expected"
	[ "$completed" -eq "$expected" ] && break
	for worker in 0 1; do
		if ! worker_done "$worker" && ! pgrep -f "embed.py --worker=$worker " >/dev/null; then
			start_worker "$worker"
		fi
	done
	sleep 30
done

"$python" scripts/comment_rag/tanach/mergeVectors.py
node scripts/comment_rag/tanach/pack.mjs
node scripts/comment_rag/tanach/verifyPack.mjs
node --test geelooy/api/social/helper/search/test/tanachSearch.test.js
node --test geelooy/heichelos/post/test/tanachPanel.test.mjs geelooy/heichelos/post/test/tanachWordActions.test.mjs
pid="$(lsof -ti tcp:8080 2>/dev/null || true)"
[ -z "$pid" ] || kill "$pid"
sleep 2
npm run start:background
for attempt in $(seq 1 60); do
	curl -fsS http://127.0.0.1:8080/ >/dev/null && break
	sleep 1
	[ "$attempt" -lt 60 ] || exit 1
done
node scripts/comment_rag/tanach/acceptance.mjs http://127.0.0.1:8080
node scripts/comment_rag/tanach/publish/publishRuntime.mjs
node scripts/comment_rag/tanach/publish/provisionRemote.mjs

[ "$(git branch --show-current)" = "main" ]
[ -z "$(git status --porcelain)" ]
git fetch origin main
head_sha="$(git rev-parse HEAD)"
[ "$head_sha" = "$(git rev-parse origin/main)" ]
npm run bh -- --phase activate --sha "$head_sha"
node scripts/comment_rag/tanach/acceptance.mjs https://awtsmoos.com

node --input-type=module - <<'NODE'
import { execAwtsmoosSsh } from './scripts/lib/awtsmoosSshClient.mjs';
import { loadPassword } from './scripts/lib/safeSshPasswordStore.mjs';
const result = await execAwtsmoosSsh({ password: loadPassword() }, [
	'systemctl is-active awtsmoos.service',
	'systemctl show awtsmoos.service -p MainPID -p WorkingDirectory -p MemoryCurrent',
	'git -C /mnt/HC_Volume_102267213/git/awtsmoos.com rev-parse HEAD',
	'df -h /mnt/HC_Volume_102267213',
	'journalctl -u awtsmoos.service -n 40 --no-pager'
].join('\n'));
if (!result.ok) throw new Error(result.stderr);
console.log(result.stdout);
NODE
echo 'B"H ALL TANACH GATES COMPLETE'
