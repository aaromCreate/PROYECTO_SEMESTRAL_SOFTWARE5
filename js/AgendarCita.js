// ======================
// APIs
// ======================
const API_CITAS = "http://localhost:5000/api/Citas";
const API_PACIENTES = "http://localhost:5000/api/Pacientes";
const API_MEDICOS = "http://localhost:5000/api/Medicos";
const API_CLINICAS = "http://localhost:5000/api/Clinicas";

// ======================
// Variables globales
// ======================
let pacientes = [];
let medicos = [];

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
// Cargar médicos (combobox)
// ======================
fetch(API_MEDICOS)
    .then(res => res.json())
    .then(lista => {
        medicos = lista;
        const select = document.getElementById("medicoId");

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

pacienteInput.addEventListener("input", () => {
    const texto = pacienteInput.value.toLowerCase();

    const encontrados = pacientes.filter(p =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(texto)
    );

    mostrarSugerencias(encontrados);
});

function mostrarSugerencias(lista) {
    // Eliminar sugerencias anteriores
    let box = document.getElementById("sugerenciasPacientes");
    if (box) box.remove();

    // Caja nueva
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
            pacienteInput.value = `${p.nombre} ${p.apellido}`;
            pacienteSeleccionado = p.id;
            box.remove();
        });

        box.appendChild(item);
    });

    pacienteInput.parentElement.appendChild(box);
}


// ======================
// Validar horario del médico
// ======================
function validarHorario(medicoId, fechaCita) {
    const medico = medicos.find(m => m.id == medicoId);
    if (!medico) return { valido: false, mensaje: "Médico no encontrado." };

    const entrada = medico.horaEntrada; // "08:00:00"
    const salida = medico.horaSalida;   // "16:00:00"

    const horaUsuario = fechaCita.split("T")[1] + ":00"; // "08:45:00"

    if (horaUsuario < entrada || horaUsuario > salida) {
        return {
            valido: false,
            mensaje: `El médico atiende entre ${entrada} y ${salida}.`
        };
    }

    return { valido: true };
}


// ======================
// Guardar cita
// ======================
document.getElementById("btnAgendar").addEventListener("click", async (e) => {
    e.preventDefault(); // importante para que no recargue la página

    const medicoId = document.getElementById("medicoId").value;
    const clinicaId = document.getElementById("clinicaId").value;
    const fechaCita = document.getElementById("fechaCita").value;
    const motivo = document.getElementById("motivo").value;

    const resultado = document.getElementById("resultado");
    resultado.textContent = "";

    if (!pacienteSeleccionado) {
        resultado.textContent = "❌ Debes seleccionar un paciente de la lista.";
        return;
    }

    if (!fechaCita) {
        resultado.textContent = "❌ Debes elegir una fecha y hora.";
        return;
    }

    // Validar fecha futura
    if (new Date(fechaCita) < new Date()) {
        resultado.textContent = "❌ La cita no puede ser en el pasado.";
        return;
    }

    // Validación de horario del médico
    const validar = validarHorario(medicoId, fechaCita);
    if (!validar.valido) {
        resultado.textContent = "❌ " + validar.mensaje;
        return;
    }

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

        resultado.textContent = "✔️ Cita creada correctamente";
    }
    catch (err) {
        resultado.textContent = "❌ " + err.message;
    }
});
