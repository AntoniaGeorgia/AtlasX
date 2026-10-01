fetch("/resurse/json/oferte.json")
  .then(r => r.json())
  .then(data => {
    if (!data.oferte || data.oferte.length === 0) {
      document.getElementById("banner-oferta").style.display = "none";
      return;
    }

    const oferta = data.oferte[0];
    if (!oferta || !oferta["data-finalizare"] || !oferta.reducere || !oferta.categorie) {
      document.getElementById("banner-oferta").style.display = "none";
      return;
    }

    const tFinal = new Date(oferta["data-finalizare"]).getTime();
    document.getElementById("oferta-categorie").textContent = oferta.categorie;
    document.getElementById("oferta-reducere").textContent = oferta.reducere;

    function updateTimer() {
      const dif = tFinal - Date.now();
      if (dif <= 0) {
    document.getElementById("banner-oferta").style.display = "none";
    return;
}


      const sec = Math.floor((dif / 1000) % 60).toString().padStart(2, "0");
      const min = Math.floor((dif / (1000 * 60)) % 60).toString().padStart(2, "0");
      const h = Math.floor(dif / (1000 * 60 * 60)).toString().padStart(2, "0");

      const timer = document.getElementById("timer");
      timer.textContent = `${h}:${min}:${sec}`;

      // Ultimele 10 secunde
      if (dif < 10000) {
        timer.style.color = "red";
        timer.style.fontWeight = "bold";
      } else {
        timer.style.color = "";
        timer.style.fontWeight = "";
      }
    }

    setInterval(updateTimer, 1000);
    updateTimer();
  })
  .catch(err => {
    console.error("Eroare la citirea ofertei:", err);
    document.getElementById("banner-oferta").style.display = "none";
  });
