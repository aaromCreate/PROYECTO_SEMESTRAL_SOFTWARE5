// MisCitas.js 
document.addEventListener('DOMContentLoaded', function() {
    
    console.log('MisCitas.js cargado correctamente');
    
    // Elementos del DOM
    const nombrePacienteSpan = document.getElementById('nombrePaciente');
    const listaCitas = document.getElementById('listaCitas');
    const mensajeVacio = document.getElementById('mensajeVacio');
    const filtroEstado = document.getElementById('filtroEstado');
    const yearSpan = document.getElementById('year');
    const logoutBtn = document.getElementById('logoutBtn');

    yearSpan.textContent = new Date().getFullYear();

    // pacienteId dinámico desde storage
    let pacienteId = parseInt(localStorage.getItem('pacienteId') || sessionStorage.getItem('pacienteId'));
    
    // Fallback si no hay ID válido
    if (!pacienteId || isNaN(pacienteId)) {
        pacienteId = 1;
        console.log('No se encontró pacienteId válido, usando ID 1');
    }
    
    console.log('Paciente ID cargado:', pacienteId);
    
    let todasLasCitas = [];
    let nombrePaciente = 'Cargando...';
    let medicos = {};
    let clinicas = {};

    //CARGAR MÉDICOS
    async function cargarMedicos() {
        try {
            const response = await fetch(`https://localhost:7137/api/Medicos`);
            if (!response.ok) throw new Error('Error médicos');
            
            const apiResponse = await response.json();
            const listaMedicos = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse;
            
            listaMedicos.forEach(medico => {
                medicos[medico.id] = `${medico.nombre} ${medico.apellido || ''}`.trim();
            });
            console.log('Médicos cargados:', medicos);
        } catch (error) {
            console.error('Error médicos:', error);
        }
    }

    //CARGAR CLÍNICAS
    async function cargarClinicas() {
        try {
            const response = await fetch(`https://localhost:7137/api/Clinicas`);
            if (!response.ok) throw new Error('Error clínicas');
            
            const apiResponse = await response.json();
            const listaClinicas = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse;
            
            listaClinicas.forEach(clinica => {
                clinicas[clinica.id] = clinica.nombre || `Clínica ${clinica.id}`;
            });
            console.log('Clínicas cargadas:', clinicas);
        } catch (error) {
            console.error('Error clínicas:', error);
        }
    }

    //Carga nombre del paciente usando ID
    async function cargarNombrePaciente() {
        try {
            const response = await fetch(`https://localhost:7137/api/Pacientes`);
            if (!response.ok) throw new Error('Error pacientes');
            
            const apiResponse = await response.json();
            const pacientes = Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse;
            
            if (Array.isArray(pacientes)) {
                const paciente = pacientes.find(p => Number(p.id) === pacienteId);
                if (paciente) {
                    nombrePaciente = `${paciente.nombre} ${paciente.apellido}`.trim();
                    nombrePacienteSpan.textContent = nombrePaciente;
                    console.log('Paciente encontrado:', nombrePaciente, '(ID:', pacienteId, ')');
                } else {
                    nombrePacienteSpan.textContent = `Paciente ID: ${pacienteId}`;
                }
            }
        } catch (error) {
            console.error('Error paciente:', error);
            nombrePacienteSpan.textContent = `Paciente ID: ${pacienteId}`;
        }
    }

    //Carga citas del Paciente con el mismo ID
    async function cargarCitasPaciente() {
        try {
            const response = await fetch(`https://localhost:7137/api/Citas?pacienteId=${pacienteId}`);
            if (!response.ok) throw new Error('Error citas');
            
            const apiResponse = await response.json();
            todasLasCitas = apiResponse.data || [];
            todasLasCitas = todasLasCitas.filter(cita => Number(cita.pacienteId) === pacienteId);
            
            console.log('Citas del paciente ID', pacienteId, ':', todasLasCitas.length, 'citas');
            renderizarCitas(todasLasCitas);
            
        } catch (error) {
            console.error('Error citas:', error);
            mostrarMensaje('Error de conexión', 'error');
        }
    }

    //SUPERCARGAR TODO CON Promise.all
    async function inicializar() {
        console.log('Cargando datos para paciente ID:', pacienteId);
        
        await Promise.all([
            cargarNombrePaciente(),
            cargarMedicos(),
            cargarClinicas()
        ]);
        
        await cargarCitasPaciente();
        console.log('Todo cargado para paciente ID:', pacienteId);
    }

    //renderizarCitas y darle estilos
    function renderizarCitas(citas) {
        console.log('Renderizando:', citas.length, 'citas');
        
        if (citas.length === 0) {
            listaCitas.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>📭 ${nombrePaciente} no tiene citas agendadas</p>
                </div>
            `;
            return;
        }

        listaCitas.innerHTML = citas.map(cita => `
            <div style="border: 1px solid var(--border); box-shadow: var(--shadow); border-radius: var(--radius); margin: 15px 0; padding: 20px; background: #0f1a35">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0; color: #ffffffff;">${formatearFecha(cita.fechaCita)}</h4>
                    <span style="padding: 6px 12px; border-radius: 20px; 
                        background: ${cita.estado === 'programada' ? '#e3f2fd' : '#e8f5e8'};
                        color: ${cita.estado === 'programada' ? '#1976d2' : '#2e7d32'};
                        font-weight: bold;">
                        ${capitalizar(cita.estado)}
                    </span>
                </div>
                <div style="line-height: 1.6;">
                    <p><strong>🆔 ID:</strong> <code>#${cita.id}</code></p>
                    <p><strong>👨‍⚕️ Médico:</strong> ${medicos[cita.medicoId] || `ID ${cita.medicoId}`}</p>
                    <p><strong>🏥 Clínica:</strong> ${clinicas[cita.clinicaId] || `ID ${cita.clinicaId}`}</p>
                    <p><strong>📝 Motivo:</strong> ${cita.motivo}</p>
                </div>
            </div>
        `).join('');
    }

    function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-PA') + ' ' + 
               fecha.toLocaleTimeString('es-PA', {hour: '2-digit', minute: '2-digit'});
    }

    function capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function mostrarMensaje(texto, tipo = 'info') {
        const div = document.createElement('div');
        div.style.cssText = `
            padding: 12px 20px; margin: 10px 0; border-radius: 6px; 
            background: ${tipo === 'error' ? '#fce4e4' : '#e8f5e8'};
            border-left: 4px solid ${tipo === 'error' ? '#f44336' : '#4caf50'};
        `;
        div.textContent = texto;
        document.querySelector('.app-main').insertBefore(div, document.querySelector('.app-main').firstChild);
        setTimeout(() => div.remove(), 5000);
    }

    // Event listeners
    if (filtroEstado) {
        filtroEstado.addEventListener('change', function() {
            const estado = this.value;
            const filtradas = estado ? 
                todasLasCitas.filter(c => c.estado === estado) : 
                todasLasCitas;
            renderizarCitas(filtradas);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
                localStorage.removeItem('pacienteId');
                sessionStorage.removeItem('pacienteId');
                window.location.href = 'index.html'; 
            
        });
    }

    //INICIAR TODO
    inicializar();
});
