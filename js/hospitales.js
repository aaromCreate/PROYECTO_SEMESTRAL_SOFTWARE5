document.addEventListener("DOMContentLoaded", () => {

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
 
  const medicamentosPorHospital = {
    "santo-tomas": [
      { nombre: "Losartán 50 mg", tipo: "Con receta", estado: "success" },
      { nombre: "Paracetamol 500 mg", tipo: "Venta libre", estado: "success" }
    ],
    "david": [
      { nombre: "Omeprazol 20 mg", tipo: "Venta libre", estado: "danger" },
      { nombre: "Amoxicilina 500 mg", tipo: "Con receta", estado: "warn" }
    ],
    "colon": [
      { nombre: "Metformina 850 mg", tipo: "Con receta", estado: "warn" },
      { nombre: "Ibuprofeno 400 mg", tipo: "Venta libre", estado: "success" }
    ],
    "anita-moreno": [
      { nombre: "Paracetamol 500 mg", tipo: "Venta libre", estado: "success" }
    ],
    "susana-jones": [
      { nombre: "Atorvastatina 20 mg", tipo: "Con receta", estado: "success" },
      { nombre: "Vitamina C 500 mg", tipo: "Venta libre", estado: "success" }
    ]
  };

  const hospitalList = document.querySelector("#hospitalList");
  const medBody = document.querySelector("#medHospitalBody");
  function mostrarMedicamentos(hospitalKey) {
    const meds = medicamentosPorHospital[hospitalKey];
    medBody.innerHTML = "";
    if (!meds || meds.length === 0) {
      medBody.innerHTML = `<tr><td colspan="3">No hay medicamentos registrados para este hospital.</td></tr>`;
      return;
    }
    meds.forEach(m => {
      const estadoBadge =
        m.estado === "success" ? `<span class="badge success">En stock</span>` :
        m.estado === "warn" ? `<span class="badge warn">Bajo stock</span>` :
        `<span class="badge danger">Agotado</span>`;
      medBody.innerHTML += `
        <tr>
          <td>${m.nombre}</td>
          <td>${m.tipo}</td>
          <td>${estadoBadge}</td>
        </tr>`;
    });
  }
  hospitalList.addEventListener("click", e => {
    const li = e.target.closest("li[data-hospital]");
    if (!li) return;
    const hospitalKey = li.dataset.hospital;
    mostrarMedicamentos(hospitalKey);
  });
});
