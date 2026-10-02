// Built-in guides (Gym Plan, Meal Plan): renders data from content/*.js and keeps the
// user's progress (ticks, logged weights, shopping ticks) under its own storage key.
(function () {
  'use strict';

  var KEY = 'myplans.guides';
  var G = window.GUIDES || {};
  var ORDER = ['gym', 'meals'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var ID_RE = /^[a-z0-9_]{1,40}$/;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var KG_RE = /^\d{1,3}(\.\d{1,2})?$/;

  // ---------- dates (always local time, never UTC) ----------
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { var d = new Date(); return { key: dateKey(d), dow: d.getDay(), date: d }; }
  function niceDate(key) {
    var p = key.split('-');
    return parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1];
  }

  // ---------- stored progress ----------
  function emptyState() {
    return { version: 1, gym: { done: {}, weights: {} }, meals: { done: {}, shop: {} } };
  }

  // Validates untrusted data (storage or an imported backup). Old backups without guides give an empty state.
  function sanitize(raw) {
    var out = emptyState();
    if (!raw || typeof raw !== 'object') return out;
    var cutoff = dateKey(new Date(Date.now() - 14 * 86400000)); // drop old daily ticks
    ['gym', 'meals'].forEach(function (g) {
      var src = raw[g];
      if (!src || typeof src !== 'object') return;
      var done = src.done;
      if (done && typeof done === 'object') {
        Object.keys(done).slice(0, 60).forEach(function (d) {
          if (!DATE_RE.test(d) || d < cutoff || !done[d] || typeof done[d] !== 'object') return;
          var day = {};
          Object.keys(done[d]).slice(0, 80).forEach(function (id) {
            if (ID_RE.test(id) && done[d][id] === true) day[id] = true;
          });
          if (Object.keys(day).length) out[g].done[d] = day;
        });
      }
    });
    var w = raw.gym && raw.gym.weights;
    if (w && typeof w === 'object') {
      Object.keys(w).slice(0, 200).forEach(function (id) {
        var e = w[id];
        if (ID_RE.test(id) && e && typeof e === 'object' && KG_RE.test(String(e.kg)) && DATE_RE.test(String(e.date))) {
          out.gym.weights[id] = { kg: String(e.kg), date: String(e.date) };
        }
      });
    }
    var s = raw.meals && raw.meals.shop;
    if (s && typeof s === 'object') {
      Object.keys(s).slice(0, 200).forEach(function (id) { if (ID_RE.test(id) && s[id] === true) out.meals.shop[id] = true; });
    }
    return out;
  }

  var st = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return sanitize(JSON.parse(raw));
    } catch (e) { /* fall through */ }
    return emptyState();
  }

  var warned = false;
  function save(ctx) {
    try { localStorage.setItem(KEY, JSON.stringify(st)); }
    catch (e) { if (ctx && !warned) { warned = true; ctx.toast("Couldn't save. Storage may be full or blocked."); } }
  }

  // ---------- DOM helpers (all text goes through textContent) ----------
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

  // **bold** markers become <strong>, everything else stays plain text.
  function rich(node, text) {
    String(text).split(/\*\*(.+?)\*\*/g).forEach(function (part, i) {
      if (!part) return;
      node.appendChild(i % 2 ? el('strong', { text: part }) : document.createTextNode(part));
    });
    return node;
  }

  function para(text, cls) { return rich(el('p', { class: cls || 'gp' }), text); }

  function list(kind, items) {
    var l = el(kind, { class: 'gl' });
    items.forEach(function (t) { l.appendChild(rich(el('li'), t)); });
    return l;
  }

  // Tables become stacked rows so nothing scrolls sideways on a phone.
  function table(t) {
    var wrap = el('div', { class: 'gt' });
    var two = t.cols.length <= 2;
    t.rows.forEach(function (r) {
      var row = el('div', { class: 'gt-row' + (two ? ' two' : '') });
      if (two) {
        row.appendChild(el('span', { class: 'gt-k', text: r[0] }));
        row.appendChild(el('span', { class: 'gt-v', text: r[1] }));
      } else {
        row.appendChild(el('div', { class: 'gt-h', text: r[0] }));
        for (var i = 1; i < r.length; i++) {
          if (!r[i]) continue;
          row.appendChild(el('div', { class: 'gt-line' }, [
            el('span', { class: 'gt-k', text: t.cols[i] }),
            el('span', { class: 'gt-v', text: r[i] })
          ]));
        }
      }
      wrap.appendChild(row);
    });
    return wrap;
  }

  function blocks(parent, items) {
    items.forEach(function (b) {
      if (typeof b === 'string') parent.appendChild(para(b));
      else if (b.ul) parent.appendChild(list('ul', b.ul));
      else if (b.ol) parent.appendChild(list('ol', b.ol));
      else if (b.table) parent.appendChild(table(b.table));
    });
  }

  function accordion(title, fill, open, sub) {
    var body = el('div', { class: 'acc-body' });
    fill(body);
    var summary = el('summary', null, [el('span', { class: 'acc-t', text: title })]);
    if (sub) summary.appendChild(el('span', { class: 'acc-s', text: sub }));
    var d = el('details', { class: 'acc' }, [summary, body]);
    if (open) d.open = true;
    return d;
  }

  function sections(parent, items) {
    items.forEach(function (s) { parent.appendChild(accordion(s.title, function (b) { blocks(b, s.blocks); })); });
  }

  function chip(text, cls) { return el('span', { class: 'chip' + (cls ? ' ' + cls : ''), text: text }); }

  function checkBtn(done, label, onToggle) {
    var b = el('button', { class: 'gcheck', type: 'button', 'aria-pressed': done ? 'true' : 'false', 'aria-label': label, text: '✓' });
    b.addEventListener('click', function () {
      var now = onToggle();
      b.setAttribute('aria-pressed', now ? 'true' : 'false');
    });
    return b;
  }

  function toggleDone(group, key, id, ctx) {
    var d = st[group].done;
    d[key] = d[key] || {};
    var now = !d[key][id];
    if (now) d[key][id] = true; else delete d[key][id];
    if (!Object.keys(d[key]).length) delete d[key];
    save(ctx);
    return now;
  }

  function isDone(group, key, id) { var d = st[group].done[key]; return !!(d && d[id]); }

  function fmt(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function money(pence) { return '£' + (pence / 100).toFixed(2); }

  function bar(pct) {
    var fill = el('span', { class: 'bar-fill' });
    fill.style.width = Math.max(0, Math.min(100, pct)) + '%';
    return { box: el('span', { class: 'bar' }, [fill]), fill: fill };
  }

  // ---------- Gym ----------
  function weekEntry(g, dow) {
    return g.week.filter(function (e) { return e.dow === dow; })[0];
  }

  function nextSession(g, fromDow) {
    for (var i = 1; i <= 7; i++) {
      var e = weekEntry(g, (fromDow + i) % 7);
      if (e && e.session) return e;
    }
    return null;
  }

  function lastWeightText(id, t) {
    var w = st.gym.weights[id];
    if (!w) return 'No weight logged yet';
    return w.date === t.key ? 'Saved today' : 'Last: ' + w.kg + ' kg · ' + niceDate(w.date);
  }

  function exerciseCard(ex, t, ctx, onProgress) {
    var card = el('div', { class: 'gx' + (isDone('gym', t.key, ex.id) ? ' done' : '') });
    var check = checkBtn(isDone('gym', t.key, ex.id), 'Done: ' + ex.name, function () {
      var now = toggleDone('gym', t.key, ex.id, ctx);
      card.classList.toggle('done', now);
      onProgress();
      return now;
    });
    var main = el('div', { class: 'gx-main' }, [el('div', { class: 'gx-name', text: ex.name })]);
    var chips = el('div', { class: 'chips' }, [chip(ex.sets, 'strong')]);
    if (ex.rest) chips.appendChild(chip('Rest ' + ex.rest));
    main.appendChild(chips);
    if (ex.note) main.appendChild(el('div', { class: 'gx-note', text: ex.note }));
    if (!ex.noWeight) {
      var w = st.gym.weights[ex.id];
      var input = el('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', 'aria-label': 'Weight in kg for ' + ex.name, placeholder: w ? w.kg : 'kg' });
      if (w && w.date === t.key) input.value = w.kg;
      var last = el('span', { class: 'gx-last', text: lastWeightText(ex.id, t) });
      input.addEventListener('change', function () {
        var v = input.value.trim().replace(',', '.');
        if (v === '') {
          if (st.gym.weights[ex.id] && st.gym.weights[ex.id].date === t.key) delete st.gym.weights[ex.id];
        } else if (KG_RE.test(v)) {
          st.gym.weights[ex.id] = { kg: v, date: t.key };
          input.value = v;
        } else {
          ctx.toast('Enter the weight as a number, like 62.5');
          input.value = '';
          return;
        }
        save(ctx);
        last.textContent = lastWeightText(ex.id, t);
      });
      main.appendChild(el('label', { class: 'gx-w' }, [el('span', { text: 'Weight (kg)' }), input, last]));
    }
    card.appendChild(check);
    card.appendChild(main);
    return card;
  }

  function heading(kicker, title, sub, extra) {
    var h = el('div', { class: 'ghead' }, [el('div', { class: 'ghead-k', text: kicker }), el('h2', { class: 'ghead-t', text: title })]);
    if (sub) h.appendChild(el('div', { class: 'ghead-s', text: sub }));
    if (extra) h.appendChild(extra);
    return h;
  }

  function gymToday(root, ctx) {
    var g = G.gym, t = today();
    var entry = weekEntry(g, t.dow);
    var session = entry.session ? g.sessions[entry.session] : null;
    if (!session) {
      root.appendChild(heading(entry.day, 'Rest day', g.restNote));
      var next = nextSession(g, t.dow);
      if (next) {
        var ns = g.sessions[next.session];
        root.appendChild(el('button', { class: 'gcard link', type: 'button', onclick: function () { ctx.setTab('workouts', next.session); } }, [
          el('div', { class: 'gcard-k', text: 'Next up' }),
          el('div', { class: 'gcard-t', text: next.day + ' · ' + ns.name + (ns.optional ? ' (optional)' : '') }),
          el('div', { class: 'gcard-s', text: 'Tap to see the exercises' })
        ]));
      }
      root.appendChild(accordion('Food on a rest day', function (b) {
        b.appendChild(para('Eat at roughly the same times as a training day, have the banana and toast whenever suits you, and skip the collagen.'));
      }));
      return;
    }
    var extra = session.optional ? el('div', { class: 'chips' }, [chip('Optional 5th session', 'soft')]) : null;
    root.appendChild(heading(entry.day + ' · ' + g.trainAt, session.name, session.length, extra));
    var p = bar(0);
    var count = el('span', { class: 'prog-t' });
    function updateProgress() {
      var n = session.exercises.filter(function (e) { return isDone('gym', t.key, e.id); }).length;
      count.textContent = n + ' of ' + session.exercises.length + ' done';
      p.fill.style.width = (100 * n / session.exercises.length) + '%';
    }
    root.appendChild(el('div', { class: 'prog' }, [count, p.box]));
    updateProgress();
    root.appendChild(accordion('Warm-up (same every time)', function (b) { b.appendChild(para(g.warmup)); }));
    session.exercises.forEach(function (ex) { root.appendChild(exerciseCard(ex, t, ctx, updateProgress)); });
    if (entry.note) root.appendChild(para(entry.note, 'gp muted'));
  }

  function gymWeek(root, ctx) {
    var g = G.gym, t = today();
    root.appendChild(para('**Train at ' + g.trainAt + '.** Four sessions a week, with an optional fifth on Wednesday. ' + g.restNote, 'gp'));
    g.week.forEach(function (e) {
      var s = e.session ? g.sessions[e.session] : null;
      var inner = [
        el('div', { class: 'gday-d', text: e.day }),
        el('div', { class: 'gday-t', text: s ? s.name + (s.optional ? ' (optional)' : '') : 'Rest' })
      ];
      if (s) inner.push(chip(g.trainAt, 'soft'));
      var body = el('div', { class: 'gday-b' }, inner);
      if (e.note) body.appendChild(el('div', { class: 'gday-n', text: e.note }));
      var cls = 'gday' + (e.dow === t.dow ? ' today' : '') + (s ? ' link' : '');
      var row = s
        ? el('button', { class: cls, type: 'button', onclick: function () { ctx.setTab('workouts', e.session); } }, [body])
        : el('div', { class: cls }, [body]);
      root.appendChild(row);
    });
  }

  function gymWorkouts(root, ctx) {
    var g = G.gym;
    root.appendChild(para(g.kit, 'gp muted'));
    root.appendChild(accordion('Warm-up (same every time)', function (b) { b.appendChild(para(g.warmup)); }));
    ['upperA', 'lowerA', 'shoulders', 'upperB', 'lowerB'].forEach(function (key) {
      var s = g.sessions[key];
      var d = accordion(s.name + (s.optional ? ' (optional)' : ''), function (b) {
        s.exercises.forEach(function (ex) {
          var row = el('div', { class: 'gw' }, [el('div', { class: 'gw-name', text: ex.name })]);
          var chips = el('div', { class: 'chips' }, [chip(ex.sets, 'strong')]);
          if (ex.rest) chips.appendChild(chip('Rest ' + ex.rest));
          row.appendChild(chips);
          if (ex.note) row.appendChild(el('div', { class: 'gx-note', text: ex.note }));
          b.appendChild(row);
        });
      }, ctx.arg === key, s.length);
      d.id = 'w-' + key;
      root.appendChild(d);
    });
  }

  function gymInfo(root) { sections(root, G.gym.info); }

  // ---------- Meals ----------
  function planFor(m, dow) {
    var entry = m.rotation.filter(function (e) { return e.dow === dow; })[0];
    return m.slots.map(function (s) {
      if (s.gym) return { slot: s };
      var id = s.meal || entry[s.pick];
      return { slot: s, id: id, meal: m.meals[id] };
    });
  }

  var MACROS = [['k', 'Calories', ''], ['p', 'Protein', ' g'], ['c', 'Carbs', ' g'], ['f', 'Fat', ' g']];

  function mealsToday(root, ctx) {
    var m = G.meals, t = today();
    var items = planFor(m, t.dow);
    var entry = m.rotation.filter(function (e) { return e.dow === t.dow; })[0];
    var plan = { k: 0, p: 0, c: 0, f: 0 };
    items.forEach(function (it) { if (it.meal) MACROS.forEach(function (x) { plan[x[0]] += it.meal[x[0]]; }); });

    root.appendChild(heading(entry.day, "Today's meals", 'Lunch, the post-gym wraps and dinner follow this week\'s rotation.'));

    var tiles = el('div', { class: 'tiles' });
    var refs = {};
    MACROS.forEach(function (x) {
      var b = bar(0), v = el('span', { class: 'tile-v', text: '0' });
      refs[x[0]] = { v: v, fill: b.fill };
      tiles.appendChild(el('div', { class: 'tile' }, [
        el('div', { class: 'tile-l', text: x[1] }),
        el('div', { class: 'tile-n' }, [v, el('span', { class: 'tile-of', text: ' of ' + fmt(plan[x[0]]) + x[2] })]),
        b.box
      ]));
    });
    root.appendChild(tiles);
    function updateTiles() {
      var eaten = { k: 0, p: 0, c: 0, f: 0 };
      items.forEach(function (it) {
        if (it.meal && isDone('meals', t.key, it.slot.id)) MACROS.forEach(function (x) { eaten[x[0]] += it.meal[x[0]]; });
      });
      MACROS.forEach(function (x) {
        refs[x[0]].v.textContent = fmt(eaten[x[0]]);
        refs[x[0]].fill.style.width = (plan[x[0]] ? 100 * eaten[x[0]] / plan[x[0]] : 0) + '%';
      });
    }
    updateTiles();
    root.appendChild(para('Daily target: about ' + fmt(m.target.kcal) + ' kcal and ' + m.target.protein + ' g protein, averaged over the week.', 'gp muted'));

    items.forEach(function (it) {
      if (it.slot.gym) {
        root.appendChild(el('div', { class: 'gm gym' }, [
          el('div', { class: 'gm-time', text: it.slot.time + ' · ' + it.slot.label }),
          el('div', { class: 'gm-name', text: m.gymBlurb }),
          el('button', { class: 'btn alt small', type: 'button', text: 'Open Gym Plan', onclick: function () { ctx.openGuide('gym'); } })
        ]));
        return;
      }
      var card = el('div', { class: 'gm' + (isDone('meals', t.key, it.slot.id) ? ' done' : '') });
      var check = checkBtn(isDone('meals', t.key, it.slot.id), 'Eaten: ' + it.meal.name, function () {
        var now = toggleDone('meals', t.key, it.slot.id, ctx);
        card.classList.toggle('done', now);
        updateTiles();
        return now;
      });
      var main = el('div', { class: 'gm-main' }, [
        el('div', { class: 'gm-time', text: it.slot.time + ' · ' + it.slot.label }),
        el('div', { class: 'gm-name', text: it.meal.name })
      ]);
      main.appendChild(el('div', { class: 'chips' }, [
        chip(fmt(it.meal.k) + ' kcal', 'strong'), chip(it.meal.p + ' g protein'), chip(it.meal.c + ' g carbs'), chip(it.meal.f + ' g fat')
      ]));
      var what = el('details', { class: 'gm-what' }, [el('summary', { text: 'What goes in it' }), el('p', { text: it.meal.what })]);
      main.appendChild(what);
      main.appendChild(el('button', { class: 'linkbtn', type: 'button', text: 'Recipe', onclick: function () { ctx.setTab('recipes', it.id); } }));
      card.appendChild(check);
      card.appendChild(main);
      root.appendChild(card);
    });
    if (entry.note) root.appendChild(para(entry.note + '.', 'gp muted'));
    root.appendChild(accordion('How to use it', function (b) { b.appendChild(list('ul', m.howTo)); b.appendChild(para(m.footnote, 'gp muted')); }));
  }

  function mealsWeek(root) {
    var m = G.meals, t = today();
    root.appendChild(para('**Cook twice a week, on Sunday and Wednesday, and every lunch and dinner is covered.** Across the week the plan averages about 3,466 kcal, 221 g protein, 456 g carbs, 77 g fat, 44 g fibre and about 5 g lactose a day. Breakfast and the pre-bed snack stay the same every day.'));
    m.rotation.forEach(function (e) {
      var lines = [
        ['Lunch', m.meals[e.lunch].name],
        ['Afternoon', m.meals[e.post].name],
        ['Dinner', m.meals[e.dinner].name]
      ];
      var body = el('div', { class: 'gday-b' }, [el('div', { class: 'gday-d', text: e.day })]);
      lines.forEach(function (l) {
        body.appendChild(el('div', { class: 'gt-line' }, [el('span', { class: 'gt-k', text: l[0] }), el('span', { class: 'gt-v', text: l[1] })]));
      });
      if (e.note) body.appendChild(el('div', { class: 'gday-n', text: e.note }));
      root.appendChild(el('div', { class: 'gday' + (e.dow === t.dow ? ' today' : '') }, [body]));
    });
    root.appendChild(para('The Sunday salmon meets the NHS advice of at least 2 portions of fish a week, 1 of them oily. Tinned tuna does not count as oily fish.', 'gp muted'));
    root.appendChild(el('h3', { class: 'gh3', text: 'Batch-prep game plan' }));
    sections(root, m.batch);
  }

  function mealsRecipes(root, ctx) {
    var m = G.meals;
    root.appendChild(accordion('Kitchen basics', function (b) { sections(b, m.kitchen); }));
    var target = null;
    m.recipes.forEach(function (grp) {
      root.appendChild(el('h3', { class: 'gh3', text: grp.group }));
      grp.items.forEach(function (r) {
        var d = accordion(r.title, function (b) {
          b.appendChild(para(r.meta, 'gp muted'));
          if (r.ingredients.length) {
            b.appendChild(el('h4', { class: 'gh4', text: 'Ingredients' }));
            b.appendChild(list('ul', r.ingredients));
          }
          b.appendChild(el('h4', { class: 'gh4', text: r.ingredients.length ? 'Method' : 'How to make it' }));
          b.appendChild(list('ol', r.method));
        }, ctx.arg === r.id);
        if (ctx.arg === r.id) target = d;
        root.appendChild(d);
      });
    });
    if (target) setTimeout(function () { target.scrollIntoView({ block: 'start' }); }, 0);
  }

  function mealsShopping(root, ctx) {
    var s = G.meals.shopping;
    root.appendChild(para(s.intro));
    s.sections.forEach(function (sec) {
      var sum = 0;
      sec.items.forEach(function (i) { sum += (typeof i[2] === 'number' ? i[2] : 1) * (i[3] || 0); });
      var count = el('span', { class: 'shop-c' });
      var head = el('div', { class: 'shop-h' }, [
        el('div', { class: 'shop-t', text: sec.title }),
        el('div', { class: 'shop-s' }, [count].concat(sec.total ? [el('span', { class: 'shop-sum', text: 'Total ' + money(sum) })] : []))
      ]);
      var box = el('div', { class: 'shop' }, [head]);
      function update() {
        var n = sec.items.filter(function (i) { return st.meals.shop[i[0]]; }).length;
        count.textContent = n + ' of ' + sec.items.length + ' ticked';
      }
      sec.items.forEach(function (i) {
        var id = i[0], done = !!st.meals.shop[id];
        var row = el('div', { class: 'shop-row' + (done ? ' done' : '') });
        var sub;
        if (typeof i[2] === 'number') {
          sub = i[3] == null ? i[2] + ' × (check in store)' : i[2] + ' × ' + money(i[3]) + (i[2] > 1 ? ' = ' + money(i[2] * i[3]) : '');
        } else {
          sub = i[2] + (i[3] != null ? ' · ' + money(i[3]) : '');
        }
        var main = el('div', { class: 'shop-main' }, [el('div', { class: 'shop-name', text: i[1] }), el('div', { class: 'shop-sub', text: sub })]);
        if (i[4]) main.appendChild(el('div', { class: 'gx-note', text: i[4] }));
        row.appendChild(checkBtn(done, 'Got ' + i[1], function () {
          var now = !st.meals.shop[id];
          if (now) st.meals.shop[id] = true; else delete st.meals.shop[id];
          save(ctx);
          row.classList.toggle('done', now);
          update();
          return now;
        }));
        row.appendChild(main);
        box.appendChild(row);
      });
      update();
      root.appendChild(box);
    });
    root.appendChild(el('button', { class: 'btn alt wide', type: 'button', text: 'Reset shopping ticks', onclick: function () {
      ctx.confirm('Untick everything on the shopping lists?', 'Reset').then(function (yes) {
        if (!yes) return;
        st.meals.shop = {};
        save(ctx);
        ctx.refresh();
      });
    } }));
    s.after.forEach(function (t) { root.appendChild(para(t, 'gp muted')); });
  }

  function mealsNotes(root) {
    sections(root, G.meals.notes);
    root.appendChild(para(G.meals.footnote, 'gp muted'));
  }

  // ---------- public API ----------
  var VIEWS = {
    gym: { today: gymToday, week: gymWeek, workouts: gymWorkouts, info: gymInfo },
    meals: { today: mealsToday, week: mealsWeek, recipes: mealsRecipes, shopping: mealsShopping, notes: mealsNotes }
  };

  function render(ctx) {
    var g = G[ctx.id];
    if (!g) return false;
    var tab = VIEWS[ctx.id][ctx.tab] ? ctx.tab : g.defaultTab;
    ctx.setTitle(g.title);
    ctx.view.textContent = '';
    ctx.foot.textContent = '';
    var wrap = el('div', { class: 'guide g-' + ctx.id });
    ctx.view.appendChild(wrap);
    VIEWS[ctx.id][tab](wrap, { id: ctx.id, arg: ctx.arg, setTab: ctx.setTab, openGuide: ctx.openGuide, toast: ctx.toast, confirm: ctx.confirm, refresh: ctx.refresh });
    var bar = el('div', { class: 'tabbar g-' + ctx.id, role: 'tablist' });
    g.tabs.forEach(function (x) {
      bar.appendChild(el('button', { class: 'tab', type: 'button', role: 'tab', 'aria-selected': x[0] === tab ? 'true' : 'false', text: x[1], onclick: function () { ctx.setTab(x[0]); } }));
    });
    ctx.foot.appendChild(bar);
    return true;
  }

  function summary(id) {
    var t = today();
    if (id === 'gym') {
      var e = weekEntry(G.gym, t.dow);
      return e.session ? 'Today: ' + G.gym.sessions[e.session].name + (G.gym.sessions[e.session].optional ? ' (optional)' : '') : 'Today: rest day';
    }
    if (id === 'meals') {
      var k = 0, p = 0;
      planFor(G.meals, t.dow).forEach(function (it) { if (it.meal) { k += it.meal.k; p += it.meal.p; } });
      return 'Today: ' + fmt(k) + ' kcal · ' + p + ' g protein';
    }
    return '';
  }

  window.Guides = {
    order: ORDER.filter(function (id) { return G[id]; }),
    get: function (id) { return G[id]; },
    render: render,
    summary: summary,
    sanitize: sanitize,
    exportState: function () { return st; },
    importState: function (raw) { st = sanitize(raw); save(); },
    tabKeys: function (id) { return G[id] ? G[id].tabs.map(function (x) { return x[0]; }) : []; },
    defaultTab: function (id) { return G[id] ? G[id].defaultTab : null; }
  };
})();
