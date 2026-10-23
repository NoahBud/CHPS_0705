// LE JEU DU BANC DE TEST (externe à Orion, fait par les développeurs) : deviner un nombre entre 0 et 1000.
// Le code des bugs volontaires est DANS le jeu : chaque déclencheur est relié à l'id d'un Bug d'Orion.
// Quand un bug se déclenche, le jeu envoie lui-même un message au HubAdapteur, dans SON format
// (noms en anglais, timestamp en nombre) : c'est pour ça qu'Orion a besoin d'un adaptateur.
class JeuDevinette {
  constructor(hubAdapteur) {
    this.hubAdapteur = hubAdapteur;
    this.declencheurs = []; // { bugId, valeur, effet: "reveler" | "victoire", actif }
    this.nouvellePartie();
  }

  nouvellePartie() {
    this.secret = Math.floor(Math.random() * 1001);
    this.essais = 0;
    this.gagne = false;
  }

  ajouterDeclencheur(bugId, valeur, effet) {
    this.declencheurs.push({ bugId, valeur, effet, actif: true });
  }

  envoyerMessage(bugId, joueurId) {
    const message = { type: "BUG_TRIGGERED", bug_id: bugId, player_id: joueurId, ts: Date.now() };
    Journal.log("Jeu", "envoie un message", "bug prévu déclenché dans le jeu");
    this.hubAdapteur.convertir(message);
  }

  // Renvoie le message à afficher au joueur.
  proposer(valeur, joueur) {
    if (this.gagne) return "Partie terminée : lancez une nouvelle partie.";
    this.essais++;

    const d = this.declencheurs.find((x) => x.actif && x.valeur === valeur);
    if (d) {
      this.envoyerMessage(d.bugId, joueur.id);
      if (d.effet === "reveler") return `🐞 Erreur interne… la réponse est ${this.secret}`;
      this.gagne = true;
      return `🐞 Bravo ?! Gagné en ${this.essais} essai(s) sans avoir trouvé le nombre.`;
    }

    if (!Number.isInteger(valeur) || valeur < 0 || valeur > 1000) return "Entrez un nombre entre 0 et 1000.";
    if (valeur < this.secret) return `${valeur} : c'est plus grand.`;
    if (valeur > this.secret) return `${valeur} : c'est plus petit.`;
    this.gagne = true;
    return `🎉 Bravo, c'était ${this.secret} ! Trouvé en ${this.essais} essai(s).`;
  }
}
