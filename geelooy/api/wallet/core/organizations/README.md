# B"H — Wallet Organizations (geelooy/api/wallet/core/organizations/)

Organization treasuries: org creation, funding, budgets, member management, and
consumption rules — behind the `organizations` and `organizations/action` routes.

Files:
- `organizationCreate.js`, `organizationFund.js`, `organizationConsume.js` — lifecycle
- `organizationBudget.js`, `organizationState.js`, `organizationEvents.js` — budgets/state
- `organizationMembers.js`, `organizationMemberService.js` — membership
- `organizationPolicy.js`, `organizationService.js` — policy/service orchestration

Route helpers in `routes/organizationActionSupport.js`; tested in
`tests/business/organization{Members,Treasury}.test.js`.
