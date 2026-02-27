function mostrarConfirmacion({ titulo, mensaje, botonConfirmar = 'Confirmar', botonCancelar = 'Cancelar' }) {
    return new Promise((resolve) => {
        // Crear elementos del modal
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        overlay.innerHTML = `
            <div class="modal-contenedor">
                <div class="modal-header">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 15px;">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <h2>${titulo}</h2>
                </div>
                <div class="modal-body">
                    ${mensaje}
                </div>
                <div class="modal-footer">
                    <button class="btn-cancelar">${botonCancelar}</button>
                    <button class="btn-confirmar">${botonConfirmar}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Forzar reflow para animación
        setTimeout(() => overlay.classList.add('visible'), 10);

        const cerrar = (valor) => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.remove();
                resolve(valor);
            }, 300);
        };

        overlay.querySelector('.btn-cancelar').onclick = () => cerrar(false);
        overlay.querySelector('.btn-confirmar').onclick = () => cerrar(true);

        // Cerrar al hacer clic fuera del contenedor
        overlay.onclick = (e) => {
            if (e.target === overlay) cerrar(false);
        };
    });
}
