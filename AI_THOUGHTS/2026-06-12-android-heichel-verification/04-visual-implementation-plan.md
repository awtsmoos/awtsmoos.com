B"H

# Visual implementation plan

Actual CSS work to perform in one coherent pass:

1. Rewrite home.css to improve desktop/mid/mobile composition.
2. Add heichel visual-polish.css for topbar, hero, labels, cards, modal, drawer, bottom nav.
3. Rewrite heichel index.css to import visual-polish last.
4. Add post reader visual-polish.css imported after scroll-root.
5. Rewrite post main.css to import visual-polish last.
6. Rewrite scroll sovereignty CSS to include stronger non-invasive visual/touch safety rules for hidden overlays and fixed nav padding.

Reason:
Existing immediate fixes work, but visual layers still look collided and old CSS remains. These changes do not delete the old architecture today; they put a clean visual layer above it that improves spacing, hierarchy, mobile touch targets, modal presentation, and reader rhythm.

Files touched:
- geelooy/style/social/home.css
- geelooy/style/heichelos/heichel/index.css
- geelooy/style/heichelos/heichel/visual-polish.css
- geelooy/heichelos/post/styles/main.css
- geelooy/heichelos/post/styles/ideal/reborn/visual-polish.css
- geelooy/style/awtsmoos-scroll-sovereignty.css

Verification:
- CSS grep confirms imports.
- Live HTTP response confirms assets.
- Node tests rerun for scroll and syntax.
