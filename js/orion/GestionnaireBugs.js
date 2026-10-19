// Le chef d'orchestre d'Orion.
// - garde la liste des bugs prévus (renseignés par le développeur)
// - traite les bugs déclenchés (vidéo + création de l'EvenementBug)
// - reçoit les signalements des joueurs et les relie aux événements
// - détecte l'exploitation : délai écoulé sans signalement
class GestionnaireBugs {
  constructor(enregistreur, delaiSignalementMs = 20000) {
    this.enregistreur = enregistreur;
    this.delaiSignalementMs = delaiSignalementMs;
    this.bugsPrevus = [];
    this.evenements = [];
    this.signalementsLibres = []; // signalements sans bug prévu associé
    this.surChangement = () => {}; // rafraîchit l'interface
  }

  renseignerBug(bug) {
    this.bugsPrevus.push(bug);
    Journal.log("GestionnaireBugs", "renseignerBug()",
      `${bug.id} : "${bug.description}" (déclencheur ${bug.declencheur})`);
    this.surChangement();
  }

  traiterBug(evenement) {
    Journal.log("GestionnaireBugs", "traiterBug()",
      `${evenement.bug.id} déclenché par ${evenement.joueur.pseudo}`);

    evenement.video = this.enregistreur.sauvegarder5DernieresMinutes();
    evenement.limite = new Date(evenement.heure.getTime() + this.delaiSignalementMs);
    this.evenements.push(evenement);
    Journal.log("EvenementBug", "créé", `état ${evenement.etat()}`);

    setTimeout(() => this.verifierExploitation(evenement), this.delaiSignalementMs);
    this.surChangement();
  }

  recevoirSignalement(signalement) {
    Journal.log("GestionnaireBugs", "recevoirSignalement()",
      `${signalement.joueur.pseudo} : "${signalement.description}"`);

    // dernier événement du joueur qui n'a pas encore de signalement
    const evenement = [...this.evenements].reverse().find(
      (e) => e.joueur.id === signalement.joueur.id && e.signale === null && !e.exploite
    );

    if (evenement) {
      evenement.signale = signalement;
      Journal.log("EvenementBug", "signale = Signalement",
        `${evenement.bug.id} → état ${evenement.etat()}`);
    } else {
      this.signalementsLibres.push(signalement);
      Journal.log("GestionnaireBugs", "signalement libre",
        "aucun bug prévu en attente : bug non prévu ?");
    }
    this.surChangement();
  }

  verifierExploitation(evenement) {
    if (evenement.signale === null) {
      evenement.exploite = true;
      Journal.log("GestionnaireBugs", "verifierExploitation()",
        `${evenement.bug.id} non signalé par ${evenement.joueur.pseudo} → EXPLOITÉ`);
    } else {
      Journal.log("GestionnaireBugs", "verifierExploitation()",
        `${evenement.bug.id} déjà signalé → rien à faire`);
    }
    this.surChangement();
  }
}
