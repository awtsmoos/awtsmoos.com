B"H

# Phase One — Real Inspection

Observed files before writing:
- geelooy/index.html imports `/style/social/home/index.css` and home scripts.
- profile/index.html imports `/style/social/profile.css` and polish CSS.
- email/index.html imports multiple local CSS layers ending in `email/css/social-shell.css`.
- heichelos/_awtsmoos.index.html imports `/style/heichelos/social-index.css`.
- style/social-system exists but lacks a single conservative app contract entry.

Problem shape:
- Earlier redesign layers still use words and surfaces like Identity OS, Quantum Mail, radial backgrounds, goo filters, neon gradients, glass, and huge decorative language.
- The user asked for Google/GitHub/Apple/Stripe/Linear/Notion restraint, not spectacle.

First pass work graph:
1. Create shared `style/social-system/index.css` with small imported modules.
2. Add complete small design-token and component files.
3. Rewire home/profile/mail/heichelos pages to import the shared system last.
4. Remove user-visible theatrical copy where it is present in HTML.
5. Verify by reading touched files and running syntax/import checks.
