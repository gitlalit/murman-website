/* Murman test copy: edit mode. Loaded on /test/ pages only. Never shipped to the main site. */
(function () {
  'use strict';
  var meta = document.querySelector('meta[name="murman-build"]');
  var BUILD = meta ? meta.content : '';
  var PAGE = location.pathname.replace(/index\.html$/, '');
  var FRAME = /[?&]frame=1/.test(location.search);
  var ON_KEY = 'murman-edit-on', BUILD_KEY = 'murman-edit-build';
  var DB = null, ON = false, ORIG = {}, timers = {}, bar = null, pill = null, count = 0;
  var PT = (function () { var d = document.createElement('div'); try { d.contentEditable = 'plaintext-only'; return d.contentEditable === 'plaintext-only'; } catch (e) { return false; } })();

  /* ---------- storage ---------- */
  function openDB() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open('murman-edit', 1);
      r.onupgradeneeded = function () { var d = r.result; ['text', 'img', 'added'].forEach(function (s) { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s); }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function wrap(r) { return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function put(s, k, v) { return wrap(DB.transaction(s, 'readwrite').objectStore(s).put(v, k)); }
  function del(s, k) { return wrap(DB.transaction(s, 'readwrite').objectStore(s).delete(k)); }
  function clear(s) { return wrap(DB.transaction(s, 'readwrite').objectStore(s).clear()); }
  function all(s) { return wrap(DB.transaction(s, 'readonly').objectStore(s).getAll()); }
  function recount() {
    return Promise.all([all('text'), all('img'), all('added')]).then(function (r) {
      count = r[0].length + r[1].length + r[2].length; paint(); return r;
    });
  }

  /* ---------- styles ---------- */
  var CSS = [
    'body.me-on{padding-bottom:4.5rem}',
    'body.me-on main [data-e]{outline:1px dashed transparent;outline-offset:4px;border-radius:2px;cursor:text;transition:outline-color .12s}',
    'body.me-on main [data-e]:hover{outline-color:#B8987F}',
    'body.me-on main [data-e]:focus{outline:2px solid #B8987F}',
    'body.me-on main [data-e].me-changed{box-shadow:-4px 0 0 #B8987F}',
    'body.me-on main a{cursor:text}',
    'body.me-on .slot{cursor:pointer;position:relative}',
    'body.me-on .slot:hover,body.me-on .slot.me-over{border-color:#004AAD;background:#DCE7F5}',
    '.me-hint{display:block;margin-top:.75rem;font:600 .8125rem/1.4 "DM Sans",system-ui,sans-serif;color:#004AAD}',
    '.shot{position:relative}',
    '.me-tools{display:none;gap:.5rem;flex-wrap:wrap;align-items:center;margin-top:.5rem;font:500 .8125rem/1.3 "DM Sans",system-ui,sans-serif}',
    'body.me-on .me-tools{display:flex}',
    '.me-tools input{flex:1 1 12rem;min-width:0;font:inherit;padding:.45rem .6rem;border:1px solid #D7D9E5;border-radius:4px;color:#111;background:#fff}',
    '.me-btn{font:600 .8125rem/1 "DM Sans",system-ui,sans-serif;padding:.55rem .75rem;border-radius:4px;border:1px solid #070F5A;background:#fff;color:#070F5A;cursor:pointer;white-space:nowrap}',
    '.me-btn:hover{background:#F2ECE8}',
    '.me-btn.pri{background:#B8987F;border-color:#B8987F;color:#070F5A}',
    '.me-btn.on{background:#070F5A;color:#fff}',
    '.me-add{display:none;grid-column:1/-1;width:100%;margin-top:2rem;padding:.9rem;border:2px dashed #B8987F;border-radius:4px;background:transparent;color:inherit;font:600 .875rem/1.2 "DM Sans",system-ui,sans-serif;cursor:pointer;opacity:.75}',
    '.me-add:hover{opacity:1;border-color:#004AAD}',
    'body.me-on .me-add{display:block}',
    '.shot figcaption[contenteditable]:empty::before{content:"Caption (optional)";opacity:.55}',
    'body:not(.me-on) .shot figcaption:empty{display:none}',
    '#me-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;padding:.7rem max(1rem,env(safe-area-inset-left,0px));background:#070F5A;color:#fff;font:500 .875rem/1.3 "DM Sans",system-ui,sans-serif;box-shadow:0 -6px 24px rgba(7,15,90,.25)}',
    '#me-bar b{font-weight:700}#me-bar .sp{flex:1 1 auto}#me-bar .me-btn{border-color:#C8CADB}',
    '#me-bar .note{color:#C8CADB;font-size:.8125rem}',
    '#me-pill{position:fixed;left:1rem;bottom:1rem;z-index:2147483000;font:600 .875rem/1 "DM Sans",system-ui,sans-serif;padding:.8rem 1rem;border-radius:999px;border:0;background:#070F5A;color:#fff;cursor:pointer;box-shadow:0 6px 20px rgba(7,15,90,.3)}',
    '#me-pill span{color:#DFD1C5;font-weight:500}',
    '#me-phone{position:fixed;inset:0;z-index:2147483001;background:rgba(7,15,90,.82);display:grid;place-items:center;padding:1rem}',
    '#me-phone .box{display:grid;gap:.6rem;justify-items:center;max-height:100%}',
    '#me-phone iframe{width:390px;max-width:100%;height:min(780px,calc(100vh - 6rem));border:0;border-radius:18px;background:#fff}',
    '#me-toast{position:fixed;left:50%;bottom:5.5rem;transform:translateX(-50%);z-index:2147483002;background:#fff;color:#070F5A;border:1px solid #070F5A;border-radius:6px;padding:.75rem 1rem;font:600 .875rem/1.4 "DM Sans",system-ui,sans-serif;max-width:min(34rem,90vw);box-shadow:0 8px 28px rgba(7,15,90,.25)}',
    '@media (max-width:640px){#me-bar .note{display:none}}'
  ].join('\n');

  /* ---------- small helpers ---------- */
  function el(tag, props, kids) {
    var n = document.createElement(tag), k;
    for (k in (props || {})) { if (k === 'text') n.textContent = props[k]; else if (k in n) n[k] = props[k]; else n.setAttribute(k, props[k]); }
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function toast(msg, ms) {
    var t = document.getElementById('me-toast'); if (t) t.remove();
    t = el('div', { id: 'me-toast', text: msg }); t.setAttribute('role', 'status'); document.body.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.remove(); }, ms || 5000);
  }
  function tkey(e) { return PAGE + '|' + e; }

  /* ---------- text ---------- */
  function saveText(node) {
    var e = node.getAttribute('data-e'), html = node.innerHTML;
    var p = (html === ORIG[e]) ? del('text', tkey(e)) : put('text', tkey(e), { page: PAGE, e: +e, before: ORIG[e], after: html });
    node.classList.toggle('me-changed', html !== ORIG[e]);
    return p.then(recount);
  }
  function flush() {
    var ps = [];
    Object.keys(timers).forEach(function (e) {
      clearTimeout(timers[e]); delete timers[e];
      var n = document.querySelector('main [data-e="' + e + '"]'); if (n) ps.push(saveText(n));
    });
    return Promise.all(ps);
  }
  function wireText(on) {
    [].forEach.call(document.querySelectorAll('main [data-e]'), function (n) {
      if (on) { n.contentEditable = PT ? 'plaintext-only' : 'true'; n.spellcheck = true; }
      else { n.removeAttribute('contenteditable'); }
    });
    if (on) [].forEach.call(document.querySelectorAll('main details'), function (d) { d.open = true; });
  }
  function onInput(ev) {
    var n = ev.target.closest && ev.target.closest('main [data-e]'); if (!n || !ON) return;
    var e = n.getAttribute('data-e');
    clearTimeout(timers[e]);
    timers[e] = setTimeout(function () { delete timers[e]; saveText(n); }, 350);
  }
  function onKey(ev) {
    if (!ON) return;
    var n = ev.target.closest && ev.target.closest('main [data-e]'); if (!n) return;
    if (ev.key === 'Enter') { ev.preventDefault(); n.blur(); }
    if (ev.key === ' ' && ev.target.closest('summary')) { ev.preventDefault(); document.execCommand('insertText', false, ' '); }
  }
  function onPaste(ev) {
    if (!ON || PT) return;
    var n = ev.target.closest && ev.target.closest('main [data-e]'); if (!n) return;
    ev.preventDefault();
    document.execCommand('insertText', false, (ev.clipboardData || window.clipboardData).getData('text/plain').replace(/\s*\n\s*/g, ' '));
  }
  function onClick(ev) {
    if (!ON) return;
    var t = ev.target;
    if (t.closest('#me-bar,#me-phone,.me-tools,.me-add')) return;
    if (t.closest('main') && (t.closest('a') || t.closest('summary'))) ev.preventDefault();
  }

  /* ---------- pictures ---------- */
  function prep(file) {
    if (!/^image\//.test(file.type)) return Promise.reject(new Error('That file is not a picture. Use a JPG, PNG, WebP or SVG file.'));
    if (file.type === 'image/svg+xml') return Promise.resolve({ blob: file, type: file.type, w: 0, h: 0, name: file.name });
    return createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bm) {
      var sc = Math.min(1, 2000 / bm.width), w = Math.round(bm.width * sc), h = Math.round(bm.height * sc);
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      function enc(type, bg) {
        var g = c.getContext('2d'); g.clearRect(0, 0, w, h);
        if (bg) { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); }
        g.drawImage(bm, 0, 0, w, h);
        return new Promise(function (res) { c.toBlob(function (b) { res({ blob: b, type: type, w: w, h: h, name: file.name }); }, type, 0.86); });
      }
      if (file.type === 'image/png') return enc('image/png', false).then(function (r) { return r.blob.size > 1500000 ? enc('image/jpeg', true) : r; });
      return enc('image/jpeg', true);
    }, function () { throw new Error('This picture could not be read. Save it as JPG or PNG and try again.'); });
  }
  function choose(cb) {
    var i = el('input', { type: 'file', accept: 'image/*' }); i.className = 'me-file'; i.style.display = 'none';
    i.addEventListener('change', function () { if (i.files[0]) cb(i.files[0]); i.remove(); });
    document.body.appendChild(i); i.click();
  }
  function tools(fig, rec, store, key, extra) {
    var alt = el('input', { type: 'text', placeholder: 'Describe the picture in a few words', value: rec.alt || '' });
    alt.setAttribute('aria-label', 'Picture description');
    alt.addEventListener('input', function () { rec.alt = alt.value; fig.querySelector('img').alt = alt.value; put(store, key, rec); });
    var rep = el('button', { type: 'button', className: 'me-btn', text: 'Replace' });
    rep.addEventListener('click', function () { choose(function (f) { prep(f).then(function (r) { rec.blob = r.blob; rec.type = r.type; rec.w = r.w; rec.h = r.h; rec.name = r.name; fig.querySelector('img').src = URL.createObjectURL(r.blob); return put(store, key, rec); }).catch(function (e) { toast(e.message); }); }); });
    var rem = el('button', { type: 'button', className: 'me-btn', text: 'Remove' });
    rem.addEventListener('click', function () { del(store, key).then(function () { if (fig._slot) { fig.className = fig._slot.cls; fig.innerHTML = fig._slot.html; hint(fig); } else fig.remove(); recount(); }); });
    var box = el('div', { className: 'me-tools' }, [alt].concat(extra || [], [rep, rem]));
    fig.appendChild(box);
  }
  function fillSlot(fig, rec) {
    if (!fig._slot) fig._slot = { cls: fig.className, html: fig.innerHTML.replace(/<span class="me-hint">.*?<\/span>/, '') };
    fig.className = 'shot'; fig.innerHTML = '';
    fig.appendChild(el('img', { src: URL.createObjectURL(rec.blob), alt: rec.alt || '' }));
    tools(fig, rec, 'img', rec.slot);
  }
  function takeSlot(fig, file) {
    var id = fig.getAttribute('data-slot'), title = (fig._slot ? '' : (fig.querySelector('span') || {}).textContent) || '';
    prep(file).then(function (r) {
      var rec = { slot: id, blob: r.blob, type: r.type, w: r.w, h: r.h, name: r.name, alt: title };
      return put('img', id, rec).then(function () {
        [].forEach.call(document.querySelectorAll('[data-slot="' + id + '"]'), function (f) { fillSlot(f, rec); });
        recount();
      });
    }).catch(function (e) { toast(e.message); });
  }
  function hint(fig) {
    if (fig.querySelector('.me-hint')) return;
    var d = fig.querySelector('div') || fig;
    d.appendChild(el('span', { className: 'me-hint', text: 'Drop a picture here, or click to choose one' }));
  }
  function wireSlots() {
    [].forEach.call(document.querySelectorAll('figure.slot[data-slot]'), hint);
    document.addEventListener('click', function (ev) {
      if (!ON) return; var f = ev.target.closest && ev.target.closest('figure.slot[data-slot]'); if (!f) return;
      choose(function (file) { takeSlot(f, file); });
    });
    document.addEventListener('dragover', function (ev) {
      if (!ON) return; var f = ev.target.closest && ev.target.closest('figure.slot[data-slot]');
      [].forEach.call(document.querySelectorAll('.me-over'), function (x) { if (x !== f) x.classList.remove('me-over'); });
      if (f) { ev.preventDefault(); f.classList.add('me-over'); }
    });
    document.addEventListener('drop', function (ev) {
      if (!ON) return; var f = ev.target.closest && ev.target.closest('figure.slot[data-slot]');
      if (!f) return; ev.preventDefault(); f.classList.remove('me-over');
      var file = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]; if (file) takeSlot(f, file);
    });
  }
  function showAdded(rec) {
    var sec = document.querySelector('main > section[data-s="' + rec.s + '"]'); if (!sec) return;
    var host = sec.querySelector('.wrap') || sec, add = host.querySelector(':scope > .me-add');
    var fig = el('figure', { className: 'shot added' + (rec.size === 'half' ? ' half' : '') }); fig.setAttribute('data-slot', rec.id);
    fig.appendChild(el('img', { src: URL.createObjectURL(rec.blob), alt: rec.alt || '' }));
    var cap = el('figcaption', { text: rec.caption || '' });
    cap.addEventListener('input', function () { rec.caption = cap.textContent.trim(); put('added', rec.id, rec); });
    cap.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); cap.blur(); } });
    fig.appendChild(cap); fig._cap = cap;
    var size = el('button', { type: 'button', className: 'me-btn', text: rec.size === 'half' ? 'Make full width' : 'Make half width' });
    size.addEventListener('click', function () { rec.size = rec.size === 'half' ? 'full' : 'half'; fig.classList.toggle('half', rec.size === 'half'); size.textContent = rec.size === 'half' ? 'Make full width' : 'Make half width'; put('added', rec.id, rec); });
    tools(fig, rec, 'added', rec.id, [size]);
    if (add) host.insertBefore(fig, add); else host.appendChild(fig);
    if (ON) cap.contentEditable = PT ? 'plaintext-only' : 'true';
  }
  function wireAdd() {
    [].forEach.call(document.querySelectorAll('main > section[data-s]'), function (sec) {
      if (sec.classList.contains('cta')) return;
      var host = sec.querySelector('.wrap') || sec;
      var b = el('button', { type: 'button', className: 'me-add', text: '+ Add a picture to this section' });
      b.addEventListener('click', function () {
        choose(function (file) {
          prep(file).then(function (r) {
            var rec = { id: 'A-' + Date.now().toString(36), page: PAGE, s: +sec.getAttribute('data-s'), size: 'full', caption: '', alt: '', blob: r.blob, type: r.type, w: r.w, h: r.h, name: r.name };
            return put('added', rec.id, rec).then(function () { showAdded(rec); recount(); });
          }).catch(function (e) { toast(e.message); });
        });
      });
      host.appendChild(b);
    });
  }

  /* ---------- zip (stored, no compression) ---------- */
  var CRC = (function () { var t = [], n, c, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF, i; for (i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(entries) {
    var enc = new TextEncoder(), parts = [], central = [], off = 0;
    entries.forEach(function (e) {
      var name = enc.encode(e.name), crc = crc32(e.data), h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, 0, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, e.data.length, true);
      h.setUint32(22, e.data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, e.data);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true); c.setUint32(20, e.data.length, true); c.setUint32(24, e.data.length, true);
      c.setUint16(28, name.length, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), name);
      off += 30 + name.length + e.data.length;
    });
    var csize = central.reduce(function (a, b) { return a + b.length; }, 0), end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true);
    end.setUint32(12, csize, true); end.setUint32(16, off, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
  }
  function ext(type) { return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/svg+xml': 'svg', 'image/webp': 'webp' }[type] || 'jpg'; }
  function save() {
    return flush().then(recount).then(function (r) {
      if (!count) { toast('There are no changes to save yet.'); return; }
      var man = { site: 'murman-test', build: BUILD, saved_at: new Date().toISOString(), text: r[0], images: [], added: [] }, files = [], jobs = [];
      r[1].forEach(function (i) {
        var f = 'images/' + i.slot + '.' + ext(i.type);
        man.images.push({ slot: i.slot, file: f, alt: i.alt || '', w: i.w, h: i.h, name: i.name });
        jobs.push(i.blob.arrayBuffer().then(function (b) { files.push({ name: f, data: new Uint8Array(b) }); }));
      });
      r[2].forEach(function (a) {
        var f = 'images/' + a.id + '.' + ext(a.type);
        man.added.push({ id: a.id, page: a.page, s: a.s, size: a.size, caption: a.caption || '', alt: a.alt || '', file: f, w: a.w, h: a.h, name: a.name });
        jobs.push(a.blob.arrayBuffer().then(function (b) { files.push({ name: f, data: new Uint8Array(b) }); }));
      });
      return Promise.all(jobs).then(function () {
        files.unshift({ name: 'edits.json', data: new TextEncoder().encode(JSON.stringify(man, null, 1)) });
        var d = new Date(), p = function (n) { return ('0' + n).slice(-2); };
        var name = 'murman-edits-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + '.zip';
        var a = el('a', { href: URL.createObjectURL(zip(files)), download: name }); document.body.appendChild(a); a.click(); a.remove();
        toast('Saved ' + name + ' to your Downloads folder. Send that file to Claude in the chat to put the changes on the test site.', 9000);
      });
    });
  }

  /* ---------- chrome ---------- */
  function paint() {
    if (FRAME) return;
    if (pill) pill.innerHTML = 'Edit this page' + (count ? ' <span>&middot; ' + count + ' unsaved</span>' : '');
    var c = document.getElementById('me-count'); if (c) c.textContent = count === 1 ? '1 change' : count + ' changes';
  }
  function setOn(on) {
    ON = on; try { localStorage.setItem(ON_KEY, on ? '1' : ''); } catch (e) {}
    document.body.classList.toggle('me-on', on); document.body.classList.toggle('show-slots', on);
    wireText(on && !!document.querySelector('main [data-e]'));
    [].forEach.call(document.querySelectorAll('.shot.added figcaption'), function (c) { if (on) c.contentEditable = PT ? 'plaintext-only' : 'true'; else c.removeAttribute('contenteditable'); });
    if (bar) bar.hidden = !on; if (pill) pill.hidden = on; if (bar) bar.style.display = on ? '' : 'none';
    paint();
  }
  function phone() {
    flush().then(function () {
      var close = el('button', { type: 'button', className: 'me-btn', text: 'Close phone view' });
      var f = el('iframe', { src: location.pathname + '?frame=1', title: 'Phone view' });
      var o = el('div', { id: 'me-phone' }, [el('div', { className: 'box' }, [f, close])]);
      close.addEventListener('click', function () { o.remove(); });
      o.addEventListener('click', function (ev) { if (ev.target === o) o.remove(); });
      document.body.appendChild(o);
    });
  }
  function chrome() {
    pill = el('button', { id: 'me-pill', type: 'button' }); pill.addEventListener('click', function () { setOn(true); });
    var note = document.querySelector('main [data-e]') ? 'Click any text to change it. Use the top menu to move between pages.' : 'The calculator page cannot be edited here. Tell Claude what to change.';
    var bPhone = el('button', { type: 'button', className: 'me-btn', text: 'Phone view' }); bPhone.addEventListener('click', phone);
    var bSave = el('button', { type: 'button', className: 'me-btn pri', text: 'Save changes' }); bSave.addEventListener('click', save);
    var bUndo = el('button', { type: 'button', className: 'me-btn', text: 'Undo all' });
    bUndo.addEventListener('click', function () {
      if (bUndo.dataset.arm !== '1') { bUndo.dataset.arm = '1'; bUndo.textContent = 'Click again to undo all'; setTimeout(function () { bUndo.dataset.arm = ''; bUndo.textContent = 'Undo all'; }, 4000); return; }
      Promise.all([clear('text'), clear('img'), clear('added')]).then(function () { location.reload(); });
    });
    var bExit = el('button', { type: 'button', className: 'me-btn', text: 'Exit' }); bExit.addEventListener('click', function () { flush().then(function () { setOn(false); }); });
    bar = el('div', { id: 'me-bar' }, [el('b', { text: 'Editing the test copy' }), el('span', { id: 'me-count', text: '0 changes' }), el('span', { className: 'note', text: note }), el('span', { className: 'sp' }), bPhone, bUndo, bSave, bExit]);
    bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Edit mode');
    document.body.appendChild(pill); document.body.appendChild(bar);
  }

  /* ---------- start ---------- */
  function start() {
    document.head.appendChild(el('style', { text: CSS }));
    [].forEach.call(document.querySelectorAll('main [data-e]'), function (n) { ORIG[n.getAttribute('data-e')] = n.innerHTML; });
    openDB().then(function (d) {
      DB = d;
      var prev = ''; try { prev = localStorage.getItem(BUILD_KEY) || ''; localStorage.setItem(BUILD_KEY, BUILD); } catch (e) {}
      /* 13 Nov 2026: the home page gained a cover section at the top, so pictures added there move down one section */
      if (prev === 'cb543068b1') return all('added').then(function (r) { return Promise.all(r.filter(function (a) { return a.page === '/test/'; }).map(function (a) { a.s += 1; return put('added', a.id, a); })); });
    }).then(function () { return Promise.all([all('text'), all('img'), all('added')]); }).then(function (r) {
      /* text edits are matched to their block by its original content, so they survive a site update */
      var mine = r[0].filter(function (t) { return t.page === PAGE; }), lost = 0, keep = [], jobs = [];
      mine.forEach(function (t) {
        var old = t.e;
        if (ORIG[t.e] !== t.before) {
          var hits = Object.keys(ORIG).filter(function (k) { return ORIG[k] === t.before; });
          t.e = hits.length === 1 ? +hits[0] : -1;
        }
        if (t.e !== old) jobs.push(del('text', tkey(old)));
        if (t.e < 0) lost++; else keep.push(t);
      });
      Promise.all(jobs).then(function () { keep.forEach(function (t) { put('text', tkey(t.e), t); }); if (jobs.length) recount(); });
      keep.forEach(function (t) { var n = document.querySelector('main [data-e="' + t.e + '"]'); if (n) { n.innerHTML = t.after; n.classList.add('me-changed'); } });
      if (lost && !FRAME) setTimeout(function () { toast(lost + (lost === 1 ? ' unsaved text edit' : ' unsaved text edits') + ' on this page could not be kept, because that text was changed on the site.', 8000); }, 600);
      r[0] = r[0].filter(function (t) { return t.page !== PAGE || t.e >= 0; });
      if (!FRAME) { wireSlots(); wireAdd(); }
      r[1].forEach(function (i) { [].forEach.call(document.querySelectorAll('figure[data-slot="' + i.slot + '"]'), function (f) { fillSlot(f, i); }); });
      r[2].forEach(function (a) { if (a.page === PAGE) showAdded(a); });
      count = r[0].length + r[1].length + r[2].length;
      if (FRAME) return;
      chrome();
      document.addEventListener('input', onInput); document.addEventListener('keydown', onKey);
      document.addEventListener('paste', onPaste); document.addEventListener('click', onClick, true);
      window.addEventListener('pagehide', flush);
      document.addEventListener('focusout', function (ev) { if (ON && ev.target.closest && ev.target.closest('main [data-e]')) flush(); });
      var on = false; try { on = localStorage.getItem(ON_KEY) === '1'; } catch (e) {}
      if (/[?&]edit=1/.test(location.search)) on = true;
      setOn(on);
    }).catch(function (e) { if (window.console) console.error('[murman-edit]', e); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
