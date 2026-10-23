// Câblage de l'interface : crée les objets du diagramme et relie les boutons.

// ---------- Données simulées (hors diagramme) ----------
const bugs = [];          // Bug déclarés par le développeur
const joueurs = [];       // Joueur connus
const base = [];          // base simulée : EvenementBug traités par le Gestionnaire
const stockageVideo = []; // disque simulé : clips sauvegardés par l'EnregistreurVideo
const flux = [];          // "vidéo" simulée : ce qui s'affiche à l'écran, image par image
const fluxVideo = () => flux;

// ---------- Objets du diagramme ----------
// Gestionnaire ◆ EnregistreurVideo : le Gestionnaire crée son enregistreur (composition)
const gestionnaire = new Gestionnaire(base, fluxVideo, stockageVideo);
const enregistreur = gestionnaire.enregistreur;
// HubAdapteur → Gestionnaire : on lui donne le gestionnaire existant (association)
const hubAdapteur = new HubAdapteur(bugs, joueurs, gestionnaire);

// ---------- Côté jeu (externe) ----------
const jeu = new JeuDevinette(hubAdapteur);

let joueurCourant = null;
let delaiMs = 20000;
const exploitesDejaNotes = new Set();

const $ = (id) => document.getElementById(id);
const heure = (d) => new Date(d).toLocaleTimeString("fr-FR");

// Nom affiché de chaque objet (comme dans un diagramme d'objets)
function nom(obj) {
  if (obj instanceof Bug) return "bug" + obj.id;
  if (obj instanceof Joueur) return "joueur" + obj.id;
  if (obj instanceof EvenementBug) return "evt" + (base.indexOf(obj) + 1);
  if (obj === hubAdapteur) return "hubAdapteur";
  if (obj === gestionnaire) return "gestionnaire";
  if (obj === enregistreur) return "enregistreur";
  return "?";
}

// ---------- État d'un événement (calculé, pas d'attribut en plus) ----------
// timestamp_sign rempli                       -> REPORTÉ
// vide et délai dépassé après timestamp_decl  -> EXPLOITÉ
// vide et délai pas encore dépassé            -> EN ATTENTE
function etat(evt) {
  if (evt.timestamp_sign) return "REPORTE";
  if (Date.now() - Date.parse(evt.timestamp_decl) > delaiMs) return "EXPLOITE";
  return "ATTENTE";
}

// ---------- Journal ----------
Journal.surNouvelleEntree((e) => {
  const li = document.createElement("li");
  li.innerHTML = `<time>${heure(e.heure)}</time>
    <b class="c-${e.classe}">${e.classe}</b>.<code>${e.methode}</code>
    <span>${e.detail}</span>`;
  $("journal").prepend(li);

  const bloc = document.querySelector(`.diagramme [data-classe="${e.classe}"]`);
  if (bloc) {
    bloc.classList.remove("actif");
    void bloc.getBoundingClientRect();
    bloc.classList.add("actif");
  }
  toutAfficher();
});

// ---------- Joueur ----------
function filmer(action) {
  flux.push({ heure: Date.now(), action });
}

function connecterJoueur() {
  const pseudo = $("pseudo").value.trim() || "Anonyme";
  joueurCourant = joueurs.find((j) => j.pseudo === pseudo);
  if (!joueurCourant) {
    joueurCourant = new Joueur(joueurs.length + 1, pseudo);
    joueurs.push(joueurCourant);
    Journal.log("Joueur", "new Joueur()", `${nom(joueurCourant)} « ${pseudo} »`);
  }
}

function afficherMessage(texte, classe = "") {
  const li = document.createElement("li");
  li.textContent = texte;
  if (texte.startsWith("🐞")) li.className = "bug";
  if (classe) li.className = classe;
  $("messages-jeu").prepend(li);
}

$("btn-nouvelle-partie").addEventListener("click", () => {
  connecterJoueur();
  jeu.nouvellePartie();
  $("messages-jeu").innerHTML = "";
  filmer(`${joueurCourant.pseudo} lance une nouvelle partie`);
  afficherMessage(`Nouvelle partie pour ${joueurCourant.pseudo}.`);
});

$("form-essai").addEventListener("submit", (ev) => {
  ev.preventDefault();
  connecterJoueur();
  const valeur = parseInt($("essai").value, 10);
  filmer(`${joueurCourant.pseudo} propose ${valeur}`);
  const reponse = jeu.proposer(valeur, joueurCourant);
  filmer(`Écran : ${reponse}`);
  afficherMessage(reponse);
  toutAfficher(); // l'événement vient d'être rangé : on met à jour les objets
  $("essai").value = "";
  $("essai").focus();
});

// Le joueur signale : on remplit timestamp_sign du dernier événement encore en attente.
$("btn-signaler").addEventListener("click", () => {
  connecterJoueur();
  filmer(`${joueurCourant.pseudo} clique sur « Signaler un bug »`);
  const evt = [...base].reverse().find((e) => e.joueur === joueurCourant && etat(e) === "ATTENTE");
  if (!evt) {
    afficherMessage("Aucun bug prévu en attente de signalement.", "info");
    return;
  }
  evt.timestamp_sign = new Date().toISOString();
  afficherMessage("Merci, le bug a été signalé.", "info");
  Journal.log("EvenementBug", "timestamp_sign = maintenant", `${nom(evt)} signalé par ${joueurCourant.pseudo}`);
});

// ---------- Développeur ----------
const libellesEffet = { reveler: "Révèle la réponse", victoire: "Victoire immédiate" };

function declarerBug(description, valeur, effet) {
  const bug = new Bug(bugs.length + 1, description);
  bugs.push(bug);
  jeu.ajouterDeclencheur(bug.id, valeur, effet);
  Journal.log("Bug", "new Bug()", `${nom(bug)} : « ${description} » (déclencheur ${valeur} dans le jeu)`);
}

$("form-bug").addEventListener("submit", (ev) => {
  ev.preventDefault();
  declarerBug($("bug-description").value.trim(), parseInt($("bug-declencheur").value, 10), $("bug-effet").value);
  ev.target.reset();
});

$("delai").addEventListener("change", () => {
  delaiMs = Math.max(5, parseInt($("delai").value, 10) || 20) * 1000;
  toutAfficher();
});

function afficherBugs() {
  const tbody = $("liste-bugs");
  if (tbody.children.length === bugs.length) return; // déjà à jour
  tbody.innerHTML = "";
  bugs.forEach((b) => {
    const d = jeu.declencheurs.find((x) => x.bugId === b.id);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${b.id}</b></td><td>${b.description}</td>
      <td><code>${d.valeur}</code></td><td>${libellesEffet[d.effet]}</td>
      <td><input type="checkbox" ${d.actif ? "checked" : ""}></td>`;
    tr.querySelector("input").addEventListener("change", (e) => { d.actif = e.target.checked; });
    tbody.appendChild(tr);
  });
}

// ---------- Objets en mémoire ----------
const valeurAvant = new Map();

function ref(obj) {
  return obj ? `<b>${nom(obj)}</b>` : `<i>null</i>`;
}
function texte(s) {
  return s === null ? "<i>null</i>" : `"${s}"`;
}

function carteObjet(obj, classe, lignes) {
  return `<div class="objet" data-nom="${nom(obj)}">
    <div class="titre"><u>${nom(obj)} : ${classe}</u></div>
    ${lignes.map((l) => `<div class="attr">${l}</div>`).join("") || `<div class="attr muet">—</div>`}
  </div>`;
}

function afficherObjets() {
  const colonnes = [
    ["Orion", [
      carteObjet(hubAdapteur, "HubAdapteur", [`gestionnaire = ${ref(gestionnaire)}`]),
      carteObjet(gestionnaire, "Gestionnaire", [`◆ enregistreur = ${ref(enregistreur)}`]),
      carteObjet(enregistreur, "EnregistreurVideo", [`<span class="muet">${stockageVideo.length} clip(s) sur le disque simulé</span>`]),
    ]],
    ["EvenementBug", base.map((e) => carteObjet(e, "EvenementBug", [
      `bug = ${ref(e.bug)}`,
      `joueur = ${ref(e.joueur)}`,
      `timestamp_decl = ${texte(e.timestamp_decl)}`,
      `timestamp_sign = ${texte(e.timestamp_sign)}`,
    ]))],
    ["Bug", bugs.map((b) => carteObjet(b, "Bug", [`id = ${b.id}`, `description = ${texte(b.description)}`]))],
    ["Joueur", joueurs.map((j) => carteObjet(j, "Joueur", [`id = ${j.id}`, `pseudo = ${texte(j.pseudo)}`]))],
  ];

  $("objets").innerHTML = colonnes.map(([titre, cartes]) =>
    `<div class="colonne"><h3>${titre}</h3>${cartes.join("") || `<p class="vide">aucun</p>`}</div>`).join("");

  // fait clignoter les objets nouveaux ou modifiés
  document.querySelectorAll(".objet").forEach((el) => {
    const n = el.dataset.nom;
    if (valeurAvant.has(n) && valeurAvant.get(n) === el.innerHTML) return;
    if (valeurAvant.size > 0) el.classList.add("modifie");
    valeurAvant.set(n, el.innerHTML);
  });
}

// ---------- Événements ----------
const etiquettes = {
  ATTENTE: "En attente de signalement",
  REPORTE: "Reporté par le joueur",
  EXPLOITE: "Exploité sans signalement",
};

// On ne redessine la liste que si un événement a changé :
// sinon les blocs « JSON » ou « Clip » ouverts se refermeraient.
let dernierRendu = "";

function afficherEvenements() {
  if (base.length === 0) return;
  const html = [...base].reverse().map((e) => {
    const et = etat(e);
    const clip = (stockageVideo.find((s) => s.evenement === e) || { clip: [] }).clip;
    const json = {
      bug: e.bug.id, joueur: e.joueur.id,
      timestamp_decl: e.timestamp_decl, timestamp_sign: e.timestamp_sign,
    };
    return `<div class="evenement ${et}">
      <div class="entete"><b>${nom(e)}</b> · bug ${e.bug.id} — ${e.bug.description}
        <span class="badge">${etiquettes[et]}</span></div>
      <div class="infos">Joueur : <b>${e.joueur.pseudo}</b> · déclenché à ${heure(e.timestamp_decl)}
        ${et === "ATTENTE" ? `· <span class="compte" data-limite="${Date.parse(e.timestamp_decl) + delaiMs}"></span>` : ""}
        ${e.timestamp_sign ? `· signalé à ${heure(e.timestamp_sign)}` : ""}</div>
      <details><summary>Clip vidéo sauvegardé (${clip.length} images)</summary>
        <ol class="clip">${clip.map((i) => `<li><time>${heure(i.heure)}</time> ${i.action}</li>`).join("")}</ol></details>
      <details><summary>JSON</summary><pre>${JSON.stringify(json, null, 2)}</pre></details>
    </div>`;
  }).join("");

  if (html !== dernierRendu) {
    $("evenements").innerHTML = html;
    dernierRendu = html;
  }
  majComptes();
}

function majComptes() {
  document.querySelectorAll(".compte").forEach((el) => {
    const reste = Math.max(0, Math.ceil((el.dataset.limite - Date.now()) / 1000));
    el.textContent = `${reste} s pour signaler`;
  });
}

// ---------- Rafraîchissement ----------
let enCours = false;
function toutAfficher() {
  if (enCours) return;
  enCours = true;
  afficherBugs();
  afficherObjets();
  afficherEvenements();
  enCours = false;
}

// Toutes les 0,5 s : compte à rebours + détection d'exploitation
setInterval(() => {
  base.forEach((e) => {
    if (etat(e) === "EXPLOITE" && !exploitesDejaNotes.has(e)) {
      exploitesDejaNotes.add(e);
      Journal.log("Démo", "délai dépassé",
        `${nom(e)} : timestamp_sign toujours null → bug exploité par ${e.joueur.pseudo}`);
    }
  });
  afficherEvenements();
}, 500);

// ---------- Réinitialisation ----------
// Toutes les données sont en mémoire : recharger la page remet tout à zéro.
$("btn-reset").addEventListener("click", () => location.reload());

// ---------- Données de départ ----------
declarerBug("Entrer -1 affiche la réponse", -1, "reveler");
declarerBug("Entrer 1001 fait gagner directement", 1001, "victoire");
connecterJoueur();
filmer(`${joueurCourant.pseudo} lance une nouvelle partie`);
toutAfficher();
