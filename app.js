const DATA = window.DANCE_DATA;
const app = document.getElementById('app');
const state = { person: localStorage.getItem('selectedPerson') || '' };

function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''); }
function esc(s){ return String(s).replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }
function isEveryone(song){ return song.dancers === 'TODOS'; }
function dancesSong(person, song){ if(song.introOnly) return false; return isEveryone(song) || (song.dancers||[]).includes(person); }
function notesFor(person, songId){ return ((DATA.personalNotes || {})[person] || {})[songId] || []; }

function route(){ const h = location.hash.replace('#','') || 'inicio'; const [page, id] = h.split('/'); render(page, decodeURIComponent(id || '')); }
window.addEventListener('hashchange', route);

function shell(content, page){
  app.innerHTML = `
    <div class="shell">
      <header class="top"><div class="top-inner">
        <a class="brand" href="#inicio"><div class="logo">💃</div><b>Baile boda</b></a>
        <div class="top-actions"><a class="pill" href="#timeline">Timeline</a><a class="pill primary" href="#personas">Busca tu nombre</a></div>
      </div></header>
      <main class="main">${content}</main>
      <nav class="bottom"><div class="bottom-inner">
        ${nav('inicio','🏠','Inicio',page)}${nav('timeline','🎵','Timeline',page)}${nav('personas','👤','Yo',page)}${nav('mapas','🗺️','Mapas',page)}
      </div></nav>
    </div>`;
}
function nav(id, icon, label, current){ return `<button class="nav ${current===id?'active':''}" onclick="location.hash='${id}'"><b>${icon}</b><span>${label}</span></button>`; }
function render(page, id){ if(page==='timeline') return renderTimeline(); if(page==='song') return renderSong(id); if(page==='personas') return renderPeople(); if(page==='profile') return renderProfile(id); if(page==='mapas') return renderMaps(); return renderHome(); }

function timelineHtml(){ return `<section><div class="section-head"><div><h2>Timeline</h2></div></div><div class="timeline">${DATA.songs.map((s,i)=>songRow(s,i)).join('')}</div></section>`; }
function songRow(song, i){ return `<article class="song-row" onclick="location.hash='song/${song.id}'"><div class="song-num">${i+1}</div><div class="song-main"><h3>${song.emoji} ${song.title}</h3><p>${song.subtitle||''}</p></div><div class="song-arrow">›</div></article>`; }
function renderHome(){ shell(`<h1 class="home-title">${DATA.siteTitle}</h1><div class="home-actions"><button class="main-button" onclick="location.hash='personas'">Busca tu nombre</button></div>${timelineHtml()}`, 'inicio'); }
function renderTimeline(){ shell(timelineHtml(), 'timeline'); }

function renderSong(id){
  const song = DATA.songs.find(s=>s.id===id) || DATA.songs[0];
  if(song.introOnly){
    shell(`<article class="card song-title-card"><a class="pill small" href="#timeline">← Timeline</a><h1>${song.emoji} ${song.title}</h1><p>${song.subtitle}</p><div class="intro-text">${song.text.map(t=>`<p>${t}</p>`).join('')}</div></article>`, 'timeline');
    return;
  }
  shell(`
    <article class="card song-title-card"><a class="pill small" href="#timeline">← Timeline</a><h1>${song.emoji} ${song.title}</h1><p>${song.subtitle||''}</p></article>
    <section class="card block"><h2>Bailarines</h2>${dancersHtml(song.dancers)}</section>
    <section class="block"><h2>Posiciones</h2><div class="positions">${song.positions.map(p=>positionCard(p, song)).join('')}</div></section>
    <section class="card block"><h2>Vídeo baile</h2>${videoCard(song.videos?.dance, 'Vídeo baile · '+song.title)}</section>
    <section class="card block"><h2>Vídeo paso a paso</h2>${videoCard(song.videos?.step, 'Vídeo paso a paso · '+song.title)}</section>
    ${song.clarifications?.length ? `<section class="card block"><h2>Aclaraciones</h2><div class="clarifications">${song.clarifications.map(c=>`<div class="clarification">${c}</div>`).join('')}</div></section>` : ''}
  `, 'timeline');
}
function dancersHtml(dancers){ if(dancers==='TODOS') return `<div class="chips"><span class="chip all">TODOS</span></div>`; return `<div class="chips">${dancers.map(d=>`<span class="chip">${d}</span>`).join('')}</div>`; }
function labelClass(label){ const l=norm(label); if(l.includes('mov')) return 'mov'; if(l.includes('trans')) return 'trans'; if(l.includes('mom')||l.includes('forma')) return 'mom'; if(l.includes('record')) return 'rec'; return 'pos'; }
function positionCard(p, song){ return `<article class="card pos-card"><div class="pos-head"><h3>${p.title}</h3><span class="tag ${labelClass(p.label)}">${p.label}</span></div><div class="image-wrap"><img src="${p.image}" alt="${song.title} · ${p.title}" loading="lazy"><button onclick="openImage('${p.image}','${esc(song.title)} · ${esc(p.title)}')">Ampliar</button></div><ul class="notes">${p.notes.map(n=>`<li>${n}</li>`).join('')}</ul></article>`; }
function videoCard(src, title){ if(!src) return `<div class="empty">Pendiente de subir.</div>`; return `<div class="video-card"><h3>${title}</h3><video src="${src}" controls preload="metadata" playsinline></video></div>`; }

function renderPeople(){
  shell(`<section><div class="section-head"><div><h2>Busca tu nombre</h2><p>Te saldrán solo los bailes que haces tú.</p></div></div><input id="personSearch" class="search" placeholder="Escribe tu nombre…" oninput="filterPeople()"><div id="people" class="people">${DATA.participants.map(p=>personChip(p)).join('')}</div><div id="profileBox">${state.person ? profileHtml(state.person) : `<div class="empty">Toca tu nombre para ver tus bailes.</div>`}</div></section>`, 'personas');
}
function personChip(name){ return `<button class="person ${state.person===name?'active':''}" data-name="${esc(name)}" onclick="selectPerson('${esc(name)}')">${name}</button>`; }
window.selectPerson = function(name){ state.person = name; localStorage.setItem('selectedPerson', name); renderPeople(); }
window.filterPeople = function(){ const q = norm(document.getElementById('personSearch').value); document.querySelectorAll('.person').forEach(el=>{el.style.display = norm(el.dataset.name).includes(q) ? '' : 'none';}); }
function renderProfile(name){ shell(`<a class="pill small" href="#personas">← Volver</a>${profileHtml(name || state.person)}`, 'personas'); }
function profileHtml(person){
  const songs = DATA.songs.filter(s=>dancesSong(person, s));
  return `<article class="card profile"><h2>${person}</h2><p class="muted">Estos son tus bailes. Mira solo estos.</p>${songs.length ? `<div class="dance-buttons">${songs.map(s=>profileSong(person,s)).join('')}</div>` : `<div class="empty">No tengo bailes asignados para este nombre.</div>`}</article>`;
}
function profileSong(person, song){ const ns = notesFor(person, song.id); return `<div class="dance-button" onclick="location.hash='song/${song.id}'"><b>${song.emoji} ${song.title}</b><span>${song.subtitle||''}</span>${ns.length ? `<div class="personal-note">${ns.map(n=>`<div>${n}</div>`).join('')}</div>` : ''}</div>`; }
function renderMaps(){ const maps = DATA.songs.flatMap(s => (s.positions||[]).map(p=>({song:s,pos:p}))); shell(`<section><div class="section-head"><div><h2>Posiciones generales</h2><p>Consulta global de todas las imágenes.</p></div></div><div class="maps">${maps.map(({song,pos})=>`<article class="mini" onclick="openImage('${pos.image}','${esc(song.title)} · ${esc(pos.title)}')"><img src="${pos.image}" alt="${song.title} · ${pos.title}" loading="lazy"><h3>${song.emoji} ${song.title} · ${pos.title}</h3><p>${pos.label}</p></article>`).join('')}</div></section>`, 'mapas'); }
window.openImage = function(src, caption){ const d=document.getElementById('imageDialog'); document.getElementById('dialogImage').src=src; document.getElementById('dialogCaption').textContent=caption; d.showModal(); }
window.closeImage = function(){ document.getElementById('imageDialog').close(); }
route();
