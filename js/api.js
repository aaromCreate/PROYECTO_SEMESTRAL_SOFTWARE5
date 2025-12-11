//api.js 
export const API_BASE_URL = "https://localhost:7137/api/";

export const getMedicoId = () => localStorage.getItem('medicoId');
export const getPacienteId = () => localStorage.getItem('pacienteId'); 

/**
 * checkLogin 
 */
export const checkLogin = () => {
    const medicoId = getMedicoId();
    const pacienteId = getPacienteId();
    
    if (!medicoId && !pacienteId) {
        window.location.href = "index.html";
        return null;
    }
    
    return medicoId || pacienteId; // Devuelve el que exista
};

export const logout = () => {
    localStorage.removeItem('medicoId');
    localStorage.removeItem('pacienteId'); 
    window.location.href = "index.html";
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Asigna el año actual al footer
    const year = document.querySelector("#year");
    if (year) year.textContent = new Date().getFullYear();
    
    // 2. Lógica para la activación del nav-link actual (Navegación)
    const links = document.querySelectorAll(".nav-link");
    // Obtenemos el nombre del archivo HTML actual (ej: credenciales.html)
    const currentPath = window.location.pathname.split('/').pop();

    links.forEach(link => {
        const linkPath = link.getAttribute('href');
        
        // Verifica si el link coincide con la página actual
        if (linkPath === currentPath) {
            // Asegura que solo el link actual esté activo
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
        }
    });

    // 3. Manejo del evento de click para el botón de LOGOUT
    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});