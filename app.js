(function () {
  var KEY = "vscode-workspace-v1";
  var STATUSES = ["Active", "Shipped", "Paused", "Idea", "Link"];
  var storageOk = true;
  var ui = { cur: null, parentId: null, q: "", sortKey: "updated", sortDir: "desc", panel: null, editId: null, confirm: null, err: "", exportText: "" };

  function uid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID().slice(0, 12); } catch (e) {}
    return "id" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  function seed() {
    var f1 = uid(), f2 = uid();
    return {
      folders: [{ id: f1, name: "Work projects" }, { id: f2, name: "Learning" }],
      projects: [
        { id: uid(), folderId: f1, name: "branch-dashboard", desc: "Daily branch sales and lead conversion view", stack: ["Python", "Pandas"], status: "Active", link: "C:\\Projects\\branch-dashboard", updated: today(), example: true },
        { id: uid(), folderId: f1, name: "attendance-report", desc: "Daily attendance report with PDF export", stack: ["JavaScript", "HTML"], status: "Shipped", link: "https://github.com/your-name/attendance-report", updated: today(), example: true },
        { id: uid(), folderId: f2, name: "sql-practice", desc: "Practice queries and notes", stack: ["SQL"], status: "Paused", link: "C:\\Projects\\sql-practice", updated: today(), example: true }
      ]
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && Array.isArray(s.folders) && Array.isArray(s.projects)) return s;
      }
    } catch (e) {}
    return seed();
  }
  var state = load();
  function findFolder(name, parentId) {
    return state.folders.filter(function (f) {
      return f.name.toLowerCase() === name.toLowerCase() && (f.parentId || null) === (parentId || null);
    })[0] || null;
  }
  /* One-time: companies at the top level, Marketing and Operations under Magnus. */
  var COMPANIES = ["Magnus", "Alims", "Merchx", "M&D", "Grandis", "HU"];
  if (!state.structureV2) {
    var made = {};
    COMPANIES.slice().reverse().forEach(function (n) {
      var f = findFolder(n, null);
      if (!f) { f = { id: uid(), name: n }; state.folders.unshift(f); }
      made[n] = f;
    });
    ["Marketing", "Operations"].forEach(function (d) {
      if (!findFolder(d, made.Magnus.id)) state.folders.push({ id: uid(), name: d, parentId: made.Magnus.id });
    });
    var hub = state.projects.filter(function (p) { return p.link === "https://magnusworkspace.vercel.app/"; })[0];
    if (hub) hub.folderId = made.Magnus.id;
    else state.projects.push({ id: uid(), folderId: made.Magnus.id, name: "Magnus Workspace", desc: "Company applications workspace", stack: [], status: "Link", link: "https://magnusworkspace.vercel.app/", updated: today() });
    var biz = findFolder("Business", null);
    if (biz && !state.projects.some(function (p) { return p.folderId === biz.id; })) {
      state.folders = state.folders.filter(function (f) { return f.id !== biz.id; });
    }
    state.structureV2 = true;
  }
  /* One-time: the Magnus app links and the REGISTARTION subfolder. */
  if (!state.structureV3) {
    var mg = findFolder("Magnus", null);
    if (mg) {
      if (!findFolder("REGISTARTION", mg.id)) state.folders.push({ id: uid(), name: "REGISTARTION", parentId: mg.id });
      [
        ["Magnus Approval Workflow", "https://student-approval-workflow-system-v7.onrender.com/"],
        ["Magnus ERP", "https://magnus.magnuserp.net/"],
        ["Rm Daily Report", "https://report-automation-wjdn.onrender.com/"],
        ["Ok For Class Start Form", "https://forms.gle/BVH58YmR2oKVRQ3P9"]
      ].forEach(function (l) {
        var key = l[1].replace(/\/+$/, "");
        var have = state.projects.some(function (p) { return (p.link || "").replace(/\/+$/, "") === key; });
        if (!have) state.projects.push({ id: uid(), folderId: mg.id, name: l[0], desc: "", stack: [], status: "Link", link: l[1], updated: today() });
      });
    }
    state.structureV3 = true;
  }
  /* One-time: move the Magnus app links into Magnus / Marketing. */
  if (!state.structureV4) {
    var mg4 = findFolder("Magnus", null), mk4 = mg4 ? findFolder("Marketing", mg4.id) : null;
    if (mk4) {
      var keep = ["magnusworkspace.vercel.app", "student-approval-workflow-system-v7.onrender.com", "magnus.magnuserp.net", "report-automation-wjdn.onrender.com", "forms.gle", "forms.gle/BVH58YmR2oKVRQ3P9"];
      state.projects.forEach(function (p) {
        var k = (p.link || "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");
        if (p.status === "Link" && p.folderId === mg4.id && keep.indexOf(k) !== -1) p.folderId = mk4.id;
      });
    }
    state.structureV4 = true;
  }
  /* One-time: the two REGISTARTION links. */
  if (!state.structureV5) {
    var mg5 = findFolder("Magnus", null), rg5 = mg5 ? findFolder("REGISTARTION", mg5.id) : null;
    if (rg5) {
      [["Magnus Registration Software", "https://registrationdata.magnusinnovative.com/"], ["Registrtion Form", "https://forms.gle/RadoY2R3rFVbkoRZ6"]].forEach(function (l) {
        var have = state.projects.some(function (p) { return p.folderId === rg5.id && p.name === l[0]; });
        if (!have) state.projects.push({ id: uid(), folderId: rg5.id, name: l[0], desc: "", stack: [], status: "Link", link: l[1], updated: today() });
      });
    }
    state.structureV5 = true;
  }
  /* One-time: REGISTARTION lives under Marketing. */
  if (!state.structureV6) {
    var mg6 = findFolder("Magnus", null), mk6 = mg6 ? findFolder("Marketing", mg6.id) : null, rg6 = mg6 ? findFolder("REGISTARTION", mg6.id) : null;
    if (mk6 && rg6) rg6.parentId = mk6.id;
    state.structureV6 = true;
  }
  /* One-time: real form links, Attendance Monitor under Alims and HU, tidy Marketing. */
  if (!state.structureV7) {
    var mg7 = findFolder("Magnus", null), mk7 = mg7 ? findFolder("Marketing", mg7.id) : null;
    var rg7 = mk7 ? findFolder("REGISTARTION", mk7.id) : null;
    var plain7 = function (u) { return (u || "").replace(/\/+$/, ""); };
    state.projects.forEach(function (p) {
      if (mk7 && p.folderId === mk7.id && p.name === "Ok For Class Start Form" && plain7(p.link) === "https://forms.gle") p.link = "https://forms.gle/BVH58YmR2oKVRQ3P9";
      if (rg7 && p.folderId === rg7.id && p.name === "Registrtion Form" && plain7(p.link) === "https://forms.gle") p.link = "https://forms.gle/RadoY2R3rFVbkoRZ6";
    });
    if (mk7) state.projects = state.projects.filter(function (p) { return !(p.folderId === mk7.id && plain7(p.link) === "https://magnusworkspace.vercel.app"); });
    ["Alims", "HU"].forEach(function (cn) {
      var co7 = findFolder(cn, null);
      if (!co7) return;
      var op7 = findFolder("Operation", co7.id);
      if (!op7) { op7 = { id: uid(), name: "Operation", parentId: co7.id }; state.folders.push(op7); }
      if (!state.projects.some(function (p) { return p.folderId === op7.id && p.name === "Attendance Monitor"; }))
        state.projects.push({ id: uid(), folderId: op7.id, name: "Attendance Monitor", desc: "", stack: [], status: "Link", link: "https://attendance-monitor-4i3c.onrender.com/", updated: today() });
    });
    state.structureV7 = true;
  }
  /* Links listed in links.js: folders are created from the path, each entry is added once. */
  (function syncConfigLinks() {
    var list = window.WORKSPACE_LINKS || [];
    if (!state.seededLinks) state.seededLinks = {};
    list.forEach(function (it) {
      var parts = String(it.folder || "").split("/").map(function (t) { return t.trim(); }).filter(Boolean);
      if (!parts.length || !it.name || !it.url) return;
      var key = parts.join("/").toLowerCase() + "|" + String(it.name).toLowerCase();
      if (state.seededLinks[key]) return;
      var parent = null;
      parts.forEach(function (part) {
        var f = findFolder(part, parent);
        if (!f) { f = { id: uid(), name: part.slice(0, 60) }; if (parent) f.parentId = parent; state.folders.push(f); }
        parent = f.id;
      });
      var exists = state.projects.some(function (p) { return p.folderId === parent && String(p.name).toLowerCase() === String(it.name).toLowerCase(); });
      if (!exists) state.projects.push({ id: uid(), folderId: parent, name: String(it.name), desc: "", stack: [], status: "Link", link: String(it.url), updated: today() });
      state.seededLinks[key] = true;
    });
  })();
  function nameHtml(p) {
    if (p.status === "Link" && /^https?:\/\//i.test(p.link)) return '<a href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer">' + esc(p.name) + "</a>";
    return esc(p.name);
  }
  function showErr(msg) {
    ui.err = msg;
    var f = document.querySelector("#panel form");
    if (!f) return;
    var e = f.querySelector(".err");
    if (!e) { e = document.createElement("div"); e.className = "err"; f.querySelector(".actions").before(e); }
    e.textContent = msg;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); storageOk = true; }
    catch (e) { storageOk = false; }
  }
  save();

  function toast(msg) {
    var slot = $("toast-slot");
    slot.innerHTML = '<div class="toast" role="status">' + esc(msg) + "</div>";
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { slot.innerHTML = ""; }, 2600);
  }

  function folderById(id) {
    for (var i = 0; i < state.folders.length; i++) if (state.folders[i].id === id) return state.folders[i];
    return null;
  }
  function folderName(id) {
    var f = folderById(id);
    if (!f) return "No folder";
    var parts = [f.name], guard = 0;
    while (f.parentId && guard++ < 10) { f = folderById(f.parentId); if (!f) break; parts.unshift(f.name); }
    return parts.join(" / ");
  }
  function tops() { return state.folders.filter(function (f) { return !f.parentId; }); }
  function childrenOf(id) { return state.folders.filter(function (f) { return f.parentId === id; }); }
  function idsUnder(id) { var out = [id]; childrenOf(id).forEach(function (c) { out = out.concat(idsUnder(c.id)); }); return out; }
  function countIn(id) {
    var ids = idsUnder(id);
    return state.projects.filter(function (p) { return ids.indexOf(p.folderId) !== -1; }).length;
  }
  function currentFolderId() { return ui.cur || null; }
  function selectFolder(id) {
    var f = folderById(id);
    if (!f) return;
    ui.cur = id;
  }

  /* ---------- render ---------- */
  function renderChips() {
    var co = ui.cur ? folderById(ui.cur) : null;
    var sb = null;
    var cr = "";
    if (co) {
      var chain = [], x = co, g = 0;
      while (x && g++ < 10) { chain.unshift(x); x = x.parentId ? folderById(x.parentId) : null; }
      cr = '<button class="crumb" type="button" data-act="crumb" data-id="">All folders</button>';
      chain.forEach(function (f, i) {
        cr += '<span class="sep">\u203a</span>' + (i === chain.length - 1 ? '<span class="here">' + esc(f.name) + "</span>" :
          '<button class="crumb" type="button" data-act="crumb" data-id="' + esc(f.id) + '">' + esc(f.name) + "</button>");
      });
    }
    $("crumbs").innerHTML = cr;
    $("crumbs").hidden = !cr;

    var list = co ? childrenOf(co.id) : tops();
    var h = list.map(function (f) {
      var fk = childrenOf(f.id).length, fn = countIn(f.id);
      return '<button class="fcard" type="button" data-act="open" data-id="' + esc(f.id) + '"><span class="ficon"><i></i></span><span class="ftxt"><strong>' + esc(f.name) + "</strong><small>" +
        fn + " link" + (fn === 1 ? "" : "s") + (fk ? " · " + fk + " folder" + (fk === 1 ? "" : "s") : "") + "</small></span></button>";
    }).join("");
    $("cards").innerHTML = h;
    $("cards").hidden = !h;
    $("folderCount").textContent = sb ? "" : list.length + (co ? " subfolder" : " folder") + (list.length === 1 ? "" : "s");
    $("newFolderForm").hidden = !!sb;
    $("newFolderName").placeholder = co ? "New subfolder name (e.g. Marketing)" : "New folder name (e.g. Merchx)";
    $("newFolderBtn").textContent = co ? "Create subfolder" : "Create folder";

    var t = "";
    var cur = currentFolderId();
    if (cur) {
      var cf = folderById(cur);
      var kids = childrenOf(cur).length;
      var n = countIn(cur);
      var armed = ui.confirm === "folder:" + cur;
      t = '<button class="btn small" type="button" data-act="rename-folder">Rename ' + esc(cf.name) + '</button>' +
        '<button class="btn small danger' + (armed ? " armed" : "") + '" type="button" data-act="delete-folder">' +
        (armed ? "Confirm: delete " + (kids ? kids + " subfolder" + (kids === 1 ? "" : "s") + " and " : "") + n + " project" + (n === 1 ? "" : "s") : "Delete " + esc(cf.name)) + "</button>";
    }
    $("folderTools").innerHTML = t;
  }

  function renderWarn() {
    $("storageWarn").innerHTML = storageOk ? "" :
      '<div class="alert">This browser is blocking storage, so changes will be lost when you close the page. Use Export my folders to keep a copy.</div>';
    var ex = state.projects.some(function (p) { return p.example; });
    $("exampleNote").innerHTML = ex ?
      '<div class="alert">The rows marked Example show how the table works. <button class="btn small" type="button" data-act="remove-examples">Remove examples</button></div>' : "";
  }

  function pathOf(id) {
    var chain = [], x = folderById(id), g = 0;
    while (x && g++ < 10) { chain.unshift(x); x = x.parentId ? folderById(x.parentId) : null; }
    return chain;
  }
  function deptDatalist(bizId) {
    return childrenOf(bizId).map(function (f) { return '<option value="' + esc(f.name) + '"></option>'; }).join("");
  }
  function folderOptions(sel) {
    var out = [];
    (function walk(l) { l.forEach(function (f) { out.push(f); walk(childrenOf(f.id)); }); })(tops());
    return out.map(function (f) {
      return '<option value="' + esc(f.id) + '"' + (f.id === sel ? " selected" : "") + ">" + esc(folderName(f.id)) + "</option>";
    }).join("");
  }

  function renderPanel() {
    var el = $("panel");
    if (ui.panel === "folder") {
      var f = ui.editId ? state.folders.filter(function (x) { return x.id === ui.editId; })[0] : null;
      el.innerHTML = '<form class="panel" id="folderForm" novalidate><h3>' + (f ? "Rename folder" : (ui.parentId ? "New subfolder in " + esc(folderName(ui.parentId)) : "New folder")) + '</h3>' +
        '<div class="fields"><div class="field"><label for="fName">Folder name</label><input id="fName" type="text" maxlength="60" value="' + esc(f ? f.name : "") + '" placeholder="' + (ui.parentId || (f && f.parentId) ? "For example, Marketing" : "For example, Merchx") + '" autocomplete="off"></div></div>' +
        (ui.err ? '<div class="err">' + esc(ui.err) + "</div>" : "") +
        '<div class="actions"><button class="btn primary" type="submit">' + (f ? "Save name" : "Create folder") + '</button><button class="btn" type="button" data-act="close-panel">Cancel</button></div></form>';
      var i = $("fName"); if (i) { i.focus(); i.select(); }
    } else if (ui.panel === "project") {
      if (!state.folders.length) { ui.panel = null; el.innerHTML = ""; return; }
      var p = ui.editId ? state.projects.filter(function (x) { return x.id === ui.editId; })[0] : null;
      var isLink = ui.linkMode;
      var folderSel = p ? p.folderId : (currentFolderId() || state.folders[0].id);
      var chain = pathOf(folderSel), bizTops = tops();
      var bizSel = chain[0] ? chain[0].id : (bizTops[0] ? bizTops[0].id : "");
      var deptVal = chain[1] ? chain[1].name : "";
      var subVal = chain.slice(2).map(function (x) { return x.name; }).join("/");
      var linkFolderFields =
        '<div class="field"><label for="pSub">Folder name</label><input id="pSub" type="text" maxlength="120" value="' + esc(subVal) + '" placeholder="e.g. Class Room Asset Audit" autocomplete="off"><small>Use / for a folder inside a folder.</small></div>' +
        '<div class="field"><label for="pBiz">Business</label><select id="pBiz">' + bizTops.map(function (f) {
          return '<option value="' + esc(f.id) + '"' + (f.id === bizSel ? " selected" : "") + ">" + esc(f.name) + "</option>";
        }).join("") + "</select></div>"  +
        '<div class="field"><label for="pDept">Department</label><input id="pDept" type="text" list="deptList" maxlength="60" value="' + esc(deptVal) + '" placeholder="e.g. Operations" autocomplete="off"><datalist id="deptList">' + deptDatalist(bizSel) + "</datalist></div>";
      el.innerHTML = '<form class="panel" id="projForm" novalidate><h3>' + (p ? (isLink ? "Edit link" : "Edit project") : (isLink ? "Add link" : "Add project")) + '</h3><div class="fields">' + (isLink ? linkFolderFields : "") +
        '<div class="field"><label for="pName">' + (isLink ? "Link name" : "Project name") + '</label><input id="pName" type="text" maxlength="120" value="' + esc(p ? p.name : "") + '" placeholder="' + (isLink ? "Attendance portal" : "my-project") + '" autocomplete="off"></div>' +
        (isLink ? "" : '<div class="field"><label for="pFolder">Folder</label><select id="pFolder">' + folderOptions(folderSel) + "</select></div>") +
        (isLink || p ? "" : '<div class="field"><label for="pNewFolder">New folder (optional)</label><input id="pNewFolder" type="text" maxlength="60" placeholder="Creates it inside the folder above" autocomplete="off"></div>') +
        (isLink ? "" : '<div class="field"><label for="pStatus">Status</label><select id="pStatus">' + STATUSES.filter(function (s) { return s !== "Link"; }).map(function (s) { return '<option' + (p && p.status === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></div>") +
        (isLink ? "" : '<div class="field"><label for="pUpdated">Last worked on</label><input id="pUpdated" type="date" value="' + esc(p ? p.updated : today()) + '"></div>') +
        (isLink ? "" : '<div class="field"><label for="pStack">Stack</label><input id="pStack" type="text" maxlength="200" value="' + esc(p ? p.stack.join(", ") : "") + '" placeholder="Python, SQL, HTML" autocomplete="off"><small>Separate with commas.</small></div>') +
        '<div class="field"><label for="pLink">' + (isLink ? "Link" : "Link or folder path") + '</label><input id="pLink" type="text" maxlength="400" value="' + esc(p ? p.link : "") + '" placeholder="https://github.com/you/repo or C:\\Projects\\repo" autocomplete="off"></div>' +
        '<div class="field wide"><label for="pDesc">Notes</label><textarea id="pDesc" maxlength="500" placeholder="What this project does">' + esc(p ? p.desc : "") + "</textarea></div></div>" +
        (ui.err ? '<div class="err">' + esc(ui.err) + "</div>" : "") +
        '<div class="actions"><button class="btn primary" type="submit">' + (p ? "Save changes" : (isLink ? "Add link" : "Add to table")) + '</button><button class="btn" type="button" data-act="close-panel">Cancel</button></div></form>';
      var n = $("pName"); if (n) n.focus();
    } else if (ui.panel === "export") {
      el.innerHTML = '<div class="panel"><h3>Copy your folders</h3><p class="note">This browser cannot save files from here. Copy the text below into a file named vscode-workspace.json, then use Import on the other device.</p>' +
        '<textarea class="export-box" id="exportBox" readonly>' + esc(ui.exportText) + '</textarea>' +
        '<div class="actions"><button class="btn primary" type="button" data-act="copy-export">Copy text</button><button class="btn" type="button" data-act="close-panel">Close</button></div></div>';
    } else {
      el.innerHTML = "";
    }
  }

  function visibleAll() {
    var q = ui.q.trim().toLowerCase();
    var scope = q ? null : (ui.cur ? [ui.cur] : null);
    var list = state.projects.filter(function (p) {
      if (scope && scope.indexOf(p.folderId) === -1) return false;
      if (!q) return true;
      return (p.name + " " + p.desc + " " + p.stack.join(" ") + " " + p.link + " " + p.status + " " + folderName(p.folderId)).toLowerCase().indexOf(q) !== -1;
    });
    var k = ui.sortKey, dir = ui.sortDir === "asc" ? 1 : -1;
    list.sort(function (a, b) {
      var x, y;
      if (k === "folder") { x = folderName(a.folderId).toLowerCase(); y = folderName(b.folderId).toLowerCase(); }
      else if (k === "stack") { x = a.stack.join(",").toLowerCase(); y = b.stack.join(",").toLowerCase(); }
      else { x = String(a[k] || "").toLowerCase(); y = String(b[k] || "").toLowerCase(); }
      return x < y ? -dir : x > y ? dir : 0;
    });
    return list;
  }
  function visibleProjects() { return visibleAll().filter(function (p) { return p.status !== "Link"; }); }
  function visibleLinks() { return visibleAll().filter(function (p) { return p.status === "Link"; }); }

  function shortLink(link) { return String(link || "").replace(/^https?:\/\//i, "").replace(/\/+$/, ""); }
  function renderLinks(links) {
    var box = $("linkbox");
    if (!links.length) { box.innerHTML = ""; return; }
    var showFolder = !!ui.q.trim();
    var h = '<div class="sublabel">Links</div><div class="lgrid">';
    links.forEach(function (p) {
      var web = /^https?:\/\//i.test(p.link || "");
      var armed = ui.confirm === "proj:" + p.id;
      var inner = '<span class="lav">' + esc((p.name || "?").charAt(0).toUpperCase()) + '</span><span class="ltxt"><strong>' + esc(p.name) + "</strong><small>" +
        esc(shortLink(p.link)) + (showFolder ? " \u00b7 " + esc(folderName(p.folderId)) : "") + "</small></span>";
      h += '<div class="lcard">' +
        (web ? '<a class="lmain" href="' + esc(p.link) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>" : '<div class="lmain">' + inner + "</div>") +
        '<div class="lacts"><button class="btn small" type="button" data-act="copy-loc" data-val="' + esc(p.link) + '">Copy link</button>' +
        '<button class="btn small" type="button" data-act="edit-project" data-id="' + esc(p.id) + '">Edit</button>' +
        '<button class="btn small danger' + (armed ? " armed" : "") + '" type="button" data-act="delete-project" data-id="' + esc(p.id) + '">' + (armed ? "Confirm" : "Delete") + "</button></div></div>";
    });
    box.innerHTML = h + "</div>";
  }

  function th(key, label) {
    var on = ui.sortKey === key;
    var arr = on ? (ui.sortDir === "asc" ? " \u2191" : " \u2193") : "";
    return '<th scope="col" aria-sort="' + (on ? (ui.sortDir === "asc" ? "ascending" : "descending") : "none") + '"><button type="button" data-act="sort" data-key="' + key + '">' + label + '<span class="arr">' + arr + "</span></button></th>";
  }

  function locCell(link) {
    if (!link) return '<span class="fold">-</span>';
    if (/^https?:\/\//i.test(link)) return '<a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">' + esc(link.replace(/^https?:\/\//i, "")) + "</a>";
    return esc(link) + ' <button class="btn ghost small" type="button" data-act="copy-loc" data-val="' + esc(link) + '">Copy</button>';
  }

  function renderTable() {
    var box = $("tablebox");
    var links = visibleLinks();
    renderLinks(links);
    var list = visibleProjects();
    if (!list.length && links.length) { box.innerHTML = ""; box.style.display = "none"; return; }
    box.style.display = "";
    if (!state.projects.length || (!list.length && !ui.q && ui.cur)) {
      box.innerHTML = '<div class="empty"><strong>' + (state.folders.length ? "No links or projects here yet" : "Create a folder to begin") + "</strong>" +
        (state.folders.length ? "Add a link to a company app, or add a project." : "Folders group your projects. Make one, then add projects to it.") +
        '<br><button class="btn primary" type="button" data-act="' + (state.folders.length ? "new-link" : "new-folder") + '">' + (state.folders.length ? "Add link" : "Create folder") + "</button></div>";
      return;
    }
    if (!list.length) {
      box.innerHTML = '<div class="empty"><strong>No match</strong>Nothing in this view matches "' + esc(ui.q) + '".</div>';
      return;
    }
    var showFolder = !!ui.q.trim();
    var h = "<table><thead><tr>" + th("name", "Project") + (showFolder ? th("folder", "Folder") : "") + th("stack", "Stack") + th("status", "Status") + '<th scope="col">Link or path</th>' + th("updated", "Updated") + '<th scope="col"><span class="sr" style="position:absolute;left:-9999px">Actions</span></th></tr></thead><tbody>';
    list.forEach(function (p) {
      var armed = ui.confirm === "proj:" + p.id;
      h += "<tr><td><div class=\"pname\">" + nameHtml(p) + (p.example ? '<span class="ex">Example</span>' : "") + "</div>" + (p.desc ? '<div class="pdesc">' + esc(p.desc) + "</div>" : "") + "</td>" +
        (showFolder ? '<td class="fold">' + esc(folderName(p.folderId)) + "</td>" : "") +
        '<td><div class="stack">' + (p.stack.length ? p.stack.map(function (s) { return '<span class="tg">' + esc(s) + "</span>"; }).join("") : '<span class="fold">-</span>') + "</div></td>" +
        '<td><span class="pill ' + esc(p.status) + '">' + esc(p.status) + "</span></td>" +
        '<td class="loc">' + locCell(p.link) + "</td>" +
        '<td class="date">' + esc(p.updated || "-") + "</td>" +
        '<td><div class="acts"><button class="btn small" type="button" data-act="edit-project" data-id="' + esc(p.id) + '">Edit</button>' +
        '<button class="btn small danger' + (armed ? " armed" : "") + '" type="button" data-act="delete-project" data-id="' + esc(p.id) + '">' + (armed ? "Confirm" : "Delete") + "</button></div></td></tr>";
    });
    box.innerHTML = h + "</tbody></table>";
  }

  function renderFoot() {
    var v = visibleAll().length;
    $("foot").textContent = v + " of " + state.projects.length + " item" + (state.projects.length === 1 ? "" : "s") + " shown across " + state.folders.length + " folder" + (state.folders.length === 1 ? "" : "s") + ".";
  }

  function syncProjSec() {
    /* First window: only the Add link button; links appear inside their folders (or in search). */
    var root = !ui.cur && !ui.q.trim();
    ["exampleNote", "linkbox", "tablebox", "btnNewProject"].forEach(function (id) { $(id).hidden = root; });
    document.querySelector("#projSec .sec-head").hidden = root;
  }
  function render() {
    if (ui.cur && !folderById(ui.cur)) ui.cur = null;
    renderChips(); renderWarn(); renderTable(); renderFoot(); syncProjSec();
  }
  function commit() { save(); render(); }

  /* ---------- csv ---------- */
  function parseCsv(text) {
    var rows = [], row = [], cur = "", q = false, i, c;
    text = text.replace(/^\uFEFF/, "");
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur); cur = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }
  function csvCell(v) {
    v = String(v == null ? "" : v);
    return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function toCsv() {
    var head = ["Folder", "Project", "Notes", "Stack", "Status", "Link or path", "Updated"];
    var lines = [head.join(",")];
    state.projects.forEach(function (p) {
      lines.push([folderName(p.folderId), p.name, p.desc, p.stack.join("; "), p.status, p.link, p.updated].map(csvCell).join(","));
    });
    return lines.join("\r\n");
  }

  function clean(s, n) { return String(s == null ? "" : s).trim().slice(0, n); }
  function cleanDate(s) { s = clean(s, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : today(); }

  function importCsv(text) {
    var rows = parseCsv(text);
    if (rows.length < 2) { toast("That CSV has no rows to import."); return; }
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    function col() { for (var a = 0; a < arguments.length; a++) { var ix = head.indexOf(arguments[a]); if (ix !== -1) return ix; } return -1; }
    var cName = col("project", "name"), cDesc = col("description", "notes"), cLang = col("languages", "stack"),
      cUpd = col("last updated", "updated"), cGit = col("git remote", "link", "link or path"), cPath = col("path"), cFolder = col("folder");
    if (cName === -1) { toast("No Project column found in that CSV."); return; }
    function folderFor(name) {
      var f = state.folders.filter(function (x) { return x.name.toLowerCase() === name.toLowerCase(); })[0];
      if (!f) { f = { id: uid(), name: name }; state.folders.push(f); }
      return f.id;
    }
    var fallback = currentFolderId(), added = 0;
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r], name = clean(row[cName], 120);
      if (!name) continue;
      var git = cGit !== -1 ? clean(row[cGit], 400) : "", path = cPath !== -1 ? clean(row[cPath], 400) : "";
      var fid = cFolder !== -1 && clean(row[cFolder], 60) ? folderFor(clean(row[cFolder], 60)) : (fallback || (fallback = folderFor("Imported")));
      state.projects.push({
        id: uid(), folderId: fid, name: name,
        desc: cDesc !== -1 ? clean(row[cDesc], 500) : "",
        stack: cLang !== -1 ? clean(row[cLang], 200).split(/[,;]/).map(function (s) { return s.trim(); }).filter(function (s) { return s && s !== "-"; }) : [],
        status: "Active",
        link: git && git !== "-" ? git : (path && path !== "-" ? path : ""),
        updated: cUpd !== -1 ? cleanDate(row[cUpd]) : today()
      });
      added++;
    }
    commit(); toast("Imported " + added + " project" + (added === 1 ? "" : "s") + ".");
  }
  function importJson(text) {
    var d;
    try { d = JSON.parse(text); } catch (e) { toast("That file is not valid JSON."); return; }
    if (!d || !Array.isArray(d.folders) || !Array.isArray(d.projects)) { toast("That file is not a workspace export."); return; }
    var fids = {}, af = 0, ap = 0;
    state.folders.forEach(function (f) { fids[f.id] = true; });
    d.folders.forEach(function (f) {
      if (!f || !f.id || fids[f.id]) return;
      var name = clean(f.name, 60); if (!name) return;
      var nfi = { id: clean(f.id, 40), name: name };
      if (f.parentId) nfi.parentId = clean(f.parentId, 40);
      state.folders.push(nfi); fids[clean(f.id, 40)] = true; af++;
    });
    var pids = {};
    state.projects.forEach(function (p) { pids[p.id] = true; });
    d.projects.forEach(function (p) {
      if (!p || !p.id || pids[p.id] || !fids[p.folderId]) return;
      var name = clean(p.name, 120); if (!name) return;
      state.projects.push({
        id: clean(p.id, 40), folderId: p.folderId, name: name, desc: clean(p.desc, 500),
        stack: Array.isArray(p.stack) ? p.stack.map(function (s) { return clean(s, 40); }).filter(Boolean).slice(0, 12) : [],
        status: STATUSES.indexOf(p.status) !== -1 ? p.status : "Active", link: clean(p.link, 400), updated: cleanDate(p.updated)
      });
      ap++;
    });
    commit(); toast("Imported " + af + " folder" + (af === 1 ? "" : "s") + " and " + ap + " project" + (ap === 1 ? "" : "s") + ".");
  }

  /* ---------- actions ---------- */
  function saveFile(filename, data, fallbackText) {
    var go = (window.claude && window.claude.use) ? window.claude.use("downloads") : Promise.resolve(null);
    Promise.resolve(go).then(function (dl) {
      if (!dl) throw { code: "unavailable" };
      return dl.save({ filename: filename, data: data });
    }).then(function () { toast("Saved " + filename); }).catch(function (e) {
      if (e && e.code === "declined") return;
      ui.panel = "export"; ui.exportText = fallbackText; renderPanel();
    });
  }
  function copyText(text, msg) {
    var done = function () { toast(msg); };
    var fail = function () { toast("Copy was blocked. Select the text and copy it yourself."); };
    try { navigator.clipboard.writeText(text).then(done, fail); } catch (e) { fail(); }
  }

  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-act]");
    if (!b) return;
    var act = b.getAttribute("data-act"), id = b.getAttribute("data-id");
    if (act !== "delete-project" && act !== "delete-folder") ui.confirm = null;
    switch (act) {
      case "open": selectFolder(id); ui.confirm = null; render(); break;
      case "crumb":
        ui.cur = id || null;
        ui.confirm = null; render(); break;
      case "sort":
        var k = b.getAttribute("data-key");
        if (ui.sortKey === k) ui.sortDir = ui.sortDir === "asc" ? "desc" : "asc"; else { ui.sortKey = k; ui.sortDir = k === "updated" ? "desc" : "asc"; }
        renderTable(); break;
      case "new-folder": $("newFolderName").focus(); break;
      case "rename-folder": ui.panel = "folder"; ui.editId = currentFolderId(); ui.parentId = null; ui.err = ""; renderChips(); renderPanel(); break;
      case "new-project":
        if (!state.folders.length) { ui.panel = "folder"; ui.editId = null; ui.err = ""; renderPanel(); toast("Create a folder first."); break; }
        ui.linkMode = false; ui.panel = "project"; ui.editId = null; ui.err = ""; renderPanel(); break;
      case "new-link":
        if (!state.folders.length) { ui.panel = "folder"; ui.editId = null; ui.err = ""; renderPanel(); toast("Create a folder first."); break; }
        ui.linkMode = true; ui.panel = "project"; ui.editId = null; ui.err = ""; renderPanel(); break;
      case "edit-project":
        var ep = state.projects.filter(function (p) { return p.id === id; })[0];
        ui.linkMode = !!ep && ep.status === "Link";
        ui.panel = "project"; ui.editId = id; ui.err = ""; renderPanel(); $("panel").scrollIntoView({ block: "nearest" }); break;
      case "close-panel": ui.panel = null; ui.editId = null; ui.err = ""; renderPanel(); break;
      case "delete-project":
        if (ui.confirm === "proj:" + id) {
          state.projects = state.projects.filter(function (p) { return p.id !== id; });
          ui.confirm = null; commit(); toast("Project deleted.");
        } else { ui.confirm = "proj:" + id; renderTable(); }
        break;
      case "delete-folder":
        var cur = currentFolderId();
        if (!cur) break;
        if (ui.confirm === "folder:" + cur) {
          var gone = idsUnder(cur);
          state.projects = state.projects.filter(function (p) { return gone.indexOf(p.folderId) === -1; });
          state.folders = state.folders.filter(function (f) { return gone.indexOf(f.id) === -1; });
          var gf = folderById(cur); ui.cur = gf && gf.parentId ? gf.parentId : null;
          ui.confirm = null; commit(); toast("Folder deleted.");
        } else { ui.confirm = "folder:" + cur; renderChips(); }
        break;
      case "remove-examples":
        state.projects = state.projects.filter(function (p) { return !p.example; });
        commit(); toast("Examples removed.");
        break;
      case "export-json":
        var json = JSON.stringify(state, null, 2); saveFile("vscode-workspace.json", json, json); break;
      case "export-csv":
        var csv = toCsv(); saveFile("vscode-workspace.csv", csv, csv); break;
      case "import": $("importFile").click(); break;
      case "copy-loc": copyText(b.getAttribute("data-val"), "Link copied."); break;
      case "copy-export": var bx = $("exportBox"); copyText(bx ? bx.value : "", "Copied."); if (bx) bx.select(); break;
    }
  });

  document.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (ev.target.id === "folderForm") {
      var name = clean($("fName").value, 60);
      if (!name) { ui.err = "Enter a folder name."; renderPanel(); return; }
      var editing = ui.editId ? folderById(ui.editId) : null;
      var parent = editing ? (editing.parentId || null) : (ui.parentId || null);
      var dupe = state.folders.some(function (f) { return f.name.toLowerCase() === name.toLowerCase() && (f.parentId || null) === parent && f.id !== ui.editId; });
      if (dupe) { showErr("A folder with that name already exists here."); return; }
      if (editing) {
        editing.name = name;
      } else {
        var nf = { id: uid(), name: name };
        if (parent) nf.parentId = parent;
        state.folders.push(nf);
        selectFolder(nf.id);
      }
      ui.panel = null; ui.editId = null; ui.parentId = null; ui.err = ""; commit(); renderPanel(); toast("Folder saved.");
    } else if (ev.target.id === "projForm") {
      var pn = clean($("pName").value, 120);
      if (!pn) { showErr(ui.linkMode ? "Enter a name." : "Enter a project name."); return; }
      var rec = { name: pn, folderId: ui.linkMode ? $("pBiz").value : $("pFolder").value, link: clean($("pLink").value, 400), desc: clean($("pDesc").value, 500) };
      if (ui.linkMode && !rec.link) { showErr("Enter the link."); return; }
      var pathParts = [];
      if (ui.linkMode) pathParts = [$("pDept").value].concat($("pSub").value.split("/"));
      else if ($("pNewFolder")) pathParts = [$("pNewFolder").value];
      var fid = rec.folderId;
      pathParts.map(function (t) { return clean(t, 60); }).filter(Boolean).forEach(function (part) {
        var f = findFolder(part, fid);
        if (!f) { f = { id: uid(), name: part, parentId: fid }; state.folders.push(f); }
        fid = f.id;
      });
      rec.folderId = fid;
      if (ui.linkMode) {
        rec.status = "Link";
        if (!ui.editId) { rec.stack = []; rec.updated = today(); }
      } else {
        rec.status = $("pStatus").value;
        rec.updated = cleanDate($("pUpdated").value);
        rec.stack = clean($("pStack").value, 200).split(",").map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 12);
      }
      if (ui.editId) {
        state.projects.forEach(function (p) { if (p.id === ui.editId) { for (var k in rec) p[k] = rec[k]; delete p.example; } });
      } else {
        rec.id = uid(); state.projects.push(rec);
        selectFolder(rec.folderId);
      }
      ui.panel = null; ui.editId = null; ui.err = ""; commit(); renderPanel(); toast(ui.linkMode ? "Link saved." : "Project saved.");
    }
  });

  $("newFolderForm").addEventListener("submit", function () {
    var input = $("newFolderName"), name = clean(input.value, 60);
    if (!name) { toast("Enter a folder name."); input.focus(); return; }
    var parent = ui.cur || null;
    var dupe = state.folders.some(function (f) { return f.name.toLowerCase() === name.toLowerCase() && (f.parentId || null) === parent; });
    if (dupe) { toast("A folder with that name already exists here."); return; }
    var nf = { id: uid(), name: name };
    if (parent) nf.parentId = parent;
    state.folders.push(nf);
    input.value = "";
    commit();
    toast("Folder created.");
  });
  $("search").addEventListener("input", function (e) { ui.q = e.target.value; renderTable(); renderFoot(); syncProjSec(); });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "pBiz") $("deptList").innerHTML = deptDatalist(e.target.value);
  });
  $("importFile").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      var text = String(r.result || "");
      if (/\.csv$/i.test(f.name)) importCsv(text); else importJson(text);
      e.target.value = "";
    };
    r.onerror = function () { toast("Could not read that file."); };
    r.readAsText(f);
  });

  render();
  renderPanel();
})();