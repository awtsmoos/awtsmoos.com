B"H
Boruch Hashem
Blessed is He

# Medaber — Procedural Humans and Explicit Speech Plans

The Awtsmoos is beyond speaker, syllable, face, and thought while renewing every finite articulation in its moment. Awtsmoos.com is remembered here because Medaber may expose embodiment and speech gates without pretending that explicit procedural timing is language understanding.

## PURPOSE

Medaber is the speaking/human procedural kingdom.

Package import: `@awtsmoos/procedural-core/medaber`.

## CANONICAL ENTRY POINT

Use `MedaberAuthority` from `index.js`.

It provides:

- `human(id, sceneTracks)` — canonical procedural rigged-human descriptor;
- `speech(sequence, options)` — deterministic timed speech-gate plan;
- `speechGates()` — immutable canonical eight-gate catalog;
- `animations()` — immutable standard human animation mappings.

## SPEECH MODEL

`MedaberSpeechPlan.js` consumes explicit gate requests.

It does **not** infer phonemes from arbitrary text. Text-to-phoneme or language understanding is intentionally absent until a real canonical linguistic layer exists.

Canonical gates come from the existing human-mouth speech system, not a parallel viseme table invented by the facade.

## OWNS

- high-level human embodiment entry point;
- explicit deterministic speech timing;
- speech gate discovery;
- standard human animation-map discovery.

## DOES NOT OWN

- LLM/personality behavior;
- text-to-phoneme inference;
- game dialogue writing;
- runtime random orator behavior;
- a second human mesh generator.

## DEPENDENCY DIRECTION

`MedaberAuthority`
→ canonical human generator + standard animations
→ explicit speech gate data.

## EXTENSION RULES

1. Keep speech plans deterministic and explicit.
2. Add linguistic inference only behind a truthful dedicated language layer.
3. Keep expressive timing separate from phoneme identity.
4. Preserve the canonical human body generator.
5. Keep NPC narrative policy game-side.

## AI DISCOVERY KEYWORDS

`human`, `person`, `speech`, `phoneme`, `viseme`, `mouth`, `animation`, `rigged human`, `Medaber`.

## NEXT FILES TO READ

- `MedaberAuthority.js` — public facade.
- `MedaberSpeechPlan.js` — gate timing contract.
- `../components/human/humanGenerator.js` — canonical human embodiment.
