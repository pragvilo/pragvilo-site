const encoder = new TextEncoder();
const iterations = 600000;
const invalid = () => new Error('Invalid encrypted preview.');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exact = (value, names) => object(value) && Object.keys(value).sort().join(',') === names.slice().sort().join(',');
const validSlug = slug => typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80;

function encode(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(binary);
}
function decode(value, length) {
  if (typeof value !== 'string' || !value.length || value.length > 40 * 1024 * 1024 || value.length % 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw invalid();
  const bytes = Uint8Array.from(atob(value), char => char.charCodeAt(0));
  if ((length && bytes.length !== length) || encode(bytes) !== value) throw invalid();
  return bytes;
}
function checkPassword(password) {
  if (typeof password !== 'string' || [...password].length < 16 || encoder.encode(password).length > 1024) throw new Error('Use a password of at least 16 characters (maximum 1024 UTF-8 bytes).');
}
export function validatePayload(payload, { slug } = {}) {
  if (!validSlug(slug) || !exact(payload, ['version', 'slug', 'kdf', 'cipher', 'ciphertext']) || payload.version !== 1 || payload.slug !== slug || !exact(payload.kdf, ['name', 'hash', 'iterations', 'salt']) || payload.kdf.name !== 'PBKDF2' || payload.kdf.hash !== 'SHA-256' || payload.kdf.iterations !== iterations || !exact(payload.cipher, ['name', 'iv', 'tagLength']) || payload.cipher.name !== 'AES-GCM' || payload.cipher.tagLength !== 128) throw invalid();
  decode(payload.kdf.salt, 16);
  decode(payload.cipher.iv, 12);
  if (decode(payload.ciphertext).length < 17) throw invalid();
}
const aad = slug => encoder.encode('Pragvilo private preview|1|' + slug);
async function derive(password, salt, usage) {
  checkPassword(password);
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', iterations, salt }, material, { name: 'AES-GCM', length: 256 }, false, [usage]);
}
export async function encryptBundle(bundle, password, { slug } = {}) {
  checkPassword(password);
  if (!validSlug(slug) || !object(bundle) || bundle.version !== 1 || !object(bundle.pages) || !object(bundle.assets) || !Object.hasOwn(bundle.pages, bundle.entry)) throw invalid();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derive(password, salt, 'encrypt');
  const bytes = encoder.encode(JSON.stringify(bundle));
  if (bytes.length > 30 * 1024 * 1024) throw invalid();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength: 128, additionalData: aad(slug) }, key, bytes);
  return { version: 1, slug, kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations, salt: encode(salt) }, cipher: { name: 'AES-GCM', iv: encode(iv), tagLength: 128 }, ciphertext: encode(new Uint8Array(ciphertext)) };
}
export async function decryptBundle(payload, password, { slug } = {}) {
  validatePayload(payload, { slug });
  const key = await derive(password, decode(payload.kdf.salt, 16), 'decrypt');
  const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(payload.cipher.iv, 12), tagLength: 128, additionalData: aad(slug) }, key, decode(payload.ciphertext));
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}
