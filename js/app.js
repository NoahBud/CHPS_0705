// Câblage de l'interface : crée les objets et relie les boutons aux méthodes des classes.

// ---------- Création des objets (comme dans le diagramme) ----------
const joueurs = new Map();
const enregistreur = new EnregistreurVideo();
const gestionnaire = new GestionnaireBugs(enregistreur, 20000);
const adapter = new HubAdapter(gestionnaire, joueurs);
const hub = new Hub();
hub.connecter(adapter);
const jeu = new JeuDevinette(hub, () => gestionnaire.bugsPrevus);

let joueurCourant = null;
let compteurBugs = 0;

const $ = (id) => document.getElementById(id);
const heure = (d) => d.toLocaleTimeString("fr-FR");

// ---------- Journal ----------
const couleurs = {
  Hub: "c-hub", HubAdapter: "c-adapter", GestionnaireBugs: "c-gest",
  EnregistreurVideo: "c-video", EvenementBug: "c-evt", Joueur: "c-joueur",
};

Journal.surNouvelleEntree((e) => {
  const li = document.createElement("li");
  li.innerHTML = `<time>${heure(e.heure)}</time>
    <b class="${couleurs[e.classe] || ""}">${e.classe}</b>.<code>${e.methode}</code>
    <span>${e.detail}</span>`;
  $("journal").prepend(li);

  // fait clignoter la classe dans la chaîne du haut
  const bloc = document.querySelector(`.classe[data-classe="${e.classe}"]`);
  if (bloc) {
    bloc.classList.remove("actif");
    void bloc.offsetWidth; // relance l'animation
    bloc.classList.add("actif");
  }
});

// ---------- Joueur ----------
function connecterJoueur() {
  const pseudo = $("pseudo").value.trim() || "Anonyme";
  const id = "J" + (joueurs.size + 1);
  joueurCourant = [...joueurs.values()].find((j) => j.pseudo === pseudo);
  if (!joueurCourant) {
    joueurCourant = new Joueur(id, pseudo);
    joueurs.set(id, joueurCourant);
    Journal.log("Joueur", "créé", `${id} « ${pseudo} »`);
  }
}

function afficherMessage(texte) {
  const li = document.createElement("li");
  li.textContent = texte;
  if (texte.startsWith("🐞")) li.className = "bug";
  $("messages-jeu").prepend(li);
}

$("btn-nouvelle-partie").addEventListener("click", () => {
  connecterJoueur();
  jeu.nouvellePartie();
  $("messages-jeu").innerHTML = "";
  enregistreur.enregistrer(`${joueurCourant.pseudo} lance une nouvelle partie`);
  afficherMessage(`Nouvelle partie pour ${joueurCourant.pseudo}.`);
});

$("form-essai").addEventListener("submit", (ev) => {
  ev.preventDefault();
  connecterJoueur();
  const valeur = parseInt($("essai").value, 10);
  enregistreur.enregistrer(`${joueurCourant.pseudo} propose ${valeur}`);
  const reponse = jeu.proposer(valeur, joueurCourant);
  enregistreur.enregistrer(`Le jeu répond : ${reponse}`);
  afficherMessage(reponse);
  $("essai").value = "";
  $("essai").focus();
});

$("form-signalement").addEventListener("submit", (ev) => {
  ev.preventDefault();
  connecterJoueur();
  gestionnaire.recevoirSignalement(new Signalement(joueurCourant, $("signalement").value.trim()));
  $("signalement").value = "";
});

// ---------- Développeur ----------
function ajouterBug(description, declencheur, effet) {
  compteurBugs++;
  gestionnaire.renseignerBug(new BugPrevu("B" + compteurBugs, description, declencheur, effet));
}

$("form-bug").addEventListener("submit", (ev) => {
  ev.preventDefault();
  ajouterBug($("bug-description").value.trim(), parseInt($("bug-declencheur").value, 10), $("bug-effet").value);
  ev.target.reset();
});

$("delai").addEventListener("change", () => {
  const s = Math.max(5, parseInt($("delai").value, 10) || 20);
  gestionnaire.delaiSignalementMs = s * 1000;
});

function afficherBugs() {
  const libelles = { reveler: "Révèle la réponse", victoire: "Victoire immédiate" };
  $("liste-bugs").innerHTML = "";
  gestionnaire.bugsPrevus.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><b>${b.id}</b></td><td>${b.description}</td>
      <td><code>${b.declencheur}</code></td><td>${libelles[b.effet]}</td>
      <td><input type="checkbox" ${b.actif ? "checked" : ""}></td>`;
    tr.querySelector("input").addEventListener("change", (e) => {
      b.actif = e.target.checked;
      Journal.log("GestionnaireBugs", "paramétrage", `${b.id} ${b.actif ? "activé" : "désactivé"}`);
    });
    $("liste-bugs").appendChild(tr);
  });
}

// ---------- Événements ----------
const etiquettes = {
  DECOUVERT: "Découvert · en attente de signalement",
  REPORTE: "Reporté par le joueur",
  EXPLOITE_NON_REPORTE: "Exploité sans signalement",
};

function afficherEvenements() {
  const zone = $("evenements");
  if (gestionnaire.evenements.length === 0) return;
  zone.innerHTML = "";

  [...gestionnaire.evenements].reverse().forEach((e) => {
    const etat = e.etat();
    const div = document.createElement("div");
    div.className = "evenement " + etat;
    const clip = e.video.map((img) => `<li><time>${heure(img.heure)}</time> ${img.action}</li>`).join("");
    div.innerHTML = `
      <div class="entete">
        <b>${e.bug.id}</b> — ${e.bug.description}
        <span class="badge">${etiquettes[etat]}</span>
      </div>
      <div class="infos">
        Joueur : <b>${e.joueur.pseudo}</b> (${e.joueur.id}) · déclenché à ${heure(e.heure)}
        ${etat === "DECOUVERT" ? `· <span class="compte" data-limite="${e.limite.getTime()}"></span>` : ""}
        ${e.signale ? `<br>Signalement : « ${e.signale.description} » à ${heure(e.signale.heure)}` : ""}
      </div>
      <details><summary>Clip vidéo simulé (${e.video.length} actions)</summary><ol class="clip">${clip}</ol></details>
      <details><summary>JSON envoyé</summary><pre>${JSON.stringify(e.versJSON(), null, 2)}</pre></details>`;
    zone.appendChild(div);
  });

  $("libres").innerHTML = gestionnaire.signalementsLibres.length
    ? `<h3>Signalements sans bug prévu</h3><ul>${gestionnaire.signalementsLibres
        .map((s) => `<li><b>${s.joueur.pseudo}</b> à ${heure(s.heure)} : « ${s.description} »</li>`).join("")}</ul>`
    : "";
  majComptes();
}

function majComptes() {
  document.querySelectorAll(".compte").forEach((el) => {
    const reste = Math.max(0, Math.ceil((el.dataset.limite - Date.now()) / 1000));
    el.textContent = `${reste} s pour signaler`;
  });
}
setInterval(majComptes, 500);

gestionnaire.surChangement = () => {
  afficherBugs();
  afficherEvenements();
};

// ---------- Données de départ ----------
ajouterBug("Entrer -1 affiche la réponse", -1, "reveler");
ajouterBug("Entrer 1001 fait gagner directement", 1001, "victoire");
connecterJoueur();
enregistreur.enregistrer(`${joueurCourant.pseudo} lance une nouvelle partie`);
