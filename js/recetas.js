import { API_BASE_URL, checkLogin } from './api.js';

document.addEventListener("DOMContentLoaded", async () => {
    const medicoId = checkLogin();
    if (!medicoId) return;

    await cargarPacientes();
    await cargarClinicas();

    const med = JSON.parse(localStorage.getItem('medicamentoSeleccionado'));
    if (med) {
        document.getElementById('medNombre').value = med.nombre;
        document.getElementById('medNombre').dataset.medId = med.id;
    }

    // Cargar stock del medicamento
    if (med) {
        await cargarStock(med.id);
    }

    document.getElementById('generarReceta')
        .addEventListener('click', generarReceta);
});

/* =====================================================
    FUNCIÓN PARA OBTENER STOCK DESDE LA API
===================================================== */
async function getStock(medicamentoId, clinicaId) {
    const res = await fetch(`${API_BASE_URL}StockMedicamentos`);
    const data = await res.json();

    if (!data || !data.data) return null;

    return data.data.find(
        s => s.medicamentoId === medicamentoId && s.clinicaId === clinicaId
    ) || null;
}

/* =====================================================
    MOSTRAR STOCK + ETIQUETA EN FORMULARIO
===================================================== */
async function cargarStock(medicamentoId) {
    const clinicaSelect = document.getElementById('clinicaId');
    const cantidadInput = document.getElementById('cantidad');

    const actualizarStock = async (selectedClinicaId) => {
        if (!selectedClinicaId) return;

        const stock = await getStock(medicamentoId, selectedClinicaId);
        const disponible = stock ? stock.cantidad : 0;

        const badge = getStockBadge(disponible);
        document.getElementById("stockInfo").innerHTML =
            `<strong>Stock disponible:</strong> ${disponible} unidades ${badge}`;

        // Ajustar máximo del input de cantidad
        cantidadInput.max = disponible;
        if (parseInt(cantidadInput.value) > disponible) {
            cantidadInput.value = disponible > 0 ? disponible : 1;
        }

        // Deshabilitar botón si no hay stock
        const btn = document.getElementById("generarReceta");
        btn.disabled = disponible <= 0;
    };

    // Actualizar stock al cargar la página si ya hay clínica seleccionada
    if (clinicaSelect.value) {
        await actualizarStock(parseInt(clinicaSelect.value));
    }

    // Escuchar cambios en el select de clínica
    clinicaSelect.addEventListener("change", async () => {
        const selectedId = parseInt(clinicaSelect.value);
        await actualizarStock(selectedId);
    });

    // Escuchar cambios en input de cantidad para validar
    cantidadInput.addEventListener("input", () => {
        const max = parseInt(cantidadInput.max);
        if (parseInt(cantidadInput.value) > max) {
            cantidadInput.value = max;
            alert(`⚠️ La cantidad máxima disponible es ${max}`);
        } else if (parseInt(cantidadInput.value) < 1) {
            cantidadInput.value = 1;
        }
    });
}

/* =====================================================
    ETIQUETA DE STOCK
===================================================== */
function getStockBadge(cantidad) {
    let estado = "Agotado";
    let clase = "danger";

    if (cantidad > 100) {
        estado = "En stock";
        clase = "success";
    } else if (cantidad > 0) {
        estado = "Bajo stock";
        clase = "warn";
    }

    return `<span class="badge ${clase}">${estado}</span>`;
}

/* =====================================================
    DESCONTAR STOCK MEDICAMENTO
===================================================== */
async function descontarStock(medicamentoId, clinicaId, cantidadADescontar) {
    const stock = await getStock(medicamentoId, clinicaId);
    if (!stock) throw new Error("No se encontró stock para este medicamento.");

    const nuevoStock = stock.cantidad - cantidadADescontar;
    if (nuevoStock < 0) throw new Error("No hay suficiente stock disponible.");

    const stockActualizado = {
        id: stock.id,
        clinicaId: stock.clinicaId,
        medicamentoId: stock.medicamentoId,
        cantidad: nuevoStock
    };

    const res = await fetch(`${API_BASE_URL}StockMedicamentos/${stock.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockActualizado)
    });

    const respuesta = await res.json();
    if (respuesta.error) throw new Error(respuesta.mensaje);

    // Actualizar stock visible inmediatamente
    const badge = getStockBadge(nuevoStock);
    document.getElementById("stockInfo").innerHTML =
        `<strong>Stock disponible:</strong> ${nuevoStock} unidades ${badge}`;
    
    // Ajustar máximo del input de cantidad
    const cantidadInput = document.getElementById('cantidad');
    cantidadInput.max = nuevoStock;
    if (parseInt(cantidadInput.value) > nuevoStock) {
        cantidadInput.value = nuevoStock > 0 ? nuevoStock : 1;
    }

    // Deshabilitar botón si no hay stock
    const btn = document.getElementById("generarReceta");
    btn.disabled = nuevoStock <= 0;

    return respuesta;
}

/* =====================================================
    GENERAR RECETA + VALIDAR STOCK
===================================================== */
async function generarReceta() {
    const btn = document.getElementById('generarReceta');
    btn.disabled = true;
    btn.textContent = 'Generando...';

    try {
        const pacienteId = parseInt(document.getElementById('pacienteId').value);
        const clinicaId = parseInt(document.getElementById('clinicaId').value);
        const cantidad = parseInt(document.getElementById('cantidad').value);
        const medicamentoId = parseInt(document.getElementById('medNombre').dataset.medId);

        if (!pacienteId || !clinicaId || !cantidad || !medicamentoId) {
            throw new Error('Complete todos los campos');
        }

        // Verificar stock antes de enviar pedido
        const stock = await getStock(medicamentoId, clinicaId);
        const disponible = stock ? stock.cantidad : 0;
        if (cantidad > disponible) {
            throw new Error(`Solo hay ${disponible} unidades disponibles.`);
        }

        // Descontar stock y actualizar la interfaz inmediatamente
        await descontarStock(medicamentoId, clinicaId, cantidad);

        // Crear pedido
        const pedido = {
            pacienteId,
            clinicaId,
            medicamentoId,
            cantidad,
            fecha: new Date().toISOString()
        };

        const response = await fetch(`${API_BASE_URL}Pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
        });

        const data = await response.json();
        if (data.error) throw new Error(data.mensaje);

        mostrarComprobante(data.data);
        document.getElementById('imprimirBtn').style.display = 'inline-block';

    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '🩺 Generar Receta';
    }
}

/* =====================================================
    Cargar Pacientes
===================================================== */
async function cargarPacientes() {
    try {
        const res = await fetch(`${API_BASE_URL}Pacientes`);
        const data = await res.json();

        const select = document.getElementById('pacienteId');
        data.data.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nombre} ${p.apellido}`;
            select.appendChild(option);
        });
    } catch (err) {
        alert("❌ Error al cargar pacientes.");
    }
}

/* =====================================================
    Cargar Clínicas
===================================================== */
async function cargarClinicas() {
    try {
        const res = await fetch(`${API_BASE_URL}Clinicas`);
        const data = await res.json();

        const select = document.getElementById('clinicaId');
        data.data.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;
            select.appendChild(option);
        });
    } catch (err) {
        alert("❌ Error al cargar clínicas.");
    }
}

/* =====================================================
    Mostrar Comprobante
===================================================== */
function mostrarComprobante(pedido) {
    const nombreMed = document.getElementById('medNombre').value;

    // Obtener nombre del paciente y de la clínica desde los select
    const pacienteSelect = document.getElementById('pacienteId');
    const pacienteNombre = pacienteSelect.options[pacienteSelect.selectedIndex].text;

    const clinicaSelect = document.getElementById('clinicaId');
    const clinicaNombre = clinicaSelect.options[clinicaSelect.selectedIndex].text;

    document.getElementById('comprobanteContent').innerHTML = `
        <div class="comprobante">
            <h4>Receta Médica #${pedido.id}</h4>
            <p><strong>Medicamento:</strong> ${nombreMed}</p>
            <p><strong>Paciente:</strong> ${pacienteNombre}</p>
            <p><strong>Clínica:</strong> ${clinicaNombre}</p>
            <p><strong>Cantidad:</strong> ${pedido.cantidad}</p>
            <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString('es-PA')}</p>
        </div>
    `;

    document.getElementById('comprobante').style.display = 'block';
}
