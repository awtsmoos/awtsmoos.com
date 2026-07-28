B"H
Boruch Hashem
Blessed is He

# Implementation and Verification

The Awtsmoos gave one post many ordered chambers,
so each word, image, voice, and moving light may remain where meaning remembers.

## Planned Versus Actual

### Manual Verses and Subsections

- Planned: expose the existing structured post schema through a clean primary workflow.
- Actual: every verse is now an open collapsible card with a numbered summary, editable title, comments toggle, movement controls, removal, content blocks, scoped media, and nested subsections.
- Added one visible `+ Add verse` action.
- Preserved the original hidden `addSectionButton` as the controller hook used by existing tools.
- Added one visible `+ Add subsection` action inside each verse.
- Every subsection is an independently collapsible card with its own title, coordinate, blocks, removal action, and scoped media.
- The canonical payload schema remains unchanged: sections and subsections still serialize through the existing composer state and post payload builder.

### Per-Scope Media

- Planned: attach image, audio, video, or files to the root post, an individual verse, or an individual subsection.
- Actual: every root, verse, and subsection media panel now exposes explicit `Image`, `Audio`, `Video`, and `File` controls.
- Each picker feeds the existing scoped attachment mutation path.
- Drag-and-drop remains available as a secondary convenience.
- Existing MIME validation, upload states, alt text, captions, preview cards, upload actions, and removal actions remain intact.
- No parallel asset schema was introduced.

### Playlist-Style Destination Selection

- Planned: present Heichel and series selection like a familiar playlist chooser.
- Actual: the writing panel now contains one compact `Series playlist` card showing `Heichel › Series`.
- Added `Change series`, `Make default`, and `Browse all` actions.
- Root series is honestly labeled `Heichel Home`.
- Quick choices include writable destinations only.
- The complete destination evidence tree remains available through `Browse all`.
- Server-provided Heichel and series names are rendered through text-only DOM nodes.

### Alias Defaults

- Planned: default publishing to the alias's own profile destination.
- Repository evidence: no explicit canonical `profile Heichel` contract exists.
- Implemented truthful policy:
	1. Draft or URL destination context wins.
	2. An explicitly remembered writable destination for that alias wins next.
	3. Otherwise, an owned writable Heichel is chosen.
	4. Its fallback series is `root`, shown as `Heichel Home`.
	5. Followed, invited, or denied spaces are never silent defaults.
	6. No Heichel is automatically created.
	7. If no owned writable Heichel exists, the destination remains unselected.
- Default memory is isolated per alias in local storage.

## Browser Interaction Evidence

Installed headless Chrome exercised the final source through a fresh isolated project server.

### Mobile

- Browser content width: 375px.
- Document scroll width: 375px.
- Horizontal overflow: none.
- Playlist selector: visible.
- Structured verses panel: open.
- Visible add-verse actions: exactly one.
- Manual verse creation: one verse created.
- Manual subsection creation: one nested subsection created.
- Root media controls: Image, Audio, Video, File.
- Verse media controls: Image, Audio, Video, File.
- Subsection media controls: Image, Audio, Video, File.
- A real in-memory root image remained in the root scope.
- A real in-memory audio file remained in the verse scope.
- A real in-memory video file remained in the subsection scope.
- Mobile publication bar remained fixed.
- Browser exceptions: none.

### Desktop

- Browser content width: 1425px.
- Document scroll width: 1425px.
- Horizontal overflow: none.
- Playlist selector: visible.
- Structured verses panel: open.
- Root media controls: Image, Audio, Video, File.
- Desktop publication behavior remains sticky.
- Browser exceptions: none.

## Payload Evidence

Focused payload tests proved:

- Root image remains in `rootAssets`.
- Verse audio remains in `sections[0].assets`.
- Subsection video remains in `sections[0].subsections[0].assets`.
- Canonical `heichelId` and `seriesId` remain unchanged in the post payload.

## Automated Evidence

- Sixteen focused Home, composer, destination, structure, media, payload, and mobile tests passed.
- Unified destination-service test passed.
- Social content test passed.
- Packed social snapshot test passed.
- Post migration test passed.
- Packed snapshot repair test passed.
- Profile-menu simulation passed.
- CSS quality and ownership checks passed.
- JavaScript syntax checks passed.
- `git diff --check` passed.
- Every touched source and test file remains below 120 lines.
- Complete touched-file reread succeeded.

## Remaining Work

No safe, relevant, in-scope implementation, schema integration, media scoping, destination-default, responsive layout, interaction, testing, or browser-verification work remains for this structured post-composer request.
