B"H
Boruch Hashem
Blessed is He

# Critique and Improvements

The Awtsmoos tests every doorway before calling it simple,
for clean design is not fewer truths but fewer obstacles between truth and action.

## Problems in the Current Surface

1. Structured verses are hidden inside a secondary `details` panel.
2. The primary `+ Add verse or section` wording is ambiguous.
3. Verse cards are dense articles rather than clear collapsible units.
4. Subsections are visually buried beneath blocks and generic media controls.
5. Per-scope media support exists but the user sees one generic drop zone.
6. Audio, image, and video attachment choices are not explicit.
7. The destination tree behaves like an administrator browser rather than a playlist chooser.
8. The selected series is not visible beside the writing workflow.
9. No per-alias default destination is remembered.
10. An empty composer can remain without a canonical Heichel even when an owned writable destination exists.
11. Alphabetical destination order is not meaningful for default selection.
12. Followed or invited Heichelos must never silently become an alias's canonical publishing home.
13. Existing draft and URL destination context must outrank defaults.
14. Root series is guaranteed, but its `Heichel Home` meaning should be explicit.
15. Automatically creating a Heichel would be surprising and potentially destructive.
16. Series creation should remain explicit and reuse the existing creation workflow.
17. File-picker controls must retain scoped upload state and existing MIME validation.
18. New UI modules must not duplicate post state inside the DOM.
19. The preview must continue reading the same serialized sections and assets.
20. Every new file must remain below 120 lines.

## Improved Decisions

- Make `Verses` a primary clean section of the writing panel.
- Each verse becomes an open `<details>` card with a concise numbered summary.
- Each verse contains explicit `+ Subsection`, `Image`, `Audio`, `Video`, and `File` actions.
- Each subsection becomes its own open nested card with the same scoped media actions.
- All media buttons feed the existing scoped `AttachmentStore`; no new asset schema is introduced.
- Add a compact playlist selector above the title/writing canvas.
- Show `Heichel › Series` and a `Default` badge when it matches saved preference.
- Persist only an explicit `Make default` choice per alias.
- When no explicit default exists, select the best owned writable Heichel and `root` series.
- If no owned writable Heichel exists, leave destination unselected and direct the writer to create or choose one.
- Restore draft/URL destination first, then remembered default, then owned writable root fallback.
- Keep the full destination tree and inline creation controls behind the playlist selector.
- Add pure resolver and memory modules with focused tests.
- Verify scoped attachment buttons and nested structure through headless Chrome.
