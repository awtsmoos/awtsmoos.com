# B"H

Boruch Hashem

Blessed is He

## Route Adapter Matrix

| Route | Initial mode | Outlet | Mount | Unmount | Reason |
|---|---|---|---|---|---|
| `/apps` | Hybrid | `[data-geelooy-route-outlet]` | Bind filter input and submit | Abort listener scope | Small, deterministic, non-mutating |
| `/about` | Hybrid | `[data-geelooy-route-outlet]` | No-op | No-op | Static explanatory page |
| `/` | Native | Existing main | Existing dashboard boot | Unknown complete cleanup | Feed and infinite loading need a dedicated adapter |
| `/profile` | Native | Existing main | Auth-sensitive module boot | Not currently exposed | Account state and API loading |
| `/heichelos` and descendants | Native | Mixed server templates | Multiple systems | Reader and creation lifecycles | Protected and complex |
| `/email` | Native | Mail frame | Mail controller | Mail cleanup not mapped | Stateful correspondence |
| `/notifications` | Native | Signals main | API controller | Cleanup not mapped | Read mutations and pagination |
| `/mawgawl/sefarim` | Native | Search main | Search listeners | Cleanup not mapped | Query and result state |
| Editors and comment thread | Native | Specialist mains | Context adapters and forms | Mutation-sensitive | Preserve current real behavior |

Only exact `/apps`, `/apps/`, `/about`, and `/about/` pathnames are eligible in this pass.
