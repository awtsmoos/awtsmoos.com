B"H

# Meluket DeepSeek Translation Job Scaffold

This folder is intentionally inert unless explicitly run. It is designed for whole-post translation batches to save tokens while preserving exact alignment.

## Compact alignment model

Do **not** repeat `seriesId`, `postId`, and full source hashes on every subsection. Instead:

- The prompt sends one post at a time.
- The root XML has `seriesId` and `postId` once.
- Each subsection uses only compact coordinates:
  - `v` = verseSection index
  - `s` = subSection index
- The validator compares counts and coordinates against the original source item list.
- Optional short hashes can be used only as a safety check, for example first 8 hex chars, but they are not needed for every line if order + coordinates are strict.

## Required output contents

For each post, the model should return:

1. `postIntroShort` — one sentence summary of the whole maamar.
2. `postIntroLong` — longer “Eric novel style” opening, atmospheric but faithful.
3. For each verseSection:
   - `sectionSummaryShort` — one sentence.
   - `sectionSummaryLong` — fuller summary.
   - translations for every subsection in that section.

## Transliteration / glossary rules

The model must preserve these spellings exactly:

- יעקב → Yaakov, not Jacob
- יצחק → Yitzchak, not Isaac
- אברהם → Avraham, not Abraham
- משה → Moshe, not Moses
- דוד → Dovid, not David
- עצמות / Atzmus → Awtsmoos
- Ein Sof, Sefiros, Nefesh HaBahamis, Nefesh HaElokis, Yechidah, Chayah
- The Rebbe, the Alter Rebbe, the Mitteler Rebbe, the Tzemach Tzedek

## Compact XML response schema

```xml
<awtsmoosMeluketTranslation heichel="ikar" alias="meluket_translation_en" seriesId="כסלו_meluket" postId="BH_POST_..." batchId="...">
  <postIntroShort>One sentence.</postIntroShort>
  <postIntroLong>Longer faithful literary opening.</postIntroLong>
  <section v="1">
    <sectionSummaryShort>One sentence.</sectionSummaryShort>
    <sectionSummaryLong>Longer summary.</sectionSummaryLong>
    <t s="0">English translation of subsection 0.</t>
    <t s="1">English translation of subsection 1.</t>
  </section>
</awtsmoosMeluketTranslation>
```

## Future comment storage shape

Translation comments:

`/social/heichelos/ikar/comments/atSeries/<seriesId>/atPost/<postId>/meluket_translation_en.awtsmoosJSON`

Summary comments:

`meluket_summary_en.awtsmoosJSON`

Possible object shape:

```json
{
  "__postIntroShort": "...",
  "__postIntroLong": "...",
  "1": [
    {
      "content": { "title": "English translation", "text": "..." },
      "dayuh": { "verseSection": 1, "subSection": 0 },
      "author": "meluket_translation_en",
      "verseSection": 1,
      "subSection": 0
    }
  ],
  "__sectionSummaries": {
    "1": { "short": "...", "long": "..." }
  }
}
```

## Safe flow

1. Prepare one whole-post prompt.
2. Send one whole-post test to DeepSeek.
3. Validate strict coordinate coverage: every source subsection must have exactly one `<t s="...">`.
4. Reject markdown fences.
5. Reject missing or extra sections/subsections.
6. Review output manually.
7. Only then write comments.
