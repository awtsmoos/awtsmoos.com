// B"H
/** WildlifeStream.js — stream the far herd after early gameplay is stable. */
import { FIRST_PLAYABLE_WILDLIFE_LIMIT, STREAMED_WILDLIFE_CHUNK } from "../RegionWildlifeData.js?v=mitzvah-aggressive-split-20260703-bh1";

const FIRST_STREAM_DELAY_MS = 36000;
const STREAM_INTERVAL_MS = 3000;

export function scheduleRemainder({ root, olam, backend, all, addActor, sealRoot, registerForProof }) {
  const remaining = all.slice(FIRST_PLAYABLE_WILDLIFE_LIMIT);
  root.userData.streamingRemaining = remaining.length;
  root.userData.streamingChunk = STREAMED_WILDLIFE_CHUNK;
  root.userData.streamingFirstDelayMs = FIRST_STREAM_DELAY_MS;
  root.userData.streamingIntervalMs = STREAM_INTERVAL_MS;
  root.userData.deferredUntilEarlyGameplayStable = true;
  if (!remaining.length) return;
  let cursor = 0;
  const pump = () => {
    const chunk = remaining.slice(cursor, cursor + STREAMED_WILDLIFE_CHUNK);
    chunk.forEach((animal, i) => addActor(root, olam, backend, animal, FIRST_PLAYABLE_WILDLIFE_LIMIT + cursor + i));
    cursor += chunk.length;
    root.userData.streamedAnimals = cursor;
    root.userData.streamingRemaining = Math.max(0, remaining.length - cursor);
    sealRoot(root, backend);
    registerForProof(root, olam);
    if (cursor < remaining.length) setTimeout(pump, STREAM_INTERVAL_MS);
  };
  setTimeout(pump, FIRST_STREAM_DELAY_MS);
}
