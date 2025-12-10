import { API_BASE_URL, checkLogin } from './api.js';

let allMedicamentos = [];
const tableBody = document.getElementById('medBody');
const filter = document.querySelector("#medFilter");
const search = document.querySelector("#medSearch");

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
    loadAllMedicamentos();

    filter.addEventListener("change", applyFilters);
    search.addEventListener("input", applyFilters);
});

async function loadAllMedicamentos() {
    tableBody.innerHTML = '<tr><td colspan="5">Cargando inventario...</td></tr>';
    
    try {
        const response = await fetch(`${API_BASE_URL}Medicamentos`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        allMedicamentos = data.data || [];
        
        if (allMedicamentos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No hay medicamentos disponibles.</td></tr>';
            return;
        }
        
        renderMedicamentos(allMedicamentos);
    } catch (error) {
        console.error("Error:", error);
        tableBody.innerHTML = `<tr><td colspan="5" class="form-error">Error: ${error.message}</td></tr>`;
    }
}

function renderMedicamentos(meds) {
    tableBody.innerHTML = '';
    meds.forEach(m => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${m.nombre}</td>
            <td>${m.tipo}</td>
            <td>${m.precio ? '$' + m.precio.toFixed(2) : 'N/A'}</td>
            <td>${m.descripcion || 'N/A'}</td>
            <td>
                <button class="btn primary btn-small recetar-btn" 
                        data-id="${m.id}" 
                        data-nombre="${m.nombre}"
                        data-tipo="${m.tipo}"
                        data-precio="${m.precio || 0}">
                    📋 Recetar
                </button>
            </td>
        `;
    });
    
    // Event listeners para botones recetar
    document.querySelectorAll('.recetar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const med = {
                id: parseInt(e.target.dataset.id),
                nombre: e.target.dataset.nombre,
                tipo: e.target.dataset.tipo,
                precio: parseFloat(e.target.dataset.precio)
            };
            localStorage.setItem('medicamentoSeleccionado', JSON.stringify(med));
            window.location.href = 'recetas.html';
        });
    });
}

function applyFilters() {
    const type = filter.value;
    const term = search.value.trim().toLowerCase();
    
    const filtered = allMedicamentos.filter(m => {
        const matchesType = type === "todos" || 
            (type === "receta" && m.tipo.toLowerCase().includes("receta")) ||
            (type === "otc" && m.tipo.toLowerCase().includes("venta libre"));
        const matchesSearch = !term || m.nombre.toLowerCase().includes(term);
        return matchesType && matchesSearch;
    });
    
    renderMedicamentos(filtered);
}
