B"H
Boruch Hashem
Blessed is He

# Generated API Source Contract Evidence 1–65

Lexical source evidence; methods marked unknown are not assumed GET.

| Source | Methods | Vessels | Statuses | Headers |
| --- | --- | --- | --- | --- |
| geelooy/api/_awtsmoos.derech.js | unknown | route-vars | — | Access-Control-Allow-Origin |
| geelooy/api/admin/_awtsmoos.derech.js | unknown | $_POST, identity | — | — |
| geelooy/api/compiler/core/body.js | unknown | $_POST | — | — |
| geelooy/api/contact/_awtsmoos.derech.js | POST | $_POST, db | — | x-forwarded-for |
| geelooy/api/fetch/_awtsmoos.derech.js | unknown | $_POST, headers, cookies, identity | 400, 401, 403, 429 | — |
| geelooy/api/gpt/core/body.js | unknown | $_GET, $_POST, cookies | — | — |
| geelooy/api/gpt/core/handlers.js | unknown | $_POST | — | — |
| geelooy/api/oauth/_awtsmoos.derech.js | unknown | route-vars | 404 | Access-Control-Allow-Headers, Access-Control-Allow-Methods, Access-Control-Allow-Origin, Cache-Control |
| geelooy/api/oauth/core/currentUser.js | unknown | cookies, identity | — | — |
| geelooy/api/oauth/core/requestBody.js | unknown | $_GET, $_POST | — | — |
| geelooy/api/oauth/routes/logout.js | unknown | headers, cookies | — | Set-Cookie |
| geelooy/api/oauth/routes/start.js | unknown | identity | — | — |
| geelooy/api/oauth/tools/requestData.js | unknown | $_GET, $_POST | — | — |
| geelooy/api/oauth/tools/respond.js | unknown | — | 200, 302 | — |
| geelooy/api/ohr-hagnuz/_awtsmoos.derech.js | unknown | — | — | Cache-Control, Vary |
| geelooy/api/ohr-hagnuz/auth/GameTicketClaims.js | unknown | headers | — | — |
| geelooy/api/ohr-hagnuz/auth/GameTicketIssuer.js | unknown | identity | — | — |
| geelooy/api/ohr-hagnuz/auth/GameTicketStore.js | unknown | identity | — | — |
| geelooy/api/public/_awtsmoos.derech.js | unknown | $_GET, $_POST, route-vars, identity, db | — | — |
| geelooy/api/runtime/core/body.js | unknown | $_POST | — | — |
| geelooy/api/sefarim/_awtsmoos.derech.js | unknown | route-vars, db | — | — |
| geelooy/api/social/_awtsmoos.activityLedger.js | GET, POST | — | — | — |
| geelooy/api/social/_awtsmoos.alias.js | GET, POST, PUT, DELETE | route-vars, identity | — | — |
| geelooy/api/social/_awtsmoos.assets.js | unknown | $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.civilization.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.comments.js | unknown | db | — | — |
| geelooy/api/social/_awtsmoos.communications.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.community.js | unknown | $_GET, $_POST, $_DELETE | — | — |
| geelooy/api/social/_awtsmoos.content.js | GET, POST | $_POST | — | — |
| geelooy/api/social/_awtsmoos.counter.js | GET, POST, DELETE | — | — | — |
| geelooy/api/social/_awtsmoos.derech.js | unknown | identity | — | — |
| geelooy/api/social/_awtsmoos.editor.js | unknown | route-vars | — | — |
| geelooy/api/social/_awtsmoos.entities.js | GET, POST | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.fileSystem.js | unknown | $_POST, $_DELETE, route-vars | — | — |
| geelooy/api/social/_awtsmoos.governance.js | GET, POST, PUT | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.graph.js | GET, POST | $_GET, $_POST | — | — |
| geelooy/api/social/_awtsmoos.heichel.js | unknown | $_GET, $_POST, $_DELETE, route-vars | — | — |
| geelooy/api/social/_awtsmoos.identityBootstrap.js | GET, POST | $_GET | — | — |
| geelooy/api/social/_awtsmoos.keys.js | GET, POST | route-vars | — | — |
| geelooy/api/social/_awtsmoos.living.js | GET | $_GET, route-vars | — | — |
| geelooy/api/social/_awtsmoos.mail.js | unknown | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.migrations.js | unknown | $_GET, $_POST | — | — |
| geelooy/api/social/_awtsmoos.nodeOs.js | unknown | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.notifications.js | GET, POST, DELETE | $_GET, $_POST, $_DELETE | — | — |
| geelooy/api/social/_awtsmoos.objects.js | unknown | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.packed.js | GET, POST | $_GET, $_POST | — | — |
| geelooy/api/social/_awtsmoos.platform.js | unknown | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.posts.base.js | GET, PUT | $_GET, $_POST, $_DELETE, route-vars | — | — |
| geelooy/api/social/_awtsmoos.posts.js | GET, POST | — | — | — |
| geelooy/api/social/_awtsmoos.profile.js | unknown | $_POST, route-vars | — | — |
| geelooy/api/social/_awtsmoos.radiance.js | unknown | $_POST | — | — |
| geelooy/api/social/_awtsmoos.reviewCenter.js | GET | — | — | — |
| geelooy/api/social/_awtsmoos.richSocial.js | GET | — | — | — |
| geelooy/api/social/_awtsmoos.series.base.js | GET | $_GET, $_POST, $_DELETE | — | — |
| geelooy/api/social/_awtsmoos.series.js | GET | $_GET, $_POST, $_DELETE, route-vars | — | — |
| geelooy/api/social/_awtsmoos.thoughts.js | GET, POST, PUT, DELETE | $_GET, $_POST, route-vars | — | — |
| geelooy/api/social/helper/alias.js | GET, POST | $_POST, cookies, identity, db | — | — |
| geelooy/api/social/helper/apiKeys.js | unknown | $_GET, $_POST, $_DELETE, cookies, db | — | — |
| geelooy/api/social/helper/assets/assetBindings.js | unknown | db | — | — |
| geelooy/api/social/helper/assets/assetManifest.js | unknown | db | — | — |
| geelooy/api/social/helper/assets/assetRateLimit.js | unknown | — | — | x-forwarded-for |
| geelooy/api/social/helper/assets/assetUpload.js | unknown | $_GET, $_POST, db | — | — |
| geelooy/api/social/helper/assets/multipart.js | unknown | $_POST | — | — |
| geelooy/api/social/helper/comments/commentCreation.js | unknown | $_POST, identity, db | — | — |
| geelooy/api/social/helper/comments/commentDeletion.js | unknown | $_POST, $_DELETE, db | — | — |
