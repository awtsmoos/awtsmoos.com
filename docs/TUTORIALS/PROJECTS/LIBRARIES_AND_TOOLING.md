B"H
Boruch Hashem
Blessed is He

# Libraries and Tooling

Library/tooling/test boundaries exist to be consumed, executed during development, or support other systems rather than present one end-user surface.

## Investigate these boundaries

1. Use incoming dependency evidence to find consumers.
2. Use outgoing/external dependencies to understand assumptions.
3. Inspect exports and representative symbol samples.
4. Distinguish production libraries from scripts/tools/tests by exact project type.
5. Trace package scripts and test ownership before changing shared behavior.

## Caveats

A highly connected library can have no public HTML entry. Export counts are lexical discovery evidence. Tooling commands can mutate files/processes and should be reviewed for safety separately from ordinary library calls.
