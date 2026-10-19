// Un bug déclaré à l'avance par le développeur du jeu.
class BugPrevu {
  constructor(id, description, declencheur, effet) {
    this.id = id;                   // ex : "B1"
    this.description = description; // ex : "Entrer -1 affiche la réponse"
    this.declencheur = declencheur; // valeur saisie qui déclenche le bug (ex : -1)
    this.effet = effet;             // "reveler" ou "victoire"
    this.actif = true;
  }
}
