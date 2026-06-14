B'H
# Current Truth After Public Verification

The public URL still renders raw post controls. Web verification shows the public page text includes `A I`, `Scribe's Lens`, `Focus Mode`, and other settings controls in the page body. That means the deployed/public template is not yet carrying the critical inline style and `legend-002` cache-busted CSS links from the local files.

Local files now protect the post reader in three layers:
1. Both post templates link `main.css?v=legend-002`.
2. Both post templates directly link `reader-controls/live-template.css?v=legend-002`.
3. Both post templates include inline critical CSS that hides `.hidden-details` and fixes `.awtsmoos-floating-controls`.

Local verification passed:
- template version contract
- imported post style ownership
- CSS quality
- heichel mobile contract
- home feed contract
- post CSS graph: 53 files, 0 missing imports, 0 duplicate selectors

Remaining blocker:
- public awtsmoos.com is not serving these local changes yet. Need deployment/restart/publish path for public server, not more local CSS guessing.
