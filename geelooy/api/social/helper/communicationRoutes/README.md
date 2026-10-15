# B"H — Communication Routes (geelooy/api/social/helper/communicationRoutes/)

HTTP routes for alias communications: inbox, threads, overview, live map, and notification digest.

## Files
- `CommunicationRouteVessel.js` — assembles the route set.
- `CommunicationInboxRoutes.js` — inbox read/mark-read.
- `CommunicationThreadRoutes.js` — thread read/mark-read.
- `CommunicationOverviewRoutes.js` — per-alias communication overview.
- `CommunicationNotificationRoutes.js` — notification digests.

## Endpoints
- `/communications/:alias/inbox` · `/communications/:alias/inbox/unread` · `/communications/:alias/inbox/:item/read`
- `/communications/:alias/threads/:thread` · `/communications/:alias/threads/:thread/read`
- `/communications/:alias/overview`
- `/communications/:alias/live-map`
- `/communications/:alias/notification-digest`
