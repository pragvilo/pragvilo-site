/* Password screen for the mediarithmics review mockup. Loaded synchronously in <head> so nothing shows before unlock.
   Only a SHA-256 fingerprint of the password is stored here. Once entered, the browser remembers it. */
(() => {
  const HASH = '5e08407df941bba17b4d0d678ad5023572330c934c29ac645806f4489bd08f9d';
  const STORE = 'mics-review-access';
  const root = document.documentElement;
  try { if (localStorage.getItem(STORE) === HASH) return; } catch (e) {}

  root.classList.add('gate-locked');
  const style = document.createElement('style');
  style.textContent = `html.gate-locked body>*:not(#gate){display:none!important}
#gate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:16px;background:#061e44;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#061e44}
#gate form{width:100%;max-width:380px;background:#fff;border-radius:10px;padding:28px}
#gate h1{margin:0 0 6px;font-size:22px;line-height:1.2}
#gate p{margin:0 0 18px;color:#4F5168;font-size:15px}
#gate label{display:block;font-size:14px;font-weight:600;margin-bottom:6px}
#gate input{display:block;width:100%;box-sizing:border-box;padding:13px 14px;border:1.5px solid #B8BCCB;border-radius:6px;font:inherit;font-size:16px}
#gate input:focus{outline:3px solid #3A6BFF;outline-offset:1px;border-color:#061e44}
#gate button{margin-top:14px;width:100%;min-height:48px;border:0;border-radius:6px;background:#061e44;color:#fff;font:inherit;font-weight:700;cursor:pointer}
#gate .err{min-height:20px;margin:10px 0 0;color:#A3261B;font-size:14px;font-weight:600}`;
  document.head.appendChild(style);

  const sha = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');

  const mount = () => {
    const gate = document.createElement('div');
    gate.id = 'gate';
    gate.innerHTML = `<form novalidate><h1>mediarithmics · website review</h1><p>Private mockup prepared by Pragvilo. Enter the password Gilles sent you.</p><label for="gate-pw">Password</label><input id="gate-pw" type="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" required><button type="submit">Open the mockup</button><p class="err" role="alert"></p></form>`;
    document.body.appendChild(gate);
    const form = gate.querySelector('form');
    const input = gate.querySelector('input');
    const err = gate.querySelector('.err');
    input.focus();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      err.textContent = '';
      if (await sha(input.value.trim()) === HASH) {
        try { localStorage.setItem(STORE, HASH); } catch (x) {}
        gate.remove();
        root.classList.remove('gate-locked');
        window.dispatchEvent(new Event('resize'));
      } else {
        err.textContent = 'Wrong password. Please try again.';
        input.select();
      }
    });
  };
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
