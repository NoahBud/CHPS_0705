// SYSTÈME EXTERNE (simulé) : on ne le code pas dans le vrai projet.
// Il surveille le jeu et prévient Orion quand un bug prévu se déclenche,
// dans SON format (noms en anglais, timestamp en nombre) pour montrer l'intérêt de l'adapter.
class Hub {
  constructor() {
    this.destinataire = null;
  }

  connecter(adapter) {
    this.destinataire = adapter;
  }

  bugDetecte(bugId, joueurId) {
    const messageHub = { type: "BUG_TRIGGERED", bug_id: bugId, player_id: joueurId, ts: Date.now() };
    Journal.log("Hub", "envoie un message", "bug prévu détecté dans le jeu");
    this.destinataire.bugDeclenche(messageHub);
  }
}
