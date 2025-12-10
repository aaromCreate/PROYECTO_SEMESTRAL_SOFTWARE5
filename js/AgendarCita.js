const API_CITAS = "https://localhost:7137/api/Citas";
const API_PACIENTES = "https://localhost:7137/api/Pacientes";
const API_MEDICOS = "https://localhost:7137/api/Medicos";
const API_CLINICAS = "https://localhost:7137/api/Clinicas";


// Variables globales
let pacientes = [];
let medicos = [];

// Ejecutar al cargar el DOM para evitar errores si faltan elementos
document.addEventListener("DOMContentLoaded", () => {

    // ======================
    // Cargar pacientes (para autocompletar)
    // ======================
    fetch(API_PACIENTES)
        .then(res => res.json())
        .then(json => {
            pacientes = json.data;
            console.log("Pacientes cargados.");
        })
        .catch(err => console.error("Error pacientes:", err));

    // ======================
    // Autocompletar paciente logeado
    // ======================
    const pacienteIDLogeado = localStorage.getItem("pacienteId");

    if (pacienteIDLogeado) {
        const intervalo = setInterval(() => {
            if (pacientes.length > 0) {
                const p = pacientes.find(x => x.id == pacienteIDLogeado);

                if (p) {
                    const pacienteInput = document.getElementById("pacienteInput");

                    if (pacienteInput) {
                        pacienteInput.value = `${p.nombre} ${p.apellido}`;
                        pacienteSeleccionado = p.id;
                        pacienteInput.disabled = true;
                        console.log("Paciente autocompletado por login:", p);
                    }
                }
                clearInterval(intervalo);
            }
        }, 100);
    }

    // ======================
    // Cargar médicos (combobox)
    // ======================
    fetch(API_MEDICOS)
        .then(res => res.json())
        .then(lista => {
            medicos = lista;
            const select = document.getElementById("medicoId");
            if (!select) return;

            lista.forEach(m => {
                const opcion = document.createElement("option");
                opcion.value = m.id;
                opcion.textContent = `${m.nombre} ${m.apellido} - (${m.especialidad})`;
                select.appendChild(opcion);
            });

            console.log("Médicos cargados.");
        })
        .catch(err => console.error("Error médicos:", err));

    // ======================
    // Cargar clínicas
    // ======================
    fetch(API_CLINICAS)
        .then(res => res.json())
        .then(json => {
            const select = document.getElementById("clinicaId");
            if (!select) return;

            json.data.forEach(c => {
                const opcion = document.createElement("option");
                opcion.value = c.id;
                opcion.textContent = c.nombre;
                select.appendChild(opcion);
            });

            console.log("Clínicas cargadas.");
        })
        .catch(err => console.error("Error clínicas:", err));


    // ======================
    // Autocompletado de pacientes
    // ======================
    const pacienteInput = document.getElementById("pacienteInput");
    let pacienteSeleccionado = null;

    if (pacienteInput) {
        pacienteInput.addEventListener("input", () => {
            const texto = pacienteInput.value.toLowerCase();

            const encontrados = pacientes.filter(p =>
                `${p.nombre} ${p.apellido}`.toLowerCase().includes(texto)
            );

            mostrarSugerencias(encontrados);
        });
    } else {
        console.log("Aviso: #pacienteInput no existe en el HTML. Se omite autocompletado.");
    }

    function mostrarSugerencias(lista) {
        let box = document.getElementById("sugerenciasPacientes");
        if (box) box.remove();

        box = document.createElement("div");
        box.id = "sugerenciasPacientes";
        box.style.border = "1px solid #aaa";
        box.style.background = "white";
        box.style.position = "absolute";
        box.style.width = "300px";
        box.style.zIndex = "2000";

        lista.forEach(p => {
            let item = document.createElement("div");
            item.textContent = `${p.nombre} ${p.apellido}`;
            item.style.padding = "4px";
            item.style.cursor = "pointer";

            item.addEventListener("click", () => {
                if (!pacienteInput) return;
                pacienteInput.value = `${p.nombre} ${p.apellido}`;
                pacienteSeleccionado = p.id;
                box.remove();
            });

            box.appendChild(item);
        });

        if (pacienteInput && pacienteInput.parentElement) {
            pacienteInput.parentElement.appendChild(box);
        }
    }

    // ======================
    // Validar horario del médico
    // ======================
    function validarHorario(medicoId, fechaCita) {
        const medico = medicos.find(m => m.id == medicoId);
        if (!medico) return { valido: false, mensaje: "Médico no encontrado." };

        const entrada = medico.horaEntrada;
        const salida = medico.horaSalida;

        const horaUsuario = fechaCita.split("T")[1] + ":00";

        if (horaUsuario < entrada || horaUsuario > salida) {
            return {
                valido: false,
                mensaje: `El médico atiende entre ${entrada} y ${salida}.`
            };
        }
        return { valido: true };
    }

    // ==========================================================
    // NUEVO: FUNCION ANTISPAM — EVITAR CITAS DUPLICADAS
    // ==========================================================
    async function verificarConflictoCita(pacienteId, fechaCita) {
        try {
            const res = await fetch(`${API_CITAS}?pacienteId=${pacienteId}`);
            if (!res.ok) return false;

            const json = await res.json();
            const citas = json.data || json;

            const fechaNormal = fechaCita.replace(":00.000Z", "");

            return citas.some(c => c.fechaCita.startsWith(fechaNormal));
        }
        catch (err) {
            console.error("Error verificando conflicto:", err);
            return false;
        }
    }

    // ======================
    // Guardar cita
    // ======================
    const btnAgendar = document.getElementById("btnAgendar");
    if (btnAgendar) {
        btnAgendar.addEventListener("click", async (e) => {
            e.preventDefault();

            const medicoId = document.getElementById("medicoId")?.value;
            const clinicaId = document.getElementById("clinicaId")?.value;
            const fechaCita = document.getElementById("fechaCita")?.value;
            const motivo = document.getElementById("motivo")?.value || "";

            const resultado = document.getElementById("resultado");
            if (resultado) resultado.textContent = "";

            if (!pacienteSeleccionado) {
                if (resultado) resultado.textContent = "❌ Debes seleccionar un paciente de la lista.";
                return;
            }

            if (!fechaCita) {
                if (resultado) resultado.textContent = "❌ Debes elegir una fecha y hora.";
                return;
            }

            if (new Date(fechaCita) < new Date()) {
                if (resultado) resultado.textContent = "❌ La cita no puede ser en el pasado.";
                return;
            }

            const validar = validarHorario(medicoId, fechaCita);
            if (!validar.valido) {
                if (resultado) resultado.textContent = "❌ " + validar.mensaje;
                return;
            }

            // ==========================================================
            // NUEVO: Validación antibasura — evitar citas duplicadas
            // ==========================================================
            const hayConflicto = await verificarConflictoCita(pacienteSeleccionado, fechaCita);
            if (hayConflicto) {
                if (resultado) resultado.textContent = "❌ Ya existe una cita programada en esa fecha y hora.";
                return;
            }
            // ==========================================================

            const cita = {
                pacienteId: pacienteSeleccionado,
                medicoId: parseInt(medicoId),
                clinicaId: parseInt(clinicaId),
                fechaCita: fechaCita,
                motivo: motivo,
                estado: "programada"
            };

            try {
                const res = await fetch(API_CITAS, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(cita)
                });

                if (!res.ok) throw new Error("Error al guardar la cita");

                if (resultado) resultado.textContent = "✔️ Cita creada correctamente";
            }
            catch (err) {
                if (resultado) resultado.textContent = "❌ " + err.message;
            }

        });
    }

    // ======================
    // Logout
    // ======================
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    }

});
