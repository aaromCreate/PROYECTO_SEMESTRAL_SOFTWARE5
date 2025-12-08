// js/credenciales.js

// Importamos la URL base y la función de verificación de login
import { API_BASE_URL, checkLogin } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificar si el usuario está logueado y obtener su ID
    const medicoId = checkLogin();
    
    if (medicoId) {
        // 2. Si hay un ID, cargar los datos del médico
        loadMedicoData(medicoId);
    }
    // Nota: Si checkLogin falla, redirige a index.html, por eso no necesitamos un 'else'.
});

async function loadMedicoData(id) {
    // URL esperada: https://localhost:7137/api/Medicos/{id}
    const url = `${API_BASE_URL}Medicos/${id}`; 
    
    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Maneja respuestas HTTP no exitosas (ej: 404 Not Found, 500 Server Error)
            throw new Error(`Error al cargar los datos del médico: ${response.status} ${response.statusText}`);
        }
        
        const medico = await response.json();
        
        // 3. Renderizar los datos en el HTML
        
        // Asume que la API devuelve los campos: nombre, apellido, id, especialidad, correo, telefono
        
        document.getElementById('medico-nombre').textContent = `Dr(a). ${medico.nombre} ${medico.apellido || ''}`;
        document.getElementById('medico-id').textContent = medico.id || 'N/A';
        document.getElementById('medico-especialidad').textContent = medico.especialidad || 'No asignada';
        document.getElementById('medico-correo').textContent = medico.correo || 'N/A';
        document.getElementById('medico-telefono').textContent = medico.telefono || 'N/A';

    } catch (err) {
        console.error("Error fetching medico data:", err);
        const detailsContainer = document.getElementById('medicoDetails');
        if (detailsContainer) {
            detailsContainer.innerHTML = `<li><strong style="color: #ef4444;">Error:</strong> No se pudo cargar la información del perfil. Por favor, asegúrate de que el endpoint ${url} esté funcionando correctamente.</li>`;
        }
    }
}



const API_PACIENTE = "http://localhost:5000/api/Pacientes";

document.addEventListener("DOMContentLoaded", async () => {
    const year = document.querySelector("#year");
    if (year) year.textContent = new Date().getFullYear();

    const pacienteId = localStorage.getItem("medicoId"); // si guardaste pacienteId, usa ese
    if (!pacienteId) return console.error("No se encontró el ID del paciente en localStorage");

    const nombreEl = document.getElementById("paciente-nombre");
    const idEl = document.getElementById("paciente-id");
    const nacimientoEl = document.getElementById("nacimiento");
    const correoEl = document.getElementById("paciente-correo");
    const telefonoEl = document.getElementById("paciente-telefono");

    try {
        const res = await fetch(API_PACIENTE);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const json = await res.json();

        // Obtener array de pacientes
        const pacientes = json.data || [];

        // Buscar paciente por ID
        const paciente = pacientes.find(p => String(p.id) === String(pacienteId));
        if (!paciente) throw new Error("Paciente no encontrado");

        // Mostrar datos
        nombreEl.textContent = paciente.nombre + " " + (paciente.apellido || "");
        idEl.textContent = paciente.id;
        nacimientoEl.textContent = paciente.fechaNacimiento 
            ? new Date(paciente.fechaNacimiento).toLocaleDateString() 
            : "No disponible";
        correoEl.textContent = paciente.correo;
        telefonoEl.textContent = paciente.telefono || "No disponible";

        console.log(paciente);

    } catch (error) {
        console.error("Error al obtener datos del paciente:", error);
        nombreEl.textContent = "Error al cargar";
        idEl.textContent = "-";
        nacimientoEl.textContent = "-";
        correoEl.textContent = "-";
        telefonoEl.textContent = "-";
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("medicoId"); // o pacienteId
        window.location.href = "index.html";
    });
});

