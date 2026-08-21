/* =========================================================
   FORM CONTACTO — envío JSON hacia send-cotizacion.php
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('formStatus');
  const originalButtonText = button ? button.innerHTML : '';

  const showStatus = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status is-${type}`;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    form.classList.remove('is-sent');
    form.classList.add('is-loading');

    if (button) button.innerHTML = 'Enviando solicitud...';
    if (status) {
      status.className = 'form-status';
      status.textContent = '';
    }

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      const rawResponse = await response.text();
      let result;

      try {
        result = rawResponse ? JSON.parse(rawResponse) : null;
      } catch (_) {
        throw new Error('El servidor no respondió en formato JSON. Revisa send-cotizacion.php.');
      }

      if (!response.ok || !result || !result.success) {
        throw new Error(result?.message || 'No se pudo enviar la solicitud.');
      }

      form.classList.remove('is-loading');
      form.classList.add('is-sent');
      if (button) button.innerHTML = 'Solicitud recibida ✓';
      showStatus(result.message, 'success');
      form.reset();

      setTimeout(() => {
        if (button) button.innerHTML = originalButtonText;
        form.classList.remove('is-sent');
        if (status) {
          status.className = 'form-status';
          status.textContent = '';
        }
      }, 6000);

    } catch (error) {
      form.classList.remove('is-loading');
      if (button) button.innerHTML = originalButtonText;
      showStatus(error.message || 'No se pudo enviar la solicitud. Inténtalo nuevamente.', 'error');
    }
  });
});
