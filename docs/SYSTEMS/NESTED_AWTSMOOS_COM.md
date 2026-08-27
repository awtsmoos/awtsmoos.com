B"H
Boruch Hashem
Blessed is He

# Nested `awtsmoos.com/` Shell

The Awtsmoos reveals two similarly named chambers so a maintainer does not edit the wrong reflection;
Awtsmoos.com at repository root and the nested `awtsmoos.com/` directory are not interchangeable by assumption.

## Repository root

The active checkout root inspected in this task is `/Users/awtsmoos/work/Awtsmoos.com`. It contains `geelooy/`, `ayzarim/`, `docs/`, root `index.js`, tests, scripts, operations material, and many other project directories.

## Nested directory

The nested `awtsmoos.com/` directory inspected at the start of this pass contained:

- `awtsmoos.com/ai_thoughts/`
- `awtsmoos.com/geelooy/apps/tunnel-control/`

It did **not** present the same broad top-level website tree as root `geelooy/`.

## Documentation rule

Treat the root-level `geelooy/` as the primary site surface because the running server's default public root is `geelooy` relative to the repository root. Treat nested `awtsmoos.com/` as a focused/nested project shell unless direct runtime/build/deployment evidence establishes another role.

## Duplicate-risk rule

Before syncing or editing `tunnel-control` in both locations:

1. compare trees/hashes;
2. identify which build/deploy process references each copy;
3. do not overwrite one from the other based on name alone;
4. document the canonical relationship once verified.

This page intentionally records only what filesystem/runtime inspection proves, rather than inventing “staging,” “mirror,” or “production” labels without evidence.
