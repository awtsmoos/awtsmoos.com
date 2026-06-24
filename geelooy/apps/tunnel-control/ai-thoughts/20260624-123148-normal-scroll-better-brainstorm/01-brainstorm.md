B"H

# Brainstorm: normal scrolling and less UI noise

"Scroll lock" meant the broken state where a container/viewport was preventing normal page scrolling. The real goal: browser page scrolls normally everywhere; no nested full-height traps except small log/message panels that need their own scroll.

Better UI direction:
- One document scroll: html/body are the scroll owners.
- Dashboard is a clean card grid, no trapped internal viewport.
- Mission rooms: rooms first, compact top actions, filters hidden behind Advanced.
- No diagnostics floating button.
- Avoid card text clipping and huge cards causing awkward viewport cutoff.
- Reduce glass chaos: simpler spacing, consistent card widths, less overlap.

Possible fixes:
1. Add final CSS override file for normal scroll and simplified dashboards.
2. Ensure it imports last.
3. Remove any max-height/overflow hidden from page-level containers.
4. Make action cards compact, readable, and wrapping.
5. Keep panels with data output scrollable only where content is huge.
