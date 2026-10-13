// B"H
/**
 * @module ScrollSpyRestoration
 * @description
 * Restores Yaakov's two reading companions: (1) scroll-spy highlighting —
 * the verse/section you are reading glows subtly as you scroll; (2) scroll
 * restoration — refresh the page and it returns you to the verse you were
 * reading. Both work on mobile and desktop, and neither blocks the 4-second
 * load law (all observers are passive, restoration waits for content).
 */

const STORAGE_KEY = '__awtsmoosReaderScrollPos';
const SPY_CLASS = 'awtsmoos-spy-current';
const RESTORED_CLASS = 'awtsmoos-spy-restored';
const STATE_KEY = '__awtsmoosScrollSpy';

function vessel() {
  return typeof window !== 'undefined' ? window : globalThis;
}

/** Returns the post ID for scoping the saved position. */
function postKey() {
  try {
    const params = new URLSearchParams(location.search);
    const postId = params.get('postId') || params.get('post') || location.pathname;
    return `${STORAGE_KEY}:${postId}`;
  } catch {
    return STORAGE_KEY;
  }
}

/** Saves the current chunk ID (throttled by caller). */
function savePosition(chunkId) {
  try {
    vessel().localStorage.setItem(postKey(), JSON.stringify({
      chunkId: String(chunkId),
      savedAt: Date.now()
    }));
  } catch {}
}

/** Loads the saved chunk ID, or null. */
function loadPosition() {
  try {
    const raw = vessel().localStorage.getItem(postKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Ignore positions older than 7 days.
    if (Date.now() - (parsed.savedAt || 0) > 7 * 24 * 60 * 60 * 1000) return null;
    return parsed.chunkId || null;
  } catch {
    return null;
  }
}

/** Finds all verse chunks in reading order. */
function findChunks() {
  if (typeof document === 'undefined') return [];
  return [...document.querySelectorAll('#realPost .scroll-chunk[data-chunk-id]')];
}

/**
 * Binds scroll-spy highlighting + position saving.
 * Safe to call multiple times; previous observer is disconnected.
 */
export function bindScrollSpy() {
  const world = vessel();
  const previous = world[STATE_KEY];
  if (previous?.disconnect) {
    try { previous.disconnect(); } catch {}
  }

  // Skip if URL has an explicit deep-link (idx param) — that takes precedence.
  let hasDeepLink = false;
  try {
    hasDeepLink = new URLSearchParams(location.search).has('idx');
  } catch {}

  const state = { disconnect: () => {}, active: false };
  world[STATE_KEY] = state;

  if (typeof document === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return state.disconnect;
  }

  const chunks = findChunks();
  if (!chunks.length) {
    return state.disconnect;
  }

  let saveTimer = null;
  const scheduleSave = (chunkId) => {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      savePosition(chunkId);
    }, 800);
  };

  const observer = new IntersectionObserver((entries) => {
    let best = null;
    let bestRatio = 0;
    for (const entry of entries) {
      if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
        best = entry.target;
        bestRatio = entry.intersectionRatio;
      }
    }
    if (!best) return;
    // Update highlight: only the most-visible chunk glows.
    for (const chunk of chunks) {
      chunk.classList.toggle(SPY_CLASS, chunk === best);
    }
    // Save position for restoration (skip if user deep-linked).
    if (!hasDeepLink && best.dataset.chunkId) {
      scheduleSave(best.dataset.chunkId);
    }
  }, {
    root: null,
    rootMargin: '-30% 0px -30% 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  });

  chunks.forEach(chunk => observer.observe(chunk));

  // Watch for new chunks (virtual scroll appends as you read).
  const watcher = new MutationObserver(() => {
    const fresh = findChunks();
    for (const chunk of fresh) {
      if (!chunks.includes(chunk)) {
        chunks.push(chunk);
        observer.observe(chunk);
      }
    }
  });
  const container = document.querySelector('#realPost');
  if (container) {
    watcher.observe(container, { childList: true, subtree: true });
  }

  state.active = true;
  state.disconnect = () => {
    try { observer.disconnect(); } catch {}
    try { watcher.disconnect(); } catch {}
    if (saveTimer) clearTimeout(saveTimer);
  };
  return state.disconnect;
}

/**
 * Restores scroll to the saved verse. Call after content is ready.
 * Returns true if a restoration was attempted.
 */
export function restoreScrollPosition() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return false;

  // Deep-link params take precedence over saved position.
  try {
    if (new URLSearchParams(location.search).has('idx')) return false;
    if (location.hash) return false;
  } catch {}

  const chunkId = loadPosition();
  if (!chunkId) return false;

  const attempt = (triesLeft) => {
    const target = document.querySelector(`#realPost .scroll-chunk[data-chunk-id="${chunkId}"]`);
    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
      target.classList.add(SPY_CLASS, RESTORED_CLASS);
      // Remove the restored flash after 2.5s, keep the spy highlight.
      setTimeout(() => target.classList.remove(RESTORED_CLASS), 2500);
      return true;
    }
    if (triesLeft > 0) {
      setTimeout(() => attempt(triesLeft - 1), 400);
    }
    return false;
  };

  // Try immediately, then retry as chunks render (up to ~6s).
  return attempt(15);
}

export function getScrollSpyState() {
  return vessel()[STATE_KEY] || null;
}
