B"H
Boruch Hashem
Blessed is He

# Troubleshooting APIs

## Start with classification

Is the failure routing, syntax health, authentication, authorization, input shape, persistence/provider behavior, response handling, or transport size?

## Routing failures

Check generated route pattern, owning derech, ancestor discovery, dynamic parameters, and exact slash/path form.

## Syntax failures

Use `docs/GENERATED/DERECH_HEALTH.md`. The Text API currently has the known syntax failure and should not be treated as live merely because route text can be extracted.

## 401 / 403

Separate missing identity from insufficient resource authority. Check session/API-key/OAuth/origin/scope first, then owner/editor/member/moderation checks.

## 404

Distinguish route mismatch from missing resource/path/data. Trace the route before changing persistence.

## 413 / transport size

The documentation frontend itself encountered static JSON 413 limits; its publication generator solves this through bounded shards. For another subsystem, measure the actual server/provider limit before changing global configuration.

## Bad client parsing

Inspect response status/headers/body before assuming JSON.

## Stale documentation

Run regeneration and validation. Never hand-edit generated output to hide drift.
