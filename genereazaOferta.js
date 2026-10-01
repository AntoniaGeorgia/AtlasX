const fs = require("fs");
const { Client } = require("pg");


const caleJson = "./resurse/json/oferte.json";
const T_MINUTE = 1; 
const durataOferta = T_MINUTE * 60 * 1000;
const reduceriPosibile = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

async function genereazaOferta() {
  const client = new Client({
    database: "proiect",
    user: "antonia",
    password: "parola",
    host: "localhost",
    port: 5432
  });

  await client.connect();

  // Obține categoriile distincte
  const rez = await client.query("SELECT DISTINCT categorie FROM excursii");
  const categorii = rez.rows.map(r => r.categorie);

  if (categorii.length === 0) {
    console.warn(" Nu există categorii în DB!");
    await client.end();
    return;
  }

  // Încarcă JSON-ul
  let json = { oferte: [] };
  if (fs.existsSync(caleJson)) {
    try {
      json = JSON.parse(fs.readFileSync(caleJson, "utf-8"));
    } catch (e) {
      console.warn(" Fișier JSON corupt. Se reinitializează.");
    }
  }

  const ofertaVeche = json.oferte[0];
  let categorieNoua;

  // Alege o categorie diferită de cea veche
  do {
    categorieNoua = categorii[Math.floor(Math.random() * categorii.length)];
  } while (ofertaVeche && categorieNoua === ofertaVeche.categorie);

  const reducere = reduceriPosibile[Math.floor(Math.random() * reduceriPosibile.length)];
  const dataStart = new Date();
  const dataFinal = new Date(dataStart.getTime() + durataOferta);

  const ofertaNoua = {
    categorie: categorieNoua,
    "data-incepere": dataStart.toISOString(),
    "data-finalizare": dataFinal.toISOString(),
    reducere: reducere
  };

  // Adaugă oferta în începutul vectorului
  json.oferte.unshift(ofertaNoua);

  // Scrie înapoi în fișier
  fs.writeFileSync(caleJson, JSON.stringify(json, null, 2));
  console.log(" Ofertă nouă generată:", ofertaNoua);

  await client.end();
}


// Oferă una inițial
genereazaOferta().catch(err => console.error("Eroare inițială:", err));

// Rulează la fiecare T minute
setInterval(() => {
  genereazaOferta().catch(err => console.error("Eroare periodică:", err));
}, durataOferta);
