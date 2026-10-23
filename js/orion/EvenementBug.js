// EvenementBug — « tel joueur a déclenché tel bug à telle heure ».
//   - bug: Bug               (agrégation)
//   - joueur: Joueur         (agrégation)
//   - timestamp_decl: String heure du déclenchement
//   - timestamp_sign: String heure du signalement, null tant que le joueur n'a pas signalé
class EvenementBug {
  constructor(bug, joueur, timestamp_decl) {
    this.bug = bug;
    this.joueur = joueur;
    this.timestamp_decl = timestamp_decl;
    this.timestamp_sign = null;
  }
}
