// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos carries one carefully validated signal from the browser into the real server mail river.

const form = document.querySelector('[data-contact-form]');
const status = document.querySelector('[data-contact-status]');
const startedAt = form?.elements.namedItem('startedAt');

if (startedAt) startedAt.value = String(Date.now());
if (form) form.addEventListener('submit', submitContact);

async function submitContact(event) {
	event.preventDefault();
	const button = form.querySelector('button[type="submit"]');
	button.disabled = true;
	status.textContent = 'Sending your signal…';

	try {
		const response = await fetch('/api/contact/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(Object.fromEntries(new FormData(form))),
			credentials: 'same-origin'
		});
		const result = await response.json();
		if (!response.ok || !result.ok) throw new Error(result.message || 'Could not send the message.');
		form.reset();
		startedAt.value = String(Date.now());
		status.textContent = `Signal received. Reference ${result.reference}.`;
		status.dataset.state = 'success';
	} catch (error) {
		status.textContent = error.message;
		status.dataset.state = 'error';
	} finally {
		button.disabled = false;
	}
}
