export const API_BASE_URL = "https://localhost:7137/api/";

// FUNCIONES DE AUTENTICACIÓN Y SESIÓN

/**
 * Obtiene el ID del médico guardado en el almacenamiento local.
 * @returns {string | null} El ID del médico o null.
 */
export const getMedicoId = () => {
    return localStorage.getItem('medicoId');
};

export const getPacienteId = () => {
    return localStorage.getItem('pacienteId');
};

/**
 * Verifica si el usuario está logueado. Si no, redirige a la página de login.
 * @returns {string | null} El ID del médico si está logueado, o inicia la redirección.
 */
export const checkLogin = () => {
    const medicoId = getMedicoId();
    const pacienteId = getPacienteId();
    if (!medicoId) {
        if(!pacienteId){
        // Redirige al login si no hay ID guardado
        window.location.href = "index.html"; 
        return null;}
    }
    if (!pacienteId) {
        if(!medicoId){
        window.location.href = "index.html"; 
        return null;}
    }
    return medicoId;
};


export const logout = () => {
    localStorage.removeItem('medicoId');
    localStorage.removeItem('pacienteId')
    window.location.href = "index.html"; 
};

// INICIALIZACIÓN COMÚN (Se ejecuta al cargar cualquier página)
document.addEventListener("DOMContentLoaded", () => {
    const year = document.querySelector("#year");
    if (year) year.textContent = new Date().getFullYear();
    const links = document.querySelectorAll(".nav-link");
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

    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});