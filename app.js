
const DATA = window.DANCE_DATA;
const app = document.getElementById("app");

const KINDS = {
  "posición": "position",
  "movimiento": "move",
  "transición": "transition",
  "recordatorio": "reminder",
  "momento": "moment",
  "forma": "forma",
  "posición/movimiento": "move"
};

const state = {
  person: localStorage.getItem("selectedPerson") || ""
};

function norm(s){
  return (s || "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"");
}

function route(){
  const hash = location.hash.replace("#","");
  const [page, id] = hash.split("/");
  render(page || "inicio", id);
}

window.addEventListener("hashchange", route);

function shell(content, page="inicio"){
  app.innerHTML = `
    <div class="app-shell">
      <header class="header">
        <div class="header-inner">
          <a class="brand" href="#inicio">
            <div class="logo">💃</div>
            <div>
              <h1>Baile sorpresa</h1>
              <p>Hub visual · boda</p>
            </div>
          </a>
          <div class="top-actions">
            <a class="pill" href="#timeline">Timeline</a>
            <a class="pill primary" href="#personas">Mi posición</a>
          </div>
        </div>
      </header>
      <main class="main">${content}</main>
      <nav class="bottom-nav">
        <div class="bottom-nav-inner">
          ${navButton("inicio","🏠","Inicio",page)}
          ${navButton("timeline","🎵","Timeline",page)}
          ${navButton("personas","👤","Yo",page)}
          ${navButton("mapas","🗺️","Mapas",page)}
        </div>
      </nav>
    </div>
  `;
}

function navButton(id, icon, label, current){
  return `<button class="nav-btn ${current===id ? "active" : ""}" onclick="location.hash='${id}'"><b>${icon}</b><span>${label}</span></button>`;
}

function render(page, id){
  if(page === "timeline") return renderTimeline();
  if(page === "song") return renderSong(id);
  if(page === "personas") return renderPeople();
  if(page === "profile") return renderProfile(decodeURIComponent(id || ""));
  if(page === "mapas") return renderMaps();
  return renderHome();
}

function renderHome(){
  shell(`
    <section class="hero">
      <div class="card hero-card">
        <div class="kicker">Versión v0 actualizable</div>
        <h2>Entra, toca tu nombre y mira solo lo tuyo.</h2>
        <p>Esta web está pensada para que nadie se agobie. Las transiciones están marcadas como movimiento y las posiciones reales como posición.</p>
        <div class="quick-grid">
          <button class="big-button" onclick="location.hash='personas'">
            <b>👤 Buscar mi nombre</b>
            <span>La opción más importante</span>
          </button>
          <button class="big-button" onclick="location.hash='timeline'">
            <b>🎵 Ver timeline</b>
            <span>Orden completo del baile</span>
          </button>
          <button class="big-button" onclick="location.hash='song/grease'">
            <b>🕺 Ir a Grease</b>
            <span>Final con María y Carlos</span>
          </button>
          <button class="big-button" onclick="location.hash='mapas'">
            <b>🗺️ Mapas generales</b>
            <span>Consulta global</span>
          </button>
        </div>
      </div>
      <aside class="card panic-card">
        <h3>Regla anti-agobio</h3>
        <ul>
          <li><b>1.</b> Mira primero tu nombre.</li>
          <li><b>2.</b> Si pone movimiento, no te quedes clavado ahí.</li>
          <li><b>3.</b> En transiciones, busca tu zona sin chocar.</li>
          <li><b>4.</b> En Grease importa más la intención que la perfección.</li>
        </ul>
      </aside>
    </section>
    <div class="notice"><b>Faltan vídeos/audio:</b> esta v0 deja el hueco preparado. Cuando paséis vídeos, se incrustan aquí sin cambiar la estructura.</div>
    ${timelineBlock(false)}
  `, "inicio");
}

function timelineBlock(full=true){
  return `
    <section>
      <div class="section-title">
        <div>
          <h2>Timeline del show</h2>
          <p>Toca una canción para ver sus posiciones.</p>
        </div>
      </div>
      <div class="timeline">
        ${DATA.songs.map((song, i)=>songRow(song, i)).join("")}
      </div>
    </section>
  `;
}

function songRow(song, i){
  const ok = song.status.includes("listo") ? "ok" : "warn";
  return `
    <article class="song-row" onclick="location.hash='song/${song.id}'">
      <div class="song-num">${i+1}</div>
      <div class="song-main">
        <h3>${song.emoji} ${song.title}</h3>
        <p>${song.subtitle || ""}</p>
      </div>
      <div class="song-tags">
        <span class="tag ${ok}">${song.status}</span>
        <span class="tag">${song.steps.length} mapas</span>
      </div>
    </article>
  `;
}

function renderTimeline(){
  shell(timelineBlock(), "timeline");
}

function renderSong(id){
  const song = DATA.songs.find(s=>s.id===id) || DATA.songs[0];
  shell(`
    <section class="song-view">
      <article class="card song-header">
        <a class="pill small" href="#timeline">← Timeline</a>
        <h2>${song.emoji} ${song.title}</h2>
        <p>${song.subtitle || ""}</p>
        <ul class="summary-list">
          ${song.summary.map(x=>`<li>${x}</li>`).join("")}
        </ul>
      </article>
      ${song.steps.length ? `
        <div class="step-grid">
          ${song.steps.map((step, idx)=>stepCard(step, song, idx)).join("")}
        </div>
      ` : `<div class="empty">Aún falta subir material visual de esta parte.</div>`}
    </section>
  `, "timeline");
}

function kindTag(kind){
  const css = KINDS[kind] || "";
  return `<span class="tag ${css}">${kind}</span>`;
}

function stepCard(step, song, idx){
  return `
    <article class="card step-card">
      <div class="step-top">
        <h3>${idx+1}. ${step.title}</h3>
        ${kindTag(step.kind)}
      </div>
      <div class="image-wrap">
        <img src="${step.image}" alt="${song.title} · ${step.title}" loading="lazy">
        <button onclick="openImage('${step.image}', '${escapeAttr(song.title)} · ${escapeAttr(step.title)}')">Ampliar</button>
      </div>
      <div class="video-box">🎬 <span><b>Vídeo:</b> pendiente de subir</span></div>
      <ul class="step-notes">
        ${step.notes.map(n=>`<li>${n}</li>`).join("")}
      </ul>
    </article>
  `;
}

function renderPeople(){
  const q = "";
  shell(`
    <section>
      <div class="section-title">
        <div>
          <h2>Busca tu nombre</h2>
          <p>Elige tu perfil. Esto es lo que debe mirar cada persona.</p>
        </div>
      </div>
      <input id="personSearch" class="search-box" placeholder="Escribe tu nombre… Ej: Ruth, Sof, Manuel" oninput="filterPeople()">
      <div id="peopleGrid" class="people-grid">
        ${DATA.participants.map(p=>personChip(p)).join("")}
      </div>
      <div id="selectedProfile">
        ${state.person ? profileHtml(state.person) : `<div class="empty">Toca tu nombre para ver tu resumen personal.</div>`}
      </div>
    </section>
  `, "personas");
}

function personChip(person){
  const active = state.person === person.name ? "active" : "";
  return `<button class="person-chip ${active}" data-name="${person.name}" onclick="selectPerson('${escapeAttr(person.name)}')">${person.name}</button>`;
}

window.selectPerson = function(name){
  state.person = name;
  localStorage.setItem("selectedPerson", name);
  renderPeople();
}

window.filterPeople = function(){
  const q = norm(document.getElementById("personSearch").value);
  const chips = [...document.querySelectorAll(".person-chip")];
  chips.forEach(chip => {
    chip.style.display = norm(chip.dataset.name).includes(q) ? "" : "none";
  });
}

function profileHtml(name){
  const specialNotes = DATA.personalNotes[name] || [
    "Busca tu nombre o inicial en cada imagen.",
    "Si la tarjeta pone movimiento/transición, no es para quedarse quieto: es para llegar al siguiente sitio.",
    "Si te agobias, mira solo los mapas clave de cada canción."
  ];

  const songs = DATA.songs.filter(s=>s.steps.length);
  return `
    <article class="card profile-card">
      <div class="profile-head">
        <h2>Perfil de ${name}</h2>
        <a class="pill small" href="#profile/${encodeURIComponent(name)}">Abrir perfil</a>
      </div>
      <div class="profile-notes">
        ${specialNotes.map(n=>`<div class="profile-note">${n}</div>`).join("")}
      </div>
      <div class="profile-song-list">
        ${songs.map(song => profileSong(song, name)).join("")}
      </div>
    </article>
  `;
}

function profileSong(song, name){
  const specials = song.steps.filter(st => (st.special || []).includes(name));
  const specialText = specials.length
    ? specials.map(s=>`<b>${s.title}:</b> ${s.notes.join(" ")}`).join("<br>")
    : "Mira los mapas de esta canción y busca tu nombre/inicial.";
  return `
    <div class="profile-song">
      <h3>${song.emoji} ${song.title}</h3>
      <p>${specialText}</p>
      <p style="margin-top:8px"><a class="pill small" href="#song/${song.id}">Ver mapas</a></p>
    </div>
  `;
}

function renderProfile(name){
  shell(`
    <a class="pill small" href="#personas">← Volver a nombres</a>
    ${profileHtml(name || state.person || "Sin nombre")}
  `, "personas");
}

function renderMaps(){
  const maps = DATA.songs.flatMap(song => song.steps.map((step, i)=>({song, step, i})));
  shell(`
    <section>
      <div class="section-title">
        <div>
          <h2>Posiciones generales</h2>
          <p>Todos los mapas en orden. Úsalo solo para consulta global.</p>
        </div>
      </div>
      <div class="general-grid">
        ${maps.map(({song, step, i})=>`
          <article class="mini-map" onclick="openImage('${step.image}', '${escapeAttr(song.title)} · ${escapeAttr(step.title)}')">
            <img src="${step.image}" alt="${song.title} · ${step.title}" loading="lazy">
            <h3>${song.emoji} ${song.title} · ${step.title}</h3>
            <p>${step.kind}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `, "mapas");
}

function escapeAttr(s){
  return String(s).replace(/'/g,"&#39;").replace(/"/g,"&quot;");
}

window.openImage = function(src, caption){
  const dlg = document.getElementById("imageDialog");
  document.getElementById("dialogImage").src = src;
  document.getElementById("dialogCaption").textContent = caption;
  dlg.showModal();
}

window.closeImage = function(){
  document.getElementById("imageDialog").close();
}

route();
