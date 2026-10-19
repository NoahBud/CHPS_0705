// LE JEU DU BANC DE TEST (externe à Orion) : deviner un nombre entre 0 et 1000.
// Il contient des bugs volontaires, paramétrés par le développeur dans Orion.
class JeuDevinette {
  constructor(hub, lireBugs) {
    this.hub = hub;
    this.lireBugs = lireBugs; // fonction qui renvoie les BugPrevu actifs
    this.nouvellePartie();
  }

  nouvellePartie() {
    this.secret = Math.floor(Math.random() * 1001);
    this.essais = 0;
    this.gagne = false;
  }

  // Renvoie le message à afficher au joueur.
  proposer(valeur, joueur) {
    if (this.gagne) return "Partie terminée : relance une nouvelle partie.";
    this.essais++;

    // Les bugs volontaires du jeu
    const bug = this.lireBugs().find((b) => b.actif && b.declencheur === valeur);
    if (bug) {
      this.hub.bugDetecte(bug.id, joueur.id);
      if (bug.effet === "reveler") return `🐞 Erreur interne… la réponse est ${this.secret}`;
      if (bug.effet === "victoire") {
        this.gagne = true;
        return `🐞 Bravo ?! Gagné en ${this.essais} essai(s) sans avoir trouvé le nombre.`;
      }
    }

    // Comportement normal
    if (!Number.isInteger(valeur) || valeur < 0 || valeur > 1000) return "Entre un nombre entre 0 et 1000.";
    if (valeur < this.secret) return `${valeur} : c'est plus grand.`;
    if (valeur > this.secret) return `${valeur} : c'est plus petit.`;
    this.gagne = true;
    return `🎉 Bravo, c'était ${this.secret} ! Trouvé en ${this.essais} essai(s).`;
  }
}
