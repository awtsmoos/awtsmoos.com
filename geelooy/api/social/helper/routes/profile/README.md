# B"H — Profile Routes (geelooy/api/social/helper/routes/profile/)

Profile HTTP routes: profiles, feeds, discovery, follows, trending, activity, and analytics.

## Files
- `socialRoutes.js` — core social profile routes.
- `discoveryRoutes.js`, `discoveryCatalogRoutes.js`, `discoveryFlowRoutes.js`, `discoveryRecommendationRoutes.js` — discovery surfaces.
- `commentBrowseRoutes.js` — profile comment browsing.
- `resourceRoutes.js`, `resourceCoreRoutes.js`, `resourceInsightRoutes.js` — resource routes.
- `operations.js`, `values.js` — operations and value helpers.
- `legacyAuthoredRoutes.js`, `legacyCatalogRoutes.js`, `legacyReadRoutes.js`, `legacyStructureRoutes.js`, `legacyWriteRoutes.js` — legacy compat routes.

## Endpoints
- `/profile/:alias`, `/profiles/:alias` (+ `/activity`, `/comments`, `/posts`, `/heichelos`, `/series-tree`, `/tree`, `/analytics`, `/graph`, `/history`, `/living-card`, `/comment-series[/:seriesId[/posts[/:postId/comments]]]`, `/comments/search`)
- `/profile/feed`, `/profile/batch`, `/profiles/batch`, `/profile/meta`, `/profile/templates`
- `/alias/:alias/profile[/template]`, `/alias/:alias/history`
- `/follows/:alias`, `/followers/:type/:id`
- `/feed`, `/trending`, `/search`, `/heichelos/discover`, `/recommendations/:alias`
- `/bulk`, `/events`, `/meta`, `/openapi.json`
