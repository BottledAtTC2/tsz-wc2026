import type { FantasyTeam } from "./types";

// Fantasy teams owned by league members, with squads drafted from the auction.
export const teams: FantasyTeam[] = [
  {
    id: "shivadip",
    name: "Team ShivaDip",
    poolId: "tsz",
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
    poolId: "tsz",
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
    name: "Bangalore Vibrators",
    poolId: "tsz",
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
    poolId: "tsz",
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
    poolId: "tsz",
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
    name: "UDKohli",
    poolId: "tsz",
    squad: [
      "unai-simon", "nuno-mendes", "schlotterbeck", "dumfries", "casemiro",
      "bruno-guimaraes", "valverde", "morgan-rogers", "kane", "ronaldo", "salah"
    ],
    replacements: [
      {
        outgoingId: "schlotterbeck",
        incomingId: "brown",
        startsEventId: 15186907, // inclusive: replacement counts from this game onwards
      },
    ],
    captainId: "kane",
    viceCaptainId: "nuno-mendes",
    points: 0,
  },
  {
    id: "zeeshan",
    name: "Team Zeeshan",
    poolId: "tsz",
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
    poolId: "tsz",
    squad: [
      "olise", "nico-williams", "marcos-llorente", "mac-allister",
      "giuliano-simeone", "raphinha", "alex-sandro", "tah", "baumann",
      "sane", "mctominay",
    ],
    captainId: "olise",
    viceCaptainId: "raphinha",
    points: 0,
  },
  {
    id: "mfk",
    name: "Le FiFA",
    poolId: "tsz",
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
    poolId: "tsz",
    squad: [
      "saliba", "cherki", "doue", "kounde", "fabian-ruiz", "dani-olmo",
      "emi-martinez", "bellingham", "neymar", "gabriel", "gakpo",
    ],
    captainId: "bellingham",
    viceCaptainId: "doue",
    points: 0,
  },

  // ===== CCO Pool =====
  {
    id: "night-merchants",
    name: "Night Merchants",
    poolId: "cco",
    squad: [
      "kobel", "reece-james", "saliba", "van-de-ven", "joao-neves",
      "bruno-guimaraes", "tielemans", "olise", "doue", "raul-jimenez", "embolo",
    ],
    captainId: "olise",
    viceCaptainId: "joao-neves",
    points: 0,
  },
  {
    id: "le-fifa",
    name: "Le FIFA",
    poolId: "cco",
    squad: [
      "declan-rice", "cancelo", "diogo-costa", "bernardo-silva", "vinicius",
      "casemiro", "odegaard", "van-dijk", "gakpo", "pavlovic", "ryerson",
    ],
    captainId: "vinicius",
    viceCaptainId: "declan-rice",
    points: 0,
  },
  {
    id: "jokic",
    name: "Jokic",
    poolId: "cco",
    squad: [
      "pickford", "oreilly", "hakimi", "marquinhos", "dumfries", "brahim-diaz",
      "de-paul", "rabiot", "kane", "trossard", "malen",
    ],
    captainId: "kane",
    viceCaptainId: "oreilly",
    points: 0,
  },
  {
    id: "sidmay",
    name: "Sidmay",
    poolId: "cco",
    squad: [
      "maignan", "konsa", "van-hecke", "hincapie", "enzo-fernandez", "modric",
      "caicedo", "dembele", "haaland", "lautaro", "ferran-torres",
    ],
    captainId: "dembele",
    viceCaptainId: "haaland",
    points: 0,
  },
  {
    id: "bangalore-vibrators",
    name: "Bangalore Vibrators",
    poolId: "cco",
    squad: [
      "yamal", "ronaldo", "vitinha", "cristian-romero", "theo-hernandez",
      "schlotterbeck", "salah", "mctominay", "edouard-mendy", "mane",
      "reijnders"
    ],
    replacements: [
      {
        outgoingId: "schlotterbeck",
        incomingId: "brown",
        startsEventId: 15186907, // inclusive: replacement counts from this game onwards
      },
    ],
    captainId: "yamal",
    viceCaptainId: "vitinha",
    points: 0,
  },
  {
    id: "cco-zeeshan",
    name: "Zeeshan",
    poolId: "cco",
    squad: [
      "julian-alvarez", "messi", "bellingham", "rodri", "lucas-hernandez",
      "kimmich", "neuer", "molina", "alaba", "patrik-schick", "sabitzer",
    ],
    captainId: "messi",
    viceCaptainId: "julian-alvarez",
    points: 0,
  },
  {
    id: "saishith",
    name: "Saishith",
    poolId: "cco",
    squad: [
      "nico-williams", "raphinha", "cubarsi", "tchouameni", "giuliano-simeone",
      "musiala", "doku", "de-jong", "verbruggen", "gvardiol", "koulibaly",
    ],
    captainId: "nico-williams",
    viceCaptainId: "raphinha",
    points: 0,
  },
  {
    id: "diptham",
    name: "Diptham",
    poolId: "cco",
    squad: [
      "courtois", "guehi", "marcos-llorente", "davies", "fabian-ruiz",
      "morgan-rogers", "wirtz", "valverde", "matheus-cunha", "de-ketelaere",
      "yildiz",
    ],
    captainId: "wirtz",
    viceCaptainId: "matheus-cunha",
    points: 0,
  },
  {
    id: "nishank",
    name: "Nishank",
    poolId: "cco",
    squad: [
      "alisson", "oyarzabal", "depay", "gordon", "kai-havertz", "pedri",
      "cherki", "arda-guler", "tah", "laimer", "eric-garcia",
    ],
    captainId: "oyarzabal",
    viceCaptainId: "kai-havertz",
    points: 0,
  },
  {
    id: "mradul-mavericks",
    name: "Mradul Mavericks",
    poolId: "cco",
    squad: [
      "tagliafico", "saka", "unai-simon", "mbappe", "kante", "konate",
      "inacio", "neymar", "rieder", "ounahi", "lukaku",
    ],
    captainId: "mbappe",
    viceCaptainId: "ounahi",
    points: 0,
  },
  {
    id: "kanha",
    name: "Kanha",
    poolId: "cco",
    squad: [
      "emi-martinez", "upamecano", "pacho", "stanisic", "bruno-fernandes",
      "de-bruyne", "dani-olmo", "rashford", "luis-diaz", "son", "pulisic",
    ],
    captainId: "bruno-fernandes",
    viceCaptainId: "luis-diaz",
    points: 0,
  },
  {
    id: "maclone",
    name: "Maclone",
    poolId: "cco",
    squad: [
      "mac-allister", "elliot-anderson", "cucurella", "nuno-mendes", "leao",
      "ruben-dias", "paqueta", "gabriel", "undav", "bounou", "luis-suarez",
    ],
    captainId: "nuno-mendes",
    viceCaptainId: "elliot-anderson",
    points: 0,
  },
  {
    id: "be-zeeshan",
    name: "Zeeshan",
    poolId: "be_1",
    squad: [
      "mbappe", "vinicius", "paz", "nuno-mendes", "kimmich",
      "van-dijk", "salah", "ferran-torres", "patrik-schick", "mane", "courtois",
    ],
    captainId: "mbappe",
    viceCaptainId: "vinicius",
    points: 0,
  },
  {
    id: "be-ayush",
    name: "Ayush",
    poolId: "be_1",
    squad: [
      "cucurella", "fabian-ruiz", "cubarsi", "tchouameni", "inacio",
      "kane", "bellingham", "reece-james", "marquinhos", "paqueta", "vargas",
    ],
    captainId: "kane",
    viceCaptainId: "bellingham",
    points: 0,
  },
  {
    id: "be-shivadip",
    name: "ShivaDip",
    poolId: "be_1",
    squad: [
      "bruno-fernandes", "olise", "marcos-llorente", "pickford", "sorloth",
      "de-jong", "trossard", "yildiz", "saibari", "james-rodriguez", "malen",
    ],
    captainId: "bruno-fernandes",
    viceCaptainId: "olise",
    points: 0,
  },
  {
    id: "be-kappsons",
    name: "Kappsons",
    poolId: "be_1",
    squad: [
      "dembele", "doue", "neymar", "lautaro", "matheus-cunha", "musiala",
      "nusa", "valverde", "pavlovic", "saliba", "emi-martinez",
    ],
    captainId: "dembele",
    viceCaptainId: "matheus-cunha",
    points: 0,
  },
  {
    id: "be-ritz",
    name: "Ritz XI",
    poolId: "be_1",
    squad: [
      "cherki", "joao-neves", "gabriel", "alisson", "odegaard", "gakpo",
      "doku", "de-bruyne", "arda-guler", "modric", "pulisic",
    ],
    captainId: "gakpo",
    viceCaptainId: "arda-guler",
    points: 0,
  },
  {
    id: "be-aman",
    name: "Aman",
    poolId: "be_1",
    squad: [
      "messi", "luis-diaz", "upamecano", "ruben-dias", "hakimi",
      "bruno-guimaraes", "raul-jimenez", "sane", "brahim-diaz", "xhaka",
      "diogo-costa",
    ],
    captainId: "messi",
    viceCaptainId: "luis-diaz",
    points: 0,
  },
  {
    id: "be-bharatsons",
    name: "Bharatsons",
    poolId: "be_1",
    squad: [
      "vitinha", "ronaldo", "cancelo", "declan-rice", "guehi", "oreilly",
      "casemiro", "wirtz", "depay", "dumfries", "neuer",
    ],
    captainId: "declan-rice",
    viceCaptainId: "oreilly",
    points: 0,
  },
  {
    id: "be-ps-dada",
    name: "PS Dada",
    poolId: "be_1",
    squad: [
      "leao", "joao-felix", "saka", "elliot-anderson", "morgan-rogers",
      "julian-alvarez", "bernardo-silva", "enzo-fernandez", "mac-allister",
      "haaland", "verbruggen",
    ],
    captainId: "julian-alvarez",
    viceCaptainId: "haaland",
    points: 0,
  },
  {
    id: "be-nishank",
    name: "Nishank",
    poolId: "be_1",
    squad: [
      "luis-suarez", "endrick", "oyarzabal", "dani-olmo", "rashford",
      "raphinha", "kai-havertz", "sarr", "nmecha", "rodri", "bounou",
    ],
    captainId: "oyarzabal",
    viceCaptainId: "raphinha",
    points: 0,
  },
  {
    id: "be1-mradul",
    name: "Mradul",
    poolId: "be_1",
    squad: [
      "yamal", "nico-williams", "pedri", "maignan", "ramos", "rabiot",
      "arias", "kokcu", "weghorst", "pavel",
    ],
    captainId: "yamal",
    viceCaptainId: "nico-williams",
    points: -150,
  },

  // ===== Bid Enclave Pool 2 =====
  {
    id: "be2-samarth",
    name: "Samarth",
    poolId: "be_2",
    squad: [
      "elliot-anderson", "emi-martinez", "nuno-mendes", "joao-neves", "mbappe",
      "doue", "undav", "endrick", "ueda",
    ],
    captainId: "mbappe",
    viceCaptainId: "nuno-mendes",
    points: -150,
  },
  {
    id: "be2-nishank",
    name: "Nishank",
    poolId: "be_2",
    squad: [
      "messi", "julian-alvarez", "pedri", "nico-williams", "oyarzabal",
      "de-bruyne", "arda-guler", "dani-olmo", "cherki", "bounou", "patrik-schick",
    ],
    captainId: "messi",
    viceCaptainId: "oyarzabal",
    points: 0,
  },
  {
    id: "be2-maclone",
    name: "Maclone",
    poolId: "be_2",
    squad: [
      "bruno-fernandes", "bellingham", "saka", "wirtz", "vinicius", "pickford",
      "oreilly", "sane", "thuram", "mane", "arias",
    ],
    captainId: "bruno-fernandes",
    viceCaptainId: "vinicius",
    points: 0,
  },
  {
    id: "be2-mradul",
    name: "Mradul Mavericks",
    poolId: "be_2",
    squad: [
      "doku", "ruben-neves", "ruben-dias", "maignan", "vitinha", "estupinan",
      "luis-suarez", "valverde", "fidalgo", "mauricio", "saibari",
    ],
    captainId: "luis-suarez",
    viceCaptainId: "mauricio",
    points: 0,
  },
  {
    id: "be2-swadhin",
    name: "Swadhin",
    poolId: "be_2",
    squad: [
      "unai-simon", "saliba", "bruno-guimaraes", "odegaard", "kubo", "yamal",
      "lautaro", "gakpo", "kramaric", "santiago-gimenez", "pedro-neto",
    ],
    captainId: "yamal",
    viceCaptainId: "lautaro",
    points: 0,
  },
  {
    id: "be2-thalasons",
    name: "Thalasons",
    poolId: "be_2",
    squad: [
      "rashford", "bernardo-silva", "cancelo", "dembele", "kounde", "olise",
      "marquinhos", "cubarsi", "courtois", "de-jong", "modric",
    ],
    captainId: "olise",
    viceCaptainId: "dembele",
    points: 0,
  },
  {
    id: "be2-adrsh",
    name: "Adrsh Raja",
    poolId: "be_2",
    squad: [
      "kane", "declan-rice", "guehi", "reece-james", "francisco-conceicao", "upamecano",
      "kai-havertz", "kimmich", "luis-diaz", "verbruggen", "depay",
    ],
    captainId: "kane",
    viceCaptainId: "declan-rice",
    points: 0,
  },
  {
    id: "be2-kappsons",
    name: "Kappsons",
    poolId: "be_2",
    squad: [
      "diogo-costa", "neuer", "theo-hernandez", "tah", "gabriel", "fabian-ruiz",
      "rodri", "enzo-fernandez", "neymar", "ronaldo", "raphinha",
    ],
    captainId: "raphinha",
    viceCaptainId: "ronaldo",
    points: 0,
  },
  {
    id: "be2-lefifa",
    name: "LeFifa",
    poolId: "be_2",
    squad: [
      "mac-allister", "tchouameni", "musiala", "matheus-cunha", "alisson",
      "haaland", "van-dijk", "sorloth", "hakimi", "pavlovic", "leao",
    ],
    captainId: "haaland",
    viceCaptainId: "musiala",
    points: 0,
  },

  // ===== RCB Fam Pool =====
  {
    id: "rcb-chokers",
    name: "Chokers",
    poolId: "rcb",
    squad: [
      "verbruggen", "cucurella", "laporte", "reece-james", "de-jong",
      "bellingham", "mctominay", "ferran-torres", "doue", "messi", "vinicius"
    ],
    replacements: [
      {
        outgoingId: "reece-james",
        incomingId: "spence",
        startsEventId: 15186676, // inclusive: replacement counts from this game onwards
      },
    ],
    captainId: "messi",
    viceCaptainId: "vinicius",
    points: 0,
  },
  {
    id: "rcb-champions",
    name: "Champions",
    poolId: "rcb",
    squad: [
      "alisson", "tah", "dumfries", "davies", "pedri", "enzo-fernandez",
      "vitinha", "musiala", "julian-alvarez", "trossard", "de-ketelaere",
    ],
    captainId: "julian-alvarez",
    viceCaptainId: "vitinha",
    points: 0,
  },
  {
    id: "rcb-saisuresh",
    name: "SaiSuresh",
    poolId: "rcb",
    squad: [
      "emi-martinez", "cubarsi", "schlotterbeck", "hincapie", "joao-neves",
      "bernardo-silva", "dani-olmo", "cherki", "raphinha", "pulisic", "gyokeres"
    ],
    replacements: [
      {
        outgoingId: "schlotterbeck",
        incomingId: "brown",
        startsEventId: 15186907, // inclusive: replacement counts from this game onwards
      },
    ],
    captainId: "raphinha",
    viceCaptainId: "cherki",
    points: 0,
  },
  {
    id: "rcb-rcbfam",
    name: "RCB FAM",
    poolId: "rcb",
    squad: [
      "maignan", "marquinhos", "guehi", "gvardiol", "bruno-fernandes",
      "pavlovic", "odegaard", "gakpo", "saka", "doku", "embolo",
    ],
    captainId: "bruno-fernandes",
    viceCaptainId: "doku",
    points: 0,
  },
  {
    id: "rcb-aman",
    name: "Aman",
    poolId: "rcb",
    squad: [
      "raya", "upamecano", "cancelo", "van-dijk", "wirtz", "tielemans",
      "bruno-guimaraes", "olise", "brahim-diaz", "luis-diaz", "saibari",
    ],
    replacements: [
      {
        outgoingId: "saibari",
        incomingId: "ounahi",
        startsEventId: 12813016, // inclusive: replacement counts from this game onwards
      },
    ],
    captainId: "olise",
    viceCaptainId: "wirtz",
    points: 0,
  },
  {
    id: "rcb-night-merchants",
    name: "Night Merchants",
    poolId: "rcb",
    squad: [
      "unai-simon", "molina", "pacho", "nuno-mendes", "reijnders", "casemiro",
      "morgan-rogers", "salah", "oyarzabal", "kai-havertz", "dembele",
    ],
    captainId: "dembele",
    viceCaptainId: "oyarzabal",
    points: 0,
  },
  {
    id: "rcb-tanmay",
    name: "Tanmay XI",
    poolId: "rcb",
    squad: [
      "diogo-costa", "saliba", "ruben-dias", "hakimi", "elliot-anderson",
      "tchouameni", "yildiz", "yamal", "haaland", "matheus-cunha", "luis-suarez",
    ],
    captainId: "yamal",
    viceCaptainId: "matheus-cunha",
    points: 0,
  },
  {
    id: "rcb-haggu",
    name: "Haggu XI",
    poolId: "rcb",
    squad: [
      "pickford", "rashford", "ronaldo", "son", "fabian-ruiz", "rodri",
      "mac-allister", "marcos-llorente", "cristian-romero", "konate", "oreilly",
    ],
    captainId: "ronaldo",
    viceCaptainId: "fabian-ruiz",
    points: 0,
  },
  {
    id: "rcb-dip",
    name: "Dip",
    poolId: "rcb",
    squad: [
      "neuer", "gabriel", "rudiger", "kounde", "de-bruyne", "arda-guler",
      "valverde", "mbappe", "nico-williams", "depay", "lautaro",
    ],
    captainId: "mbappe",
    viceCaptainId: "arda-guler",
    points: 0,
  },
  {
    id: "rcb-team10",
    name: "Team 10",
    poolId: "rcb",
    squad: [
      "courtois", "eric-garcia", "theo-hernandez", "david-raum", "declan-rice",
      "kimmich", "modric", "perisic", "sorloth", "kane", "joao-felix",
    ],
    captainId: "kane",
    viceCaptainId: "declan-rice",
    points: 0,
  },
];

export const teamById = new Map(teams.map((t) => [t.id, t]));
