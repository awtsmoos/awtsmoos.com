B'H
# Phase Two File Map

Files/directories to inspect before writing:
- geelooy/heichelos/_awtsmoos.index.html
- geelooy/heichelos/_awtsmoos.heichel.html
- geelooy/heichelos/heichel/_awtsmoos.heichel.html
- geelooy/heichelos/_awtsmoos.post.html
- geelooy/heichelos/post/_awtsmoos.post.html
- geelooy/heichelos/heichelos/post/styles/main.css and its imported CSS shards
- geelooy/heichelos/new-style.css
- geelooy/heichelos/heichel/modules/ui/render/*.js
- geelooy/heichelos/heichel/modules/editing/buttons.js
- geelooy/heichelos/heichel/modules/navigator/*.js
- git history versions of post and heichel templates/styles before the damaging edits

Potential touch set, only after evidence:
- A single canonical stylesheet entry for post view, possibly restoring imports and missing base rules.
- A single canonical stylesheet entry for heichel/list view, possibly restoring new-style.css or replacing template CSS links.
- Small JS button/menu modules only if buttons are fake/nonfunctional.
- Tests/contracts to detect default anchor leak, mobile overlap, and missing stylesheet references.

No partial patching. Any modified file must be fully rewritten. If a file is too large, prefer creating smaller modules and replacing importer files completely.
