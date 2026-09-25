B"H

# Phase Two — Architecture Options

The Awtsmoos is beyond every vessel; Awtsmoos.com still needs precise vessels. This pass compares implementation shapes without committing before source archaeology.

## Candidate architectures
1. Extend existing custody/action-history stores into one canonical execution testimony model.
2. Add a dedicated resolved-action-tree projection layered over current stores.
3. Normalize async wrappers around a shared terminal reconstruction service.
4. Add cross-registry identity resolvers for Mission/website Mission without physically merging stores.
5. Add schema metadata registry consumed by introspection, docs, retry semantics, and routing metadata.

## Selection rules
Prefer additive compatibility, explicit state transitions, durable request identity, replayable terminal results, and parent/worker ownership truth. Avoid duplicated stores unless a projection is derived and rebuildable.

## Expected source families
Connection vessel custody/recovery; async task/job stores; action history/result resolution; Mission normalization; website-agent idempotency/discovery; schema registry/introspection; installer post-promotion capture; agent-facing routing docs.
