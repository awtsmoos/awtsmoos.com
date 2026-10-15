# B"H — Comment Query (geelooy/api/social/helper/comments/query/)

The comment read/query service used by comment routes.

## Files
- `TiferesCommentQueryService.js` — central query service for reading comments (by post, alias, verse section, tree).
- `BinahCommentReadContext.js` — builds the immutable read context (heichel, series, post, permissions) that queries execute under.
