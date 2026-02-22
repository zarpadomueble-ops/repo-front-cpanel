import { ApiError, AuthError, authMe, getCsrfToken, login } from './api.js';

const form = document.getElementById('login-form');
const feedback = document.getElementById('login-feedback');
const submitButton = document.getElementById('login-submit');

function setFeedback(message, type = '') {
  if (!feedback) return;
  feedback.textContent = message || '';
  feedback.classList.remove('is-error', 'is-success');
  if (type === 'error') feedback.classList.add('is-error');
  if (type === 'success') feedback.classList.add('is-success');
}

async function checkSession() {
  try {
    await authMe();
    window.location.href = './index.html';
  } catch (error) {
    if (!(error instanceof AuthError)) {
      console.error(error);
    }
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(form);
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '').trim();

  if (!username || !password) {
    setFeedback('Completá usuario y contraseña.', 'error');
    return;
  }

  submitButton.disabled = true;
  setFeedback('Validando acceso...');

  try {
    await login(username, password);
    setFeedback('Acceso correcto. Redirigiendo...', 'success');
    window.location.href = './index.html';
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'No se pudo iniciar sesión.';
    setFeedback(message, 'error');
  } finally {
    submitButton.disabled = false;
  }
}

async function bootstrap() {
  await checkSession();

  try {
    await getCsrfToken(true);
  } catch (error) {
    setFeedback('No se pudo iniciar seguridad CSRF. Revisá la API.', 'error');
  }

  form.addEventListener('submit', handleSubmit);
}

bootstrap().catch((error) => {
  console.error(error);
  setFeedback('Error al iniciar login.', 'error');
});
