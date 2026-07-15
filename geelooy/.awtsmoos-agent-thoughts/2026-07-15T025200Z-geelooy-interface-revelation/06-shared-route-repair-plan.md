# B"H

Boruch Hashem

Blessed is He

## Shared Route Repair Plan

The Awtsmoos gives every defect an existing owner. This pass changes no route contract and creates no alternate theme.

## Approved production files

### Shared shell

- `geelooy/style/geelooy-app/header/mobile.css`
  - Raise mobile search, menu, and profile actions from 42.4 to 44 pixels.
  - Keep current compact header geometry and desktop behavior.

### Heichel discovery

- `geelooy/style/heichelos/discovery-cards.css`
  - Replace `var(--g-faint)` metadata on white cards with the AA-capable secondary text token.
  - Give metadata pills and card actions touch-safe dimensions.

### Ikar / Heichel reader

- `geelooy/style/heichelos/heichel/controls.css`
  - Preserve form ownership.
  - Consolidate final touch sizing for tabs, card menus, expand toggles, breadcrumbs, context items, and bottom navigation.
  - Contain long platform tabs with horizontal scrolling inside the viewport.
  - Restore explicit dark foreground/background ownership where older generations leak light text tokens.

### Mail

- `geelooy/email/css/quantum/core/frame.css`
  - Keep desktop two-column layout.
  - On mobile, show one full-width pane at a time and prevent the hidden 540-pixel chat canvas from extending beyond the viewport.
- `geelooy/email/css/quantum/touch-targets.css`
  - Raise search and route links to 44 pixels.
  - Make sender categories horizontally scrollable only inside their own container.
  - Improve identity and status text contrast without adding decorative effects.

### Social composer

- `geelooy/social-composer/style.css`
  - Import one focused accessibility module last.
- `geelooy/social-composer/styles/accessibility.css`
  - Give summaries and editor controls 44-pixel targets.
  - Correct primary-action foreground contrast.
  - Preserve visible focus and reduced motion.
- `geelooy/social-composer/js/accessibility.js`
  - Assign accessible names to the nine verified unnamed fields from stable IDs.
- `geelooy/social-composer/js/main.js`
  - Initialize the accessibility module before composer behavior.

## Verification

- Rerun Home, Heichelos, Ikar, Mail, and Social Composer at 390×844 and 1440×1000.
- Require zero horizontal overflow for those routes.
- Require no unnamed composer controls.
- Require all actionable controls at least 44 pixels unless a larger associated label owns the target.
- Rerun CSS ownership, route, syntax, and line-count gates.
