// Journal des appels : chaque classe y écrit quand une de ses méthodes est appelée.
// Sert uniquement à la démo, pour voir en direct qui appelle quoi.
const Journal = {
  ecouteurs: [],

  log(classe, methode, detail = "") {
    const entree = { heure: new Date(), classe, methode, detail };
    this.ecouteurs.forEach((f) => f(entree));
  },

  surNouvelleEntree(fonction) {
    this.ecouteurs.push(fonction);
  },
};
