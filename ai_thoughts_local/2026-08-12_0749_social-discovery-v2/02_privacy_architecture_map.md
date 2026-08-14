B"H

# Social Discovery II — Privacy Architecture Map

Boruch Hashem — Blessed is He.

## Proven storage truth

The public alias tree lives beneath the social alias root. Raw alias `info` records can contain the owning `user`, so raw recursive reads are forbidden for public discovery.

DosDB's current legacy-compatible `get()` implementation gives us a privacy-safe primitive: when reading an object non-recursively with no `propertyMap`, it returns **child keys only**, with page/pageSize applied before return. Therefore a bounded read of the alias root can reveal alias IDs without returning nested owner metadata.

Existing `getAlias(aliasId, $i)` reads one alias's public `info` and deletes `user` before returning it. A new public-universe helper should still normalize/sanitize output explicitly so privacy does not depend on a caller remembering this detail.

## Bounded discovery model

- Explicit `query.aliases` always wins and preserves current scoped semantics.
- With no explicit aliases, `/feed` and `/trending` obtain one bounded page of public alias IDs.
- Default alias page size should remain modest; hard max 50 for profile aggregation.
- Global people enumeration may page independently but must enforce a hard maximum.
- Global search should enumerate cheap alias IDs/public metadata first, rank them, then call expensive `aggregateProfile()` only for the top matching aliases.
- No request may aggregate hundreds of full profiles.
- Search with an empty query should return lightweight alias results only.
- Search with text may return alias plus bounded profile content results from top-ranked aliases.

## Privacy contract

Never return `user`, account identifiers, email, cookie/token material, `/users/...` paths, or raw database nodes. Cache only sanitized public alias records. Errors must not echo raw DB objects.

## Client architecture

- Preserve personalized feed behavior for logged-in aliases.
- Logged-out feed/trending become globally useful automatically once backend omitted-alias behavior is global.
- Add a `people` route and dynamically mounted People chamber before navigation initializes.
- `PeoplePanel` owns query sequencing and API coordination.
- `PeopleView` owns shell/status/search controls.
- `PeopleResultRenderer` owns safe typed results and destinations.
- Alias results open Profile; post results only link when a canonical destination can be derived; other types remain explicit context if no safe destination exists.

## Risks and mitigations

- **Owner leak:** child-key enumeration + explicit sanitizer + leak tests.
- **Expensive search:** cheap alias ranking before top-profile expansion.
- **Huge alias base:** page/pageSize/maxScan caps.
- **Stale UI:** request sequence token.
- **Route bloat:** separate People modules; keep RouteModel/State under 120.
- **Existing dirty work:** current working tree is source of truth; whole-file reread before rewrite.
- **Production mismatch:** canonical Git remains authoritative; no local-live claim.

## Provisional source families

Backend: new `publicAliasUniverse.js`, new focused search/ranking helper if needed, whole-file rewrite/split of `discovery.js`, focused backend tests.

Client: RouteModel/State, SocialHubApi only if response helpers need adjustment, new People modules, AppAssembly/HubApp, PublicDiscovery only if scope messaging changes, focused styles/tests.

The next planning pass freezes exact behavioral and verification gates before the final source audit chooses the precise files.
