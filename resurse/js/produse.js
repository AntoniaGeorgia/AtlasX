
function normalizeText(txt) {
  return txt.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

let produseFixate = new Set();
let produseAscunseTemp = new Set();
let produseAscunsePermanent = new Set(JSON.parse(sessionStorage.getItem("produseAscunsePermanent") || "[]"));

function toggleDropdown() {
  document.getElementById("dropdown-destinatii").classList.toggle("show");
}

function getDestinatiiSelectate() {
  const checkboxes = document.querySelectorAll('#dropdown-destinatii input[type=checkbox]');
  const selected = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value.trim().toLowerCase());
  return selected;
}

window.addEventListener("click", function (e) {
  if (!e.target.closest('.custom-multiselect')) {
    document.getElementById("dropdown-destinatii").classList.remove("show");
  }
});

window.onload = function () {

  const inputPret = document.getElementById("inp-pret");
const toateProdusele = Array.from(document.getElementsByClassName("produs"));

const preturi = toateProdusele.map(p => parseFloat(p.querySelector(".val-pret").innerText.trim()));
const minPret = Math.min(...preturi);
const maxPret = Math.max(...preturi);

inputPret.min = minPret;
inputPret.max = maxPret;
inputPret.value = minPret; 
document.getElementById("infoRange").textContent = `(${minPret})`;


  function aplicaFiltrare() {
  let inpNume = normalizeText(document.getElementById("inp-nume").value.trim());
  let inpPret = parseFloat(document.getElementById("inp-pret").value);
  let inpCategorie = normalizeText(document.getElementById("inp-categorie").value.trim());
  let inpDestinatii = getDestinatiiSelectate();

  //  Durata: min & max din radio selectat
  let inpDurata = "toate";
  let minDurata = 0, maxDurata = Infinity;
  let radios = document.getElementsByName("gr_rad");
  for (let r of radios) {
    if (r.checked) {
      inpDurata = r.value;
      if (inpDurata !== "toate") {
        [minDurata, maxDurata] = inpDurata.split(":").map(x => parseInt(x));
      }
      break;
    }
  }

  let nrAfisate = 0;
  let sumaPret = 0;
  let produse = document.getElementsByClassName("produs");

  for (let prod of produse) {
    let idProd = prod.getAttribute("data-id");

    // Ignoră produsele ascunse
    if (produseAscunseTemp.has(idProd) || produseAscunsePermanent.has(idProd)) {
      prod.style.display = "none";
      continue;
    }

    //  Dacă e fixat îl afișezi oricum
    if (produseFixate.has(idProd)) {
      prod.style.display = "block";
      nrAfisate++;
        let pretFix = parseFloat(prod.querySelector(".val-pret")?.innerText.trim() || "0");
      sumaPret += pretFix;

      continue;
    }


    
    //  Nume
    // 
    let nume = normalizeText(prod.querySelector(".val-nume")?.textContent.trim() || "");

    let cond1 = nume.includes(inpNume);

    //  Durată zile (parsează doar numărul)
    let durataText = prod.querySelector(".val-durata_zile")?.innerText.trim() || "";
    let durata = parseInt(durataText.match(/\d+/)?.[0] || "0");
    let cond2 = (inpDurata === "toate" || (durata >= minDurata && durata < maxDurata));

    //  Preț
    let pret = parseFloat(prod.querySelector(".val-pret")?.innerText.trim() || "0");
    let cond3 = pret >= inpPret;

    //  Categorie
    let cat = normalizeText(prod.querySelector(".val-categorie")?.innerText.trim() || "");
    let cond4 = (inpCategorie === "toate" || cat === inpCategorie);

    //  Destinații
    let destinatiiText = prod.querySelector(".val-destinatii")?.innerText.toLowerCase() || "";
    let cond5 = inpDestinatii.every(dest => !destinatiiText.includes(dest));

    // Afișare dacă toate condițiile sunt îndeplinite
    if (cond1 && cond2 && cond3 && cond4 && cond5) {
      prod.style.display = "block";
      nrAfisate++;

       sumaPret += pret;
    } else {
      prod.style.display = "none";
    }
  }

  document.getElementById("suma-produse").innerText = `Total preț produse afișate: ${sumaPret.toFixed(2)} lei`;
  // Mesaj dacă nu s-a afișat nimic
  document.getElementById("mesaj").style.display = nrAfisate === 0 ? "block" : "none";
}


  const produse = document.getElementsByClassName("produs");
  for (let prod of produse) {
    const idProd = prod.getAttribute("data-id");
    if (!idProd) continue;

    const container = document.createElement("div");
    container.className = "actiuni-produs";

    const btnFix = document.createElement("button");
    btnFix.className = "btn btn-outline-secondary btn-pastreaza";
    btnFix.title = "Păstrează produsul";
    btnFix.innerHTML = '<i class="fas fa-thumbtack"></i>';
    btnFix.onclick = () => {
      if (produseFixate.has(idProd)) {
        produseFixate.delete(idProd);
        prod.classList.remove("fixat");
        btnFix.classList.remove("btn-success");
      } else {
        produseFixate.add(idProd);
        prod.classList.add("fixat");
        btnFix.classList.add("btn-success");
      }
    };

    const btnTemp = document.createElement("button");
    btnTemp.className = "btn btn-outline-secondary btn-ascunde-temporar";
    btnTemp.title = "Ascunde temporar produsul";
    btnTemp.innerHTML = '<i class="fas fa-eye-slash"></i>';
    btnTemp.onclick = () => {
      produseAscunseTemp.add(idProd);
      aplicaFiltrare();
    };

    const btnPerm = document.createElement("button");
    btnPerm.className = "btn btn-outline-secondary btn-ascunde-permanent";
    btnPerm.title = "Ascunde permanent în sesiune";
    btnPerm.innerHTML = '<i class="fas fa-ban"></i>';
    btnPerm.onclick = () => {
      produseAscunsePermanent.add(idProd);
      sessionStorage.setItem("produseAscunsePermanent", JSON.stringify([...produseAscunsePermanent]));
      aplicaFiltrare();
    };

    container.appendChild(btnFix);
    container.appendChild(btnTemp);
    container.appendChild(btnPerm);
    prod.appendChild(container);
  }

  document.getElementById("filtrare").onclick = function (e) {
    e.preventDefault(); // oprește comportamentul default

    

    // 1️ inp-nume: să nu conțină cifre
    let inpNume = document.getElementById("inp-nume").value.trim();
    if (/\d/.test(inpNume)) { 
        alert("⚠️ Numele nu poate conține cifre!");
        document.getElementById("inp-nume").style.border = "2px solid red";
        return; // STOP
    } else {
        document.getElementById("inp-nume").style.border = ""; // reset
    }

    // 2️ inp-pret: >= 0
    let inpPret = parseFloat(document.getElementById("inp-pret").value);
    if (isNaN(inpPret) || inpPret < 0) {
        alert("⚠️ Prețul trebuie să fie un număr pozitiv!");
        document.getElementById("inp-pret").style.border = "2px solid red";
        return; // STOP
    } else {
        document.getElementById("inp-pret").style.border = "";
    }

    // 3️ Radio durată: să fie unul bifat
    let radios = document.getElementsByName("gr_rad");
    let radioBifat = false;
    for (let r of radios) {
        if (r.checked) {
            radioBifat = true;
            break;
        }
    }
    if (!radioBifat) {
        alert("⚠️ Selectați o durată!");
        return; // STOP
    }

    // Dacă toate sunt OK  APLICĂM FILTRAREA 
    aplicaFiltrare();
};

  
document.getElementById("inp-categorie").onchange = aplicaFiltrare;


  document.querySelectorAll(".produs").forEach(p => {
    p.addEventListener("click", () => {
      const nume = p.querySelector(".val-nume")?.innerText || "";
      const pret = p.querySelector(".val-pret")?.innerText || "";
      const durata = p.querySelector(".val-durata_zile")?.innerText || "";
      const categorie = p.querySelector(".val-categorie")?.innerText || "";
      const descriere = p.querySelector(".val-descriere")?.innerText || "";
      const destinatii = p.querySelector(".val-destinatii")?.innerText || "";
      const imagine = p.querySelector("img")?.getAttribute("src") || "";

      const continut = `
        <div class="row">
          <div class="col-md-5 text-center">
            <img src="${imagine}" class="img-fluid rounded shadow" alt="${nume}">
          </div>
          <div class="col-md-7">
            <h5>${nume}</h5>
            <p><strong>Preț:</strong> ${pret} lei</p>
            <p><strong>Durată:</strong> ${durata} zile</p>
            <p><strong>Categorie:</strong> ${categorie}</p>
            <p><strong>Destinații:</strong> ${destinatii}</p>
            <p><strong>Descriere:</strong> ${descriere}</p>
          </div>
        </div>
      `;
      document.getElementById("continut-modal").innerHTML = continut;
      const modal = new bootstrap.Modal(document.getElementById("modalProdus"));
      modal.show();
    });
  });

  document.getElementById("btn-sortare-dubla").onclick = function () {
    sorteazaDublu();
    creeazaPaginare();
  };

 document.getElementById("sortCrescNume").onclick = function () {
    sorteaza(1);
    creeazaPaginare();
  };
  document.getElementById("sortDescrescNume").onclick = function () {
    sorteaza(-1);
    creeazaPaginare();
  };

  function sorteaza(semn) {
  let produse = Array.from(document.getElementsByClassName("produs"));

  produse.sort(function (a, b) {
    let pretA = extrageValoare(a, "pret");
    let pretB = extrageValoare(b, "pret");

    if (pretA !== pretB) return semn * (pretA - pretB);

    let numeA = extrageValoare(a, "nume");
    let numeB = extrageValoare(b, "nume");
    return semn * numeA.localeCompare(numeB);
  });

  for (let p of produse) {
    p.parentNode.appendChild(p); // rearanjează în DOM
  }
}


  function sorteazaDublu() {
    const cheie1 = document.getElementById("cheie1").value;
    const cheie2 = document.getElementById("cheie2").value;
    const sens1 = parseInt(document.getElementById("sens1").value);
    const sens2 = parseInt(document.getElementById("sens2").value);
    let produse = Array.from(document.getElementsByClassName("produs"));
    produse.sort((a, b) => {
      const valA1 = extrageValoare(a, cheie1);
      const valB1 = extrageValoare(b, cheie1);
      if (valA1 < valB1) return -sens1;
      if (valA1 > valB1) return sens1;
      const valA2 = extrageValoare(a, cheie2);
      const valB2 = extrageValoare(b, cheie2);
      if (valA2 < valB2) return -sens2;
      if (valA2 > valB2) return sens2;
      return 0;
    });
    for (let p of produse) {
      p.parentNode.appendChild(p);
    }
  }

 function extrageValoare(elem, cheie) {
  switch (cheie) {
    case "nume":
      return normalizeText(elem.querySelector(".val-nume")?.innerText.trim() || "");
    case "pret":
      let pretText = elem.querySelector(".val-pret")?.innerText.trim() || "0";
      let valoareNumerica = parseFloat(pretText.match(/[\d.]+/)?.[0] || "0");
      return valoareNumerica;
    case "categorie":
      return normalizeText(elem.querySelector(".val-categorie")?.innerText.trim() || "");
    default:
      return "";
  }
}


  //  Activăm aplicaFiltrare doar pe filtrele locale
  document.getElementById("inp-nume").oninput = aplicaFiltrare;
  document.getElementById("inp-pret").addEventListener("input", function () {
    document.getElementById("infoRange").textContent = `(${this.value})`;
    aplicaFiltrare();
  });
  let radioDurata = document.getElementsByName("gr_rad");
  for (let r of radioDurata) {
    r.onchange = aplicaFiltrare;
  }
  let checkboxes = document.querySelectorAll('#dropdown-destinatii input[type=checkbox]');
  for (let cb of checkboxes) {
    cb.onchange = aplicaFiltrare;
  }

function creeazaPaginare() {
    const K = 6; // nr. produse pe pagină
    const produse = Array.from(document.querySelectorAll(".produs")).filter(p => p.style.display !== "none");
    const nrPagini = Math.ceil(produse.length / K);

    const divPaginare = document.getElementById("paginare");
    divPaginare.innerHTML = "";

    for (let i = 0; i < nrPagini; i++) {
        const btnPag = document.createElement("button");
        btnPag.className = "btn btn-primary";
        btnPag.innerText = (i + 1);
        btnPag.onclick = function () {
            // ascund toate produsele
            for (let p of produse) {
                p.style.display = "none";
            }

            // afișez doar produsele de pe pagina curentă
            for (let j = i * K; j < Math.min(produse.length, (i + 1) * K); j++) {
                produse[j].style.display = "block";
            }
        };
        divPaginare.appendChild(btnPag);
    }

    // automat afișez prima pagină
    if (nrPagini > 0) {
        divPaginare.querySelector("button")?.click();
    }
}


  document.getElementById("resetare").onclick = function () {

    if (!confirm("Sigur doriți să resetați filtrele?")) {
    return; 
}

  //  1. Resetare filtre
  document.getElementById("inp-nume").value = "";
  document.getElementById("inp-pret").value = 0;
  document.getElementById("infoRange").textContent = "(0)";
  document.getElementById("inp-categorie").value = "toate";
  document.getElementById("suma-produse").innerText = "Total preț produse afișate: 0 lei";


  // 2. Bifam opțiunea "toate" la radio
  let radioToate = document.querySelector("input[name='gr_rad'][value='toate']");
  if (radioToate) radioToate.checked = true;

  // 3. Debifam toate destinațiile
  let checkboxes = document.querySelectorAll('#dropdown-destinatii input[type=checkbox]');
  for (let cb of checkboxes) {
    cb.checked = false;
  }

  // 4. Resetare ascunderi temporare (nu permanente)
  produseAscunseTemp.clear();

  // 5. Afișăm din nou produsele care nu sunt ascunse permanent
  let produse = document.getElementsByClassName("produs");
  for (let prod of produse) {
    let idProd = prod.getAttribute("data-id");
    if (!produseAscunsePermanent.has(idProd)) {
      prod.style.display = "block";
    }
  }

  // 6. Ascunde mesajul de eroare
  document.getElementById("mesaj").style.display = "none";

  
  creeazaPaginare();
};

};
