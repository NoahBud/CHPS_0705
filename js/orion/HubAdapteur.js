// HubAdapteur (pattern Adapter) — la porte d'entrée d'Orion.
//   + convertir(message): EvenementBug
//   → association avec un Gestionnaire
//   ⇢ crée des EvenementBug
//
// Le Jeu (fait par les développeurs) envoie un message dans SON format :
//   { type: "BUG_TRIGGERED", bug_id, player_id, ts }
// convertir() le traduit en EvenementBug (notre format) et le confie au Gestionnaire.
class HubAdapteur {
  constructor(bugs, joueurs, gestionnaire) {
    this.bugs = bugs;       // les Bug déclarés par le développeur
    this.joueurs = joueurs; // les Joueur connus
    // association : le HubAdapteur connaît un Gestionnaire qui existe déjà (il ne le crée pas)
    this.gestionnaire = gestionnaire;
  }

  convertir(message) {
    Journal.log("HubAdapteur", "convertir(message)", JSON.stringify(message));

    const bug = this.bugs.find((b) => b.id === message.bug_id);
    const joueur = this.joueurs.find((j) => j.id === message.player_id);
    const evenement = new EvenementBug(bug, joueur, new Date(message.ts).toISOString());
    Journal.log("EvenementBug", "new EvenementBug()", "message du jeu traduit dans notre format");

    this.gestionnaire.traiterBug(evenement);
    return evenement;
  }
}
