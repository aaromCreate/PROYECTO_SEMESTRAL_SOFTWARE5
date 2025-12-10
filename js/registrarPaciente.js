document.addEventListener("DOMContentLoaded", () => {
    const API_PACIENTE = "https://localhost:7137/api/Pacientes";
    const year = document.querySelector("#year");
    if (year) year.textContent = new Date().getFullYear();

    const form = document.querySelector("#pacienteForm");
    const message = document.querySelector("#formMessage");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        message.textContent = "⏳ Registrando paciente...";
        message.style.color = "#facc15"; 

        const paciente = {
            id: 0,
            nombre: document.querySelector("#nombre").value.trim(),
            apellido: document.querySelector("#apellido").value.trim(),
            correo: document.querySelector("#correo").value.trim(),
            contrasena: document.querySelector("#contrasena").value.trim(),
            telefono: document.querySelector("#telefono").value.trim(),
            fechaNacimiento: new Date(document.querySelector("#fechaNacimiento").value).toISOString()
        };

        try {
            const response = await fetch(API_PACIENTE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paciente)
            });

            const result = await response.json();

            if (response.ok) {
                message.textContent = "✅ Paciente registrado correctamente";
                message.style.color = "#22c55e"; 
                form.reset();
            } else {
                message.textContent = `❌ Error: ${result.mensaje || "No se pudo registrar"}`;
                message.style.color = "#ef4444"; 
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            message.textContent = `❌ Error al conectar con el servidor: ${error.message}`;
            message.style.color = "#ef4444";
        }
    });
});
