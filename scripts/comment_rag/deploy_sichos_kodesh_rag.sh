#!/bin/sh
# B"H
# Boruch Hashem
# Blessed is He

set -eu

REPO='/Users/awtsmoos/Documents/Awtsmoos/git/awtsmoos.com'
STAGING='/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output/rag-staging'
LIVE='/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag'
PACK_PID_FILE='/Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-two-part-pack.pid'
PACK_SUMMARY='/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output/sichos-kodesh-english-comments-embedding-job/pack-awtsdb-summary.json'
REPORT='/Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-rag-deployment-report.json'
LOG='/Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-rag-deployment.log'

cd "$REPO"
PACK_PID=$(cat "$PACK_PID_FILE")
while kill -0 "$PACK_PID" 2>/dev/null; do
	sleep 10
done

if ! grep -q '"records": 68490' "$PACK_SUMMARY"; then
	echo 'pack did not complete' >> "$LOG"
	exit 1
fi

SICHOS_KODESH_RAG_ROOT="$STAGING" node scripts/comment_rag/verify_sichos_kodesh_rag_setup.mjs \
	> /Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-staging-verification.json

mkdir -p "$LIVE"
for base in \
	sichos-kodesh-english-comments-rag-part-1 \
	sichos-kodesh-english-comments-rag-part-2; do
	for suffix in awtsdb fast-manifest.json meta.jsonl f32; do
		cp "$STAGING/$base.$suffix" "$LIVE/$base.$suffix.publish-tmp"
		mv "$LIVE/$base.$suffix.publish-tmp" "$LIVE/$base.$suffix"
	done
done

for sidecar in "$LIVE"/*.awtsdb.wal "$LIVE"/*.awtsdb.journal "$LIVE"/*.awtsdb.lock "$LIVE"/*.awtsdb.tmp; do
	[ ! -e "$sidecar" ] || {
		echo "forbidden sidecar $sidecar" >> "$LOG"
		exit 1
	}
done

OLD_PID=$(lsof -tiTCP:8080 -sTCP:LISTEN || true)
[ -z "$OLD_PID" ] || kill "$OLD_PID"
for attempt in 1 2 3 4 5 6 7 8 9 10; do
	lsof -tiTCP:8080 -sTCP:LISTEN >/dev/null 2>&1 || break
	sleep 1
done

AWTSMOOS_RAG_ROOT="$LIVE" nohup npm run start:background \
	>> .logs/sichos-kodesh-rag-deploy.log 2>&1 < /dev/null &

NEW_PID=''
for attempt in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
	NEW_PID=$(lsof -tiTCP:8080 -sTCP:LISTEN || true)
	[ -n "$NEW_PID" ] && break
	sleep 1
done
[ -n "$NEW_PID" ] || {
	echo 'server failed to restart' >> "$LOG"
	exit 1
}

node --input-type=module <<'NODE' > "$REPORT"
const base = 'http://127.0.0.1:8080';

async function json(path) {
	const response = await fetch(base + path);
	const body = await response.json();
	if (!response.ok || body.error) {
		throw new Error(`${path}: ${JSON.stringify(body)}`);
	}
	return { status: response.status, body };
}

const shards = await json('/api/social/search/rag/shards');
const lanes = ['likkutei-sichos', 'sefer-hasichos', 'sichos-kodesh'];
const searches = {};
for (const lane of lanes) {
	const path = `/api/social/search/rag/query?q=${encodeURIComponent('the Rebbe explained the purpose of Torah')}&lane=${lane}&limit=5`;
	const result = await json(path);
	const success = result.body.success;
	if (!success?.indexed || success?.index?.persisted !== true || !success?.hits?.length) {
		throw new Error(`invalid strict result for ${lane}`);
	}
	searches[lane] = {
		status: result.status,
		hits: success.hits.length,
		totalRows: success.totalRows,
		vectorSource: success.vectorSource,
		firstPostId: success.hits[0]?.row?.postId || success.hits[0]?.postId || null
	};
}

const indexResponse = await fetch(base + '/');
if (!indexResponse.ok) {
	throw new Error(`frontend index status ${indexResponse.status}`);
}

console.log(JSON.stringify({
	BH: 'B"H',
	checkedAt: new Date().toISOString(),
	shards: shards.body.success,
	searches,
	frontendIndexStatus: indexResponse.status
}, null, 2));
NODE
