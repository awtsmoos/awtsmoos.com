B"H
# Route Ownership

## One route, one global shell
A route may have local toolbars and local navigation, but it must not mount two global Geelooy shells. The shared shell boot is an application/workspace concern, not a universal requirement.

| Surface | Ownership |
| --- | --- |
| `/` | bespoke Home |
| `/os/` | OS desktop shell |
| `/apps/drive/` | shared app shell |
| `/social-hub/` | shared social/app shell |
| `/social-composer/` | focused shared composer shell |
| `/email/` | shared app shell |
| `/profile/` | shared app shell |
| `/notifications/` | shared app shell |
| `/apps/` | shared app shell |
| `/about/` | bespoke editorial |
| `/login/` | focused auth gate |
| Heichel directory | server navigation shell |
| Heichel reader | bespoke reader |
| Heichel create/editor | one route-appropriate shell + shared editor partials |

## Verification
`geelooy/style/test/remainingRouteOwnership.test.mjs` is the executable witness for the second-wave consumers. Existing app-quality and shell ownership tests cover the original flagship routes.

## Server templates
Never infer server ownership from filenames alone. Read the `_awtsmoos.*` template and its `getT(...)` composition. Cache/query suffixes are versioning details, not separate architectures.
