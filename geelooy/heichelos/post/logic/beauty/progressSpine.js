// B"H
/**
 * Chapter 328: The progress spine remembers its own markers.
 * Long sefarim should not rebuild the same constellation every delayed pass.
 */

function chunkSignature(chunks) {
  return chunks.map((chunk, index) => chunk.dataset.chunkId || String(index)).join('|');
}

function makeMarker(chunk, index) {
  const marker = document.createElement('span');
  marker.className = 'awtsmoos-progress-marker';
  marker.dataset.chunkId = chunk.dataset.chunkId || String(index);
  return marker;
}

export function manifestProgressSpine() {
  const chunks = [...document.querySelectorAll('#virtual-scroll-container > .scroll-chunk')];
  if (!chunks.length) return null;

  let spine = document.querySelector('.awtsmoos-progress-spine');
  if (!spine) {
    spine = document.createElement('div');
    spine.className = 'awtsmoos-progress-spine';
    spine.setAttribute('aria-hidden', 'true');
    document.body.appendChild(spine);
  }

  const signature = chunkSignature(chunks);
  if (spine.dataset.awtsmoosSignature !== signature) {
    spine.replaceChildren(...chunks.map(makeMarker));
    spine.dataset.awtsmoosSignature = signature;
  }
  return spine;
}

export function updateProgressSpine(currentChunk) {
  const id = currentChunk?.dataset?.chunkId;
  document.querySelectorAll('.awtsmoos-progress-marker').forEach(marker => {
    marker.classList.toggle('current', marker.dataset.chunkId === id);
  });
}
