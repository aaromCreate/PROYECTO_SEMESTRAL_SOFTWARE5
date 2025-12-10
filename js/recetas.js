import { API_BASE_URL, checkLogin } from './api.js';

document.addEventListener("DOMContentLoaded", () => {
    const medicoId = checkLogin();
    if (!medicoId) return;
    
    const med = JSON.parse(localStorage.getItem('medicamentoSeleccionado'));
    if (med) {
        document.getElementById('medNombre').value = med.nombre;
        document.getElementById('medNombre').dataset.medId = med.id;
    }
    
    document.getElementById('generarReceta').addEventListener('click', generarReceta);
});

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
        
        // Mostrar comprobante
        mostrarComprobante(data.data);
        document.getElementById('imprimirBtn').style.display = 'inline-block';
        
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '🩺 Generar Receta';
    }
}

function mostrarComprobante(pedido) {
    const nombreMed = document.getElementById('medNombre').value;
    document.getElementById('comprobanteContent').innerHTML = `
        <div class="comprobante">
            <h4>Receta Médica #${pedido.id}</h4>
            <p><strong>Medicamento:</strong> ${nombreMed}</p>
            <p><strong>Paciente ID:</strong> ${pedido.pacienteId}</p>
            <p><strong>Cantidad:</strong> ${pedido.cantidad}</p>
            <p><strong>Clínica ID:</strong> ${pedido.clinicaId}</p>
            <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString('es-PA')}</p>
        </div>
    `;
    document.getElementById('comprobante').style.display = 'block';
}
