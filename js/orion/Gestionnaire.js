// Gestionnaire — traite chaque bug déclenché.
//   + traiterBug(EvenementBug)
//   ◆ compose un EnregistreurVideo
//   ⇢ utilise EvenementBug
//
// Pour la démo, les événements traités sont rangés dans une base simulée (hors diagramme).
class Gestionnaire {
  constructor(base, fluxVideo, stockageVideo) {
    // composition : le Gestionnaire crée et possède son EnregistreurVideo
    this.enregistreur = new EnregistreurVideo(fluxVideo, stockageVideo);
    this.base = base;
  }

  traiterBug(evenement) {
    Journal.log("Gestionnaire", "traiterBug(EvenementBug)",
      `bug ${evenement.bug.id} déclenché par ${evenement.joueur.pseudo}`);
    this.enregistreur.enregistrer(evenement);
    this.base.push(evenement);
  }
}
