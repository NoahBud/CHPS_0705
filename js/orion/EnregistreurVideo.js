// EnregistreurVideo — sauvegarde les 5 dernières minutes de la partie.
//   + enregistrer()
//
// Pour la démo, la "vidéo" est simulée par l'historique des actions affichées à l'écran,
// et le "disque" par une simple liste (stockage). Ces deux éléments sont hors diagramme.
class EnregistreurVideo {
  constructor(fluxVideo, stockage) {
    this.fluxVideo = fluxVideo; // fonction qui renvoie les images (actions) récentes
    this.stockage = stockage;   // simulation du disque où sont rangés les clips
  }

  enregistrer(evenement) {
    const cinqMinutes = 5 * 60 * 1000;
    const maintenant = Date.now();
    const clip = this.fluxVideo().filter((img) => maintenant - img.heure <= cinqMinutes);
    this.stockage.push({ evenement, clip });
    Journal.log("EnregistreurVideo", "enregistrer()", `clip de ${clip.length} image(s) sauvegardé`);
    return clip;
  }
}
