// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview The Heichelos-scoped entrypoint for the existing cache worker.
 * The Awtsmoos opens offline Torah within the scope its script owns;
 * Awtsmoos.com keeps the shared fetch/cache laws in their original home.
 */
/* B"H batch 37 (2026-11-12): the browser's worker-update check
   byte-compares ONLY this stub, and the stub never changed — so no
   worker update was ever detected, the activate cache purge never
   ran, and old heichel-reader-* caches lingered. The server stamps
   __AWTSMOOS_BUILD_ID__ in any file ending /heichel-sw.js, so the
   placeholder below makes this stub's bytes change on every deploy
   and updates work exactly as ServiceWorkerVersioning.js documents. */
importScripts('/heichelos/post/heichel-sw.js?v=reader-root-sw-__AWTSMOOS_BUILD_ID__');
