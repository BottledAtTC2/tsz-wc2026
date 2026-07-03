import type { PlayerId } from "./types";

/** One side of a draft matchup. */
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

/** A head-to-head draft between two or more teams. */
export interface Draft {
  id: string;
  /** Optional label, e.g. "Round of 16". Falls back to joined team names. */
  title?: string;
  /**
   * Optional first fixture stage to count. Omit to count every scored match.
   * Examples: "Round of 32", "Round of 16", "Quarterfinals".
   */
  scoringStartsAt?: string;
  teams: DraftTeam[];
}

// Add h2h or h3h drafts here. Example (delete or replace):
//
// {
//   id: "ayush-vs-mfk",
//   title: "Round of 32 Auction",
//   scoringStartsAt: "Round of 32", // omit to include group-stage points too
//   teams: [
//     {
//       name: "Ayush",
//       squad: ["messi", "yamal", "kane", "saka", "pedri"],
//       captainId: "messi",      // optional
//       viceCaptainId: "yamal",  // optional
//       countTop: 5,             // best 5 count; omit for "all count"
//     },
//     {
//       name: "MFK",
//       squad: ["haaland", "mbappe", "vinicius", "rodri", "bellingham"],
//       // no captain/vice, all players count
//     },
//   ],
// },
export const drafts: Draft[] = [
  {
    id: "mfk-vs-ayush-anand",
    teams: [
      {
        name: "MFK",
        squad: [
          "mbappe", "olise", "oyarzabal", "vinicius", "dembele", "nico-williams",
          "declan-rice", "vitinha", "raphinha", "haaland", "matheus-cunha",
        ],
        captainId: "olise",
        viceCaptainId: "oyarzabal",
      },
      {
        name: "Ayush Anand",
        squad: [
          "kane", "bellingham", "yamal", "bruno-fernandes", "julian-alvarez",
          "wirtz", "luis-diaz", "arda-guler", "messi", "kai-havertz", "saka",
        ],
        captainId: "kane",
        viceCaptainId: "bellingham",
      },
    ],
  },
  {
    id: "tanmay-vs-ayush-anand",
    teams: [
      {
        name: "Tanmay",
        squad: [
          "kane", "yamal", "vinicius", "bruno-fernandes", "dembele",
          "pedri", "gakpo", "ronaldo", "lautaro", "mike-maignan", "nuno-mendes",
        ],
        captainId: "kane",
        viceCaptainId: "dembele",
      },
      {
        name: "Ayush Anand",
        squad: [
          "mbappe", "olise", "oyarzabal", "vinicius", "dembele", "nico-williams",
          "declan-rice", "vitinha", "raphinha", "haaland", "matheus-cunha",
        ],
        captainId: "olise",
        viceCaptainId: "oyarzabal",
      },
    ],
  },
  {
    id: "mradul-vs-nishank",
    scoringStartsAt: "Round of 32",
    teams: [
      {
        name: "Mradul",
        squad: [
          "messi", "undav", "dembele", "saka", "vinicius", "haaland",
          "ronaldo", "lukaku", "brobbey", "courtois", "nuno-mendes",
        ],
        captainId: "messi",
        viceCaptainId: "ronaldo",
      },
      {
        name: "Nishank",
        squad: [
          "kane", "mbappe", "gakpo", "bellingham", "kai-havertz",
          "olise", "oyarzabal", "matheus-cunha", "de-bruyne", "unai-simon", "yamal",
        ],
        captainId: "mbappe",
        viceCaptainId: "yamal",
      },
    ],
  },
  {
    id: "ayush-anand-vs-nishank",
    scoringStartsAt: "Round of 32",
    teams: [
      {
        name: "Ayush Anand",
        squad: [
          "kane", "bellingham", "yamal", "saka", "vinicius", "lautaro",
          "dani-olmo", "gakpo", "bruno-fernandes", "emi-martinez", "balogun",
        ],
        captainId: "kane",
        viceCaptainId: "bellingham",
      },
      {
        name: "Nishank",
        squad: [
          "messi", "mbappe", "dembele", "olise", "kai-havertz",
          "declan-rice", "oyarzabal", "matheus-cunha", "brobbey", "unai-simon", "haaland",
        ],
        captainId: "mbappe",
        viceCaptainId: "messi",
      },
    ],
  },
  {
    id: "nishank-vs-tanmay",
    scoringStartsAt: "Round of 32",
    teams: [
      {
        name: "Nishank",
        squad: [
          "haaland", "mbappe", "messi", "bellingham", "kai-havertz",
          "olise", "oyarzabal", "declan-rice", "brobbey", "unai-simon", "matheus-cunha",
        ],
        captainId: "mbappe",
        viceCaptainId: "messi",
      },
      {
        name: "Tanmay",
        squad: [
          "kane", "yamal", "vinicius", "bruno-fernandes", "dembele",
          "pedri", "gakpo", "ronaldo", "lautaro", "maignan", "nuno-mendes",
        ],
        captainId: "kane",
        viceCaptainId: "dembele",
      },
    ],
  },
  {
    id: "csd",
    teams: [
      {
        name: "Chaitanya",
        squad: [
          "kane", "mbappe", "nuno-mendes", "vinicius", "arda-guler", "wirtz",
          "doku", "nico-williams", "matheus-cunha", "enzo-fernandez", "reece-james",
          "casemiro", "cherki", "doue", "elliot-anderson"
        ],
        captainId: "mbappe",
        viceCaptainId: "kane",
      },
      {
        name: "Rathin",
        squad: [
          "messi", "yamal", "ronaldo", "joao-neves", "raphinha",
          "julian-alvarez", "musiala", "hakimi", "kimmich", "saka", "pedri",
          "de-bruyne", "rodri", "neymar", "theo-hernandez"
        ],
        captainId: "yamal",
        viceCaptainId: "messi",
      },
      {
        name: "Smayan",
        squad: [
          "olise", "bruno-fernandes", "oyarzabal", "dembele", "vitinha",
          "kai-havertz", "haaland", "yildiz", "cucurella", "bellingham", "gakpo",
          "luis-diaz", "sane", "declan-rice", "paqueta"
        ],
        captainId: "olise",
        viceCaptainId: "bruno-fernandes",
      },
    ],
  },
  {
    id: "ayush-anand-vs-ps-dada",
    teams: [
      {
        name: "Ayush Anand",
        squad: [
          "kane", "olise", "vinicius", "oyarzabal", "julian-alvarez", "wirtz",
          "luis-diaz", "bellingham", "arda-guler", "kai-havertz", "saka",
        ],
        captainId: "kane",
        viceCaptainId: "bellingham",
      },
      {
        name: "PS Dada",
        squad: [
          "mbappe", "yamal", "dembele", "bruno-fernandes", "nico-williams",
          "haaland", "messi", "declan-rice", "matheus-cunha", "musiala", "pedri",
        ],
        captainId: "mbappe",
        viceCaptainId: "yamal",
      },
    ],
  },
];
