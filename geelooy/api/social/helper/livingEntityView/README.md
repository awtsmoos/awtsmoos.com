# B"H — Living Entity View (geelooy/api/social/helper/livingEntityView/)

Read-side view of a "living entity": identity, content, social graph, and comment trees for a single entity, cleaned and sanitized.

## Files
- `index.js` — module entry; `paths.js` — storage paths.
- `identity.js`, `content.js`, `social.js`, `graph.js` — entity identity, content, social edges, graph.
- `read.js`, `clean.js`, `sanitize.js` — read, clean, and sanitize the view.
- `test.js` — module tests.

## Routes (examples)
- `/social/heichelos/h1/posts/p1`, `/heichelos/h1/series/root/p1`
- `/social/heichelos/h1/posts/p1/commentTree/roots`, `.../commentTree/comments/c1/data`, `.../commentTree/comments/c1/children`
