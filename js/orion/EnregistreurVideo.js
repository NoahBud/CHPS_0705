// Garde en permanence les 5 dernières minutes de la partie.
// Pour la démo, la "vidéo" est simulée par l'historique des actions du joueur.
class EnregistreurVideo {
  constructor(dureeMs = 5 * 60 * 1000) {
    this.dureeMs = dureeMs;
    this.buffer = [];
  }

  // Appelé à chaque action du joueur (comme une image de vidéo).
  enregistrer(action) {
    const maintenant = new Date();
    this.buffer.push({ heure: maintenant, action });
    // on oublie tout ce qui a plus de 5 minutes
    this.buffer = this.buffer.filter((img) => maintenant - img.heure <= this.dureeMs);
  }

  sauvegarder5DernieresMinutes() {
    Journal.log("EnregistreurVideo", "sauvegarder5DernieresMinutes()",
      `clip de ${this.buffer.length} action(s) sauvegardé`);
    return [...this.buffer];
  }
}
