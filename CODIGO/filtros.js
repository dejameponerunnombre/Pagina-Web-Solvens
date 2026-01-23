const btnToggleSidebar = document.getElementById('btnToggleSidebar');
const btnCerrarSidebar = document.getElementById('btnCerrarSidebar');
const sidebarFiltros = document.getElementById('sidebarFiltros');

btnToggleSidebar.addEventListener('click', () => {
    sidebarFiltros.classList.add('activo');
    btnToggleSidebar.classList.add('oculto');
});

btnCerrarSidebar.addEventListener('click', () => {
    sidebarFiltros.classList.remove('activo');
    btnToggleSidebar.classList.remove('oculto');
});

const filtrosHeaders = document.querySelectorAll('.filtro-header');

filtrosHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const contenido = header.nextElementSibling;
        const icono = header.querySelector('.icono-toggle');
        const grupoFiltro = header.parentElement;

        grupoFiltro.classList.toggle('colapsado');
        
        if (grupoFiltro.classList.contains('colapsado')) {
            contenido.style.maxHeight = '0';
            icono.style.transform = 'rotate(-90deg)';
        } else {
            contenido.style.maxHeight = contenido.scrollHeight + 'px';
            icono.style.transform = 'rotate(0deg)';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const gruposFiltro = document.querySelectorAll('.grupo-filtro');
    gruposFiltro.forEach(grupo => {
        grupo.classList.add('colapsado');
        const contenido = grupo.querySelector('.filtro-contenido');
        const icono = grupo.querySelector('.icono-toggle');
        contenido.style.maxHeight = '0';
        icono.style.transform = 'rotate(-90deg)';
    });
});