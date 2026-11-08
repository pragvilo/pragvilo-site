const origin = 'https://preview.invalid/';
const own = (value, key) => Object.hasOwn(value, key);
const escapeAttribute = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function localUrl(href, page) {
  const url = new URL(href, origin + page);
  return url.origin === new URL(origin).origin ? url : null;
}
export function parseRoute(hash, pages) {
  const fallback = { page: 'index.html', search: '', hash: '' };
  if (!hash.startsWith('#/')) return fallback;
  try {
    const raw = hash.slice(2);
    const rawPath = raw.split(/[?#]/, 1)[0];
    if (!own(pages, rawPath)) return fallback;
    const url = localUrl(raw, 'index.html');
    return { page: rawPath, search: url.search, hash: url.hash };
  } catch { return fallback; }
}
export function routeForLink(href, page, pages) {
  try {
    const url = localUrl(href, page);
    const target = url?.pathname.slice(1);
    return target && own(pages, target) ? '#/' + target + url.search + url.hash : null;
  } catch { return null; }
}
function assetUrl(href, owner, assets) {
  if (/^(data:|blob:|#)/i.test(href)) return href;
  const url = localUrl(href, owner);
  if (!url) throw new Error('External resources are not accepted.');
  const result = assets.get(url.pathname.slice(1));
  if (!result) throw new Error('Missing resource: ' + url.pathname);
  return result + url.hash;
}
export function rewriteCss(css, owner, assets) {
  if (/@import\b/i.test(css)) throw new Error('CSS imports are not supported.');
  return css.replace(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/gi, (_, double, single, unquoted) => 'url("' + assetUrl((double ?? single ?? unquoted).trim(), owner, assets) + '")');
}
export function pageHtml(html, search, assetUrls = {}) {
  return html.replace(/<html\b[^>]*>/i, tag => tag.replace(/\sdata-preview-(?:search|assets)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '').replace(/>$/, ' data-preview-search="' + escapeAttribute(search) + '" data-preview-assets="' + escapeAttribute(JSON.stringify(assetUrls)) + '">'));
}

export function mountPreview(bundle, iframe, { slug } = {}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || '') || bundle.version !== 1 || !own(bundle.pages, 'index.html')) throw new Error('Invalid preview bundle.');
  const host = iframe.ownerDocument.defaultView;
  const assets = new Map();
  const urls = [];
  function blob(bytes, type) {
    const url = URL.createObjectURL(new Blob([bytes], { type }));
    urls.push(url); return url;
  }
  function bytes(asset) { return Uint8Array.from(atob(asset.base64), char => char.charCodeAt(0)); }
  for (const [name, asset] of Object.entries(bundle.assets)) {
    if (asset.mime !== 'text/css') assets.set(name, blob(bytes(asset), asset.mime));
  }
  for (const [name, asset] of Object.entries(bundle.assets)) {
    if (asset.mime === 'text/css') assets.set(name, blob(rewriteCss(new TextDecoder().decode(bytes(asset)), name, assets), 'text/css'));
  }
  let current;
  function render(route) {
    current = parseRoute(route, bundle.pages);
    // Inert attributes prevent even the parser from requesting clear resources.
    const inert = pageHtml(bundle.pages[current.page], current.search, Object.fromEntries(assets)).replace(/\b(src|href|srcset|poster)\s*=/gi, 'data-pv-$1=');
    const document = new host.DOMParser().parseFromString(inert, 'text/html');
    for (const element of document.querySelectorAll('[data-pv-src], [data-pv-href], [data-pv-poster], [data-pv-srcset]')) {
      for (const attribute of ['src', 'href', 'poster', 'srcset']) {
        const value = element.getAttribute('data-pv-' + attribute);
        if (value === null) continue;
        element.removeAttribute('data-pv-' + attribute);
        if (attribute === 'srcset') throw new Error('Responsive source lists are not supported.');
        if (element.tagName === 'A' && attribute === 'href') {
          const route = routeForLink(value, current.page, bundle.pages);
          if (route) { element.setAttribute('href', route); element.setAttribute('data-preview-route', route); }
          else {
            const local = localUrl(value, current.page);
            element.setAttribute('href', local ? assetUrl(value, current.page, assets) : value);
            if (!local && !/^https?:|^mailto:|^tel:/i.test(value)) throw new Error('Unsupported external link.');
            element.setAttribute('target', '_blank');
            element.setAttribute('rel', 'noopener noreferrer');
          }
        } else element.setAttribute(attribute, assetUrl(value, current.page, assets));
      }
    }
    for (const element of document.querySelectorAll('[style]')) element.setAttribute('style', rewriteCss(element.getAttribute('style'), current.page, assets));
    for (const style of document.querySelectorAll('style')) style.textContent = rewriteCss(style.textContent, current.page, assets);
    iframe.srcdoc = '<!doctype html>\n' + document.documentElement.outerHTML;
  }
  function navigate(route) {
    const parsed = parseRoute(route, bundle.pages);
    const hash = '#/' + parsed.page + parsed.search + parsed.hash;
    if (host.location.hash === hash) render(hash);
    else host.location.hash = hash;
  }
  const onHash = () => render(host.location.hash);
  const onLoad = () => {
    const document = iframe.contentDocument;
    if (!document) return;
    document.addEventListener('click', event => {
      const anchor = event.target.closest?.('a[data-preview-route]');
      if (!anchor) return;
      event.preventDefault();
      navigate(anchor.getAttribute('data-preview-route'));
    });
    if (current.hash) {
      let id;
      try { id = decodeURIComponent(current.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      target?.scrollIntoView();
      target?.focus({ preventScroll: true });
    }
    host.document.title = document.title;
  };
  iframe.addEventListener('load', onLoad);
  host.addEventListener('hashchange', onHash);
  render(host.location.hash);
  return { navigate, destroy() { host.removeEventListener('hashchange', onHash); iframe.removeEventListener('load', onLoad); iframe.srcdoc = ''; for (const url of urls) URL.revokeObjectURL(url); } };
}
