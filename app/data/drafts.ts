import type { PlayerId } from "./types";

/** One side of a 1v1 draft matchup. */
export interface DraftTeam {
  name: string;
  /** Drafted real players (player ids from players.ts). */
  squad: PlayerId[];
  /** Optional captain (2x) / vice-captain (1.5x). Omit if the draft has none. */
  captainId?: PlayerId;
  viceCaptainId?: PlayerId;
  /**
   * How many of the squad's players count toward the total. Undefined = all
   * count; e.g. 5 = only the best 5 players' points count.
   */
  countTop?: number;
}

/** A head-to-head draft between two teams. */
export interface Draft {
  id: string;
  /** Optional label, e.g. "Round of 16". Falls back to "TeamA vs TeamB". */
  title?: string;
  /**
   * Optional first fixture stage to count. Omit to count every scored match.
   * Examples: "Round of 32", "Round of 16", "Quarterfinals".
   */
  scoringStartsAt?: string;
  teamA: DraftTeam;
  teamB: DraftTeam;
}

// Add 1v1 drafts here. Example (delete or replace):
//
// {
//   id: "ayush-vs-mfk",
//   title: "Round of 32 Auction",
//   scoringStartsAt: "Round of 32", // omit to include group-stage points too
//   teamA: {
//     name: "Ayush",
//     squad: ["messi", "yamal", "kane", "saka", "pedri"],
//     captainId: "messi",      // optional
//     viceCaptainId: "yamal",  // optional
//     countTop: 5,             // best 5 count; omit for "all count"
//   },
//   teamB: {
//     name: "MFK",
//     squad: ["haaland", "mbappe", "vinicius", "rodri", "bellingham"],
//     // no captain/vice, all players count
//   },
// },
export const drafts: Draft[] = [
  {
    id: "mfk-vs-ayush-anand",
    teamA: {
      name: "MFK",
      squad: [
        "mbappe", "olise", "oyarzabal", "vinicius", "dembele", "nico-williams",
        "declan-rice", "vitinha", "raphinha", "haaland", "matheus-cunha",
      ],
      captainId: "olise",
      viceCaptainId: "oyarzabal",
    },
    teamB: {
      name: "Ayush Anand",
      squad: [
        "kane", "", "yamal", "bruno-fernandes", "julian-alvarez",
        "wirtz", "luis-diaz", "arda-guler", "messi", "kai-havertz", "saka",
      ],
      captainId: "kane",
      viceCaptainId: "bellingham",
    },
  },
  {
    id: "tanmay-vs-ayush-anand",
    teamA: {
      name: "Tanmay",
      squad: [
        "kane", "yamal", "vinicius", "bruno-fernandes", "dembele",
        "pedri", "gakpo", "ronaldo", "lautaro", "mike-maignan", "nuno-mendes",
      ],
      captainId: "kane",
      viceCaptainId: "yamal",
    },
    teamB: {
      name: "Ayush Anand",
      squad: [
        "mbappe", "olise", "oyarzabal", "vinicius", "dembele", "nico-williams",
        "declan-rice", "vitinha", "raphinha", "haaland", "matheus-cunha",
      ],
      captainId: "olise",
      viceCaptainId: "oyarzabal",
    },
  },
  {
    id: "mradul-vs-nishank",
    scoringStartsAt: "Round of 32",
    teamA: {
      name: "Mradul",
      squad: [
        "messi", "undav", "dembele", "saka", "vinicius", "haaland",
        "ronaldo", "lukaku", "brobbey", "courtois", "nuno-mendes",
      ],
      captainId: "messi",
      viceCaptainId: "ronaldo",
    },
    teamB: {
      name: "Nishank",
      squad: [
        "kane", "mbappe", "gakpo", "bellingham", "kai-havertz",
        "olise", "oyarzabal", "matheus-cunha", "de-bruyne", "unai-simon", "yamal",
      ],
      captainId: "mbappe",
      viceCaptainId: "yamal",
    },  
  },
  {
    id: "ayush-anand-vs-nishank",
    scoringStartsAt: "Round of 32",
    teamA: {
      name: "Ayush Anand",
      squad: [
        "kane", "bellingham", "yamal", "saka", "vinicius", "lautaro",
        "dani-olmo", "gakpo", "bruno-fernandes", "emi-martinez", "balogun",
      ],
      captainId: "kane",
      viceCaptainId: "bellingham",
    },
    teamB: {
      name: "Nishank",
      squad: [
        "messi", "mbappe", "dembele", "olise", "kai-havertz",
        "declan-rice", "oyarzabal", "matheus-cunha", "brobbey", "unai-simon", "haaland",
      ],
      captainId: "mbappe",
      viceCaptainId: "messi",
    },
  },
  {
    id: "nishank-vs-tanmay",
    scoringStartsAt: "Round of 32",
    teamA: {
      name: "Nishank",
      squad: [
        "haaland", "mbappe", "messi", "bellingham", "kai-havertz",
        "olise", "oyarzabal", "declan-rice", "brobbey", "unai-simon", "matheus-cunha",
      ],
      captainId: "mbappe",
      viceCaptainId: "messi",
    },
    teamB: {
      name: "Tanmay",
      squad: [
        "kane", "yamal", "vinicius", "bruno-fernandes", "dembele",
        "pedri", "gakpo", "ronaldo", "lautaro", "mike-maignan", "nuno-mendes",
      ],
      captainId: "kane",
      viceCaptainId: "yamal",
    },
  },
  {
    id: "ayush-anand-vs-ps-dada",
    teamA: {
      name: "Ayush Anand",
      squad: [
        "kane", "olise", "vinicius", "oyarzabal", "julian-alvarez", "wirtz",
        "luis-diaz", "bellingham", "arda-guler", "kai-havertz", "saka",
      ],
      captainId: "kane",
      viceCaptainId: "bellingham",
    },
    teamB: {
      name: "PS Dada",
      squad: [
        "mbappe", "yamal", "dembele", "bruno-fernandes", "nico-williams",
        "haaland", "messi", "declan-rice", "matheus-cunha", "musiala", "pedri",
      ],
      captainId: "mbappe",
      viceCaptainId: "yamal",
    },
  },
];
