B"H

# Restore Top Header + Sidebar Plan

User says the most important part was delayed/removed: top header with sidebar. Bring it back, but better and easier.

Problems in screenshots:
- Home has modern custom header but not the expected global header/sidebar.
- Profile still leaks old broken header and menu in a bad way.
- Bottom dock clips at left on mobile in one home screenshot.
- Feed empty-state text/actions collide.
- Some text is too low contrast due to gradients.
- DevTools MIME error shows module script loaded as JSON somewhere, likely public/devtools context, but home dashboard JS local tests passed. Need avoid extra fragility.

Fix strategy:
1. Add a new modern top header inside home index.html:
   - B"H / Geelooy identity
   - menu button
   - alias pill @rambam
   - sidebar drawer with Home, Mail, Heichelos, Sefarim, Games, Profile, Apps
2. Do not resurrect broken legacy HTML. Build clean accessible header and sidebar.
3. Update dashboard JS to control sidebar open/close.
4. Remove CSS hiding that would suppress the new header/sidebar; scope legacy shield to legacy classes only.
5. Add CSS modules: header/sidebar under home/top-shell.
6. Fix dock left clipping and feed empty action wrap.
7. Add contract test requiring top header/sidebar.
8. Run gates.
