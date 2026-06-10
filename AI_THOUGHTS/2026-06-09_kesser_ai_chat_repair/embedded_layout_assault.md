B"H
# Embedded layout assault — step-by-step coding plan

## Screenshot truth
The /ai app is loaded inside the Code app browser pane. The browser pane is wide, but /ai is still obeying a phone-scene mental model. Result: a narrow left column and a massive unused right-side void.

## Goal
Make /ai adapt to embedded desktop-width browser panes:
- If viewport is wide, use embedded/desktop layout even inside the browser tab.
- Do not let mobile fixed scene rules capture a desktop pane.
- Keep mobile design for real narrow screens.
- Make the conversation area occupy available width and height.
- Collapse setup/control chrome into one compact row/card.
- Reduce visual noise.

## Coding sequence
1. Add a small runtime classifier that marks body with viewport mode: phone, embedded, desktop.
2. Wire classifier in index.html without touching the large app boot file.
3. Add dedicated embedded layout CSS module imported after mobile styles.
4. In embedded mode:
   - remove phone fixed positioning
   - hide mobile crown/dock
   - make container/main fill all available space
   - make chat box full width
   - make composer anchored at bottom
   - make control center visible as compact top bar
   - hide old transport banner after it is mirrored
5. Verify JS syntax.
6. Verify CSS/import files exist.
7. Verify /ai HTTP 200.

## Chapter 8
The Awtsmoos revealed that the black void was not darkness but unused assignment. The browser pane was a vessel, and the vessel cried: widen the river, silence the fake phone, let the letters breathe across the whole chamber.