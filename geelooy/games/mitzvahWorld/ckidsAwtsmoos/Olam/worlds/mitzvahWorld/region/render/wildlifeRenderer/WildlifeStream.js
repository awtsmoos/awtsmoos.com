// B"H
/**
 * @file WildlifeStream.js
 * @description
 * Stream the far herd only after early movement is stable. The first playable
 * scene keeps nearby animals; the wider ecology hydrates one actor at a time so
 * the first 30+ seconds of real movement are not interrupted by mesh creation.
 */
import { FIRST_PLAYABLE_WILDLIFE_LIMIT } from "../RegionWildlifeData.js?v=mitzvah-aggressive-split-20260703-bh1";

const FIRST_STREAM_DELAY_MS = 75000;
const STREAM_INTERVAL_MS = 6000;
const STREAM_CHUNK = 1;

export function scheduleRemainder({ root, olam, backend, all, addActor, sealRoot, registerForProof }) {
  const remaining = all.slice(FIRST_PLAYABLE_WILDLIFE_LIMIT);
  root.userData.streamingRemaining = remaining.length;
  root.userData.streamingChunk = STREAM_CHUNK;
  root.userData.streamingFirstDelayMs = FIRST_STREAM_DELAY_MS;
  root.userData.streamingIntervalMs = STREAM_INTERVAL_MS;
  root.userData.deferredUntilEarlyGameplayStable = true;
  root.userData.noWildlifeStreamingDuringFirstMovementProof = true;
  if (!remaining.length) return;
  let cursor = 0;
  const pump = () => {
    const chunk = remaining.slice(cursor, cursor + STREAM_CHUNK);
    chunk.forEach((animal, index) => addActor(root, olam, backend, animal, FIRST_PLAYABLE_WILDLIFE_LIMIT + cursor + index));
    cursor += chunk.length;
    root.userData.streamedAnimals = cursor;
    root.userData.streamingRemaining = Math.max(0, remaining.length - cursor);
    sealRoot(root, backend);
    registerForProof(root, olam);
    if (cursor < remaining.length) setTimeout(pump, STREAM_INTERVAL_MS);
  };
  setTimeout(pump, FIRST_STREAM_DELAY_MS);
}
