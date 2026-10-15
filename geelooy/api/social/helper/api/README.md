# B"H — API Request/Response Primitives (geelooy/api/social/helper/api/)

Low-level request/response policy wrappers used by social routes, named in the sephirah style used across this codebase.

## Files
- `BinahRequestBody.js`, `BinahRequestQuery.js` — decode and validate incoming request bodies and query values.
- `BinahRequestValueDecoder.js` — shared value-decoding used by the Binah request wrappers.
- `GevurahRouteMethodPolicy.js` — enforces allowed HTTP methods per route.
- `HodApiMetadata.js` — attaches API metadata (caller, version, timing) to responses.
- `MalchusResponseGarments.js` — shapes final response envelopes ("garments") so every route returns a consistent success/error structure.
- `YesodSocialIdentityResolver.js` — resolves the acting social identity (user/alias) behind a request.

## What it does
Gives route handlers one place to: parse request input safely, reject wrong methods, know who is acting, and emit uniform responses with metadata attached.
