<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Verification Plan

## Static verification

- Re-read every touched file completely.
- Run syntax checks for changed JavaScript modules.
- Run `git diff --check`.
- Confirm every new module is imported and no dead selector remains.

## Behavioral verification

- Existing and newly streamed user messages receive exactly one action trigger.
- Existing and newly streamed assistant messages receive exactly one action trigger.
- Copy preserves readable message text.
- Share uses native sharing when supported and safely falls back otherwise.
- Audio and video downloads appear only when matching media exists.
- Menus close on Escape, outside activation, and action completion.
- Keyboard focus returns to the trigger.

## Responsive verification

Test narrow mobile, tablet, standard desktop, and wide desktop widths. Confirm panels remain reachable, message text does not collapse into unusable columns, menus stay visible, and the composer remains usable.

## Regression verification

Run the relevant project tests and a browser smoke path. Confirm conversation loading, streaming, automation controls, scrolling, and composer submission remain functional.

## Completion evidence

Record commands, outputs, browser observations, affected files, and any remaining limitations in the final evidence report.
