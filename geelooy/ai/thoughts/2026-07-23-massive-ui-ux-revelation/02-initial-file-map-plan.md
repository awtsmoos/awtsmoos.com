<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Phase Two — Initial File Map and Realistic Plan

## Inspection targets

- index.html shell landmarks and controls.
- styles.css and every imported CSS manifest.
- css/ideal tokens, shell, sidebar, chat, composer, automation, settings, and mobile.
- css/right-panel panel surfaces, forms, responsive rules, and overlap seals.
- JavaScript owning panel toggles, focus, and viewport state.
- Existing CSS parity, overlap, mobile, static, and browser tests.

## Initial architecture hypothesis

1. Preserve the DOM contract unless inspection proves it inadequate.
2. Create one explicit responsive workspace controller only if state is currently scattered.
3. Reuse existing controls for a compact app bar where possible.
4. Rewrite focused CSS modules completely rather than stacking overrides.
5. Separate mobile shell, desktop shell, component surfaces, and accessibility policy.
6. Preserve tested stylesheet import order.
7. Add browser assertions at mobile, tablet, laptop, desktop, and ultrawide widths.

## Potential touched files

- css/ideal/tokens.css
- css/ideal/shell.css
- css/ideal/sidebar.css
- css/ideal/chat.css
- css/ideal/composer.css
- css/ideal/automation.css
- css/ideal/settings.css
- css/ideal/mobile.css
- css/right-panel/manifest.css
- styles.css

## Potential new modules

- css/experience/app-bar.css
- css/experience/panel-surfaces.css
- css/experience/conversation-list.css
- css/experience/message-content.css
- css/experience/desktop-workspace.css
- css/experience/mobile-workspace.css
- css/experience/accessibility.css
- js/ui/responsiveWorkspaceController.js
- js/ui/workspaceFocusPolicy.js
- focused browser and geometry tests.

## Constraints

- Complete-file rewrites only.
- Tabs where valid.
- Focused modules below 120 lines when practical.
- Preserve public selectors unless all consumers migrate.
- No visual change without keyboard, touch, and overflow verification.
