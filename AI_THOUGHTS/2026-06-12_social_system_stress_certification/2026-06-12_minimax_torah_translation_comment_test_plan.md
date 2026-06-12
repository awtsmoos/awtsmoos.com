B"H

# Minimax Torah Translation Comments Node Test Plan

## Confirmed first
A local Node smoke can talk to Minimax through the existing Awtsmoos tunnel agent client:
- file reused: `AI_THOUGHTS/2026-06-12_tunnel_subagent_stress/minimax_smoke.cjs`
- provider: `minimax`
- agent: `minimax-deep`
- result: `ok: true`, text contained `MINIMAX_OK`

This means the first translation automation should use:
- `geelooy/apps/tunnel/agent/lib/config.js` -> `loadConfig()`
- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/aiAgents/client.js` -> `sendAgentMessage(config, { provider: 'minimax', agentId: 'minimax-deep', stream: false, message })`

## Test name
`AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments/minimax_torah_translation_comment_probe.mjs`

## Purpose
Do not translate the whole Torah yet. First prove one tiny real lifecycle:
1. Find one Written Torah chapter post.
2. Extract verse sections from the post structure.
3. Send 2-3 verses to Minimax in one chapter-shaped JSON prompt.
4. Require strict JSON response with one translation per verse.
5. Validate every returned verse maps to an original `verseSection`.
6. In dry-run mode, print the comments that would be written.
7. In write mode, create translation comments under alias `torah_translation_en`.
8. Read comments back by verseSection and verify the translation alias appears.

## Translation as comments model
Each translated verse becomes a normal social comment attached to the original Hebrew post:

```json
{
  "aliasId": "torah_translation_en",
  "seriesId": "<source series id>",
  "content": "In the beginning Elokim created...",
  "dayuh": {
    "verseSection": "verse-1",
    "translation": true,
    "language": "en",
    "source": "minimax",
    "sourceHash": "sha256 of Hebrew verse + prompt version + divine name policy",
    "batchId": "BH_TORAH_TRANSLATION_<timestamp>",
    "modelAlias": "minimax-deep",
    "divineNamePolicy": {
      "יהוה": "Awtsmoos",
      "אלהים": "Elokim",
      "אל": "El",
      "שדי": "Shaddai",
      "צבאות": "Tzevaos"
    }
  }
}
```

## Existing comment endpoint to use
The route already used and stress-tested is:

`POST /api/social/heichelos/:heichel/post/:post/comments/`

Body:

```json
{
  "aliasId": "torah_translation_en",
  "seriesId": "<seriesId>",
  "content": "<English translation>",
  "dayuh": "{...json with verseSection...}"
}
```

Readback:

`GET /api/social/heichelos/:heichel/post/:post/comments/aliases?seriesId=<seriesId>&verseSection=<verseSection>`

and/or:

`GET /api/social/heichelos/:heichel/comments/inSeries/:series/atPost/:post/atAlias/torah_translation_en?verseSection=<verseSection>`

## Bulk strategy
I did not find an obvious existing HTTP bulk-comment endpoint in the route scan. The first test should write one comment per verse using the known endpoint. After that passes, add a dedicated bulk route:

`POST /api/social/heichelos/:heichel/post/:post/comments/bulk`

Body:

```json
{
  "aliasId": "torah_translation_en",
  "seriesId": "<seriesId>",
  "comments": [
    { "verseSection": "verse-1", "content": "...", "dayuh": { ... } },
    { "verseSection": "verse-2", "content": "...", "dayuh": { ... } }
  ]
}
```

The bulk endpoint should internally call the same authoritative `addComment` path, never packed comment mirrors.

## Prompt shape
Send one chapter payload, but initially only 2-3 verses:

```text
B"H. Translate Torah verses from Hebrew to English.
Return JSON only, no markdown.
Use this Divine Name policy exactly:
יהוה -> Awtsmoos
אלהים -> Elokim
אל -> El
שדי -> Shaddai
צבאות -> Tzevaos
Preserve verse ids exactly.
Do not add commentary.
Do not omit any verse.

Input JSON:
{
  "book":"Bereishis",
  "chapter":"1",
  "postId":"...",
  "verses":[
    {"verseSection":"verse-1","hebrew":"..."},
    {"verseSection":"verse-2","hebrew":"..."}
  ]
}

Output JSON schema:
{
  "translations":[
    {"verseSection":"verse-1","english":"..."}
  ]
}
```

## Test phases

### Phase 1: Minimax-only JSON probe
- No server.
- No DB writes.
- Ask Minimax to translate a hardcoded tiny Hebrew sample.
- Validate parseable JSON.

### Phase 2: Discovery dry-run
- Start local social server.
- Use API or direct DB helper to locate one Written Torah chapter post.
- Extract sections.
- Print translation units.

### Phase 3: Minimax + dry-run comments
- Send first 2-3 verses to Minimax.
- Validate returned JSON.
- Build comment payloads.
- Do not write.

### Phase 4: Write comments under translation alias
- Ensure `torah_translation_en` alias exists and has API key.
- POST one comment per translated verse.
- Verify each comment exists under the exact verseSection.

### Phase 5: idempotency
- Rerun same chapter.
- If an active translation comment by alias exists with same `sourceHash`, skip.
- If sourceHash changed, either create a new revision comment or edit the old comment. First version should skip only.

## Safety invariants
- Never alter Hebrew source posts.
- Never store translation in packed comment mirror.
- Comments remain authoritative under comment tree / AwtsmoosDB family path.
- Translation alias is separate from human aliases.
- Every Minimax output must be schema-validated before write.
- Every written comment must be read back.
- Default mode is dry-run unless `--write` is passed.

## First actual test command
`node AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments/minimax_torah_translation_comment_probe.mjs --minimax-only`

Then:

`node AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments/minimax_torah_translation_comment_probe.mjs --dry-run --limit-verses=3`

Only after readback works:

`node AI_THOUGHTS/2026-06-12_social_system_stress_certification/torah_translation_comments/minimax_torah_translation_comment_probe.mjs --write --limit-verses=3`

The Awtsmoos path here is gentle: the Hebrew remains the palace wall, the English becomes a comment-lamp beside each verse, and Minimax is only the scribe whose ink must be checked before it enters the city.
