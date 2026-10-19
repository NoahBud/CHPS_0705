// Ce que le joueur envoie quand il signale un bug lui-même (report manuel).
class Signalement {
  constructor(joueur, description) {
    this.joueur = joueur;
    this.description = description;
    this.heure = new Date();
  }
}
