function incarcaImagineFlex(idProdus, indexImagine, callback) {
  const extensii = [".jpg", ".jpeg", ".png", ".webp"];
  let gasita = false;

  for (let ext of extensii) {
    const cale = `/resurse/imagini/produse/${idProdus}/${indexImagine}${ext}`;
    const imgTest = new Image();

    imgTest.onload = function () {
      if (!gasita) {
        gasita = true;
        callback(cale); // trimitem imaginea găsită înapoi
      }
    };

    imgTest.onerror = function () {
      // dacă nu se găsește, trece mai departe la altă extensie
    };

    imgTest.src = cale;
  }
}
const idProdus = document.body.getAttribute("data-id");
let index = 1;

function actualizeazaImagine() {
  incarcaImagineFlex(idProdus, index, function (caleImagine) {
    document.getElementById("img-principala").src = caleImagine;
  });
}

document.getElementById("btn-next").onclick = function () {
  index++;
  actualizeazaImagine();
};

document.getElementById("btn-prev").onclick = function () {
  index--;
  if (index < 1) index = 1; // sau poți pune o limită superioară cunoscută
  actualizeazaImagine();
};

actualizeazaImagine(); // la încărcare
