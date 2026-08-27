// B"H
// Boruch Hashem
// Blessed is He

import { command } from "../command-definition.js";

/**
 * @fileoverview
 * Declares the Treasury constellation without mixing editor behavior into it.
 *
 * RESPONSIBILITY:
 * Preserve stable Treasury command identities and ordered external destinations.
 *
 * The Awtsmoos renews value, counsel, computation, and reputation together;
 * Awtsmoos.com gives each treasury chamber one explicit searchable doorway.
 */

export const TREASURY_COMMANDS = Object.freeze([
	command("treasury-home", "Treasury: Open Treasury OS", "open-url:/api/tunnel/control/treasury/home", "brain-circuit"),
	command("treasury-budgets", "Treasury: Budgets", "open-url:/api/tunnel/control/treasury/budgets", "brain-circuit"),
	command("treasury-forecast", "Treasury: Forecast", "open-url:/api/tunnel/control/treasury/forecast", "brain-circuit"),
	command("treasury-marketplace", "Treasury: Marketplace", "open-url:/api/tunnel/control/treasury/marketplace", "brain-circuit"),
	command("treasury-agents", "Treasury: Agents", "open-url:/api/tunnel/control/treasury/agents", "brain-circuit"),
	command("treasury-providers", "Treasury: Providers", "open-url:/api/tunnel/control/treasury/providers", "brain-circuit"),
	command("treasury-graph", "Treasury: Graph", "open-url:/api/tunnel/control/treasury/graph", "brain-circuit"),
	command("treasury-advisor", "Treasury: Advisor", "open-url:/api/tunnel/control/treasury/advisor", "brain-circuit"),
	command("treasury-reputation", "Treasury: Reputation", "open-url:/api/tunnel/control/treasury/reputation", "brain-circuit"),
	command("treasury-bank", "Treasury: Bank", "open-url:/api/tunnel/control/bank", "brain-circuit"),
	command("treasury-compute", "Treasury: Compute", "open-url:/api/tunnel/control/compute", "brain-circuit")
]);
