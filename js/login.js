document.addEventListener("DOMContentLoaded", () => {
    const API_MEDICO = "https://localhost:7137/api/Medicos";
    const API_PACIENTE = "https://localhost:7137/api/Pacientes";

    // Obtener elementos del DOM
    const year = document.querySelector("#year");
    const form = document.querySelector("#loginForm");
    const idInput = document.querySelector("#idMedico");
    const pwdInput = document.querySelector("#password");
    const errorDisplay = document.querySelector("#loginError");
    const submitButton = form.querySelector("button[type='submit']");

    // Asignar año actual al footer
    if (year) year.textContent = new Date().getFullYear();

    // Función para habilitar/deshabilitar el formulario y mostrar mensaje
    const setFormState = (enabled, message = "", color = "#fecaca") => {
        submitButton.disabled = !enabled;
        idInput.disabled = !enabled;
        pwdInput.disabled = !enabled;
        errorDisplay.textContent = message;
        errorDisplay.style.color = color;
        errorDisplay.style.display = message ? "block" : "none";
    };

    // Función para validar login en una lista de usuarios
    const findUser = (lista, correo, contrasena) =>
        lista.find(u => u.correo === correo && u.contrasena === contrasena);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        setFormState(false, "Iniciando sesión...", "#facc15"); // amarillo claro

        const correo = idInput.value.trim();
        const contrasena = pwdInput.value.trim();

        if (!correo || !contrasena) {
            setFormState(true, "Completa todos los campos (Correo y Contraseña).");
            return;
        }

        try {
            // Obtener listas de médicos y pacientes simultáneamente
            const [resMedico, resPaciente] = await Promise.all([
                fetch(API_MEDICO),
                fetch(API_PACIENTE)
            ]);

            if (!resMedico.ok || !resPaciente.ok) {
                throw new Error(`Error HTTP: ${resMedico.status}/${resPaciente.status}`);
            }

            // Convertir respuesta a JSON
            const medicosJSON = await resMedico.json();
            const pacientesJSON = await resPaciente.json();

            // Asegurarnos que sean arrays
            const medicos = Array.isArray(medicosJSON) ? medicosJSON : medicosJSON.data || [];
            const pacientes = Array.isArray(pacientesJSON) ? pacientesJSON : pacientesJSON.data || [];

            // Buscar usuario en cada lista
            const medicoLogueado = findUser(medicos, correo, contrasena);
            const pacienteLogueado = findUser(pacientes, correo, contrasena);

            if (medicoLogueado) {
                setFormState(
                    true,
                    `Bienvenido, Dr(a). ${medicoLogueado.nombre} ${medicoLogueado.apellido}. Redirigiendo...`,
                    "#86efac"
                );
                localStorage.setItem("medicoId", medicoLogueado.id || medicoLogueado.Id);

                setTimeout(() => {
                    window.location.href = "credencialesM.html";
                }, 1000);

            } else if (pacienteLogueado) {
                setFormState(
                    true,
                    `Bienvenido, ${pacienteLogueado.nombre} ${pacienteLogueado.apellido}. Redirigiendo...`,
                    "#86efac"
                );
                localStorage.setItem("pacienteId", pacienteLogueado.id || pacienteLogueado.Id);

                setTimeout(() => {
                    window.location.href = "credencialesP.html";
                }, 1000);

            } else {
                setFormState(true, "Credenciales incorrectas. Verifica tu correo/ID y contraseña.");
            }

        } catch (error) {
            console.error("Error de conexión o API:", error);
            setFormState(
                true,
                `Error al conectar con el servidor: ${error.message}. Asegúrate de que las APIs estén corriendo en ${API_MEDICO} y ${API_PACIENTE}`
            );
        }
    });
});
