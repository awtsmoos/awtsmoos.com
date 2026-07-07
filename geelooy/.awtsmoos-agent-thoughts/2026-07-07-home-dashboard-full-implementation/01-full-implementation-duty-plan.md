B"H

# Full Implementation Duty Plan

User command:
- Now do everything fully step by duty.
- Do not stop until everything is fully written.

Hard constraints:
- Whole-file rewrites only.
- Do not touch `geelooy/heichelos/post`.
- Split CSS aggressively.
- Keep existing gates green.
- Fix the broken live mobile page from screenshots.

Implementation sequence:
1. Inspect current home HTML + JS contracts.
2. Rewrite `index.html` into the full home dashboard shell.
3. Replace `style/social/home/index.css` with import-only manifest.
4. Create dashboard module family.
5. Create mobile module family.
6. Create desktop module family.
7. Create dock module family.
8. Create states, actions, feed, search, legacy-shield families.
9. Add shared product and motion module families.
10. Add focused home JS split modules and import them from home page.
11. Add tests for home dashboard, mobile overflow, legacy header, module size.
12. Run all gates.
13. If any gate fails, rewrite complete files until green.

Target visual:
- Mobile app shell, no old header, no duplicate menu.
- Strong dark/futuristic but clean dashboard.
- Hero + search + action grid + continue + stats + feed + discovery + dock.
- No clipping, no horizontal overflow, no dock collision.
