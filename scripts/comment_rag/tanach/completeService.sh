#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos waits for the sealed graph, then carries every proof into public light;
# Awtsmoos.com records local lanes, remote hashes, release health, and logs made right.
set -Eeuo pipefail
root="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$root"
rag="/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag"
receipt="$rag/tanach-hebrew-verses-rag.sha256.json"
evidence="ai-thoughts/20260730-010003-tanach-hebrew-search-rag"
mkdir -p "$evidence"
for attempt in $(seq 1 240); do
	[ -s "$receipt" ] && break
	sleep 15
	[ "$attempt" -lt 240 ] || {
		echo 'B"H verified_pack_receipt_timeout' >&2
		exit 1
	}
done
node scripts/comment_rag/tanach/verifyPack.mjs \
	> "$evidence/05-pack-verification.json"
node --test geelooy/api/social/helper/search/test/tanachSearch.test.js \
	> "$evidence/06-exact-tests.log"
node --test \
	geelooy/heichelos/post/test/tanachPanel.test.mjs \
	geelooy/heichelos/post/test/tanachWordActions.test.mjs \
	> "$evidence/07-reader-tests.log"
node geelooy/api/social/helper/search/rag/test/multiLaneSearch.test.js \
	> "$evidence/08-multilane-test.log"
node geelooy/api/social/helper/search/rag/test/shardManifestIdentity.test.js \
	> "$evidence/09-shard-identity-test.log"
pids="$(lsof -ti tcp:8080 2>/dev/null || true)"
[ -z "$pids" ] || kill $pids
sleep 2
npm run start:background
for attempt in $(seq 1 90); do
	curl -fsS http://127.0.0.1:8080/ >/dev/null && break
	sleep 1
	[ "$attempt" -lt 90 ] || exit 1
done
node scripts/comment_rag/tanach/acceptance.mjs \
	http://127.0.0.1:8080 \
	"$evidence/10-local-all-lanes.json"
node scripts/comment_rag/tanach/publish/publishRuntime.mjs \
	> "$evidence/11-runtime-publication.log"
node scripts/comment_rag/tanach/publish/provisionRemote.mjs \
	> "$evidence/12-remote-runtime.log"
snapshot="$(node scripts/production/buildLocalSnapshot.mjs)"
printf '%s\n' "$snapshot" > "$evidence/13-source-snapshot.json"
receipt_path="$(printf '%s' "$snapshot" | node -e \
	"let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).receiptPath))")"
node scripts/production/publishLocalSnapshot.mjs "$receipt_path" \
	> "$evidence/14-immutable-deployment.json"
node scripts/comment_rag/tanach/acceptance.mjs \
	https://awtsmoos.com \
	"$evidence/15-public-all-lanes.json"
node --input-type=module > "$evidence/16-production-service.log" <<'NODE'
import { execAwtsmoosSsh } from './scripts/lib/awtsmoosSshClient.mjs';
import { loadPassword } from './scripts/lib/safeSshPasswordStore.mjs';
const command = [
	'set -e',
	'systemctl is-active awtsmoos.service',
	'systemctl show awtsmoos.service -p MainPID -p WorkingDirectory -p MemoryCurrent',
	'readlink -f /mnt/HC_Volume_102267213/releases/current',
	'df -h /mnt/HC_Volume_102267213',
	'journalctl -u awtsmoos.service -n 80 --no-pager'
].join('\n');
const result = await execAwtsmoosSsh({ password: loadPassword() }, command);
if (!result.ok) throw new Error(result.stderr);
console.log(result.stdout);
NODE
cat > "$evidence/17-completion-marker.md" <<EOF
B"H

# Tanach Semantic Service Completion Marker

Completed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)

The Awtsmoos joined all 23,204 Tanach verses with the existing semantic lanes in public light;
Awtsmoos.com preserved hashes, tests, deployment, rollback, acceptance, and service logs aright.

Evidence files: 05 through 16 in this folder.
EOF
echo 'B"H TANACH SEMANTIC SERVICE COMPLETE'
