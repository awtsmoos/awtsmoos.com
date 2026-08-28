B"H
Boruch Hashem
Blessed is He

# Chesed — Every Page, Every Vessel

The Awtsmoos renews every pixel, every route, every breath of light;
Awtsmoos.com should reveal that unity while each page remains swift, clear, and right.

## Mission

Improve the entire public experience by changing shared foundations first, page families second, and exceptional immersive surfaces last. Do not repaint thousands of routes one by one when one canonical shell, response contract, or state component can repair them together.

## Global experience invariants

- Every public route must provide meaningful HTML before JavaScript whenever the route has meaningful content.
- Every route must use one UTF-8 story with no conflicting legacy charset declaration.
- HTML must be served as HTML, CSS as CSS, JS as JS, JSON as JSON, and compressed variants with correct negotiation headers.
- Every page gets a visible page purpose, clear primary action, coherent navigation escape hatch, and accessible landmark hierarchy.
- Every interactive control gets hover, active, focus-visible, disabled, loading, selected, success, and error semantics where applicable.
- Mobile is the default geometry; tablet and desktop progressively expand it.
- No horizontal overflow, clipped dialogs, accidental fixed overlays, inaccessible off-screen drawers, or arbitrary z-index wars.
- Reduced-motion users get a stable experience; default motion uses transform, opacity, and bounded blur rather than layout churn.
- Advanced controls collapse behind explicit disclosure without hiding the primary task.
- Empty, loading, signed-out, offline, permission-denied, not-found, and recoverable-error states must look intentional.
- Every page should remain understandable at 200% zoom and keyboard reachable.
- Hebrew/RTL and English/LTR content must preserve reading direction without global direction leakage.
- Shared CSS must stay root-scoped or component-scoped; no new universal-selector hacks or unrelated global overrides.
- Fast loading is a release criterion: reduce render-blocking assets, eliminate unnecessary font families, avoid duplicate CSS, lazy-load optional tools, and use the canonical compact pipeline where supported.

## Route families

### Public constellation
Home, Apps, Games, Torah/Heichelos, Wallet, OS, Code, Community, About, Contact, auth, profile.

### Torah/content
Heichel directory, Heichel detail, series, posts, comments, editor/review, dynamic Hebrew content. Must fix MIME, charset, SSR body, reading typography, navigation context, loading skeletons, sharing, and mobile text rhythm.

### Creator tools
Code, social composer, Animator, Mitzvah Studio, audio editor, transcription, CSV/grid, OCR, recorder, editors. Shared command bars, file state, save state, destructive confirmations, keyboard shortcuts, mobile tool drawers, canvas fallbacks.

### Social/community
Social Hub, profile, comments, messages, activity, spaces, governance, discovery. Shared signed-out shell, skeletons, empty states, unread states, accessibility, mobile navigation, privacy disclosures.

### Games/worlds
Games catalog, Mitzvah World, Temple Runner, Party and experimental worlds. Separate lightweight catalog shell from immersive render loops; defer heavy 3D/audio until user intent; preserve touch controls and reduced effects.

### Account/commerce
Login, register, Wallet, donate, aliases/account surfaces. Strong form semantics, validation, password-manager compatibility, pending/success/failure states, touch targets, trustworthy transaction receipts.

## Performance universe

- Test normal and `?compact=true` paths where compact negotiation is implemented.
- Verify compact output preserves module URLs, dynamic imports, cache busting, source closure, and MIME headers.
- Preload only critical assets; prefetch only high-confidence next routes.
- Prefer system fonts or one carefully budgeted webfont family per experience rather than page-local font explosions.
- Defer decorative particles and WebGL until after first meaningful paint.
- Avoid layout-shift-prone image/iframe insertion; reserve dimensions.
- Audit large CSS bundles for duplicated tokens and stale compatibility layers.
- Cache immutable generated bundles aggressively while keeping HTML appropriately revalidatable.

## Production findings already observed

- Dynamic Torah post route currently exposes essentially no semantic body to crawlers and has been observed as a full HTML document served with text/plain plus conflicting charset declarations.
- Heichel detail pages expose only an Opening/loading shell before JavaScript.
- Social Hub explicitly falls back to a JavaScript-required message.
- Apps Docs has little/no server-readable page body while other docs routes have meaningful HTML.
- Audio Editor and Native Grid still present a legacy control vocabulary inconsistent with newer Awtsmoos surfaces.
- Home, profile, login/register, Wallet, About, Games, and Code already demonstrate useful SSR patterns worth reusing.

## Architectural preference

Use shared foundations to reveal unity without forcing visual sameness. Every vessel should feel unmistakably Awtsmoos.com while retaining the density and interaction model appropriate to Torah reading, coding, social communication, immersive games, or financial actions.
