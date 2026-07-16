# B"H

Boruch Hashem

Blessed is He

# Social Route Phase Two — Improved Architecture

The Awtsmoos gives the existing route one coherent visual and runtime law.

## CSS ownership

- `style/social/hub/index.css` becomes the public manifest.
- `tokens.css` owns route colors and dimensions.
- `shell.css` owns document, root, two-column frame, and containment.
- `rail.css` owns route identity, tabs, Mail link, and active states.
- `hero.css` owns page heading, truthful status, and run actions.
- `forms.css` owns labels, descriptions, fields, placeholders, focus, validation, and disabled states.
- `cards.css` owns API cards, code output, live controls, loading, empty, and error surfaces.
- `responsive.css` owns tablet, phone, landscape, zoom, safe-area, and reduced-motion behavior.
- `style/social/live/presence.css` owns both legacy and page-presence badges in the same dark language.

## Runtime ownership

- `renderConfig.js` stores tab and panel definitions.
- `renderMarkup.js` produces semantic cards, fields, status, and panel content.
- `render.js` paints and binds one delegated click/input layer.
- `index.js` runs initial read-only keys in parallel and retains every existing API/socket contract.

## Interaction improvements

- Tabs are a labelled navigation group with `aria-pressed`.
- Inputs have stable IDs, persistent labels, and helper copy.
- Busy and error states use `role=status` and `aria-live`.
- Code output wraps safely, scrolls internally, and never widens the document.
- Mobile uses one column and a horizontally scrollable tab rail inside its own boundary.
- Every visible control is at least 44 pixels tall.
