# B"H — Social CSS regression checks

Run from the repository root:

```bash
bash scripts/production/social-css-check.sh
bash scripts/production/social-css-check.sh --live
```

The first command verifies stylesheet ordering and real Chrome component isolation against deliberately conflicting global CSS. The second additionally checks the public Social homepage, profile, Heichel directory and quick composer at 320, 390 and 1280 CSS pixels. Set `CHROME_BIN` or `SOCIAL_TEST_ORIGIN` to target an alternate Chrome binary or test server. No account writes are performed.

Treat CSS as component-owned. Scope legacy selectors to the component root, keep typography explicit inside Shadow DOM, and use the real stylesheet cascade rather than escalating global specificity. Do not hide overflow merely to satisfy a test. New visual changes must pass these checks before release; these are bounded tests, not proof that every future CSS conflict is impossible. Authenticated views, individual posts and nested series require additional coverage. This script is not yet a required CI deployment check.
