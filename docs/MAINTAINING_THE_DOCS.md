B"H
Boruch Hashem
Blessed is He

# Maintaining the Documentation

Human meaning, route/project/system evidence, AI discovery, and browser publication should move together.

## Authoritative generation

```sh
node scripts/docs/generate-docs.js
```

This regenerates source evidence, route tutorials, project tutorials, system tutorials, AI packets, and public data. Generated artifacts are not hand-edited.

## Focused tests

```sh
node scripts/docs/project-evidence-test.js
node scripts/docs/system-model-test.js
node scripts/docs/tutorial-engine-test.js
node scripts/docs/search-engine-test.mjs
node scripts/docs/validate-docs.js
```

## Manual versus generated

Manuals explain purpose, trust, migration, workflow and caveats. Generate volatile routes/projects/env names/app registrations/events/callers/tests/counts. Never freeze changing counts into prose when generated evidence can answer them.

## System workflow

For persistence/security/realtime changes:

1. open the relevant Systems Explorer packet;
2. read its human manuals and change-risk note;
3. inspect project/source anchors;
4. use generated env/application/event evidence only as navigation clues;
5. change implementation/tests;
6. update human semantics if contracts changed;
7. regenerate system/API/project layers as needed;
8. republish and validate bounded transport.

Environment values and secret files are outside documentation discovery scope.
