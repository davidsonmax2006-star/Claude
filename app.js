(function () {
  'use strict';

  var KEY = 'myplans';
  var VERSION = 1;

  var TEMPLATES = {
    blank: [],
    workout: ['Warm-up (5 min)', 'Squats 4 x 8', 'Bench press 4 x 8', 'Rows 3 x 10', 'Plank 3 x 45s', 'Stretch'],
    meals: ['Breakfast', 'Lunch', 'Snack', 'Dinner']
  };

  // ---------- state ----------
  var state = load();
  var currentPage = null; // page id, or null for home

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function emptyState() { return { version: VERSION, pages: [] }; }

  // Validate and normalise untrusted data (storage or imported file).
  function sanitize(raw) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.pages)) return null;
    var out = emptyState();
    raw.pages.forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      var page = { id: uid(), title: String(p.title == null ? '' : p.title).slice(0, 200) || 'Untitled', items: [] };
      (Array.isArray(p.items) ? p.items : []).forEach(function (it) {
        if (!it || typeof it !== 'object') return;
        page.items.push({ id: uid(), text: String(it.text == null ? '' : it.text).slice(0, 2000), done: it.done === true });
      });
      out.pages.push(page);
    });
    return out;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        // Keep ids from storage rather than regenerating them.
        var clean = sanitize(parsed);
        if (clean) {
          clean.pages.forEach(function (p, i) {
            var src = parsed.pages[i];
            if (src && typeof src.id === 'string') p.id = src.id;
            p.items.forEach(function (it, j) {
              var s = src && Array.isArray(src.items) ? src.items[j] : null;
              if (s && typeof s.id === 'string') it.id = s.id;
            });
          });
          return clean;
        }
      }
    } catch (e) { /* fall through */ }
    return emptyState();
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      toast("Couldn't save. Storage may be full or blocked.");
    }
  }

  function findPage(id) {
    for (var i = 0; i < state.pages.length; i++) if (state.pages[i].id === id) return state.pages[i];
    return null;
  }

  function move(list, index, delta) {
    var to = index + delta;
    if (to < 0 || to >= list.length) return;
    var x = list.splice(index, 1)[0];
    list.splice(to, 0, x);
  }

  // ---------- DOM helpers (user text only ever goes through textContent) ----------
  function el(tag, props, children) {
    var n = document.createElement(tag);
    props = props || {};
    Object.keys(props).forEach(function (k) {
      if (props[k] == null) return;
      if (k === 'text') n.textContent = props[k];
      else if (k === 'class') n.className = props[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), props[k]);
      else n.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  var $view = document.getElementById('view');
  var $foot = document.getElementById('foot');
  var $title = document.getElementById('title');
  var $back = document.getElementById('back');
  var $menu = document.getElementById('menu');
  var $toast = document.getElementById('toast');
  var $file = document.getElementById('file');

  var toastTimer;
  function toast(msg) {
    $toast.textContent = msg;
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.classList.remove('show'); }, 2600);
  }

  // Promise-based modal. Resolves {value, data} or null if dismissed.
  // buttons: [{label, value, cls, primary}]  fields: [{name, value, placeholder, multiline}]
  function ask(opts) {
    return new Promise(function (resolve) {
      var dlg = document.createElement('dialog');
      var form = el('form', { method: 'dialog' });
      var inputs = {};
      var result = null;
      form.appendChild(el('h2', { text: opts.title }));
      if (opts.message) form.appendChild(el('p', { text: opts.message }));
      (opts.fields || []).forEach(function (f) {
        var input = el(f.multiline ? 'textarea' : 'input', { placeholder: f.placeholder || '', 'aria-label': f.placeholder || f.name });
        input.value = f.value || '';
        inputs[f.name] = input;
        form.appendChild(input);
      });
      var actions = el('div', { class: opts.stack ? 'opts' : 'actions' });
      var primaryBtn = null;
      (opts.buttons || []).forEach(function (b) {
        var btn = el('button', { type: 'button', class: 'btn ' + (b.cls || ''), text: b.label });
        btn.addEventListener('click', function () {
          if (b.onClick) b.onClick(); // runs inside the tap so iOS allows share/clipboard/file picker
          var data = {};
          Object.keys(inputs).forEach(function (k) { data[k] = inputs[k].value; });
          result = { value: b.value, data: data };
          dlg.close();
        });
        if (b.primary && !primaryBtn) primaryBtn = btn;
        actions.appendChild(btn);
      });
      form.appendChild(actions);
      form.addEventListener('submit', function (e) { e.preventDefault(); if (primaryBtn) primaryBtn.click(); });
      dlg.appendChild(form);
      dlg.addEventListener('close', function () { dlg.remove(); resolve(result); });
      document.body.appendChild(dlg);
      dlg.showModal();
      var first = dlg.querySelector('input, textarea');
      if (first) first.focus();
    });
  }

  function confirmDelete(what) {
    return ask({
      title: 'Delete?', message: what,
      buttons: [{ label: 'Cancel', value: 'no', cls: 'alt' }, { label: 'Delete', value: 'yes', cls: 'danger' }]
    }).then(function (r) { return !!r && r.value === 'yes'; });
  }

  // ---------- rendering ----------
  var footFor = null; // page id the add-item footer was built for

  function render() {
    var page = currentPage ? findPage(currentPage) : null;
    if (currentPage && !page) currentPage = null;
    $view.textContent = '';
    if (page) {
      renderPage(page);
      if (footFor !== page.id) buildAddForm(page); // keep the focused input alive between edits
    } else {
      $foot.textContent = '';
      footFor = null;
      renderHome();
    }
  }

  function renderHome() {
    $title.textContent = 'My Plans';
    $back.hidden = true;
    if (!state.pages.length) {
      $view.appendChild(el('div', { class: 'empty', text: 'Nothing here yet. Tap "New page" to make your first list, like a workout or meal plan.' }));
    }
    state.pages.forEach(function (p, i) {
      var left = p.items.filter(function (x) { return !x.done; }).length;
      $view.appendChild(el('div', { class: 'row' }, [
        el('button', { class: 'main', onclick: function () { openPage(p.id); } }, [
          el('span', { class: 'text', text: p.title }),
          el('span', { class: 'sub', text: p.items.length ? left + '/' + p.items.length : '' })
        ]),
        el('button', { class: 'ib', 'aria-label': 'Edit page', text: '✎', onclick: function () { editPage(p); } }),
        el('button', { class: 'ib', 'aria-label': 'Move up', text: '↑', disabled: i === 0 ? 'disabled' : null, onclick: function () { move(state.pages, i, -1); save(); render(); } }),
        el('button', { class: 'ib', 'aria-label': 'Move down', text: '↓', disabled: i === state.pages.length - 1 ? 'disabled' : null, onclick: function () { move(state.pages, i, 1); save(); render(); } })
      ]));
    });
    $foot.appendChild(el('button', { class: 'btn', style: 'flex:1', text: '+ New page', onclick: newPage }));
  }

  function renderPage(page) {
    $title.textContent = page.title;
    $back.hidden = false;
    if (!page.items.length) {
      $view.appendChild(el('div', { class: 'empty', text: 'Empty. Type below to add your first item.' }));
    }
    page.items.forEach(function (it, i) {
      $view.appendChild(el('div', { class: 'row' + (it.done ? ' done' : '') }, [
        el('button', { class: 'main', 'aria-pressed': it.done ? 'true' : 'false', onclick: function () { it.done = !it.done; save(); render(); } }, [
          el('span', { class: 'check', text: '✓' }),
          el('span', { class: 'text', text: it.text })
        ]),
        el('button', { class: 'ib', 'aria-label': 'Edit item', text: '✎', onclick: function () { editItem(page, it); } }),
        el('button', { class: 'ib', 'aria-label': 'Move up', text: '↑', disabled: i === 0 ? 'disabled' : null, onclick: function () { move(page.items, i, -1); save(); render(); } }),
        el('button', { class: 'ib', 'aria-label': 'Move down', text: '↓', disabled: i === page.items.length - 1 ? 'disabled' : null, onclick: function () { move(page.items, i, 1); save(); render(); } })
      ]));
    });
  }

  function buildAddForm(page) {
    footFor = page.id;
    $foot.textContent = '';
    var input = el('input', { type: 'text', placeholder: 'Add an item…', 'aria-label': 'New item', enterkeyhint: 'done', autocomplete: 'off' });
    var form = el('form', { style: 'display:flex;gap:8px;flex:1' }, [input, el('button', { class: 'btn', type: 'submit', text: 'Add' })]);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      page.items.push({ id: uid(), text: text.slice(0, 2000), done: false });
      input.value = '';
      save();
      render();
      window.scrollTo(0, document.body.scrollHeight);
    });
    $foot.appendChild(form);
  }

  // ---------- navigation ----------
  function openPage(id) {
    currentPage = id;
    history.pushState({ page: id }, '');
    window.scrollTo(0, 0);
    render();
  }

  $back.addEventListener('click', function () {
    if (history.state && history.state.page) history.back();
    else { currentPage = null; render(); }
  });

  window.addEventListener('popstate', function (e) {
    currentPage = e.state && e.state.page ? e.state.page : null;
    render();
  });

  // ---------- actions ----------
  function newPage() {
    ask({
      title: 'New page',
      fields: [{ name: 'title', placeholder: 'Name, e.g. Workout Plan' }],
      stack: true,
      buttons: [
        { label: 'Blank list', value: 'blank', primary: true },
        { label: 'Start from workout template', value: 'workout', cls: 'alt' },
        { label: 'Start from meal plan template', value: 'meals', cls: 'alt' },
        { label: 'Cancel', value: 'cancel', cls: 'alt' }
      ]
    }).then(function (r) {
      if (!r || r.value === 'cancel') return;
      var fallback = r.value === 'workout' ? 'Workout Plan' : r.value === 'meals' ? 'Meal Plan' : 'Untitled';
      var page = {
        id: uid(),
        title: r.data.title.trim().slice(0, 200) || fallback,
        items: TEMPLATES[r.value].map(function (t) { return { id: uid(), text: t, done: false }; })
      };
      state.pages.push(page);
      save();
      openPage(page.id);
    });
  }

  function editPage(page) {
    ask({
      title: 'Edit page',
      fields: [{ name: 'title', value: page.title, placeholder: 'Page name' }],
      buttons: [
        { label: 'Delete', value: 'delete', cls: 'danger' },
        { label: 'Cancel', value: 'cancel', cls: 'alt' },
        { label: 'Save', value: 'save', primary: true }
      ]
    }).then(function (r) {
      if (!r || r.value === 'cancel') return;
      if (r.value === 'delete') {
        return confirmDelete('Delete "' + page.title + '" and everything on it?').then(function (yes) {
          if (!yes) return;
          state.pages = state.pages.filter(function (p) { return p.id !== page.id; });
          save();
          render();
        });
      }
      var t = r.data.title.trim();
      if (t) page.title = t.slice(0, 200);
      save();
      render();
    });
  }

  function editItem(page, item) {
    ask({
      title: 'Edit item',
      fields: [{ name: 'text', value: item.text, placeholder: 'Item', multiline: true }],
      buttons: [
        { label: 'Delete', value: 'delete', cls: 'danger' },
        { label: 'Cancel', value: 'cancel', cls: 'alt' },
        { label: 'Save', value: 'save', primary: true }
      ]
    }).then(function (r) {
      if (!r || r.value === 'cancel') return;
      if (r.value === 'delete') {
        return confirmDelete('Delete this item?').then(function (yes) {
          if (!yes) return;
          page.items = page.items.filter(function (x) { return x.id !== item.id; });
          save();
          render();
        });
      }
      var t = r.data.text.trim();
      if (t) item.text = t.slice(0, 2000);
      save();
      render();
    });
  }

  // ---------- backup / restore ----------
  function backupJson() { return JSON.stringify(state, null, 2); }

  function exportBackup() {
    var json = backupJson();
    var name = 'my-plans-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    var file;
    try { file = new File([json], name, { type: 'application/json' }); } catch (e) { file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'My Plans backup' }).catch(function (e) {
        if (e && e.name !== 'AbortError') toast("Couldn't open the share sheet. Try 'Copy backup' instead.");
      });
    } else {
      downloadFallback(json, name);
    }
  }

  function downloadFallback(json, name) {
    var url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    var a = el('a', { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    toast('Backup saved');
  }

  function copyBackup() {
    var json = backupJson();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(function () { toast('Copied to clipboard'); }, function () { toast("Couldn't copy"); });
    } else {
      toast("Couldn't copy");
    }
  }

  function importFromText(text) {
    var parsed;
    try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
    var clean = sanitize(parsed);
    if (!clean) { toast("That doesn't look like a My Plans backup"); return; }
    var n = clean.pages.length;
    ask({
      title: 'Replace everything?',
      message: 'This replaces all your current pages with the ' + n + ' page' + (n === 1 ? '' : 's') + ' in this backup.',
      buttons: [{ label: 'Cancel', value: 'no', cls: 'alt' }, { label: 'Replace', value: 'yes', cls: 'danger' }]
    }).then(function (r) {
      if (!r || r.value !== 'yes') return;
      state = clean;
      currentPage = null;
      save();
      render();
      toast('Restored');
    });
  }

  $file.addEventListener('change', function () {
    var f = $file.files && $file.files[0];
    $file.value = '';
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () { importFromText(String(reader.result)); };
    reader.onerror = function () { toast("Couldn't read that file"); };
    reader.readAsText(f);
  });

  function pasteImport() {
    ask({
      title: 'Paste backup',
      message: 'Paste the JSON you copied earlier.',
      fields: [{ name: 'json', placeholder: 'Paste here', multiline: true }],
      buttons: [{ label: 'Cancel', value: 'no', cls: 'alt' }, { label: 'Continue', value: 'go', primary: true }]
    }).then(function (r) {
      if (r && r.value === 'go') importFromText(r.data.json);
    });
  }

  $menu.addEventListener('click', function () {
    var page = currentPage ? findPage(currentPage) : null;
    var buttons = [];
    if (page) buttons.push({ label: 'Uncheck all items', value: 'uncheck', cls: 'alt' });
    buttons.push(
      { label: 'Export backup', value: 'export', cls: 'alt', onClick: exportBackup },
      { label: 'Copy backup to clipboard', value: 'copy', cls: 'alt', onClick: copyBackup },
      { label: 'Import from file', value: 'import', cls: 'alt', onClick: function () { $file.click(); } },
      { label: 'Import from pasted text', value: 'paste', cls: 'alt' },
      { label: 'Close', value: 'close', cls: 'alt' }
    );
    ask({
      title: 'Menu',
      message: 'Your data lives only on this phone. Export a backup now and then.',
      stack: true,
      buttons: buttons
    }).then(function (r) {
      if (!r) return;
      if (r.value === 'uncheck' && page) { page.items.forEach(function (x) { x.done = false; }); save(); render(); }
      else if (r.value === 'paste') pasteImport();
    });
  });

  // ---------- boot ----------
  history.replaceState(null, '');
  render();

  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }
})();
