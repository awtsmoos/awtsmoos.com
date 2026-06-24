B"H

# Plan

Files to inspect / edit:
- css/app.css import order
- css/future/index.css import order
- css/future/views/final-normal-scroll.css create as last override
- css/future/views/dashboard.css maybe keep or replace if import order loses
- css/future/views/mission-control-os.css maybe keep or replace if import order loses
- css/future/views/no-side-rails.css keep defensive no extra UI

Verification:
- CSS imported last.
- Chrome eval: body/html overflow is auto/visible, document scrollHeight > viewport when content taller, dashboard grid exists and no diagnostics toggle.
- Mission room page selectors after opening workspace if possible.
