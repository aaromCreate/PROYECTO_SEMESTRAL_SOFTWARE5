document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://localhost:7137/api/Medicos";
    
    // Obtener elementos del DOM
    const year = document.querySelector("#year");
    const form = document.querySelector("#loginForm");
    const idInput = document.querySelector("#idMedico");
    const pwdInput = document.querySelector("#password");
    const errorDisplay = document.querySelector("#loginError");
    const submitButton = form.querySelector("button[type='submit']");

    // Asignar año actual al footer
    if (year) year.textContent = new Date().getFullYear();

    // Función para manejar el estado del formulario (deshabilitar/habilitar)
    const setFormState = (enabled, message = "") => {
        submitButton.disabled = !enabled;
        idInput.disabled = !enabled;
        pwdInput.disabled = !enabled;
        errorDisplay.textContent = message;
        errorDisplay.style.display = message ? 'block' : 'none';
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        setFormState(false, "Iniciando sesión...");

        const correo = idInput.value.trim();
        const contrasena = pwdInput.value.trim();

        if (!correo || !contrasena) {
            setFormState(true, "Completa todos los campos (Correo y Contraseña).");
            return;
        }

        try {
            // 1. Obtener la lista de médicos
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} (${response.statusText})`);
            }

            const medicos = await response.json();
            
            // 2. Buscar al médico que coincide con las credenciales
            // NOTA: Usamos 'correo' para el campo 'idMedico' ya que es lo más lógico para login
            const medicoLogueado = medicos.find(m => 
                m.correo === correo && m.contrasena === contrasena
            );

            if (medicoLogueado) {
                // Login exitoso
                setFormState(true, `Bienvenido, Dr(a). ${medicoLogueado.nombre} ${medicoLogueado.apellido}. Redirigiendo...`);
                errorDisplay.style.color = '#86efac'; // Color verde claro

                // 3. Almacenar el ID del médico para usarlo en otras páginas
                localStorage.setItem('medicoId', medicoLogueado.id || medicoLogueado.Id);
                
                // Redirigir a la página principal de la aplicación (que sería la de citas)
                setTimeout(() => {
                    window.location.href = "credenciales.html"; 
                }, 1000); 

            } else {
                // Credenciales incorrectas
                setFormState(true, "Credenciales incorrectas. Verifica tu correo/ID y contraseña.");
                errorDisplay.style.color = '#fecaca'; // Color rojo
            }

        } catch (error) {
            console.error('Error de conexión o API:', error);
            setFormState(true, `Error al conectar con el servidor: ${error.message}. Asegúrate de que la API esté corriendo en ${API_URL}`);
            errorDisplay.style.color = '#fecaca'; // Color rojo
        }
    });
});