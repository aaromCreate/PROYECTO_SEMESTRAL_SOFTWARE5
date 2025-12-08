document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  const filter = document.querySelector("#medFilter");
  const search = document.querySelector("#medSearch");
  const rows = document.querySelectorAll("#medBody tr");

  function applyFilters() {
    const type = filter.value;
    const term = search.value.trim().toLowerCase();
    rows.forEach(row => {
      const name = row.children[0].textContent.toLowerCase();
      const tipo = row.children[1].textContent.toLowerCase();
      const matchesType =
        type === "todos" ||
        (type === "receta" && tipo.includes("receta")) ||
        (type === "otc" && tipo.includes("venta libre"));
      const matchesSearch = !term || name.includes(term);
      row.style.display = matchesType && matchesSearch ? "" : "none";
    });
  }

  filter.addEventListener("change", applyFilters);
  search.addEventListener("input", applyFilters);
});
