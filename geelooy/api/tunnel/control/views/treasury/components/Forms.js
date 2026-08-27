// B"H

function actionForms() {
  return `<section class="awt-grid awt-actions">${budgetForm()}${marketForm()}${providerForm()}${reputationForm()}</section>`;
}
function budgetForm() {
  return `<form class="awt-card awt-form" action="/api/tunnel/control/treasury/budgets" method="GET"><h2>Create Budget</h2><input type="hidden" name="action" value="create"><label>Name<input name="name" value="Builder Budget"></label><label>Entity Type<input name="entityType" value="user"></label><label>Routing<input name="routing" type="number" value="1000"></label><label>Compute<input name="compute" type="number" value="100"></label><label>Storage<input name="storage" type="number" value="10"></label><label>GPU<input name="gpu" type="number" value="1"></label><button>Set Budget</button></form>`;
}
function marketForm() {
  return `<form class="awt-card awt-form" action="/api/tunnel/control/treasury/marketplace" method="GET"><h2>Record Commission</h2><input type="hidden" name="action" value="commission"><label>Seller<input name="sellerId" value="creator"></label><label>Routing<input name="routing" type="number" value="1000"></label><label>Compute<input name="compute" type="number" value="100"></label><label>Storage<input name="storage" type="number" value="0"></label><label>GPU<input name="gpu" type="number" value="0"></label><button>Split Marketplace Sale</button></form>`;
}
function providerForm() {
  return `<form class="awt-card awt-form" action="/api/tunnel/control/treasury/providers" method="GET"><h2>Record Provider Margin</h2><input type="hidden" name="action" value="margin"><label>Provider<input name="provider" value="sandbox"></label><label>Model<input name="model" value="agent-runtime"></label><label>Charged Perutas<input name="charged" type="number" value="100"></label><label>Provider Cost<input name="cost" type="number" value="65"></label><button>Record Margin</button></form>`;
}
function reputationForm() {
  return `<form class="awt-card awt-form" action="/api/tunnel/control/treasury/reputation" method="GET"><h2>Add Reputation</h2><input type="hidden" name="action" value="add"><label>Subject Type<input name="subjectType" value="agent"></label><label>Subject ID<input name="subjectId" value="agent_demo"></label><label>Kind<input name="kind" value="positive_review"></label><label>Weight<input name="weight" type="number" value="5"></label><button>Add Trust Signal</button></form>`;
}
module.exports = { actionForms };
