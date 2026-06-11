import type { FantasyTeam } from "./types";

// Fantasy teams owned by league members, with squads drafted from the auction.
export const teams: FantasyTeam[] = [
  {
    id: "shivadip",
    name: "Team ShivaDip",
    poolId: "pool1",
    squad: [
      "courtois", "guehi", "hakimi", "van-de-ven", "de-bruyne", "arda-guler",
      "odegaard", "vitinha", "dembele", "depay", "trossard",
    ],
    captainId: "dembele",
    viceCaptainId: "vitinha",
    points: 0,
  },
  {
    id: "yash",
    name: "Team Yash",
    poolId: "pool1",
    squad: [
      "maignan", "reece-james", "cristian-romero", "david-raum", "pavlovic",
      "reijnders", "paredes", "vinicius", "lautaro", "oyarzabal", "saka",
    ],
    captainId: "vinicius",
    viceCaptainId: "oyarzabal",
    points: 0,
  },
  {
    id: "aggarwal-sweets",
    name: "Team Aggarwal Sweets",
    poolId: "pool1",
    squad: [
      "pickford", "inacio", "cucurella", "ryerson", "joao-neves", "wirtz",
      "paqueta", "kimmich", "mbappe", "rashford", "endrick",
    ],
    captainId: "mbappe",
    viceCaptainId: "wirtz",
    points: 0,
  },
  {
    id: "aman",
    name: "Team Aman",
    poolId: "pool1",
    squad: [
      "diogo-costa", "upamecano", "van-dijk", "pacho", "bruno-fernandes",
      "de-jong", "elliot-anderson", "julian-alvarez", "luis-suarez",
      "patrik-schick", "xhaka",
    ],
    captainId: "bruno-fernandes",
    viceCaptainId: "julian-alvarez",
    points: 0,
  },
  {
    id: "tanmay",
    name: "Team Tanmay",
    poolId: "pool1",
    squad: [
      "bounou", "ruben-dias", "oreilly", "van-hecke", "yildiz", "tchouameni",
      "modric", "yamal", "matheus-cunha", "luis-diaz", "brahim-diaz",
    ],
    captainId: "yamal",
    viceCaptainId: "matheus-cunha",
    points: 0,
  },
  {
    id: "udkohli",
    name: "Team UDKohli",
    poolId: "pool1",
    squad: [
      "unai-simon", "nuno-mendes", "schlotterbeck", "dumfries", "casemiro",
      "bruno-guimaraes", "valverde", "morgan-rogers", "kane", "ronaldo", "salah",
    ],
    captainId: "kane",
    viceCaptainId: "nuno-mendes",
    points: 0,
  },
  {
    id: "zeeshan",
    name: "Team Zeeshan",
    poolId: "pool1",
    squad: [
      "messi", "musiala", "enzo-fernandez", "pedri", "cubarsi", "konsa",
      "molina", "ferran-torres", "embolo", "raul-jimenez", "neuer",
    ],
    captainId: "messi",
    viceCaptainId: "musiala",
    points: 0,
  },
  {
    id: "abhishek",
    name: "Team Abhishek",
    poolId: "pool1",
    squad: [
      "olise", "nico-williams", "marcos-llorente", "mac-allister",
      "giovanni-simeone", "raphinha", "alex-sandro", "tah", "baumann",
      "sane", "mctominay",
    ],
    captainId: "olise",
    viceCaptainId: "raphinha",
    points: 0,
  },
  {
    id: "mfk",
    name: "Team MFK",
    poolId: "pool1",
    squad: [
      "theo-hernandez", "bernardo-silva", "cancelo", "rodri", "declan-rice",
      "marquinhos", "alisson", "haaland", "kai-havertz", "doku", "sorloth",
    ],
    captainId: "haaland",
    viceCaptainId: "kai-havertz",
    points: 0,
  },
  {
    id: "jemin",
    name: "Team Jemin",
    poolId: "pool1",
    squad: [
      "saliba", "cherki", "doue", "kounde", "fabian-ruiz", "dani-olmo",
      "emi-martinez", "bellingham", "neymar", "gabriel", "gakpo",
    ],
    captainId: "bellingham",
    viceCaptainId: "doue",
    points: 0,
  },
  // Pool 2 teams (up to 10) will be added once that draft is provided.
];

export const teamById = new Map(teams.map((t) => [t.id, t]));
