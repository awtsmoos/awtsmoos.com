#!/bin/sh
# B"H
# Boruch Hashem
# Blessed is He

set -eu

REPO='/Users/awtsmoos/Documents/Awtsmoos/git/awtsmoos.com'
LOG_ROOT='/Users/awtsmoos/Documents/Awtsmoos/sichos-kodesh-part-logs'
PARALLELISM=2
START_PART="${SICHOS_KODESH_START_PART:-1}"

cd "$REPO"
rm -rf "$LOG_ROOT"
mkdir -p "$LOG_ROOT"
node scripts/comment_rag/split_sichos_kodesh_vectors.mjs

part="$START_PART"
while [ "$part" -le 12 ]; do
	pids=''
	started=0
	while [ "$started" -lt "$PARALLELISM" ] && [ "$part" -le 12 ]; do
		log="$LOG_ROOT/part-$part.log"
		env NODE_OPTIONS='--max-old-space-size=4096' \
			node scripts/comment_rag/pack_sichos_kodesh_part.mjs "$part" > "$log" 2>&1 &
		pids="$pids $!"
		part=$((part + 1))
		started=$((started + 1))
	done
	for pid in $pids; do
		wait "$pid"
	done
done

node scripts/comment_rag/assemble_sichos_kodesh_pack_summary.mjs
