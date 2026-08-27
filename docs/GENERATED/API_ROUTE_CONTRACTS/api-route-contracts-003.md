B"H
Boruch Hashem
Blessed is He

# Generated API Route Contract Atlas 111–165

Every discovered path joined to its source-file contract evidence; unknown remains unknown.

| URL pattern | Source | Methods | Vessels | Statuses | Headers |
| --- | --- | --- | --- | --- | --- |
| /api/social/drive/:aliasId/admin/quota | geelooy/api/social/helper/drive/routes/quotaRoutes.js | unknown | headers | — | — |
| /api/social/drive/:aliasId/credentials | geelooy/api/social/helper/drive/routes/credentialRoutes.js | GET | headers | — | — |
| /api/social/drive/:aliasId/credentials/:credentialId | geelooy/api/social/helper/drive/routes/credentialRoutes.js | GET | headers | — | — |
| /api/social/drive/:aliasId/entries | geelooy/api/social/helper/drive/routes/entryRoutes.js | GET, POST, PUT, DELETE, HEAD | $_GET, headers | — | x-request-id |
| /api/social/drive/:aliasId/entry/:path* | geelooy/api/social/helper/drive/routes/entryRoutes.js | GET, POST, PUT, DELETE, HEAD | $_GET, headers | — | x-request-id |
| /api/social/drive/:aliasId/reconciliation | geelooy/api/social/helper/drive/routes/reconciliationRoutes.js | GET | $_GET, headers | — | — |
| /api/social/drive/:aliasId/site | geelooy/api/social/helper/drive/routes/siteRoutes.js | unknown | — | — | x-request-id |
| /api/social/drive/:aliasId/stream/:path* | geelooy/api/social/helper/drive/routes/streamingRoutes.js | unknown | — | — | — |
| /api/social/drive/:aliasId/usage | geelooy/api/social/helper/drive/routes/entryRoutes.js | GET, POST, PUT, DELETE, HEAD | $_GET, headers | — | x-request-id |
| /api/social/drive/admin/service-aliases | geelooy/api/social/helper/drive/routes/serviceAliasRoutes.js | unknown | headers | — | — |
| /api/social/drive/admin/service-aliases/:aliasId | geelooy/api/social/helper/drive/routes/serviceProvisioningRoutes.js | unknown | headers | — | — |
| /api/social/drive/immutable/:aliasId/:hash | geelooy/api/social/helper/drive/routes/publicRoutes.js | OPTIONS | headers | 204 | — |
| /api/social/drive/manager | geelooy/api/social/helper/drive/routes/managerRoutes.js | HEAD | — | 200, 302, 404 | — |
| /api/social/drive/manager/:assetPath* | geelooy/api/social/helper/drive/routes/managerRoutes.js | HEAD | — | 200, 302, 404 | — |
| /api/social/drive/public/:aliasId/:path* | geelooy/api/social/helper/drive/routes/publicRoutes.js | OPTIONS | headers | 204 | — |
| /api/social/editor/heichelos/:heichel/posts/:post/subsections/:subsection | geelooy/api/social/_awtsmoos.editor.js | unknown | route-vars | — | — |
| /api/social/editor/heichelos/:heichel/posts/:post/subsections/:subsection/delete-preview | geelooy/api/social/_awtsmoos.editor.js | unknown | route-vars | — | — |
| /api/social/editor/heichelos/:heichel/posts/:post/verses/:verse | geelooy/api/social/_awtsmoos.editor.js | unknown | route-vars | — | — |
| /api/social/editor/heichelos/:heichel/posts/:post/verses/:verse/delete-preview | geelooy/api/social/_awtsmoos.editor.js | unknown | route-vars | — | — |
| /api/social/editor/posts/drafts | geelooy/api/social/_awtsmoos.editor.js | unknown | route-vars | — | — |
| /api/social/editor/posts/drafts/:alias/:draft | geelooy/api/social/_awtsmoos.editor.js | unknown | route-vars | — | — |
| /api/social/editor/posts/drafts/publish | geelooy/api/social/_awtsmoos.editor.js | unknown | route-vars | — | — |
| /api/social/entities/:heichel/:entity/comment-tree | geelooy/api/social/helper/comments/routes/rich.js | unknown | $_GET, $_POST, $_DELETE | — | — |
| /api/social/entities/:heichel/:entity/comments/:comment/replies | geelooy/api/social/helper/comments/routes/rich.js | unknown | $_GET, $_POST, $_DELETE | — | — |
| /api/social/entities/:heichel/:entity/comments/:comment/sections/:section/replies | geelooy/api/social/helper/comments/routes/rich.js | unknown | $_GET, $_POST, $_DELETE | — | — |
| /api/social/entities/universe | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/entities/universe/:type/:id | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/entities/universe/:type/:id/children | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/entities/universe/:type/:id/dna | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/entities/universe/:type/:id/edges | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/entities/universe/:type/:id/fork | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/entities/universe/:type/:id/range-reference/attach | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/entities/universe/:type/:id/range-reference/preview | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/entities/universe/:type/:id/snapshot | geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| /api/social/events | geelooy/api/social/_awtsmoos.profile.js | unknown | $_POST, route-vars | — | — |
| /api/social/federation/import | geelooy/api/social/_awtsmoos.platform.js | unknown | $_GET, $_POST, route-vars | — | — |
| /api/social/feed | geelooy/api/social/_awtsmoos.profile.js | unknown | $_POST, route-vars | — | — |
| /api/social/feed/discover | geelooy/api/social/_awtsmoos.platform.js | unknown | $_GET, $_POST, route-vars | — | — |
| /api/social/feed/heichel/:heichel | geelooy/api/social/_awtsmoos.platform.js | unknown | $_GET, $_POST, route-vars | — | — |
| /api/social/feed/home | geelooy/api/social/_awtsmoos.platform.js | unknown | $_GET, $_POST, route-vars | — | — |
| /api/social/feed/trending | geelooy/api/social/_awtsmoos.platform.js | unknown | $_GET, $_POST, route-vars | — | — |
| /api/social/fetch/:url | geelooy/api/social/_awtsmoos.derech.js | unknown | identity | — | — |
| /api/social/followers/:type/:id | geelooy/api/social/_awtsmoos.profile.js | unknown | $_POST, route-vars | — | — |
| /api/social/follows/:alias | geelooy/api/social/_awtsmoos.profile.js | unknown | $_POST, route-vars | — | — |
| /api/social/graph/entity/resolve | geelooy/api/social/_awtsmoos.graph.js | GET, POST | $_GET, $_POST | — | — |
| /api/social/graph/references | geelooy/api/social/_awtsmoos.graph.js | GET, POST | $_GET, $_POST | — | — |
| /api/social/graph/reposts | geelooy/api/social/_awtsmoos.graph.js | GET, POST | $_GET, $_POST | — | — |
| /api/social/graph/transaction | geelooy/api/social/_awtsmoos.platform.js | unknown | $_GET, $_POST, route-vars | — | — |
| /api/social/heichelActions/generateHeichelId | geelooy/api/social/_awtsmoos.heichel.js | unknown | $_GET, $_POST, $_DELETE, route-vars | — | — |
| /api/social/heichelos/:heichel | geelooy/api/social/_awtsmoos.heichel.js | unknown | $_GET, $_POST, $_DELETE, route-vars | — | — |
| /api/social/heichelos/:heichel/addContentToSeries | geelooy/api/social/_awtsmoos.series.js | GET | $_GET, $_POST, $_DELETE, route-vars | — | — |
| /api/social/heichelos/:heichel/addContentToSeries | geelooy/api/social/old/_awtsmoos.series.js | GET, POST | $_GET, $_POST | — | — |
| /api/social/heichelos/:heichel/addNewSeries | geelooy/api/social/_awtsmoos.series.base.js | GET | $_GET, $_POST, $_DELETE | — | — |
| /api/social/heichelos/:heichel/addNewSeries | geelooy/api/social/old/_awtsmoos.series.js | GET, POST | $_GET, $_POST | — | — |
| /api/social/heichelos/:heichel/aliases/:alias/commentsActions/addCommentIndexToAlias/comment/:comment | geelooy/api/social/helper/comments/routes/indexing.js | unknown | — | — | — |
