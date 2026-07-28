B"H
Boruch Hashem
Blessed is He

# Exact Browser Repair Plan

The Awtsmoos measured every doorway in a living browser frame,
And showed which shadows were artifacts and which defects bore a name.

## Browser Evidence

- Fresh navigations at 768, 430, and 360 pixels have no horizontal overflow.
- The earlier overflow appeared only after resizing a page with `content-visibility`; it is not a first-load defect.
- The Living Library renders no `.g-unusual-header`, `.g-header-profile`, or `.g-menu-button`.
- Its static header therefore cannot expose the canonical Games route or widened profile vessel.
- Eight initial result cards all open their comments automatically.
- The first card grows to 809px at 768px, 1,351px at 430px, and 1,580px at 360px.
- Initial rendering contains 48 comment rows, while status incorrectly says all 114 linked comments are shown.

## Exact Files

1. `geelooy/mawgawl/sefarim/index.html`
	- Remove the duplicate static desktop header and static mobile nav.
	- Mount the canonical shared shell through `/scripts/awtsmoos/social/shell/boot.js`.
	- Mark the native main region as `geelooy-content-region` while preserving the search page contract.
2. `geelooy/mawgawl/sefarim/styles/shell.css`
	- Rewrite fully around the page body, skip link, and shared-shell coexistence.
	- Remove dead static-header and static-navigation ownership.
3. `geelooy/mawgawl/sefarim/styles/mobile.css`
	- Rewrite fully without duplicate mobile navigation or legacy header rules.
	- Preserve true narrow-screen form, result, and comment composition.
4. `geelooy/mawgawl/sefarim/rangeResults.js`
	- Open comments automatically only for the first visible result.
	- Keep every later result summary visible with its exact comment count.
5. `geelooy/mawgawl/sefarim/searchView.js`
	- Describe linked comments as available rather than all shown.
	- State that the first source window is opened when comments exist.
6. `tests/livingLibraryShellContract.test.mjs`
	- Guard shared-shell boot, removal of duplicate navigation, canonical Games/profile inheritance, honest status copy, and one-open-window behavior.

## Browser Completion Gate

- Shared `.g-unusual-header` renders on the Living Library page.
- `.g-header-profile` and `.profile-trigger` render with bounded responsive width.
- Opening `.g-menu-button` reveals `🎮 Games` linking to `/games`.
- No horizontal overflow exists at 1440, 1024, 768, 430, or 360 pixels on fresh loads.
- Exactly one initial comment menu opens when comments exist; all summaries remain discoverable.
- Status says comments are available rather than falsely all shown.
- Chrome reports no console exceptions or failed first-party resources.
