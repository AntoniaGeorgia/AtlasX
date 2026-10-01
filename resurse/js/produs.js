window.onload = function () {
  const idProdus = document.body.getAttribute("data-id");
  const container = document.getElementById("carousel-inner");
  const extensii = [".jpg", ".jpeg", ".png", ".webp"];
  const maxImagini = 10;

  for (let i = 1; i <= maxImagini; i++) {
    let gasita = false;

    for (let ext of extensii) {
      const cale = `/resurse/imagini/produse/${idProdus}/${i}${ext}`;
      const img = new Image();
      img.onload = function () {
        if (!gasita) {
          gasita = true;
          const div = document.createElement("div");
          div.className = "carousel-item";
          const imgEl = document.createElement("img");
          imgEl.className = "d-block w-100 rounded";
          imgEl.src = cale;
          div.appendChild(imgEl);
          container.appendChild(div);
        }
      };
      img.onerror = () => {};
      img.src = cale;
    }
  }
};
