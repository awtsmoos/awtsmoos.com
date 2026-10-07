B"H
Boruch Hashem
Blessed is He

# PUBLISHING TO THE SOCIAL PACKED STORES — AGENT GUIDE

> **For agents:** this is the verified map of how content actually gets into the
> production social database and what the site actually reads. Traced and
> live-proven 2026-09-23. The binary structure needs NO changes — go through the
> production modules and the format is exact by construction.

## The One Rule

**The production page reads the packed `.awtsdb` stores, never loose JSON.**
Writing `.awtsmoosJSON` files does nothing visible. The importers in the
Chassidus publish workspace (`~/workspace/chassidus-rebuild/publish/`) bridge
that gap.

## The Three Stores You Care About

| Store file (under `<dbRoot>/socialPacked/`) | Holds | Read by |
|---|---|---|
| `social.richComments.v1.fs.awtsdb` | All rich comments (translations, summaries, discussion) | Comments API (`routes/post.js` → `richCommentReader`) |
| `social.heichel.ikar.posts.fs.awtsdb` | Post records (Hebrew source text) | Post API / pages — **OCR target** |
| `social.heichel.ikar.comments.corpus.<corpus>.alias.<alias>.v2.fs.awtsdb` | Per-corpus translation corpora | `/translations` endpoint (registry: `comments/imported/registry.js`, store: `comments/translations/corpusStore.js`) |

## Comment Path Layout (`comments/richCommentPaths.js`)

```
<sp>/heichelos/<heichelId>/posts/<postId>/commentTree/comments/<commentId>/data
<sp>/heichelos/<heichelId>/posts/<postId>/commentTree/roots
<sp>/heichelos/<heichelId>/posts/<postId>/commentTree/byVerse/<verseSection>
<sp>/heichelos/<heichelId>/posts/<postId>/commentTree/bySubsection/<subsectionId>
<sp>/heichelos/<heichelId>/posts/<postId>/commentTree/comments/<commentId>/children
<sp>/commentUrls/<commentId>
```

Helpers: `comments/richCommentAccess.js` (read/write), `comments/richDb/PackedStore.js`
(the store itself: `AwtsmoosDB` with virtual FS + `awtsmoosBinaryJSON` serialization),
`comments/aliasIndex/` (alias → comment index).

## Production Write Path (`comments/richCommentCreate.js`)

`createComment()` writes the comment body, the `commentUrls` pointer, the
`roots`/`byVerse`/`bySubsection` indexes, and the alias index — all through
`richCommentAccess` → `PackedStore` → `awtsmoosDB`.

**The writer lock:** the store opens with `processLockMode: 'exclusive'`.
A separate process cannot write while the web server holds it — imports need a
controlled server stop → import → start sequence. Reads are concurrent-safe.

## Reader (`comments/richCommentReader.js`, `richCompatibilityRead.js`)

`getTree()` pages the `roots`/`byVerse`/`bySubsection` indexes, expands replies
from `children` indexes, filters by alias. Public endpoint:

```
GET /api/social/heichelos/ikar/comments/inSeries/{series}/atPost/{post}/atAlias/{alias}?verseSection=N&map=true&includeRich=true
```

## OCR Protocol (post records)

Post records are the Hebrew source of truth. Any fix MUST:
1. Read the live packed post record first.
2. Require the repair's `before` bytes to match production EXACTLY.
3. Replace only that span; preserve every other byte.
4. Skip-and-log mismatches — never force.
5. Re-verify through the public post API and the visible page.
6. One canary post first; broad rollout only after it verifies.

## Alias Conventions (Chassidus)

- Translations: `likkutei_translation_en`, `sefer_hasichos_translation_en`,
  `sichos_kodesh_translation_en`, `meluket_translation_en`
- Summaries: `likkutei_summary_en`, `sefer_hasichos_summary_en`,
  `sichos_kodesh_summary_en`, `meluket_summary_en`
- Summaries are separate comments under separate aliases — never mixed with
  phrase translations.

## Verification Law

Nothing is "published" or "live" until the public endpoint returns the exact
expected records. Importer output and filesystem writes are not evidence.
