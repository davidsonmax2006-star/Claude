// Built-in guides (Gym Plan, Meal Plan): renders data from content/*.js and keeps the
// user's progress (ticks, logged weights, shopping ticks) under its own storage key.
(function () {
  'use strict';

  var KEY = 'myplans.guides';
  var G = window.GUIDES || {};
  var ORDER = ['time', 'gym', 'meals'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var ID_RE = /^[a-z0-9_]{1,40}$/;
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  var KG_RE = /^\d{1,3}(\.\d{1,2})?$/;
  var TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
  var MAX_EVENTS = 100;

  // The timetable's content is built from the gym and meal plans plus the user's own events.
  G.time = {
    id: 'time', title: 'Timetable', defaultTab: 'live',
    blurb: 'What is on now and next. Works offline.',
    tabs: [['live', 'Live'], ['mine', 'My events']]
  };

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
    return { version: 1, gym: { done: {}, weights: {} }, meals: { done: {}, shop: {} }, time: { events: [], showPlan: true, cycle: null } };
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
    var tm = raw.time;
    if (tm && typeof tm === 'object') {
      out.time.showPlan = tm.showPlan !== false;
      var c = tm.cycle;
      if (c && typeof c === 'object' && DATE_RE.test(String(c.monday)) && (c.week === 1 || c.week === 2)) {
        out.time.cycle = { monday: String(c.monday), week: c.week };
      }
      var seen = {};
      (Array.isArray(tm.events) ? tm.events : []).slice(0, MAX_EVENTS).forEach(function (e) {
        if (!e || typeof e !== 'object' || !ID_RE.test(String(e.id)) || seen[e.id]) return;
        var title = String(e.title == null ? '' : e.title).trim().slice(0, 60);
        var days = [];
        (Array.isArray(e.days) ? e.days : []).forEach(function (d) { if (Number.isInteger(d) && d >= 0 && d <= 6 && days.indexOf(d) < 0) days.push(d); });
        var start = String(e.start), end = e.end == null ? '' : String(e.end);
        if (!title || !days.length || !TIME_RE.test(start)) return;
        if (end !== '' && (!TIME_RE.test(end) || end <= start)) return;
        seen[e.id] = true;
        out.time.events.push({ id: String(e.id), title: title, days: days.sort(), start: start, end: end, weeks: e.weeks === 1 || e.weeks === 2 ? e.weeks : 0 });
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

  // ---------- Timetable ----------
  var SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

  function toMin(hhmm) { return parseInt(hhmm.slice(0, 2), 10) * 60 + parseInt(hhmm.slice(3, 5), 10); }
  function minStr(m) { return m >= 1440 ? '24:00' : pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function nowMin(d) { return d.getHours() * 60 + d.getMinutes(); }
  function dur(m) {
    if (m < 60) return m + ' min';
    return Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
  }

  // Which week of the two-week cycle it is, or null if the user hasn't set it.
  // Counts whole weeks between Mondays using UTC day numbers built from local date parts, so clock changes can't shift it.
  function currentWeek(d) {
    var c = st.time.cycle;
    if (!c) return null;
    var p = c.monday.split('-').map(Number);
    var mondayNow = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    var diff = Math.round((Date.UTC(mondayNow.getFullYear(), mondayNow.getMonth(), mondayNow.getDate()) - Date.UTC(p[0], p[1] - 1, p[2])) / 86400000);
    var flips = ((Math.floor(diff / 7) % 2) + 2) % 2;
    return flips ? (c.week === 1 ? 2 : 1) : c.week;
  }

  // Gym and meal blocks come straight from the plan data, so they follow the weekday rotation.
  function planItems(dow) {
    var g = G.gym, m = G.meals, items = [];
    planFor(m, dow).forEach(function (it) {
      if (it.slot.gym) return;
      var r = /^(\d\d:\d\d)(?:–(\d\d:\d\d))?/.exec(it.slot.time);
      var s = toMin(r[1]);
      items.push({ start: s, end: Math.min(r[2] ? toMin(r[2]) : s + 30, 1440), title: it.meal.name, sub: (it.slot.label !== it.meal.name ? it.slot.label + ' · ' : '') + fmt(it.meal.k) + ' kcal', kind: 'meal' });
    });
    var e = weekEntry(g, dow), sess = e && e.session ? g.sessions[e.session] : null;
    if (sess) {
      var T = toMin(g.trainAt), p = g.plan;
      var out = T + p.trainMin;
      items.push({ start: T - p.walkMin, end: T, title: 'Head to the gym', sub: 'About ' + p.walkMin + ' minutes', kind: 'gym' });
      items.push({ start: T, end: Math.min(out, 1440), title: sess.name + (sess.optional ? ' (optional)' : ''), sub: sess.length, kind: 'gym' });
      items.push({ start: out + p.walkMin, end: Math.min(out + p.walkMin + p.showerMin, 1440), title: 'Home and shower', sub: 'About ' + p.showerMin + ' minutes', kind: 'gym' });
    }
    if (m.bedtime) items.push({ start: toMin(m.bedtime), end: 1440, title: 'Bed', sub: 'Aim for 8 hours', kind: 'sleep' });
    return items;
  }

  function eventSub(e, week) {
    var bits = [];
    if (e.weeks) bits.push(week ? 'Week ' + e.weeks + ' only' : 'Week ' + e.weeks + ' only (set the week below)');
    return bits.join(' · ');
  }

  function itemsFor(dow, week) {
    var items = st.time.showPlan ? planItems(dow) : [];
    st.time.events.forEach(function (e) {
      if (e.days.indexOf(dow) < 0) return;
      if (e.weeks && week && e.weeks !== week) return;
      var s = toMin(e.start);
      items.push({ start: s, end: e.end ? toMin(e.end) : Math.min(s + 15, 1440), point: !e.end, title: e.title, sub: eventSub(e, week), kind: 'mine' });
    });
    items.forEach(function (it, i) { it.order = i; });
    items.sort(function (a, b) { return a.start - b.start || a.order - b.order; });
    return items;
  }

  // What is on now and what comes next, for a list of items sorted by start time.
  function nowNext(items, nm) {
    var cur = items.filter(function (it) { return it.start <= nm && nm < it.end; });
    var upcoming = items.filter(function (it) { return it.start > nm; });
    var next = upcoming.length ? upcoming.filter(function (it) { return it.start === upcoming[0].start; }) : [];
    return { now: cur, next: next };
  }

  // Live updates: one timer, aligned to the minute, that stops itself when its screen is gone.
  var liveTimer = null, liveTick = null;
  function stopLive() { if (liveTimer) clearTimeout(liveTimer); liveTimer = null; liveTick = null; }
  function startLive(root, tick) {
    stopLive();
    liveTick = function () {
      if (!document.body.contains(root)) { stopLive(); return false; }
      tick();
      return true;
    };
    (function schedule() {
      liveTimer = setTimeout(function () { if (liveTick && liveTick()) schedule(); }, 60000 - (Date.now() % 60000) + 50);
    })();
  }
  // iOS freezes timers in the background, so catch up whenever the app comes back.
  document.addEventListener('visibilitychange', function () { if (!document.hidden && liveTick) liveTick(); });
  window.addEventListener('pageshow', function () { if (liveTick) liveTick(); });

  function mondayKey(d) {
    var m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
    return dateKey(m);
  }

  function toggleBtn(text, pressed, onClick, cls) {
    var b = el('button', { class: cls || 'daybtn', type: 'button', 'aria-pressed': pressed ? 'true' : 'false', text: text });
    b.addEventListener('click', onClick);
    return b;
  }

  function timeLive(root, ctx) {
    var first = new Date();
    var builtKey = dateKey(first);
    var todayDow = first.getDay();
    var sel = todayDow;
    var clock = el('div', { class: 'tt-clock' });
    var dateLine = el('div', { class: 'tt-date' });
    var card = el('div', { class: 'tt-card' });
    var chipRow = el('div', { class: 'tt-days', role: 'group', 'aria-label': 'Day' });
    var listBox = el('div', { class: 'tt-list' });
    var rows = [];

    root.appendChild(el('div', { class: 'tt-top' }, [clock, dateLine]));
    root.appendChild(card);
    root.appendChild(chipRow);
    root.appendChild(listBox);

    function chips() {
      chipRow.textContent = '';
      WEEK_ORDER.forEach(function (d) {
        var b = toggleBtn(SHORT[d], d === sel, function () { sel = d; chips(); build(); tick(); }, 'daybtn' + (d === todayDow ? ' today' : ''));
        chipRow.appendChild(b);
      });
    }

    function build() {
      listBox.textContent = '';
      rows = [];
      var items = itemsFor(sel, currentWeek(new Date()));
      if (!items.length) listBox.appendChild(para('Nothing scheduled. Add your own events under My events.', 'gp muted'));
      items.forEach(function (it) {
        var time = it.point ? minStr(it.start) : minStr(it.start) + '–' + minStr(it.end);
        var body = el('div', { class: 'tt-b' }, [el('div', { class: 'tt-t', text: it.title })]);
        if (it.sub) body.appendChild(el('div', { class: 'tt-s', text: it.sub }));
        var row = el('div', { class: 'tt-row k-' + it.kind }, [el('div', { class: 'tt-time', text: time }), body]);
        listBox.appendChild(row);
        rows.push({ el: row, it: it });
      });
    }

    function names(list) { return list.map(function (x) { return x.title; }).join(' + '); }

    function tick() {
      var n = new Date();
      if (dateKey(n) !== builtKey) { ctx.refresh(); return; } // a new day started while open
      var wk = currentWeek(n);
      clock.textContent = minStr(nowMin(n));
      dateLine.textContent = DAYS[n.getDay()] + ' ' + n.getDate() + ' ' + MONTHS[n.getMonth()] + (wk ? ' · Week ' + wk : '');
      card.textContent = '';
      if (sel !== todayDow) {
        card.appendChild(el('div', { class: 'tt-card-k', text: 'Viewing' }));
        card.appendChild(el('div', { class: 'tt-card-t', text: DAYS[sel] }));
        card.appendChild(el('button', { class: 'linkbtn', type: 'button', text: 'Back to today', onclick: function () { sel = todayDow; chips(); build(); tick(); } }));
        rows.forEach(function (r) { r.el.className = 'tt-row k-' + r.it.kind; });
        return;
      }
      var nm = nowMin(n);
      var nn = nowNext(rows.map(function (r) { return r.it; }), nm);
      if (nn.now.length) {
        var endsIn = Math.min.apply(null, nn.now.map(function (x) { return x.end; })) - nm;
        card.appendChild(el('div', { class: 'tt-card-k', text: 'Now' }));
        card.appendChild(el('div', { class: 'tt-card-t', text: names(nn.now) }));
        card.appendChild(el('div', { class: 'tt-card-s', text: 'Ends in ' + dur(endsIn) }));
      } else {
        card.appendChild(el('div', { class: 'tt-card-k', text: 'Now' }));
        card.appendChild(el('div', { class: 'tt-card-t', text: 'Nothing on right now' }));
      }
      if (nn.next.length) {
        card.appendChild(el('div', { class: 'tt-next' }, [el('strong', { text: 'Next: ' }), document.createTextNode(minStr(nn.next[0].start) + ' ' + names(nn.next) + ' (in ' + dur(nn.next[0].start - nm) + ')')]));
      } else {
        var tomorrow = itemsFor((todayDow + 1) % 7, currentWeek(new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1)));
        card.appendChild(el('div', { class: 'tt-next', text: tomorrow.length ? "That's everything today. Tomorrow starts at " + minStr(tomorrow[0].start) + ' with ' + tomorrow[0].title + '.' : "That's everything for today." }));
      }
      rows.forEach(function (r) {
        var cls = 'tt-row k-' + r.it.kind;
        if (r.it.end <= nm) cls += ' past';
        else if (r.it.start <= nm) cls += ' now';
        else if (nn.next.indexOf(r.it) >= 0) cls += ' next';
        r.el.className = cls;
      });
    }

    chips();
    build();
    tick();

    // Settings
    var settings = el('div', { class: 'tt-set' });
    settings.appendChild(el('div', { class: 'tt-set-t', text: 'Show gym and meals' }));
    var planBtn = toggleBtn(st.time.showPlan ? 'On' : 'Off', st.time.showPlan, function () {
      st.time.showPlan = !st.time.showPlan;
      planBtn.textContent = st.time.showPlan ? 'On' : 'Off';
      planBtn.setAttribute('aria-pressed', st.time.showPlan ? 'true' : 'false');
      save(ctx); build(); tick();
    }, 'daybtn wide');
    settings.appendChild(planBtn);
    settings.appendChild(el('div', { class: 'tt-set-t', text: 'This week is' }));
    var wkRow = el('div', { class: 'tt-days' });
    function weekBtns() {
      wkRow.textContent = '';
      var cw = currentWeek(new Date());
      [[1, 'Week 1'], [2, 'Week 2'], [0, 'Not using']].forEach(function (x) {
        wkRow.appendChild(toggleBtn(x[1], x[0] === 0 ? !st.time.cycle : cw === x[0], function () {
          st.time.cycle = x[0] ? { monday: mondayKey(new Date()), week: x[0] } : null;
          save(ctx); weekBtns(); build(); tick();
        }, 'daybtn'));
      });
    }
    weekBtns();
    settings.appendChild(wkRow);
    settings.appendChild(para('If your lectures differ between two weeks, set which one this is. Events marked "Week 1 only" or "Week 2 only" then show on the right weeks.', 'gp muted'));
    root.appendChild(settings);
    root.appendChild(el('button', { class: 'btn alt wide', type: 'button', text: '+ Add my own event', onclick: function () { ctx.setTab('mine'); } }));
    root.appendChild(para('Works offline: it only uses the clock and what is saved on this phone.', 'gp muted'));

    startLive(root, tick);
  }

  function newEventId() { return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function eventSummary(e) {
    var days = e.days.slice().sort(function (a, b) { return WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b); }).map(function (d) { return SHORT[d]; }).join(', ');
    return days + ' · ' + e.start + (e.end ? '–' + e.end : '') + (e.weeks ? ' · Week ' + e.weeks + ' only' : '');
  }

  function timeMine(root, ctx) {
    var editing = null;
    var days = {}, weeks = 0;
    root.appendChild(para('Add things like lectures, work or appointments. They stay on this phone, show up in the Live timetable and are included in your backups.', 'gp muted'));

    var titleIn = el('input', { type: 'text', class: 'tt-input', maxlength: '60', placeholder: 'Title, e.g. Lecture', 'aria-label': 'Event title', autocomplete: 'off' });
    var startIn = el('input', { type: 'time', class: 'tt-input', 'aria-label': 'Start time' });
    var endIn = el('input', { type: 'time', class: 'tt-input', 'aria-label': 'End time (optional)' });
    var dayRow = el('div', { class: 'tt-days' });
    var weekRow = el('div', { class: 'tt-days' });
    var heading = el('div', { class: 'tt-form-t', text: 'New event' });
    var saveBtn = el('button', { class: 'btn', type: 'button', text: 'Add event' });
    var cancelBtn = el('button', { class: 'btn alt', type: 'button', text: 'Cancel', hidden: 'hidden' });

    function drawDays() {
      dayRow.textContent = '';
      WEEK_ORDER.forEach(function (d) {
        dayRow.appendChild(toggleBtn(SHORT[d], !!days[d], function () { days[d] = !days[d]; drawDays(); }));
      });
    }
    function drawWeeks() {
      weekRow.textContent = '';
      [[0, 'Every week'], [1, 'Week 1 only'], [2, 'Week 2 only']].forEach(function (x) {
        weekRow.appendChild(toggleBtn(x[1], weeks === x[0], function () { weeks = x[0]; drawWeeks(); }));
      });
    }
    function reset() {
      editing = null; days = {}; weeks = 0;
      titleIn.value = ''; startIn.value = ''; endIn.value = '';
      heading.textContent = 'New event'; saveBtn.textContent = 'Add event'; cancelBtn.hidden = true;
      drawDays(); drawWeeks();
    }
    cancelBtn.addEventListener('click', reset);

    saveBtn.addEventListener('click', function () {
      var title = titleIn.value.trim().slice(0, 60);
      var chosen = WEEK_ORDER.filter(function (d) { return days[d]; });
      var s = startIn.value, e = endIn.value;
      if (!title) { ctx.toast('Give the event a title'); return; }
      if (!chosen.length) { ctx.toast('Pick at least one day'); return; }
      if (!TIME_RE.test(s)) { ctx.toast('Pick a start time'); return; }
      if (e !== '' && (!TIME_RE.test(e) || e <= s)) { ctx.toast('The end time must be after the start'); return; }
      if (!editing && st.time.events.length >= MAX_EVENTS) { ctx.toast('That is the maximum number of events'); return; }
      var ev = { id: editing ? editing.id : newEventId(), title: title, days: chosen.slice().sort(), start: s, end: e, weeks: weeks };
      if (editing) st.time.events = st.time.events.map(function (x) { return x.id === editing.id ? ev : x; });
      else st.time.events.push(ev);
      save(ctx);
      ctx.toast(editing ? 'Saved' : 'Added');
      ctx.refresh();
    });

    function labelled(text, input) { return el('label', { class: 'tt-lab' }, [el('span', { text: text }), input]); }
    root.appendChild(el('div', { class: 'tt-form' }, [
      heading, titleIn,
      el('div', { class: 'tt-set-t', text: 'Days' }), dayRow,
      el('div', { class: 'tt-pair' }, [labelled('Start', startIn), labelled('End (optional)', endIn)]),
      el('div', { class: 'tt-set-t', text: 'Repeats' }), weekRow,
      el('div', { class: 'tt-actions' }, [saveBtn, cancelBtn])
    ]));
    reset();

    root.appendChild(el('h3', { class: 'gh3', text: 'My events' }));
    var evs = st.time.events.slice().sort(function (a, b) {
      return WEEK_ORDER.indexOf(a.days[0]) - WEEK_ORDER.indexOf(b.days[0]) || (a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
    });
    if (!evs.length) root.appendChild(para('No events yet.', 'gp muted'));
    evs.forEach(function (ev) {
      root.appendChild(el('div', { class: 'tt-ev' }, [
        el('div', { class: 'tt-ev-b' }, [el('div', { class: 'tt-t', text: ev.title }), el('div', { class: 'tt-s', text: eventSummary(ev) })]),
        el('button', { class: 'ibtn', type: 'button', 'aria-label': 'Edit ' + ev.title, text: '✎', onclick: function () {
          editing = ev; days = {}; ev.days.forEach(function (d) { days[d] = true; }); weeks = ev.weeks;
          titleIn.value = ev.title; startIn.value = ev.start; endIn.value = ev.end;
          heading.textContent = 'Edit event'; saveBtn.textContent = 'Save changes'; cancelBtn.hidden = false;
          drawDays(); drawWeeks();
          heading.scrollIntoView({ block: 'start' });
        } }),
        el('button', { class: 'ibtn danger', type: 'button', 'aria-label': 'Delete ' + ev.title, text: '✕', onclick: function () {
          ctx.confirm('Delete "' + ev.title + '"?', 'Delete').then(function (yes) {
            if (!yes) return;
            st.time.events = st.time.events.filter(function (x) { return x.id !== ev.id; });
            save(ctx);
            ctx.refresh();
          });
        } })
      ]));
    });
  }

  // ---------- public API ----------
  var VIEWS = {
    gym: { today: gymToday, week: gymWeek, workouts: gymWorkouts, info: gymInfo },
    meals: { today: mealsToday, week: mealsWeek, recipes: mealsRecipes, shopping: mealsShopping, notes: mealsNotes },
    time: { live: timeLive, mine: timeMine }
  };

  function render(ctx) {
    var g = G[ctx.id];
    if (!g) return false;
    var tab = VIEWS[ctx.id][ctx.tab] ? ctx.tab : g.defaultTab;
    stopLive();
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
    if (id === 'time') {
      var d = new Date(), items = itemsFor(d.getDay(), currentWeek(d)), nn = nowNext(items, nowMin(d));
      if (nn.now.length) return 'Now: ' + nn.now[0].title;
      return nn.next.length ? 'Next: ' + minStr(nn.next[0].start) + ' ' + nn.next[0].title : 'Nothing more today';
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
    // A backup made before the timetable existed has no "time" section; keep the events entered since.
    importState: function (raw) {
      var keep = st.time;
      st = sanitize(raw);
      if (!raw || typeof raw !== 'object' || !raw.time || typeof raw.time !== 'object') st.time = keep;
      save();
    },
    tabKeys: function (id) { return G[id] ? G[id].tabs.map(function (x) { return x[0]; }) : []; },
    defaultTab: function (id) { return G[id] ? G[id].defaultTab : null; }
  };
})();
