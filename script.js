document.addEventListener('DOMContentLoaded', async () => {
    // ===== 1. ELEMENTOS DEL DOM ===== //
    const loadingElement = document.getElementById('loading');
    const mangasContainer = document.getElementById('mangasContainer');
    const searchInput = document.getElementById('searchInput');
    const demografiaFilter = document.getElementById('demografiaFilter');
    const editorialFilter = document.getElementById('editorialFilter');
    const estadoFilter = document.getElementById('estadoFilter');
    const sortButton = document.getElementById('sortButton');

    const modal = document.getElementById('portadasModal');
    const galeria = document.getElementById('portadasGaleria');
    const closeBtn = document.querySelector('.close-button');

    // ===== 2. VARIABLES GLOBALES ===== //
    let currentPage = 1;
    const itemsPerPage = 20;
    let currentMangas = [];
    let isSorted = false;
    let allMangas = [];

    // ===== 3. CARGAR DATOS CON LOADING STATE ===== //
    try {
        loadingElement.style.display = 'block';
        mangasContainer.innerHTML = '';

        const response = await fetch('datos.json');
        if (!response.ok) throw new Error('Error al cargar el JSON');

        allMangas = await response.json();
        currentMangas = [...allMangas];

        const demografias = [...new Set(allMangas.map(m => m.demografia))];
        const editoriales = [...new Set(allMangas.map(m => m.editorial))];

        demografias.forEach(d => {
            demografiaFilter.innerHTML += `<option value="${d}">${d}</option>`;
        });

        editoriales.forEach(e => {
            editorialFilter.innerHTML += `<option value="${e}">${e}</option>`;
        });

        renderMangas();

    } catch (error) {
        console.error("Error:", error);
        mangasContainer.innerHTML = `<p class="error-message">⚠️ Error al cargar los mangas: ${error.message}</p>`;
    } finally {
        loadingElement.style.display = 'none';
    }

    // ===== 4. FUNCIONES PRINCIPALES ===== //
    function filterMangas() {
        const searchTerm = searchInput.value.toLowerCase();
        const demografia = demografiaFilter.value;
        const editorial = editorialFilter.value;
        const estado = estadoFilter.value;

        currentMangas = allMangas.filter(manga => {
            const matchesSearch =
                manga.titulo.toLowerCase().includes(searchTerm) ||
                manga.guionista.toLowerCase().includes(searchTerm) ||
                manga.dibujante.toLowerCase().includes(searchTerm);

            const matchesDemo = demografia ? manga.demografia === demografia : true;
            const matchesEditorial = editorial ? manga.editorial === editorial : true;
            const matchesEstado = estado ?
                (estado === 'abierta' ? manga.volumenes.includes('abierta') : manga.volumenes.includes('cerrada')) :
                true;

            return matchesSearch && matchesDemo && matchesEditorial && matchesEstado;
        });

        currentPage = 1;
        renderMangas();
    }

function renderMangas() {
    mangasContainer.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMangas = currentMangas.slice(startIndex, startIndex + itemsPerPage);

    if (paginatedMangas.length === 0) {
        mangasContainer.innerHTML = '<p class="no-results">No se encontraron mangas</p>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    paginatedMangas.forEach(manga => {
        const portada = manga.imagenes && manga.imagenes.length > 0 ? manga.imagenes[0] : 'imagenes/default.jpg';
        const descripcion = manga.descripcion || "Argumento no disponible.";
        
        mangasContainer.innerHTML += `
            <div class="manga-card">
                <img src="${portada}" alt="${manga.titulo}" class="manga-image">
                <h3 class="manga-title" data-titulo="${manga.titulo}">${manga.titulo}</h3>
                <p><strong>Guionista:</strong> ${manga.guionista}</p>
                <p><strong>Dibujante:</strong> ${manga.dibujante}</p>
                <p><strong>Demografía:</strong> ${manga.demografia}</p>
                <p><strong>Volúmenes:</strong> ${manga.volumenes}</p>
                <p><strong>Editorial:</strong> ${manga.editorial}</p>
                <div class="botones-container">
                    <a href="${manga.enlace}" target="_blank" class="enlace-btn">Terabox</a>
                    <button class="ver-descripcion" data-titulo="${manga.titulo}">Ver argumento</button>
                </div>
            </div>
        `;
    });

    // Añade el evento para el botón de descripción
    document.querySelectorAll('.ver-descripcion').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const titulo = e.target.dataset.titulo;
            const manga = allMangas.find(m => m.titulo === titulo);
            if (manga) {
                mostrarDescripcion(manga);
            }
        });
    });

    renderPagination();
}

// Nueva función para mostrar la descripción
function mostrarDescripcion(manga) {
    const modal = document.getElementById('descripcionModal');
    const titulo = document.getElementById('descripcionTitulo');
    const texto = document.getElementById('descripcionTexto');
    const closeBtn = document.querySelector('.descripcion-close');
    
    titulo.textContent = manga.titulo;
    texto.textContent = manga.descripcion || "Descripción no disponible.";
    
    modal.style.display = 'flex';
    
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    }
    
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    }
}

    function renderPagination() {
        const totalPages = Math.ceil(currentMangas.length / itemsPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← Anterior';
            prevBtn.addEventListener('click', () => {
                currentPage--;
                renderMangas();
            });
            pagination.appendChild(prevBtn);
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.classList.add('active');
                pageBtn.disabled = true;
            }
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                renderMangas();
            });
            pagination.appendChild(pageBtn);
        }

        if (currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Siguiente →';
            nextBtn.addEventListener('click', () => {
                currentPage++;
                renderMangas();
            });
            pagination.appendChild(nextBtn);
        }
    }

    // ===== 5. EVENT LISTENERS ===== //
    searchInput.addEventListener('input', filterMangas);
    demografiaFilter.addEventListener('change', filterMangas);
    editorialFilter.addEventListener('change', filterMangas);
    estadoFilter.addEventListener('change', filterMangas);

    sortButton.addEventListener('click', () => {
        isSorted = !isSorted;
        currentMangas.sort((a, b) => {
            return isSorted ?
                b.titulo.localeCompare(a.titulo) :
                a.titulo.localeCompare(b.titulo);
        });
        sortButton.textContent = isSorted ? 'Ordenar Z-A' : 'Ordenar A-Z';
        currentPage = 1;
        renderMangas();
    });

    // ===== 6. MOSTRAR GALERÍA DE PORTADAS EN MODAL ===== //
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('manga-title')) {
            const titulo = e.target.dataset.titulo;
            const manga = allMangas.find(m => m.titulo === titulo);
            if (!manga || !manga.imagenes) return;

            galeria.innerHTML = manga.imagenes.map(img =>
                `<img src="${img}" alt="${titulo}">`
            ).join('');
            modal.style.display = 'flex';
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});
