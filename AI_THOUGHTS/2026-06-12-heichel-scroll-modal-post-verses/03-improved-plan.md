B"H

# Improved plan after inspection

Facts inspected from real files:
- /heichelos/ikar loads geelooy/heichelos/_awtsmoos.heichel.html, which imports heichel modules and CSS.
- events.js dynamically imports modal.js and calls initializeModal.
- modal.js assumes modalForm, modalCancelBtn, and modalBackdrop exist. The blueprint creates modalForm and modalBackdrop, but does not create modalCancelBtn and does not create modalContentTypeSelect. Therefore addEventListener can crash on undefined.
- The post reader uses scribe.js append-only virtualization. interpretPostDayuh renders only targetChunkFromLocation() first, then awakens virtual oracle. The user asked to disable virtualization for now and eagerly render all verses at initial load.
- Home and Heichel CSS already try overflow-y:auto, but scroll can still be captured by local fixed/overlay vessels. Add a small global scroll sovereignty CSS and import it only into affected surfaces first.

Actual intended touch list:
1. geelooy/style/awtsmoos-scroll-sovereignty.css new small CSS antidote.
2. geelooy/index.html full rewrite with the scroll CSS link before social home CSS.
3. geelooy/heichelos/_awtsmoos.heichel.html full rewrite with the scroll CSS link.
4. geelooy/heichelos/post/_awtsmoos.post.html full rewrite with the scroll CSS link and cache bump.
5. geelooy/heichelos/heichel/modules/modal.js full rewrite: safe DOM guards, idempotent listener binding, class compatibility for modal-hidden/modal-gate-hidden.
6. geelooy/heichelos/heichel/modules/ui/blueprints/main-layout.js full rewrite: modal gets content type select and cancel button refs.
7. geelooy/heichelos/post/logic/scribe.js full rewrite: eager render all sections, no virtual oracle awakening, restore target after all sections exist.

Tests:
- node --check or dynamic import for changed JS files.
- browser smoke / simulate localhost pages if possible.
