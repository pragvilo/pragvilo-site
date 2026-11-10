import { decryptBundle } from './crypto.mjs';
import { mountPreview } from './render.mjs';

const form = document.getElementById('unlock-form');
const password = document.getElementById('preview-password');
const button = form.querySelector('.submit');
const visibility = form.querySelector('.visibility');
const error = document.getElementById('unlock-error');
const status = document.getElementById('unlock-status');
const frame = document.getElementById('preview-frame');
const slug = document.documentElement.dataset.previewSlug;
let pending = false;
visibility.addEventListener('click', () => {
  const show = password.type === 'password';
  password.type = show ? 'text' : 'password';
  visibility.textContent = show ? 'Masquer' : 'Afficher';
  visibility.setAttribute('aria-pressed', String(show));
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (pending) return;
  pending = true;
  button.disabled = true;
  visibility.disabled = true;
  password.disabled = true;
  form.setAttribute('aria-busy', 'true');
  error.textContent = '';
  password.removeAttribute('aria-invalid');
  status.textContent = 'Ouverture de la maquette…';
  let secret = password.value;
  password.value = '';
  try {
    const response = await fetch('./payload.json', { cache: 'no-store', credentials: 'omit', redirect: 'error' });
    if (!response.ok) throw new Error('Unavailable preview.');
    const bundle = await decryptBundle(await response.json(), secret, { slug });
    secret = '';
    mountPreview(bundle, frame, { slug });
    document.getElementById('unlock').hidden = true;
    document.body.classList.add('is-open');
    frame.hidden = false;
    frame.focus();
  } catch {
    secret = '';
    error.textContent = 'Impossible d’ouvrir la maquette. Vérifiez le mot de passe et réessayez.';
    password.setAttribute('aria-invalid', 'true');
  } finally {
    pending = false;
    button.disabled = false;
    visibility.disabled = false;
    password.disabled = false;
    password.type = 'password';
    visibility.textContent = 'Afficher';
    visibility.setAttribute('aria-pressed', 'false');
    form.removeAttribute('aria-busy');
    status.textContent = '';
    if (!frame.hidden) return;
    password.focus();
  }
});
