// "Tel joueur a déclenché tel bug à telle heure."
// signale : le Signalement du joueur, ou null tant qu'il n'a rien signalé.
class EvenementBug {
  constructor(bug, joueur, heure) {
    this.bug = bug;         // BugPrevu
    this.joueur = joueur;   // Joueur
    this.heure = heure;     // Date
    this.signale = null;    // Signalement | null
    this.exploite = false;  // passe à true si le délai expire sans signalement
    this.video = [];        // clip sauvegardé par l'EnregistreurVideo
    this.limite = null;     // heure limite pour signaler
  }

  etat() {
    if (this.signale) return "REPORTE";
    if (this.exploite) return "EXPLOITE_NON_REPORTE";
    return "DECOUVERT";
  }

  // Format JSON prévu dans le DCU : ID bug, ID joueur, flags, horodatages.
  versJSON() {
    return {
      idBug: this.bug.id,
      idJoueur: this.joueur.id,
      decouvert: true,
      reporte: this.signale !== null,
      exploite: this.exploite,
      heureDeclenchement: this.heure.toISOString(),
      heureSignalement: this.signale ? this.signale.heure.toISOString() : null,
      descriptionJoueur: this.signale ? this.signale.description : null,
      dureeClipVideo: this.video.length + " actions",
    };
  }
}
