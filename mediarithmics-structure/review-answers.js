/* Review notes: an answer field in each numbered note, saved to Pragvilo's database and editable at any time. */
(() => {
  const URL_BASE = 'https://ojvlhvsgazatlulliqda.supabase.co/rest/v1';
  const KEY = 'sb_publishable_S9PWWIrzmvkcfCtAejsUAQ_ZzXo519N';
  const HEADERS = { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY };
  const page = location.pathname;

  const notes = [...document.querySelectorAll('.review-note')].map((el) => {
    const m = (el.getAttribute('aria-label') || '').match(/(\d+)\s*$/);
    return m ? { el, n: Number(m[1]) } : null;
  }).filter(Boolean);
  if (!notes.length) return;

  const time = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const fields = new Map();
  notes.forEach(({ el, n }) => {
    const box = document.createElement('div');
    box.className = 'note-answer';
    const id = 'note-answer-' + n;
    box.innerHTML = `<label for="${id}">Your answer to note ${n}</label><textarea id="${id}" rows="3" maxlength="4000" placeholder="Type your answer here"></textarea><span class="note-answer-status" aria-live="polite"></span>`;
    el.appendChild(box);
    const ta = box.querySelector('textarea');
    const status = box.querySelector('.note-answer-status');
    const grow = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; };
    let timer = null, saved = '';

    const save = () => {
      clearTimeout(timer);
      const value = ta.value;
      if (value === saved) return;
      status.textContent = 'Saving…';
      status.dataset.state = 'saving';
      fetch(URL_BASE + '/rpc/save_review_answer', {
        method: 'POST', headers: HEADERS,
        body: JSON.stringify({ p_note: n, p_page: page, p_reponse: value })
      }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then((t) => { saved = value; status.textContent = 'Saved ' + time(t); status.dataset.state = 'saved'; })
        .catch(() => { status.textContent = 'Not saved. Check your connection and try again.'; status.dataset.state = 'error'; });
    };

    ta.addEventListener('input', () => { grow(); status.textContent = ''; clearTimeout(timer); timer = setTimeout(save, 900); });
    ta.addEventListener('blur', save);
    fields.set(n, { ta, status, grow, set: (v, t) => { saved = v; ta.value = v; grow(); if (v) { status.textContent = 'Saved ' + time(t); status.dataset.state = 'saved'; } } });
  });

  const list = notes.map((x) => x.n).join(',');
  fetch(URL_BASE + '/review_note_answers?select=note,reponse,updated_at&projet=eq.mediarithmics&note=in.(' + list + ')', { headers: HEADERS })
    .then((r) => (r.ok ? r.json() : []))
    .then((rows) => rows.forEach((row) => { const f = fields.get(row.note); if (f && !f.ta.value) f.set(row.reponse, row.updated_at); }))
    .catch(() => {});
})();
