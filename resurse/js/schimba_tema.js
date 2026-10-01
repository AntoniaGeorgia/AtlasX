window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("tema-btn");
  const icon = document.getElementById("tema-icon");

  const temeDisponibile = ["default", "dark", "sunny", "ice"];
  let indexTema = 0;

  function setTheme(nouaTema) {
    
    temeDisponibile.forEach(t => t !== "default" && document.body.classList.remove(t));

    if (nouaTema === "default") {
      localStorage.removeItem("tema");
      icon.className = "fa fa-moon"; 
    } else {
      document.body.classList.add(nouaTema);
      localStorage.setItem("tema", nouaTema);

    
      if (nouaTema === "dark") {
        icon.className = "fa fa-sun";
      } else if (nouaTema === "sunny") {
        icon.className = "fa fa-cloud-sun";
      } else if (nouaTema === "ice") {
        icon.className = "fa fa-snowflake";
      }
    }
  }

  
  const temaSalvata = localStorage.getItem("tema") || "default";
  if (temeDisponibile.includes(temaSalvata)) {
    indexTema = temeDisponibile.indexOf(temaSalvata);
    setTheme(temaSalvata);
  }

  
  btn.addEventListener("click", () => {
    indexTema = (indexTema + 1) % temeDisponibile.length;
    setTheme(temeDisponibile[indexTema]);
  });
});
