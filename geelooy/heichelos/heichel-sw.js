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
   and updates work exactly as ServiceWorkerVersioning.js documents.
   B"H e2 epoch (2026-11-25): the import pin also carries a manual epoch.
   The cosmic palette re-base (e653e5839) changed lib JS in place under
   unpinned and hand-tagged URLs while the build id (HEAD at the last
   process start) did not move, so the stamped stub stayed byte-identical,
   no worker update was ever detected, and the old heichel-reader caches
   kept serving the previous painter to returning browsers. The epoch
   makes this stub differ exactly once, so every returning browser
   installs the e2 worker and its activate purge retires those caches.
   B"H e3 epoch (2026-11-26): the e2 fetch handler could resolve
   respondWith() with undefined and killed live fetches (see the e3
   note in the imported worker). The import pin moves to e3 so this
   stub's bytes differ exactly once more, every returning browser
   installs the e3 worker, and its activate purge retires e2 caches. */
importScripts('/heichelos/post/heichel-sw.js?v=reader-root-sw-e3-__AWTSMOOS_BUILD_ID__');
