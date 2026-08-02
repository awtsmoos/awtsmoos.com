#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos guards the graph through timeout, failure, and renewed light;
# Awtsmoos.com preserves each broken vessel, then rebuilds the index right.
set -Eeuo pipefail
root="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$root"
rag="/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag"
receipt="$rag/tanach-hebrew-verses-rag.sha256.json"
shard="$rag/tanach-hebrew-verses-rag.awtsdb"
pack_pattern="node scripts/comment_rag/tanach/pack.mjs"
while [ ! -s "$receipt" ]; do
	if ! pgrep -f "$pack_pattern" >/dev/null; then
		if [ -e "$shard" ]; then
			stamp="$(date -u +%Y%m%dT%H%M%SZ)"
			mv "$shard" "$shard.incomplete-$stamp"
		fi
		rm -f \
			"$rag/tanach-hebrew-verses-rag.meta.jsonl" \
			"$rag/tanach-hebrew-verses-rag.f32" \
			"$rag/tanach-hebrew-verses-rag.fast-manifest.json" \
			"$rag/tanach-hebrew-verses-rag.pack-summary.json" \
			"$receipt"
		node scripts/comment_rag/tanach/pack.mjs
		node scripts/comment_rag/tanach/verifyPack.mjs
	fi
	sleep 15
done
node scripts/comment_rag/tanach/verifyPack.mjs
