B"H
Boruch Hashem
Blessed is He

# Likkutei Sichos Volume 1 — Reader editorial verification and errata

The Awtsmoos gives each Torah letter its own life; Awtsmoos.com must not confuse rendering fidelity with independently certified scholarship. This is a correction queue for the published post `BH_POST_1763106571020_theRebbe_438` in series `likkuteiSichosVolume1`, Heichel `ikar`. The original reader audit was reviewed October 28, 2026; the source-reference review below was refreshed November 1, 2026. **These editorial corrections are not yet applied to stored post content.**

## What the automated audit actually proved

- All **374** rendered Hebrew–English phrase pairs matched the **375** stored API records after excluding the trailing blank layout artifact and normalizing HTML footnote markup. This establishes display fidelity to the stored data, not accuracy against printed Likkutei Sichos.
- The post contains **64 sections**, **28 footnote records**, and **nine suggested source references**. The October 28 audit's full nested `i` menu reached all 64 sections and all 374 passage choices without changing article geometry or scroll position in its audited Chrome viewport. Current reader code may render only a viewport-sized subset at one time, so these historical counts describe the audited content set rather than a permanent all-DOM invariant.
- The renderer duplicated **13 footnote-marker HTML IDs** across sections. The separate reader code repair assigns unique IDs while preserving the original note markers and text. This is a technical fix, not an editorial rewrite.

## Confirmed references to correct after authenticated editorial review

| Location | Current stored description | Supported correction | Evidence |
|---|---|---|---|
| Footnote 13 | The English says "Torah 207" although Hebrew names `תורה אור`. | Read **Torah Or** (the work), retaining the Hebrew text. | Hebrew original in the stored footnote record; [Chabad, Torah Ohr](https://www.chabad.org/torah-texts/7440737) identifies the same work using the transliteration “Torah Ohr.” |
| Footnote 24 | Same "Torah 207" transcription error. | Read **Torah Or**. | Hebrew original in the stored footnote record; [Chabad, Torah Ohr](https://www.chabad.org/torah-texts/7440737). |
| Suggested source on `בהדי כבשי דרחמנא למה לך` | Attributes the phrase to **Sanhedrin 97b**. | **Berakhot 10a**, in Hezekiah and Isaiah's dialogue. | [Berakhot 10a](https://www.sefaria.org/Berakhot.10a) in Sefaria. |
| Suggested source on age 100 | Cites **Avos 5:26**. | Cite the edition: **Avos 5:22** in the checked Chabad numbering; other editions may number the mishnah differently. | [Chabad, Chapter Five](https://www.chabad.org/library/article_cdo/aid/2835829/jewish/Chapter-Five.htm). |

## Additional entries requiring expert editorial review

- Footnotes **1 and 25** have Hebrew text and no English translation in the published API record. Do not invent their English; request translation and review against their precise original context.
- The guide's Sotah citation should **not** be reduced to a blanket correction from 10b to 10a. In the checked Sefaria pagination, the `אַל תִּקְרֵי וַיִּקְרָא אֶלָּא: וַיַּקְרִיא` teaching begins at [Sotah 10a:23](https://www.sefaria.org/Sotah.10a.23), while its immediate explanation about Abraham's hospitality and causing travelers to bless God continues at [Sotah 10b:1](https://www.sefaria.org/Sotah.10b.1). Preserve the exact segment or range and state the edition/pagination used.
- The blessing **`אשר קידש ידיד מבטן`** appears in the *brit milah* blessing sequence in [Shabbat 137b](https://www.sefaria.org/Shabbat.137b). Language presenting it simply as a blessing on Yitzchak's birth is therefore misleading and needs theological and liturgical review; no replacement translation is proposed here.
- The nine guide sources are prose references, not individually verified links to critical editions. Citation matching does not prove that the English translation of the entire Sichah matches the Rebbe's original.

## Revision safety and acceptance requirement

The public API exposes the post for reading, but the operator's exact authorized post-revision and rollback route has not been proven in this audit. No direct mutation of `dayuhChadash.awtsdb`, unknown author records, or unauthenticated publishing calls was performed. Before editorial correction, confirm actor ownership, back up the exact current revision, apply a revision-guarded complete record update, verify every phrase and footnote again, and support rollback. Until then, distinguish **rendering verified** from **scholarship editorially approved**.
