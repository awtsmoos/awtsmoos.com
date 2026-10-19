# B"H — Zmanim Lib (geelooy/api/zmanim/lib/)

Service layer behind the Zmanim (halachic times) API (see `../README.md`).

## Services
- `dayService.js` / `calendarService.js` / `rangeService.js` — day, calendar,
  and date-range zmanim.
- `comparisonService.js` / `comparisonValidation.js` — compare zmanim across
  opinions/methods.
- `locationService.js` / `usnoService.js` / `domainLoader.js` / `metadataService.js`
  — location resolution, USNO data, domain loading, metadata.
- `presentationService.js` / `embedService.js` / `embedMarkup.js` /
  `embedComparisonMarkup.js` / `embedStyles.js` / `embedComparisonStyles.js` /
  `interactiveLink.js` — presentation and embeddable-widget rendering.
- `htmlResponse.js` / `htmlEscape.js` / `response.js` / `serializer.js` /
  `validation.js` — response shaping, escaping, serialization, input validation.
