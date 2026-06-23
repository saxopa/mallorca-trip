/* ===== Données réelles (repli si API hors-ligne) — relevé Open-Meteo du 23/06/2026 ===== */
const FALLBACK_WX = [
  { date:"2026-07-01", tmax:29.1, tmin:24.6, rain:6.6, uv:8, wind:14.7, sea:27.7 },
  { date:"2026-07-02", tmax:30.4, tmin:22.5, rain:4.8, uv:8, wind:19.2, sea:27.4 },
  { date:"2026-07-03", tmax:29.1, tmin:23.8, rain:0.6, uv:8, wind:15.5, sea:27.3 },
  { date:"2026-07-04", tmax:29.6, tmin:23.2, rain:0.0, uv:7.8, wind:8.9, sea:27.3 },
];
const DAY_LABEL = ["Mer 1","Jeu 2","Ven 3","Sam 4"];

function wxIcon(rain){ if(rain>=5) return "🌦️"; if(rain>=1) return "🌤️"; return "☀️"; }

function renderWx(data){
  const g = document.getElementById("wx-grid");
  g.innerHTML = data.map((d,i)=>`
    <div class="wx">
      <div class="d">${DAY_LABEL[i]} juil</div>
      <div class="ico">${wxIcon(d.rain)}</div>
      <div class="t">${Math.round(d.tmax)}°<small>/${Math.round(d.tmin)}°</small></div>
      <div class="row"><span>☔ <b>${d.rain.toFixed(1)}mm</b></span><span>🔆 UV <b>${Math.round(d.uv)}</b></span><span>💨 <b>${Math.round(d.wind)}</b></span></div>
      <div class="sea">🌊 mer ${d.sea ? d.sea.toFixed(1)+"°C" : "~27°C"}</div>
    </div>`).join("");
}

/* tentative live : forecast + marine */
async function loadWeather(){
  renderWx(FALLBACK_WX); // affichage immédiat
  try{
    const f = "https://api.open-meteo.com/v1/forecast?latitude=39.546&longitude=2.387&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max,wind_speed_10m_max&start_date=2026-07-01&end_date=2026-07-04&timezone=Europe%2FMadrid";
    const m = "https://marine-api.open-meteo.com/v1/marine?latitude=39.53&longitude=2.36&daily=sea_surface_temperature_max&start_date=2026-07-01&end_date=2026-07-04&timezone=Europe%2FMadrid";
    const [fr, mr] = await Promise.all([fetch(f), fetch(m)]);
    if(!fr.ok) throw 0;
    const fj = await fr.json();
    let sea = [];
    try{ const mj = await mr.json(); sea = mj.daily?.sea_surface_temperature_max || []; }catch(e){}
    const D = fj.daily;
    const live = D.time.map((t,i)=>({
      date:t, tmax:D.temperature_2m_max[i], tmin:D.temperature_2m_min[i],
      rain:D.precipitation_sum[i], uv:D.uv_index_max[i], wind:D.wind_speed_10m_max[i],
      sea: (sea[i]!=null ? sea[i] : FALLBACK_WX[i]?.sea)
    }));
    renderWx(live);
    document.getElementById("wx-source").textContent = "live · Open-Meteo";
  }catch(e){
    document.getElementById("wx-source").textContent = "relevé 23/06";
  }
}

/* ===== Itinéraire ===== */
const DAYS = [
  { tag:"Arrivée · bus · port", title:"Mer 1 — Atterrissage & douceur",
    sub:"Vol tôt, on rejoint Andratx en bus, on pose les sacs, on découvre le port et le 1er lounge.",
    items:[
      ["07:10","Atterrissage PMI","Petit-déj à l'aéroport en attendant le 1er bus. Crème solaire dès maintenant (UV 8)."],
      ["~08:00","Bus A11 → Camp de Mar","Aéroport → Santa Ponça → Peguera → Camp de Mar. Vérifier l'horaire exact sur l'app TIB."],
      ["~09:30","Bus 101 → Port d'Andratx","Camp de Mar → Andratx → Port d'Andratx. Dépose des bagages à La Pergola (check-in 14:00, ils gardent les sacs)."],
      ["10:30","Marché d'Andratx (mercredi !)","Le marché hebdo d'Andratx tombe ce jour : étals, fromages, ambiance locale. 10 min en bus/voiture."],
      ["13:00","Déj au port + sieste plage","Tapas au port, puis Cala Fonoll (700 m) — mer à 27 °C, première baignade."],
      ["14:00","Check-in & piscine","Installation, piscine/spa, repos après le réveil 4h."],
      ["20:00","Coucher de soleil + lounge du port","Apéro sur le port, puis le lounge (~10 min à pied, Carrer de sa Fábrica). Dîner tranquille au port."],
    ]},
  { tag:"Nature · île · bateau", title:"Jeu 2 — Sant Elm & Sa Dragonera",
    sub:"La grande journée nature : île-parc national, randonnée douce, criques sauvages.",
    items:[
      ["09:00","Route/bus vers Sant Elm","Petit village face à l'île. Café avant l'embarquement."],
      ["10:30","Bateau → Sa Dragonera","Parc national, sentiers, falaises, lézards endémiques. Eau, chapeau, chaussures fermées."],
      ["13:30","Retour & baignade Sant Elm","Plage de sable, déjeuner les pieds dans l'eau."],
      ["16:00","Option rando La Trapa","Sentier vers le monastère trappiste — vues sur l'île. (Plutôt fin de journée, chaleur.)"],
      ["20:30","Soirée détente hôtel","Piscine au calme, dîner léger. Journée physique = on lève le pied le soir."],
    ]},
  { tag:"Ville · culture · cluster", title:"Ven 3 — Palma & vieille ville",
    sub:"Cap sur la capitale : cathédrale, ruelles, tapas, et les lounges du centre.",
    items:[
      ["09:30","Route Palma (~35 min)","Ou bus 101. Se garer près du Parc de la Mar."],
      ["10:30","Cathédrale La Seu + vieille ville","Le monument phare, ruelles de pierre dorée, patios cachés."],
      ["13:00","Déjeuner tapas","Mercat de l'Olivar ou Santa Catalina pour l'ambiance locale."],
      ["15:30","Lounges du centre","Adhésion validée à l'avance, pièce d'identité sur soi."],
      ["18:00","CCA Andratx (option)","Sur le retour : centre d'art contemporain, l'un des plus grands d'Espagne."],
      ["21:00","Dîner au port d'Andratx","Retour tranquille, dernière soirée au port."],
    ]},
  { tag:"Criques · détente · départ", title:"Sam 4 — Criques & vol du soir",
    sub:"Vol à 21:05 : journée pleine. Check-out 12:00, l'hôtel offre une douche après départ.",
    items:[
      ["09:00","Cala Fornells / Camp de Mar","Dernière baignade, pins et ombre. Mer calme (houle 0,6 m)."],
      ["12:00","Check-out","Bagages à la réception, douche post-départ offerte par l'hôtel."],
      ["13:00","Déj + dernier lounge","Dernier passage l'après-midi, tranquille avant la route (conducteur sobre)."],
      ["18:30","Route aéroport","Rendre la voiture, marge confortable. ~45 min depuis Andratx."],
      ["21:05","Vol FR4214 → Toulouse","Décollage. Arrivée TLS 22:25."],
    ]},
];

function renderDays(){
  const wrap = document.getElementById("day-panels");
  wrap.innerHTML = DAYS.map((d,i)=>`
    <div class="day-panel ${i===0?'show':''}" data-panel="${i}">
      <div class="day-head"><h3>${d.title}</h3><span class="tag">${d.tag}</span></div>
      <p class="day-sub">${d.sub}</p>
      <ul class="timeline">
        ${d.items.map(it=>`<li><div class="time">${it[0]}</div><div class="act">${it[1]}</div><div class="det">${it[2]}</div></li>`).join("")}
      </ul>
    </div>`).join("");
}
function initTabs(){
  const tabs = document.getElementById("day-tabs");
  tabs.addEventListener("click", e=>{
    const b = e.target.closest("button"); if(!b) return;
    tabs.querySelectorAll("button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    const n = b.dataset.day;
    document.querySelectorAll(".day-panel").forEach(p=>p.classList.toggle("show", p.dataset.panel===n));
  });
}

/* ===== Sac à dos ===== */
const PACK = {
  "👕 Vêtements léger":["2–3 t-shirts respirants","1 chemise lin (soir)","Short + maillot ×2","Sous-vêtements 4j","1 pull fin (soirées 23°)","Tenue rando (jeu 2)"],
  "🩴 Pieds":["Tongs / sandales","1 baskets rando (La Trapa, Dragonera)"],
  "🎒 À emporter de France":["Lunettes de soleil + chapeau/casquette","Paracétamol + pansements"],
  "📄 Papiers & argent":["CNI / passeport (check-in + entrée lounge)","Carte bancaire + un peu de cash","Réservation hôtel (PDF)","Carte d'embarquement Ryanair","Permis (si voiture)"],
  "🔌 Tech":["Téléphone + câble","Batterie externe","Écouteurs"],
  "🛒 À acheter sur place (Decathlon / commerces — moins cher)":["Crème SPF50","Masque + tuba","Serviette microfibre","Gourde réutilisable","Après-soleil / aloe","Anti-moustiques","Brosse à dents + dentifrice","Déo / savon solide"],
  "🪪 Lounges":["Confirmer l'adhésion en ligne AVANT le départ","Pièce d'identité (obligatoire à l'entrée)","Réserver une table par WhatsApp si week-end"],
};
function renderPack(){
  const wrap = document.getElementById("pack");
  const saved = JSON.parse(localStorage.getItem("mallorca-pack")||"{}");
  wrap.innerHTML = Object.entries(PACK).map(([cat,items])=>`
    <div class="pack-cat"><h4>${cat}</h4>
      ${items.map(it=>{
        const id = cat+"|"+it;
        const on = saved[id] ? "checked" : "";
        return `<label class="${on?'done':''}"><input type="checkbox" data-id="${id}" ${on}/><span>${it}</span></label>`;
      }).join("")}
    </div>`).join("");
  wrap.addEventListener("change", e=>{
    if(e.target.type!=="checkbox") return;
    const s = JSON.parse(localStorage.getItem("mallorca-pack")||"{}");
    s[e.target.dataset.id] = e.target.checked;
    localStorage.setItem("mallorca-pack", JSON.stringify(s));
    e.target.closest("label").classList.toggle("done", e.target.checked);
  });
  document.getElementById("reset-pack").onclick = ()=>{
    localStorage.removeItem("mallorca-pack"); renderPack();
  };
}

/* ===== Nav + reveal ===== */
function initChrome(){
  const nav = document.getElementById("nav");
  addEventListener("scroll", ()=> nav.classList.toggle("scrolled", scrollY>30));
  const io = new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting) en.target.classList.add("in"); }),{threshold:.12});
  document.querySelectorAll(".band").forEach(b=>io.observe(b));
}

/* boot */
loadWeather();
renderDays();
initTabs();
renderPack();
initChrome();
