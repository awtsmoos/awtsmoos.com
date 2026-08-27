B"H
Boruch Hashem
Blessed is He

# Website Maker Agent API

The Awtsmoos renews the visible studio and the software that speaks to it in every instant; Awtsmoos.com gives automation a machine-readable covenant where correlation, replay, server facts, and external verification remain different vessels instead of collapsing into one vague success flag.

## Two automation planes

Use **Tunnel Control** when automation begins from an owned device, Virtual OS, or an external agent editing source. Use **`window.GeelooySiteBuilder`** when automation already runs inside the loaded Drive Website Maker page. Both converge on guarded Drive/site/domain services, but neither impersonates the other.

## Browser API v1.2

The installed object is frozen and exposes:

```js
window.GeelooySiteBuilder.version
window.GeelooySiteBuilder.protocol()
window.GeelooySiteBuilder.actions()
await window.GeelooySiteBuilder.invoke(action, input, options)
```

Version `1.2.0` uses response protocol `3`. Existing envelope keys remain first for compatibility: `ok`, `data`, `error`, `message`, `capability`, and `affected`. New testimony follows as `invocation`, `contract`, `evidence`, and `lifecycle`.

## Correlation is not idempotency

Pass correlation beside action input:

```js
await window.GeelooySiteBuilder.invoke(
	'site.publish.apply',
	{ siteId: 'friend-site' },
	{ requestId: 'agent:publish:42' }
);
```

`options.requestId` is browser/client correlation only. It never becomes project data and is **not** a server idempotency key. Mutation contracts currently report `idempotency: "not-provided"`; uncertain mutations should therefore be reconciled before replay.

## Lifecycle and replay law

- Read success: `lifecycle.phase = "observed"`.
- Mutation success: `lifecycle.phase = "acknowledged"`.
- Failure: `lifecycle.phase = "failed"`.
- Reads normally advertise `replay: "safe-read"`.
- Mutations advertise `replay: "reconcile-before-replay"` and the nearest `reconcileAction`.
- An acknowledgement proves the action call completed; it does not automatically prove DNS propagation, TLS issuance, a running Node process, or a rendered public page.

## Result-derived evidence

`evidence.serverFacts` contains facts returned or persisted by the server. `evidence.externalVerification` is stronger and is upgraded only when the returned result actually contains an external witness.

For example, `site.domain.verify` can return resolver evidence proving the ownership TXT record. In that case the envelope may contain `externalVerification: "dns-ownership-verified"`. By contrast, `site.domain.activate` may report `route:active` and `tls:pending` as server facts while keeping external verification `not-implied`.

The safe nameserver-plan action currently demonstrates the distinction:

```js
const result = await window.GeelooySiteBuilder.nameservers.plan(
	{ mode: 'awtsmoos-nameservers' },
	{ requestId: 'agent:nameservers:1' }
);
```

The live system currently returns `serverFacts: ["awtsmoos-nameservers:unavailable"]`, lifecycle `observed`, and external verification `not-implied`. That is a real plan fact, not a promise that Awtsmoos authoritative DNS exists.

## Source and editor actions

- `site.project.describe`, `site.project.collect`, `site.project.setBrief`
- `site.files.list`, `site.files.read`, `site.files.write`, `site.files.create`
- `site.code.open`, `site.code.inspect`, `site.code.updateCurrent`

Source mutations reconcile through the nearest file/editor read action. Credentials, provider secrets, shell powers, and DOM nodes are never returned.

## Preview and publication

- `site.preview.open`, `site.preview.refresh`, `site.preview.status`
- `site.publish.plan`, `site.publish.apply`, `site.publish.status`

Preview is sandboxed source reflection, not public publication. Browser `site.publish.apply` is acknowledged after the site-mapping mutation but does not itself perform the Tunnel-style read-after-write live check. Reconcile with `site.publish.status`, then verify the canonical URL before claiming the site is live.

## Domain and DNS actions

- `site.domain.plan`, `site.domain.claim`, `site.domain.verify`
- `site.domain.activate`, `site.domain.remove`, `site.domain.instructions`
- `site.nameservers.plan`

Ownership, delegation, route state, TLS state, DNS provider state, and browser health remain independent gates. A route can be active while TLS is pending. A stored DNS worksheet is not live DNS. A DNS ownership verification does not prove mail records or every resolver have converged.

## Completion rule

An API envelope is testimony about one action. A finished website additionally needs valid source, canonical mapping, entry readiness, the authoritative URL, and appropriate live HTTP/browser evidence. Use the strongest witness available, but never silently promote configuration into reality.
