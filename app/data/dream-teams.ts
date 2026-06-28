import type { PlayerId } from "./types";

/**
 * A "Dream Team" entry — one member's dream XI. Kept separate from the auction
 * `teams` so these don't appear on the Teams/Players tabs. Scored from players'
 * base points; no captain/vice and all 11 count unless specified.
 */
export interface DreamTeam {
  id: string;
  name: string;
  squad: PlayerId[];
  captainId?: PlayerId;
  viceCaptainId?: PlayerId;
  countTop?: number;
}

export const dreamTeams: DreamTeam[] = [
  {
    id: "dt-uday",
    name: "UDAY",
    squad: [
      "unai-simon", "hakimi", "van-dijk", "reece-james", "bruno-fernandes",
      "olise", "dumfries", "kane", "ronaldo", "vinicius", "mbappe",
    ],
  },
  {
    id: "dt-abhishek",
    name: "Abhishek",
    squad: [
      "emi-martinez", "dumfries", "van-dijk", "oreilly", "cherki", "raphinha",
      "yamal", "mbappe", "kane", "nico-williams", "vinicius",
    ],
  },
  {
    id: "dt-deekshithh",
    name: "Deekshithh",
    squad: [
      "maignan", "cristian-romero", "van-dijk", "nuno-mendes", "bruno-fernandes",
      "bellingham", "arda-guler", "haaland", "messi", "kane", "mbappe",
    ],
  },
  {
    id: "dt-dip",
    name: "Dip",
    squad: [
      "pickford", "nuno-mendes", "marcos-llorente", "molina", "bruno-fernandes",
      "olise", "yamal", "haaland", "mbappe", "julian-alvarez", "kane",
    ],
  },
  {
    id: "dt-swadhin",
    name: "Swadhin",
    squad: [
      "courtois", "nuno-mendes", "marquinhos", "saliba", "bellingham", "yamal",
      "bruno-fernandes", "lautaro", "haaland", "mbappe", "kane",
    ],
  },
  {
    id: "dt-karan",
    name: "Karan",
    squad: [
      "emi-martinez", "upamecano", "van-dijk", "nuno-mendes", "mbappe",
      "vinicius", "kane", "messi", "declan-rice", "pedri", "bruno-fernandes",
    ],
  },
  {
    id: "dt-jatin",
    name: "Jatin",
    squad: [
      "emi-martinez", "gabriel", "van-dijk", "nuno-mendes", "mbappe",
      "vinicius", "lautaro", "raphinha", "olise", "yamal", "bruno-fernandes",
    ],
  },
  {
    id: "dt-tanmay",
    name: "Tanmay",
    squad: [
      "alisson", "hakimi", "nuno-mendes", "cucurella", "bruno-fernandes",
      "yamal", "bellingham", "mbappe", "dembele", "matheus-cunha", "kane",
    ],
  },
  {
    id: "dt-smayan",
    name: "Smayan",
    squad: [
      "emi-martinez", "nuno-mendes", "reece-james", "hakimi", "yamal",
      "bruno-fernandes", "olise", "mbappe", "kane", "oyarzabal", "vinicius",
    ],
  },
  {
    id: "dt-yash-mix",
    name: "Yash Mix",
    squad: [
      "emi-martinez", "hakimi", "gabriel", "nuno-mendes", "bruno-fernandes",
      "yamal", "wirtz", "kane", "vinicius", "messi", "mbappe",
    ],
  },
  {
    id: "dt-naman",
    name: "Naman",
    squad: [
      "emi-martinez", "nuno-mendes", "reece-james", "hakimi", "yamal",
      "bruno-fernandes", "olise", "julian-alvarez", "vinicius", "mbappe", "kane",
    ],
  },
  {
    id: "dt-joy",
    name: "Joy",
    squad: [
      "emi-martinez", "nuno-mendes", "hakimi", "dumfries", "bruno-fernandes",
      "yamal", "wirtz", "mbappe", "kane", "raphinha", "julian-alvarez",
    ],
  },
  {
    id: "dt-kanha",
    name: "Kanha",
    squad: [
      "maignan", "nuno-mendes", "marquinhos", "gabriel", "bruno-fernandes",
      "bellingham", "yamal", "kane", "julian-alvarez", "mbappe", "haaland",
    ],
  },
  {
    id: "dt-rohan",
    name: "Rohan",
    squad: [
      "maignan", "van-dijk", "gabriel", "nuno-mendes", "bellingham",
      "bruno-fernandes", "olise", "oyarzabal", "haaland", "mbappe", "kane",
    ],
  },
  {
    id: "dt-chaitanya",
    name: "Chaitanya M",
    squad: [
      "emi-martinez", "nuno-mendes", "hakimi", "reece-james", "bruno-fernandes",
      "olise", "yamal", "mbappe", "kane", "oyarzabal", "vinicius",
    ],
  },
  {
    id: "dt-yash-a",
    name: "Yash A",
    squad: [
      "alisson", "hakimi", "nuno-mendes", "cucurella", "bruno-fernandes",
      "olise", "yamal", "vinicius", "messi", "mbappe", "kane",
    ],
  },
  {
    id: "dt-travis-head",
    name: "Travis Head",
    squad: [
      "emi-martinez", "hakimi", "nuno-mendes", "marcos-llorente", "yamal",
      "vitinha", "olise", "mbappe", "kane", "matheus-cunha", "julian-alvarez",
    ],
  },
  {
    id: "dt-ankur",
    name: "Ankur",
    squad: [
      "emi-martinez", "hakimi", "nuno-mendes", "dumfries", "bruno-fernandes",
      "yamal", "wirtz", "mbappe", "kane", "messi", "dembele",
    ],
  },
  {
    id: "dt-ayush-anand",
    name: "Ayush Anand",
    squad: [
      "galindez", "cucurella", "hakimi", "dumfries", "bellingham",
      "bruno-fernandes", "olise", "kane", "mbappe", "vinicius", "julian-alvarez",
    ],
  },
];

export const dreamTeamById = new Map(dreamTeams.map((t) => [t.id, t]));
