// ======================
// Importaciones
// ======================
import { API_BASE_URL, checkLogin } from './api.js';

// ======================
// Evento principal
// ======================
document.addEventListener("DOMContentLoaded", () => {
    const medicoId = checkLogin();
    if (medicoId) {
        loadPacientes(medicoId);
    }
});

// ======================
// Cargar citas por doctor
// ======================
async function loadPacientes(medicoId) {
    const tableBody = document.getElementById('pacientesBody');
    tableBody.innerHTML = '<tr><td colspan="6">Cargando citas del doctor...</td></tr>';
    
    const urlCitas = `${API_BASE_URL}Citas?medicoId=${medicoId}`;
    
    try {
        // 1. Obtener citas (igual que antes)
        const responseCitas = await fetch(urlCitas);
        if (!responseCitas.ok) throw new Error(`Error HTTP: ${responseCitas.status}`);
        
        const responseData = await responseCitas.json();
        if (responseData.error) throw new Error(responseData.mensaje || 'Error del servidor');
        
        const citas = responseData.data || [];
        tableBody.innerHTML = '';
        
        if (citas.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No tiene pacientes asignados para citas próximas.</td></tr>';
            return;
        }

        // 2. Para cada cita, obtener paciente por ID (igual que antes)
        for (const cita of citas) {
            try {
                const pacienteData = await fetch(`${API_BASE_URL}Pacientes/${cita.pacienteId}`);
                const pacienteResponse = await pacienteData.json();
                
                if (pacienteResponse.error) {
                    throw new Error(pacienteResponse.mensaje || 'Error del paciente');
                }
                
                crearFilaTabla(tableBody, cita, pacienteResponse.data);
            } catch (error) {
                console.warn(`Paciente ${cita.pacienteId} no disponible:`, error);
                crearFilaTabla(tableBody, cita, null);
            }
        }

    } catch (error) {
        console.error("Error al obtener citas:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="form-error">Error al cargar las citas: ${error.message}.</td></tr>`;
    }
}

// ======================
// Crear fila en la tabla
// ======================
function crearFilaTabla(tableBody, cita, paciente) {
    const row = tableBody.insertRow();
    
    // Nombre completo
    const nombreCompleto = paciente 
        ? `${paciente.nombre || ''} ${paciente.apellido || ''}`.trim() || 'N/A'
        : 'Paciente no disponible';
    row.insertCell().textContent = nombreCompleto;
    
    // Fecha nacimiento
    let fechaNacimientoTexto = 'N/A';
    if (paciente?.fechaNacimiento) {
        const birthDate = new Date(paciente.fechaNacimiento);
        fechaNacimientoTexto = birthDate.toLocaleDateString('es-PA');
    }
    row.insertCell().textContent = fechaNacimientoTexto;
    
    // Motivo
    row.insertCell().textContent = cita.motivo || 'N/A';
    
    // Fecha cita (incluye hora)
    const appointmentDate = new Date(cita.fechaCita);
    row.insertCell().textContent = appointmentDate.toLocaleString('es-PA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    // Estado actual de la cita
    row.insertCell().textContent = cita.estado || "N/A";

    // ======================
    // Botón para completar cita
    // ======================
    const accionCell = row.insertCell();
    const btn = document.createElement("button");
    btn.textContent = "Completar";
    btn.classList.add("btn-completar");

    // Si ya está completa, desactivar el botón
    if (cita.estado?.toLowerCase() === "completa") {
        btn.disabled = true;
        btn.textContent = "Completada";
    }

    // Evento del botón
    btn.onclick = () => completarCita(cita, row);
    accionCell.appendChild(btn);
}

// ==============================
// Cambiar estado a "completa"
// ==============================
async function completarCita(cita, fila) {
    const confirmar = confirm("¿Marcar esta cita como COMPLETA?");
    if (!confirmar) return;

    try {
        // IMPORTANTE → La API exige TODOS los campos del modelo
        const citaCompleta = {
            id: cita.id,
            pacienteId: cita.pacienteId,
            medicoId: cita.medicoId,
            clinicaId: cita.clinicaId,
            fechaCita: cita.fechaCita,
            motivo: cita.motivo,
            estado: "completa"
        };

        const response = await fetch(`${API_BASE_URL}Citas/${cita.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(citaCompleta)
        });

        if (!response.ok) {
            const txt = await response.text();
            throw new Error(txt);
        }

        // Actualizar visualmente la fila sin recargar
        fila.cells[4].textContent = "completa";
        const btn = fila.cells[5].querySelector("button");
        btn.textContent = "Completada";
        btn.disabled = true;

        alert("La cita fue marcada como COMPLETA.");

    } catch (error) {
        console.error("Error actualizando cita:", error);
        alert("Error al completar la cita.");
    }
}
