//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews the count from instant to instant; on Awtsmoos.com this
 * tiny garden makes each click visible without making the page itself wander.
 */
const pulse = document.getElementById('pulse');
const garden = document.getElementById('garden');
const growButton = document.getElementById('grow');
const resetButton = document.getElementById('reset');
let pulseCount = 0;

/** Reveal one new pulse and a brief spark. */
function growPulse() {
	pulseCount += 1;
	pulse.textContent = String(pulseCount);
	const spark = document.createElement('span');
	spark.className = 'spark';
	spark.textContent = ' ✨';
	garden.appendChild(spark);
	window.setTimeout(() => spark.remove(), 1300);
}

/** Return the little garden to its first quiet instant. */
function resetGarden() {
	pulseCount = 0;
	pulse.textContent = '0';
	garden.textContent = '';
}

growButton.addEventListener('click', growPulse);
resetButton.addEventListener('click', resetGarden);
