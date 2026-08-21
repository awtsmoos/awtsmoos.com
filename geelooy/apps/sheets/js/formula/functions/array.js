//B"H
//Boruch Hashem
//Blessed is He

import { functionDescriptor } from "./helpers.js";
import {
	chooseColumns,
	chooseRows,
	drop,
	filterRows,
	horizontalStack,
	sequence,
	sortRows,
	take,
	transpose,
	unique,
	verticalStack
} from "./arrayTransforms.js";

/**
 * @file Registers bounded dynamic-array functions shared by modern Excel and Google Sheets.
 * @description The Awtsmoos lets one formula unfold into rows and columns through measured light;
 * Awtsmoos.com keeps every public array name declarative while transformations live in smaller vessels aright.
 */
export const arrayFunctions = Object.freeze([
	descriptor(
		"UNIQUE",
		"UNIQUE(range)",
		"Returns distinct rows from a range.",
		"=UNIQUE(A1:B20)",
		unique
	),
	descriptor(
		"SORT",
		"SORT(range,column,ascending)",
		"Sorts rows by one column.",
		"=SORT(A1:C20,2,TRUE)",
		sortRows
	),
	descriptor(
		"FILTER",
		"FILTER(range,include,ifEmpty)",
		"Filters rows using aligned boolean values.",
		"=FILTER(A1:C20,D1:D20)",
		filterRows
	),
	descriptor(
		"TRANSPOSE",
		"TRANSPOSE(range)",
		"Swaps rows and columns.",
		"=TRANSPOSE(A1:C3)",
		transpose
	),
	descriptor(
		"SEQUENCE",
		"SEQUENCE(rows,columns,start,step)",
		"Generates a bounded numeric sequence array.",
		"=SEQUENCE(5,2,1,1)",
		sequence
	),
	descriptor(
		"TAKE",
		"TAKE(range,rows,columns)",
		"Returns leading or trailing rows and columns.",
		"=TAKE(A1:D20,5)",
		take
	),
	descriptor(
		"DROP",
		"DROP(range,rows,columns)",
		"Drops leading or trailing rows and columns.",
		"=DROP(A1:D20,1)",
		drop
	),
	descriptor(
		"CHOOSEROWS",
		"CHOOSEROWS(range,row1,…)",
		"Returns selected rows by one-based index.",
		"=CHOOSEROWS(A1:C20,1,3)",
		chooseRows
	),
	descriptor(
		"CHOOSECOLS",
		"CHOOSECOLS(range,col1,…)",
		"Returns selected columns by one-based index.",
		"=CHOOSECOLS(A1:F20,1,4)",
		chooseColumns
	),
	descriptor(
		"HSTACK",
		"HSTACK(array1,array2,…)",
		"Stacks arrays horizontally.",
		"=HSTACK(A1:B3,D1:E3)",
		horizontalStack
	),
	descriptor(
		"VSTACK",
		"VSTACK(array1,array2,…)",
		"Stacks arrays vertically.",
		"=VSTACK(A1:B3,A5:B7)",
		verticalStack
	)
]);

/** Creates one discoverable array-function descriptor. */
function descriptor(name, signature, description, example, execute) {
	return functionDescriptor(
		name,
		"Array",
		signature,
		description,
		example,
		execute
	);
}
