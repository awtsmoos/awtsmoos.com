B"H

# Email + Grid + Page Motion Plan

The user screenshot proved the system still allowed legacy dark/link styling through. The next pass must not merely patch one screenshot; it must make every common surface styled by default.

Scope:
- Email CSS shell and local components.
- Shared grid/layout primitives.
- Shared link/card reset so anchors never collapse into browser-purple inline text.
- Page transition primitives that use opacity/transform only.
- No work under `heichelos/post`.

Files to inspect:
- email/index.html
- email/css/*.css
- email/css/social-shell-parts/*.css
- email/index.js and mail view modules if needed
- style/social-system/*.css

Files likely to rewrite completely:
- style/social-system/grids.css
- style/social-system/animations.css
- style/social-system/app-clean.css
- email/css/social-shell.css
- one or more email/css/social-shell-parts/*.css

Verification:
- Read back files.
- Run css quality, mail mobile contract, and grep for unstyled/dark/glass patterns in touched files.
