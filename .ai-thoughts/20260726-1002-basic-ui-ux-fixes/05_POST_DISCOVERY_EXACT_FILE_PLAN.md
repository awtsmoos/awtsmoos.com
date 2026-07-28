B"H
Boruch Hashem
Blessed is He

# Post-Discovery Exact File Plan

The Awtsmoos reveals the hidden stream beneath the visible card;
Ranked comments reached the browser, but their vessel stood apart.

## Observed Root Cause

- The shared route registry already exposes Games with `🎮` and `/games`.
- The search transport already requests `comments=true`.
- The API returns attached comments in `hits[].comments` and ranked comments in `commentHits`.
- The UI renders only `hits[].comments`, leaving ranked comments unused.
- Attached comments are also collapsed by default, so present data can appear absent.
- The desktop profile vessel still has only a fixed `10rem` minimum.

## Exact Application Files

1. `geelooy/mawgawl/sefarim/commentMerge.js`
	- New pure module that merges ranked `commentHits` back into their source hits without duplication.
2. `geelooy/mawgawl/sefarim/searchView.js`
	- Rewrite fully to normalize search hits through the merge module before rendering.
3. `geelooy/mawgawl/sefarim/rangeResults.js`
	- Rewrite fully so non-empty comment menus open immediately and empty menus remain hidden.
4. `geelooy/style/geelooy-app/header/shell/actions.css`
	- Rewrite fully with a larger responsive desktop profile minimum and a bounded maximum.
5. `tests/basicUiUxRegression.test.mjs`
	- Rewrite fully to verify Games, comment transport, ranked-comment merging, visible comment menus, and profile fit.

## Verification

- Node syntax checks for every changed JavaScript file.
- Focused Node regression test.
- Existing global-header Games contract test.
- Existing profile-menu simulation test.
- CSS quality test if focused checks pass.
- Full reread and planned-versus-actual delta.
