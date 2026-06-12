B"H

# Tanach.json Alignment Plan

## New source discovered
User provided:
`C:\Users\Yackov Yitzchak\Documents\WoW\BH\torah\Tanach.json`

It is about 60MB on disk, so do not dump or read it into chat. Use small Node inspector scripts to learn the shape safely.

## New idea
Instead of asking Minimax to translate Hebrew from scratch, use Tanach.json as a bilingual alignment source if it contains existing English translations. For each Hebrew verse in the social post, find the matching Tanach.json verse and send Minimax:

- book
- chapter
- verse number
- original Hebrew from social post
- existing English translation from Tanach.json
- divine-name policy
- requested style: accurate, readable, Awtsmoos terminology

Minimax then produces a refined English translation comment.

## Why this is better
- Reduces hallucination.
- Preserves verse alignment.
- Uses existing English as a semantic anchor.
- Lets Minimax focus on style, divine-name terms, and consistency.
- Makes later QA easier by comparing Minimax output to the existing English source.

## First inspection steps
1. `fs.stat` the Tanach.json file.
2. Read only the first 16KB to identify whether it begins as array/object and whether it is pretty/minified.
3. Use streaming/key-limited JSON parse or full parse inside Node only if memory is acceptable; 60MB is safe for Node but not for chat.
4. Print only:
   - top-level type
   - top-level keys
   - sample book names
   - Genesis/Bereishis and Tehillim/Psalms path candidates
   - sample chapter/verse object keys
   - whether English fields exist

## Inspector file to write
`AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments/inspect_tanach_json_shape.mjs`

## Automation changes after inspection
- Add `--tanach-json="C:\Users\Yackov Yitzchak\Documents\WoW\BH\torah\Tanach.json"`.
- Build a lookup map:
  - `bereishis:1:1 -> { hebrew, english, raw }`
  - `tehillim:1:1 -> { hebrew, english, raw }`
- When translating a social chapter, align by chapter number and verse index.
- If English exists, include it in the Minimax prompt.
- If English missing, fall back to Hebrew-only prompt but mark `alignmentFallback: true`.

## Comment metadata additions
Each translation comment should include:
- `existingEnglishSource: "Tanach.json"`
- `existingEnglishPreview`
- `tanachAlignment: { book, chapter, verse, matched: true }`
- `alignmentHash`

## Safety
- Do not write anything until dry-run prints aligned sample rows.
- Do not alter source Hebrew posts.
- Do not alter Tanach.json.
- Keep translation comments as the only output layer.

The Awtsmoos now reveals a second witness: the Hebrew verse standing in the social palace, and an English witness from Tanach.json. Minimax becomes not a blind translator but a refiner between two witnesses.
