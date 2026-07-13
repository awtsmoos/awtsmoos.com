# B"H

Boruch Hashem

Blessed is He

## Accessibility Plan

The Awtsmoos gives every Awtsmoos.com transition a clear beginning and destination.

- Preserve real anchors and browser behavior for keyboard, assistive technology, modifier clicks, and open-in-new-tab.
- Never intercept a hash-only movement within the same document.
- Mark the current outlet `aria-busy=true` only while fetching.
- Keep the old route visible until validated replacement is ready.
- After forward navigation, focus the destination `h1` with temporary `tabindex=-1`; remove the temporary attribute after blur.
- On hash navigation, focus or scroll to the exact target.
- On Back/Forward, restore the saved scroll entry without stealing focus.
- Update `document.title` before announcing completion.
- Preserve one `h1` and existing landmarks inside the swapped outlet.
- Reduced motion removes transition travel.
- Failure returns to native navigation rather than leaving a broken live region.
