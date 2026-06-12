B"H

# First brainstorm: scroll captivity, modal null-crash, and post verses

Visible project root was listed. Relevant app surface is under geelooy/heichelos, plus global styles under geelooy/style and likely social shell CSS. User reports: wheel scrolling only works when the pointer is directly over the browser scrollbar; CSS clashes; initializeModal crashes because something undefined has addEventListener called; post viewer at /heichelos/ikar/series/likutteiAmarim/4?idx=0 only loads first verse and should load all verses now, not virtualized.

Possibilities to inspect: body/html overflow locks, full-screen fixed overlays swallowing wheel events, main app containers with height:100vh and overflow:hidden, pointer-events blockers, sticky bottom nav capturing scroll, global CSS reset conflicts, route template with scroll wrappers, modal module lacking DOM guards, module import ordering, post parsing only extracting first line, fetch limit defaulting to one verse, virtualization range based on viewport zero height, index query idx forcing one item, sefarim API returning full content but renderer slicing, or API returns only first verse because data path/series/item lookup does not expand.

Before edits, inspect templates, app scripts, post renderer modules, API route, CSS. Edits must be full file rewrites only. Prefer small targeted overrides if the file is already small; for large files, split or add a small imported helper/stylesheet referenced by a full rewritten HTML/template file if needed.
