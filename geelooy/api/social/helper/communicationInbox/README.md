# B"H — Communication Inbox (geelooy/api/social/helper/communicationInbox/)

Low-level inbox storage for per-alias communications (messages/notifications).

## Files
- `index.js` — module entry.
- `paths.js` — storage paths for inbox items.
- `read.js`, `write.js` — read/write inbox items.
- `sanitize.js` — sanitizes stored items.

## What it does
Persists and retrieves inbox items for an alias; the HTTP surface is `communicationRoutes/` (mounted via `_awtsmoos.communications.js`).
