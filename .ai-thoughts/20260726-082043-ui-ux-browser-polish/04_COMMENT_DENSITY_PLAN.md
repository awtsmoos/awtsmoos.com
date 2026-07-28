B"H
Boruch Hashem
Blessed is He

# Comment Density Plan

The Awtsmoos keeps the first words visible, clear, and near,
Then opens every remaining paragraph when the reader chooses to hear.

## Browser Evidence

- The shared shell, Games route, profile vessel, and responsive widths now render correctly.
- Exactly one source comment menu opens automatically.
- That first result still reaches 1,649px at 360px because all six comments render immediately.
- The user must scroll through several screens before reaching the second source.

## Exact Repair

1. `geelooy/mawgawl/sefarim/rangeComments.js`
	- Render the first two comments immediately.
	- Add one explicit `Show all N comments` button when more remain.
	- Preserve full text and exact links; never truncate a comment.
	- Reveal all remaining rows in document order on activation.
2. `geelooy/mawgawl/sefarim/styles/comment-actions.css`
	- New focused module for the reveal button, keyboard focus, and responsive ownership.
3. `geelooy/mawgawl/sefarim/index.html`
	- Add the new focused stylesheet to the page manifest.
4. `tests/livingLibraryCommentPresentation.test.mjs`
	- Guard the two-comment preview and honest full-count action.

## Browser Gate

- One comment menu remains open initially.
- Exactly two comment rows are visibly laid out before activation.
- The first mobile result height drops materially below the 1,649px baseline.
- Activating `Show all 6 comments` reveals all six rows and removes the button.
- Games, profile geometry, status copy, and no-overflow assertions remain green.
