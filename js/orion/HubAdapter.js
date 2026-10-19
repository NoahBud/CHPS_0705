// Pattern Adapter : la porte d'entrée d'Orion.
// Le Hub parle dans son format à lui ({ type, bug_id, player_id, ts }).
// L'adapter le traduit en EvenementBug (notre format) et le transmet au gestionnaire.
class HubAdapter {
  constructor(gestionnaire, joueurs) {
    this.gestionnaire = gestionnaire;
    this.joueurs = joueurs; // Map id -> Joueur
  }

  // Appelé par le Hub quand un bug prévu se déclenche.
  bugDeclenche(messageHub) {
    Journal.log("HubAdapter", "bugDeclenche(messageHub)", JSON.stringify(messageHub));
    const evenement = this.convertir(messageHub);
    this.gestionnaire.traiterBug(evenement);
  }

  convertir(messageHub) {
    const bug = this.gestionnaire.bugsPrevus.find((b) => b.id === messageHub.bug_id);
    const joueur = this.joueurs.get(messageHub.player_id);
    Journal.log("HubAdapter", "convertir()", "message du Hub → EvenementBug");
    return new EvenementBug(bug, joueur, new Date(messageHub.ts));
  }
}
