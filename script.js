document.addEventListener('DOMContentLoaded', async () => {
    // ===== 1. ELEMENTOS DEL DOM ===== //
    const loadingElement = document.getElementById('loading');
    const mangasContainer = document.getElementById('mangasContainer');
    const searchInput = document.getElementById('searchInput');
    const demografiaFilter = document.getElementById('demografiaFilter');
    const editorialFilter = document.getElementById('editorialFilter');
    const estadoFilter = document.getElementById('estadoFilter'); // Si lo añadiste
    const sortButton = document.getElementById('sortButton');

    // ===== 2. VARIABLES GLOBALES ===== //
    let currentPage = 1;
    const itemsPerPage = 20;
    let currentMangas = [];
    let isSorted = false;
    let allMangas = []; // Para almacenar los datos originales

    // ===== 3. CARGAR DATOS CON LOADING STATE ===== //
    try {
        loadingElement.style.display = 'block';
        mangasContainer.innerHTML = '';

        const response = await fetch('datos.json');
        if (!response.ok) throw new Error('Error al cargar el JSON');
        
        allMangas = await response.json();
        currentMangas = [...allMangas]; // Copia para trabajar

        // Generar opciones de filtros
        const demografias = [...new Set(allMangas.map(m => m.demografia))];
        const editoriales = [...new Set(allMangas.map(m => m.editorial))];
        
        demografias.forEach(d => {
            demografiaFilter.innerHTML += `<option value="${d}">${d}</option>`;
        });

        editoriales.forEach(e => {
            editorialFilter.innerHTML += `<option value="${e}">${e}</option>`;
        });

        // Renderizar inicial
        renderMangas();

    } catch (error) {
        console.error("Error:", error);
        mangasContainer.innerHTML = `
            <p class="error-message">⚠️ Error al cargar los mangas: ${error.message}</p>
        `;
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
            mangasContainer.innerHTML += `
                <div class="manga-card">
                    <img src="${manga.imagen}" alt="${manga.titulo}" class="manga-image">
                    <h3>${manga.titulo}</h3>
                    <p><strong>Guionista:</strong> ${manga.guionista}</p>
                    <p><strong>Dibujante:</strong> ${manga.dibujante}</p>
                    <p><strong>Demografía:</strong> ${manga.demografia}</p>
                    <p><strong>Volúmenes:</strong> ${manga.volumenes}</p>
                    <p><strong>Editorial:</strong> ${manga.editorial}</p>
                    <!-- Resto de tus campos -->
                    <a href="${manga.enlace}" target="_blank" class="enlace-btn">Descargar</a>
                </div>
            `;
        });
        
        renderPagination();
    }

    function renderPagination() {
        const totalPages = Math.ceil(currentMangas.length / itemsPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Botón Anterior
        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← Anterior';
            prevBtn.addEventListener('click', () => {
                currentPage--;
                renderMangas();
            });
            pagination.appendChild(prevBtn);
        }
        
        // Botones de página
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
        
        // Botón Siguiente
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
    if (estadoFilter) estadoFilter.addEventListener('change', filterMangas);
    
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
});