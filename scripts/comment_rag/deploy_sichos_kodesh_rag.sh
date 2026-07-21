#!/bin/sh
# B"H
# Boruch Hashem
# Blessed is He

set -eu

REPO='/Users/awtsmoos/Documents/Awtsmoos/git/awtsmoos.com'
STAGING='/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output/rag-staging'
LIVE='/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag'
PACK_PID_FILE='/Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-twelve-part-pack.pid'
PACK_SUMMARY='/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output/sichos-kodesh-english-comments-embedding-job/pack-awtsdb-summary.json'
VERIFY_REPORT='/Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-staging-verification.json'
API_REPORT='/Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-rag-deployment-report.json'
LOG='/Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-rag-deployment.log'

cd "$REPO"
PACK_PID=$(cat "$PACK_PID_FILE")
while kill -0 "$PACK_PID" 2>/dev/null; do
	sleep 10
done

grep -q '"records": 68490' "$PACK_SUMMARY" || {
	echo 'pack did not complete' >> "$LOG"
	exit 1
}
SICHOS_KODESH_RAG_ROOT="$STAGING" \
	node scripts/comment_rag/verify_sichos_kodesh_rag_setup.mjs > "$VERIFY_REPORT"

part=1
while [ "$part" -le 12 ]; do
	base="sichos-kodesh-english-comments-rag-part-$part"
	for suffix in awtsdb fast-manifest.json meta.jsonl f32; do
		cp "$STAGING/$base.$suffix" "$LIVE/$base.$suffix.publish-tmp"
		mv "$LIVE/$base.$suffix.publish-tmp" "$LIVE/$base.$suffix"
	done
	part=$((part + 1))
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
[ -n "$NEW_PID" ] || exit 1
AWTSMOOS_RAG_ROOT="$LIVE" \
	node scripts/comment_rag/test_sichos_kodesh_rag_api.mjs > "$API_REPORT"
