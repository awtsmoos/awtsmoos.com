# B"H

# Universal Definition Graph

> The Awtsmoos renews identity, property, relationship, material, behavior, and law in one light; Awtsmoos.com stores them as portable semantic truth before any renderer comes in sight.

## Canonical base

Universal definitions remain `awtsmoos.procedural-language/1`. No replacement schema was introduced. The existing canonical definition is extended additively with optional first-class sections.

Core identity and authoring sections include:

- `id`, `kind`, `seed`, `revision`;
- optional `type`;
- optional `properties` for semantic quantities and structured authored values;
- `traits`, `relationships`, `behaviors`;
- optional `materials` for semantic material intent;
- `constraints`, `resources`, `actions`;
- `compile`, `editor`, `metadata`, `extensions`, `provenance`, `payload`.

`type`, `properties`, and `materials` appear only when authored. This avoids changing the shape and identity hash of legacy definitions that never used those sections.

## Authoring shorthand

The high-level `createAwtsmoos()` boundary accepts simple semantic vocabulary while the canonical language remains strict.

```js
const definition=awtsmoos.define({
	id:'market-arch',
	type:'entity',
	kind:'architecture.arch',
	traits:['solid','walkable','loadBearing'],
	properties:{width:{value:4.2,unit:'m'}},
	relationships:[{type:'supportedBy',to:'foundation'}],
	constraints:[{type:'minClearance',value:2.1,unit:'m'}],
	materials:[{role:'stone',layers:[{kind:'base',material:'limestone'}]}],
	behaviors:['opens'],
	compile:{channels:['visual','collision'],quality:'balanced'}
});
```

String traits become stable `{id, kind}` descriptors. String relationships and behaviors are expanded at the same ergonomic boundary. Structured canonical descriptors remain untouched.

## Artifact intent

`definition.compile` can carry authored generation policy:

- `channels` / `required`;
- `optional` channels;
- `quality`;
- `budget`;
- `preferredAdapters`;
- `lod`;
- metadata.

Call-time request fields override authored compile policy for that invocation. This lets reusable definitions carry normal output intent while callers can still request a smaller channel subset or another quality tier.

## Identity and determinism

Canonical semantic identity is computed from the full canonical definition. First-class property/material changes therefore change the content hash. Factory seed inheritance is deterministic, while an explicit authored seed always wins.

## Relationship and constraint philosophy

Relationships are semantic graph edges, not renderer-parenting commands. Constraints are authored laws, not procedural code. Compiler and solver registries decide what can currently be interpreted; unknown or unavailable behavior remains explicit evidence instead of being guessed.
