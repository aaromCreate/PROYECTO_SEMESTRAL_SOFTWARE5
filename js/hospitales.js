// js/hospitales.js

import { API_BASE_URL, checkLogin } from './api.js';

const hospitalList = document.querySelector("#hospitalList");
const medBody = document.querySelector("#medHospitalBody");

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
    loadHospitales();
    
    // Maneja el clic en la lista de hospitales (después de que se carguen)
    hospitalList.addEventListener("click", e => {
        const li = e.target.closest("li[data-hospital-id]");
        if (!li) return;
        const hospitalId = li.dataset.hospitalId;
        
        // Carga los medicamentos específicos para ese hospital
        loadMedicamentosPorHospital(hospitalId);
    });
});

async function loadHospitales() {
    // NOTA: Asume que tienes un endpoint GET /api/Hospitales
    const url = `${API_BASE_URL}Hospitales`; 
    hospitalList.innerHTML = `<li>Cargando hospitales...</li>`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const hospitales = await response.json();
        hospitalList.innerHTML = '';
        
        hospitales.forEach(h => {
            // Asume que el objeto hospital tiene id, nombre y ubicacion/ciudad
            hospitalList.innerHTML += `
                <li data-hospital-id="${h.id}">
                    <strong>${h.nombre}</strong> — ${h.ciudad || 'Ubicación Desconocida'}
                </li>`;
        });
        
    } catch (error) {
        console.error("Error al obtener hospitales:", error);
        hospitalList.innerHTML = `<li>Error al cargar la lista de hospitales.</li>`;
    }
}

async function loadMedicamentosPorHospital(hospitalId) {
    medBody.innerHTML = `<tr><td colspan="3">Cargando inventario del hospital ${hospitalId}...</td></tr>`;
    
    // NOTA: Asume que tienes un endpoint para inventario, ejemplo: /api/Inventario?hospitalId=X
    const url = `${API_BASE_URL}Inventario?hospitalId=${hospitalId}`; 
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const inventario = await response.json();
        medBody.innerHTML = "";
        
        if (inventario.length === 0) {
            medBody.innerHTML = `<tr><td colspan="3">No hay inventario registrado para este hospital.</td></tr>`;
            return;
        }

        inventario.forEach(item => {
            // Asume que el objeto item tiene: medicamento.nombre, medicamento.tipo, item.stock
            const stock = item.stock || 0;
            let disponibilidad = 'Agotado';
            let estadoClass = 'danger';

            if (stock > 100) {
                disponibilidad = 'En stock';
                estadoClass = 'success';
            } else if (stock > 0) {
                disponibilidad = 'Bajo stock';
                estadoClass = 'warn';
            }
            
            const estadoBadge = `<span class="badge ${estadoClass}">${disponibilidad} (${stock})</span>`;
            
            medBody.innerHTML += `
                <tr>
                    <td>${item.medicamento.nombre}</td>
                    <td>${item.medicamento.tipo}</td>
                    <td>${estadoBadge}</td>
                </tr>`;
        });

    } catch (error) {
        console.error("Error al obtener inventario del hospital:", error);
        medBody.innerHTML = `<tr><td colspan="3" class="form-error">Error al cargar el inventario.</td></tr>`;
    }
}