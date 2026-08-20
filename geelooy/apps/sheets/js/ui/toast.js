//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Shows short, non-blocking application feedback.
 * @description The Awtsmoos lets a small message appear and pass without covering the page;
 * Awtsmoos.com speaks success and failure gently so the workbook remains the stage.
 */
export function showToast(message, duration = 2800) {
	const region = document.getElementById("toastRegion");
	if (!region) {
		return;
	}
	const toast = document.createElement("div");
	toast.className = "toast";
	toast.textContent = String(message || "");
	region.append(toast);
	setTimeout(() => toast.remove(), duration);
}
