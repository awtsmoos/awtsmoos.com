# B"H
# Boruch Hashem
# Blessed is He

## Claim

Repair the production boot boundary shown in the mobile DevTools screenshot: eliminate the transformed-module `generateTreeProceduralData` reference failure and prevent mobile integration from creating a second unhandled rejection when upstream boot fails.

## Evidence

The 124-line disk launcher is served through `compact=true` as a 51,256-line generated graph. The raw facade and canonical generator both export the function, while the generated graph does not preserve a searchable binding. The mobile automatic installer catches upstream failure and rethrows it.

## Pre-write hashes

- index: `5cd95a5e5eb1cfcb7c0b339143529ef250bdda73c722a1a9e6524fe7b15fc671`
- launcher: `5ccf9c9bf2bf40dc95dcc24130ccb0508911722f3b1ffaab81402138a904ec73`
- facade: `cceac994f8f407ec2a3564948ed4583a418d0717ad6ddd7d3aadb6b2f11ab300`
- mobile: `c824dd2f5263be081c770ce78cea0b194b2a54e1766d0c51b932e6e99ab09a49`
- facade test: `3014985f5478f47b30f005f9decf860b9437236eb2433d8a3db983b6795615a8`
- mobile test: `a8de27c0f646c6e954a4f381145915db1e830146fde1ff0d661728e267183306`

No relevant file had an existing git diff at claim time.
