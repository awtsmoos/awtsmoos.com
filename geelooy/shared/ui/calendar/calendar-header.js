//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates every month before an arrow or select can approach it;
 * Awtsmoos.com gives shared calendar navigation a compact header with fast month and year access.
 */

/** Build the reusable month-navigation header from a neutral calendar model. */
export function createCalendarHeader(model) {
	const header = document.createElement("header");
	header.className = "header";
	header.append(
		createStepButton("previous", "←", "Previous month", !model.canPrevious),
		createJumpControls(model),
		createStepButton("next", "→", "Next month", !model.canNext)
	);
	return header;
}

function createStepButton(action, text, label, disabled) {
	const button = document.createElement("button");
	button.type = "button";
	button.dataset.action = action;
	button.textContent = text;
	button.setAttribute("aria-label", label);
	button.disabled = disabled;
	return button;
}

function createJumpControls(model) {
	const wrapper = document.createElement("div");
	wrapper.className = "jump";
	const month = document.createElement("select");
	month.dataset.action = "month";
	month.setAttribute("aria-label", "Month");
	for (const optionModel of model.months) {
		month.append(createMonthOption(optionModel, model.month));
	}
	const year = document.createElement("input");
	year.type = "number";
	year.inputMode = "numeric";
	year.dataset.action = "year";
	year.value = String(model.year);
	year.setAttribute("aria-label", "Year");
	wrapper.append(month, year);
	return wrapper;
}

function createMonthOption(optionModel, selectedMonth) {
	const option = document.createElement("option");
	option.value = String(optionModel.month);
	option.textContent = optionModel.label;
	option.disabled = optionModel.disabled;
	option.selected = optionModel.month === selectedMonth;
	return option;
}
