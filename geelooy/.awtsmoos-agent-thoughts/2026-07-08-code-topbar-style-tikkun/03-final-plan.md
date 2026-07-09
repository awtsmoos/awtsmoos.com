# B"H — Final plan

The most surgical repair is not to chase every button style individually. The true structure problem is that major systems are using the same top row as a dumping ground. We will give each system one visible vessel.

Top row after repair:
- Left cluster: sidebar toggle, main menu, one `CIV` button.
- Right cluster: any global console/AI/refresh buttons, then one account trigger.
- Dropdowns carry secondary portals/actions.

No storage schema changes. No backend changes. No behavior removal. Only presentation and launcher grouping.

Completion gate:
- No inline portal chips should be rendered in `.menu-bar`.
- No separate `OBJ`/search/card/mode civilization buttons should appear.
- Account actions should live inside `.awtsmoos-account-menu`.
- `app.css` must import explicit style files so future edits are traceable.
