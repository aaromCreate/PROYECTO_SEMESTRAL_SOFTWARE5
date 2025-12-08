// js/medicamentos.js

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
    tableBody.innerHTML = '<tr><td colspan="4">Cargando la lista global de medicamentos...</td></tr>';
    
    // NOTA: Asume que tienes un endpoint GET /api/Medicamentos
    const url = `${API_BASE_URL}Medicamentos`; 

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        allMedicamentos = await response.json();
        
        if (allMedicamentos.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4">No hay medicamentos registrados en el sistema.</td></tr>';
            return;
        }

        renderMedicamentos(allMedicamentos);

    } catch (error) {
        console.error("Error al obtener medicamentos:", error);
        tableBody.innerHTML = `<tr><td colspan="4" class="form-error">Error al cargar el inventario: ${error.message}</td></tr>`;
    }
}

function renderMedicamentos(meds) {
    tableBody.innerHTML = ''; 
    meds.forEach(m => {
        // NOTA: Asume campos en el objeto medicamento: nombre, tipo, disponibilidad (string: 'En stock', 'Bajo stock', 'Agotado'), hospital.nombre
        
        let estadoClass = '';
        if (m.disponibilidad === 'En stock') estadoClass = 'success';
        else if (m.disponibilidad === 'Bajo stock') estadoClass = 'warn';
        else estadoClass = 'danger';
        
        const estadoBadge = `<span class="badge ${estadoClass}">${m.disponibilidad}</span>`;
        
        tableBody.innerHTML += `
            <tr data-tipo="${m.tipo.toLowerCase()}">
                <td>${m.nombre}</td>
                <td>${m.tipo}</td>
                <td>${estadoBadge}</td>
                <td>${m.hospital ? m.hospital.nombre : 'Central'}</td>
            </tr>`;
    });
}

function applyFilters() {
    const type = filter.value;
    const term = search.value.trim().toLowerCase();
    
    const filteredMeds = allMedicamentos.filter(m => {
        const name = m.nombre.toLowerCase();
        const tipo = m.tipo.toLowerCase();
        
        const matchesType =
            type === "todos" ||
            (type === "receta" && tipo.includes("receta")) ||
            (type === "otc" && tipo.includes("venta libre"));
            
        const matchesSearch = !term || name.includes(term) || (m.principioActivo && m.principioActivo.toLowerCase().includes(term));
        
        return matchesType && matchesSearch;
    });

    renderMedicamentos(filteredMeds);
}