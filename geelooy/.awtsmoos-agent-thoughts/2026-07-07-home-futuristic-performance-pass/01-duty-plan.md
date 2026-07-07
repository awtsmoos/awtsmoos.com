B"H

# Futuristic Performance Pass

User asks for:
- Not extremely fancy.
- More futuristic.
- Better borders, shadows, gradients.
- High performance.
- Better grids.
- Hover animations that go crazy but remain fast.

Rules:
- Rewrite complete files only.
- Keep files small.
- Do not touch heichelos/post.
- Re-run gates.

Plan:
1. Inspect home CSS module list and current final cascade.
2. Add a new `future` module family imported near finish.
3. Rewrite home manifest completely.
4. Rewrite action/feed/dashboard/dock/mobile/desktop finish files where needed.
5. Use GPU-friendly transforms and opacity only for hover animation.
6. Avoid giant blur and layout-changing animation.
7. Add contract test for future import + performant animation tokens.
8. Run home tests and existing gates.
