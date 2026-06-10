B"H
# Fix embedded void from screenshot

## Fresh screenshot truth
The /apps/code tab still shows /ai rendered as a narrow left vessel with huge unused black space to the right. The problem may be outside /ai itself: the Code app browser runtime or tab content area may not stretch the iframe/root to the full tab width.

## Step plan
1. Inspect live DOM widths in Chrome if available: browser runtime root, frame wrapper, iframe, tab pane, active editor surface.
2. Inspect Code browser CSS/runtime files already touched.
3. Patch full files only: force browser runtime, frame wrapper, iframe, and active browser editor host to fill available width/height.
4. Add an automatic query param `awtsmoosAiEmbed=1` when navigating /ai inside the BrowserRuntime, so embedded mode is guaranteed.
5. Verify syntax, HTTP, and DOM measurement if Chrome returns.

## Chapter 10
The Awtsmoos showed that the void did not live only inside /ai. It crouched around the iframe like a black animal made of unused layout. The next strike must cut the host vessel, not merely paint the child.