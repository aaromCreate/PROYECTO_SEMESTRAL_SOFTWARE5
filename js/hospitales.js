import { API_BASE_URL, checkLogin } from './api.js';

const hospitalList = document.querySelector("#hospitalList");
const medBody = document.querySelector("#medHospitalBody");

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
    loadHospitales();

    hospitalList.addEventListener("click", e => {
        const li = e.target.closest("li[data-clinica-id]");
        if (!li) return;

        const clinicaId = li.dataset.clinicaId;

        // Resaltar clínica seleccionada
        document.querySelectorAll('.hospital-item').forEach(item => item.classList.remove('active'));
        li.classList.add('active');

        loadMedicamentosPorClinica(clinicaId);
    });
});

async function loadHospitales() {
    hospitalList.innerHTML = `<li>Cargando clínicas...</li>`;

    try {
        const response = await fetch(`${API_BASE_URL}Clinicas`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const clinicas = data.data || [];

        hospitalList.innerHTML = '';

        if (clinicas.length === 0) {
            hospitalList.innerHTML = '<li>No hay clínicas registradas.</li>';
            return;
        }

        clinicas.forEach(c => {
            hospitalList.innerHTML += `
                <li data-clinica-id="${c.id}" class="hospital-item">
                    <strong>${c.nombre}</strong><br>
                    <small>${c.direccion} | ${c.telefono}</small>
                </li>`;
        });
    } catch (error) {
        console.error("Error al cargar clínicas:", error);
        hospitalList.innerHTML = `<li class="form-error">Error al cargar clínicas: ${error.message}</li>`;
    }
}

async function loadMedicamentosPorClinica(clinicaId) {
    medBody.innerHTML = `<tr><td colspan="3">Cargando inventario de la clínica ${clinicaId}...</td></tr>`;

    try {
        // 1. Traer solo el stock de esa clínica (ya filtra en el controlador)
        const response = await fetch(`${API_BASE_URL}StockMedicamentos?clinicaId=${clinicaId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const stocks = data.data || [];

        if (stocks.length === 0) {
            medBody.innerHTML = `<tr><td colspan="3">No hay medicamentos registrados en esta clínica.</td></tr>`;
            document.querySelector("#medicamentosHospital h3").textContent =
                `Inventario Clínica ID ${clinicaId} (0 items)`;
            return;
        }

        // 2. Cargar datos de medicamentos y cachearlos por ID
        const medicamentos = {};
        for (const stock of stocks) {
            const medId = stock.medicamentoId;
            if (!medicamentos[medId]) {
                try {
                    const medResp = await fetch(`${API_BASE_URL}Medicamentos/${medId}`);
                    const medData = await medResp.json();
                    if (!medData.error) {
                        medicamentos[medId] = medData.data;
                    }
                } catch (e) {
                    console.warn('No se pudo cargar medicamento', medId, e);
                }
            }
        }

        // 3. agrupar por medicamentoId para no repetir filas
        const stockPorMed = {};
        for (const stock of stocks) {
            const medId = stock.medicamentoId;
            if (!stockPorMed[medId]) {
                stockPorMed[medId] = 0;
            }
            stockPorMed[medId] += stock.cantidad || 0;
        }

        // 4. Pintar tabla
        medBody.innerHTML = '';

        Object.keys(stockPorMed).forEach(medId => {
            const med = medicamentos[medId] || { nombre: `Med. ID ${medId}`, tipo: 'N/A' };
            const cantidad = stockPorMed[medId];

            let estado = 'Agotado';
            let clase = 'danger';
            if (cantidad > 100) {
                estado = 'En stock';
                clase = 'success';
            } else if (cantidad > 0) {
                estado = 'Bajo stock';
                clase = 'warn';
            }

            const row = medBody.insertRow();
            row.innerHTML = `
                <td>${med.nombre}</td>
                <td>${med.tipo}</td>
                <td><span class="badge ${clase}">${estado} (${cantidad})</span></td>
            `;
        });

        document.querySelector("#medicamentosHospital h3").textContent =
            `Inventario Clínica ID ${clinicaId} (${Object.keys(stockPorMed).length} items)`;
    } catch (error) {
        console.error("Error al cargar inventario:", error);
        medBody.innerHTML = `<tr><td colspan="3" class="form-error">Error al cargar inventario: ${error.message}</td></tr>`;
    }
}
