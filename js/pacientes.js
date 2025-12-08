import { API_BASE_URL, checkLogin } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
    const medicoId = checkLogin();
    if (medicoId) {
        loadPacientes(medicoId);
    }
});

async function loadPacientes(medicoId) {
    const tableBody = document.getElementById('pacientesBody');
    tableBody.innerHTML = '<tr><td colspan="4">Cargando citas del doctor...</td></tr>';
    
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
            tableBody.innerHTML = '<tr><td colspan="4">No tiene pacientes asignados para citas próximas.</td></tr>';
            return;
        }

        // 2. Para cada cita, obtener paciente por ID
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
        tableBody.innerHTML = `<tr><td colspan="4" class="form-error">Error al cargar las citas: ${error.message}.</td></tr>`;
    }
}

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
}


