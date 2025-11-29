let titulo = "";
let tipo = "";
let anio = "";
let peticionCurso = false;
let contadorPaginas = 1;
let debounceTimer;

let contenedor;
let inputTitulo;
let inputTipo;
let inputAnio;
let form;


function maquetarPelis(listaPelis) {
    listaPelis.forEach(pelicula => {
        const card = document.createElement("div");
        card.addEventListener("click", () => lanzaPeticionDetalle(pelicula.imdbID));
        card.className = "card";
        card.innerHTML = `
            <img src="${pelicula.Poster !== "N/A" ? pelicula.Poster : './img/image_notFound.png'}" 
            alt="${pelicula.Title}" 
            onerror="this.src='./img/image_notFound.png'">
            <h2>${pelicula.Title}</h2>
            <p>${pelicula.Year}</p>`;
        contenedor.appendChild(card);
    });
}

function lanzaPeticionDetalle(imdbID) {
    fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=e8d14891`)
        .then(res => res.json())
        .then(data => {
            const overlay = document.createElement("div");
            overlay.id = "overlay";

            overlay.addEventListener("click", e => {
                if (e.target === overlay) overlay.remove();
            });

            const detalle = document.createElement("div");
            detalle.classList.add("detalle");

            detalle.innerHTML = `
                <img src="${data.Poster}" alt="${data.Title}">
                <div class="info">
                    <h2>${data.Title}</h2>
                    <button id="cerrarDetalle" class="cerrar-btn">&times;</button>
                    <div class="datos">
                        <p><strong>Año:</strong> ${data.Year}</p>
                        <p><strong>Clasificación:</strong> ${data.Rated}</p>
                        <p><strong>Estreno:</strong> ${data.Released}</p>
                        <p><strong>Duración:</strong> ${data.Runtime}</p>
                        <p><strong>Director:</strong> ${data.Director}</p>
                        <p><strong>Guionista:</strong> ${data.Writer}</p>
                        <p><strong>Actores:</strong> ${data.Actors}</p>
                        <p><strong>Género:</strong> ${data.Genre}</p>
                        <p><strong>Idioma:</strong> ${data.Language}</p>
                        <p><strong>País:</strong> ${data.Country}</p>
                    </div>
                    <p><strong>Sinopsis:</strong> ${data.Plot}</p>
                    <h3>⭐ Ratings</h3>
                    <ul>
                        ${data.Ratings.map(r => `<li>${r.Source}: ${r.Value}</li>`).join("")}
                    </ul>
                    <p><strong>Premios:</strong> ${data.Awards}</p>
                    <p><strong>Taquilla:</strong> ${data.BoxOffice}</p>
                </div>
            `;

            overlay.appendChild(detalle);
            document.body.appendChild(overlay);

            document.getElementById("cerrarDetalle").addEventListener("click", () => overlay.remove());
        });
}

function cargarPeliculas() {
    if (!titulo) return;
    peticionCurso = true;

    fetch(`https://www.omdbapi.com/?apikey=e8d14891&s=${titulo}&type=${tipo}&y=${anio}&page=${contadorPaginas}`)
        .then(res => res.json())
        .then(data => {
            if (data.Search) maquetarPelis(data.Search);
            peticionCurso = false;
        });
}

function actualizarBusqueda() {
    contenedor.innerHTML = "";
    contadorPaginas = 1;
    cargarPeliculas();
}

window.onload = () => {
    contenedor = document.getElementById("peliculas");
    inputTitulo = document.getElementById("titulo");
    inputTipo = document.getElementById("tipo");
    inputAnio = document.getElementById("anio");
    form = document.getElementById("busquedaForm");
    const btnUp = document.getElementById('btn-up');

    form.addEventListener("submit", e => {
        e.preventDefault();
        titulo = inputTitulo.value.trim();
        tipo = inputTipo.value;
        anio = inputAnio.value;
        actualizarBusqueda();
    });

    // Cambio titulo (uso debounce para retrasar la ejecucion)
    inputTitulo.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const valor = inputTitulo.value.trim();
            if (valor.length >= 3) {
                titulo = valor;
                tipo = inputTipo.value;
                anio = inputAnio.value;
                actualizarBusqueda();
            }
        }, 300);
    });

    // Cambios tipo y año
    inputTipo.addEventListener("input", () => {
        titulo = inputTitulo.value.trim();
        tipo = inputTipo.value;
        anio = inputAnio.value;
        actualizarBusqueda();
    });

    inputAnio.addEventListener("input", () => {
        titulo = inputTitulo.value.trim();
        tipo = inputTipo.value;
        anio = inputAnio.value;
        actualizarBusqueda();
    });

    // Scroll infinito
    window.onscroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !peticionCurso) {
            contadorPaginas++;
            cargarPeliculas();
        }
    };
    //Boton para volver arriba
    btnUp.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
};