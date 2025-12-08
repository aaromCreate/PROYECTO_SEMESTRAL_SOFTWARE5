// js/api.js

/**
 * URL Base de la API de .NET Core.
 * IMPORTANTE: Asegúrate de que el puerto (ej: 7137) sea el mismo que usa tu API.
 */
export const API_BASE_URL = "http://localhost:5000/api/";

// ----------------------------------------------------------------------
// FUNCIONES DE AUTENTICACIÓN Y SESIÓN
// ----------------------------------------------------------------------

/**
 * Obtiene el ID del médico guardado en el almacenamiento local.
 * @returns {string | null} El ID del médico o null.
 */
export const getMedicoId = () => {
    return localStorage.getItem('medicoId');
};

/**
 * Verifica si el usuario está logueado. Si no, redirige a la página de login.
 * @returns {string | null} El ID del médico si está logueado, o inicia la redirección.
 */
export const checkLogin = () => {
    const medicoId = getMedicoId();
    if (!medicoId) {
        // Redirige al login si no hay ID guardado
        window.location.href = "index.html"; 
        return null; 
    }
    return medicoId;
};

/**
 * Cierra la sesión del usuario, elimina el ID del almacenamiento local 
 * y redirige a la página de login.
 */
export const logout = () => {
    localStorage.removeItem('medicoId');
    // Puedes limpiar otros datos si los tienes, como un token JWT:
    // localStorage.removeItem('authToken'); 
    
    // Redirige a la página de login
    window.location.href = "index.html"; 
};

// ----------------------------------------------------------------------
// INICIALIZACIÓN COMÚN (Se ejecuta al cargar cualquier página)
// ----------------------------------------------------------------------

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