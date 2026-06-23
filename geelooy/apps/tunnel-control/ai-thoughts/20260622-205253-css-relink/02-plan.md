B"H

Files to touch, by full rewrite only:
1. css/app.css
   - Make it the single CSS entrypoint.
   - Import css/future/index.css first.
   - Import css/legacy-support.css second.
2. css/legacy-support.css
   - Add only selectors not already owned by the future bundle.
   - Keep live console, mission room, chips, badges, install command, and small compatibility helpers.
   - Use --awt-* tokens so old surfaces visually match the new design.

Verification:
- Run a selector overlap script comparing legacy-support.css against every file in css/future.
- Check app.css import order.
- Check git diff.
