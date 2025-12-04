let titulo = "";
let tipo = "";
let anio = "";
let peticionCurso = false;
let contadorPaginas = 1;
let timer;
let viendoFavoritos = false;
let contenedor;
let inputTitulo;
let inputTipo;
let inputAnio;
let form;

//Funcion para maquetar las pelis
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
//Funcion para lanzar una peticion con los detalles de una peli
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
                <img src="${data.Poster !== "N/A" ? data.Poster : './img/image_notFound.png'}" 
                alt="${data.Title}" 
                onerror="this.src='./img/image_notFound.png'">
                <div class="info">
                    <h2>${data.Title}</h2>
                    <button id="cerrarDetalle" class="cerrar-btn">&times;</button>
                    <button id="btnFavorito" class="fav-btn">⭐ Añadir a Favoritos</button>

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
            const btnFav = document.getElementById("btnFavorito");
            //Funcion para comprobar si esta en favoritos
            function estaEnFavoritos(id) {
                let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
                return favoritos.includes(id);
            }
            //Funcion para actualizar el estado del boton de favoritos
            function actualizarEstadoBoton() {
                if (estaEnFavoritos(data.imdbID)) {
                    btnFav.classList.add("fav-on");
                    btnFav.textContent = "⭐ Quitar de Favoritos";
                } else {
                    btnFav.classList.remove("fav-on");
                    btnFav.textContent = "⭐ Añadir a Favoritos";
                }
            }

            actualizarEstadoBoton();
            //Evento para actualizar boton y guardar o eliminar de favoritos
            btnFav.addEventListener("click", () => {
                if (estaEnFavoritos(data.imdbID)) {
                    eliminarFavorito(data.imdbID);
                } else {
                    guardarFavorito(data.imdbID);
                }
                actualizarEstadoBoton();
            });
        });
}
//Funcion para cargar las peliculas cuando se busque
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

//Funcion para guardar en localStorage una pelicula favorita
function guardarFavorito(imdbID) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if (!favoritos.includes(imdbID)) {
        favoritos.push(imdbID);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
    }
}
//Funcion para eliminar en localStorage una pelicula favorita
function eliminarFavorito(imdbID) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    favoritos = favoritos.filter(id => id !== imdbID);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}



window.onload = () => {
    contenedor = document.getElementById("peliculas");
    inputTitulo = document.getElementById("titulo");
    inputTipo = document.getElementById("tipo");
    inputAnio = document.getElementById("anio");
    form = document.getElementById("busquedaForm");

    const btnUp = document.getElementById('btn-up');
    const btnFavoritos = document.getElementById("btnFavoritos");
    //Buscar cuando se pulse buscar
    form.addEventListener("submit", e => {
        e.preventDefault();
        viendoFavoritos = false;
        titulo = inputTitulo.value.trim();
        tipo = inputTipo.value;
        anio = inputAnio.value;
        actualizarBusqueda();
    });
    //Buscar cuando cambie el titulo y tenga minimo tres caracteres
    inputTitulo.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const valor = inputTitulo.value.trim();
            if (valor.length >= 3) {
                viendoFavoritos = false;
                titulo = valor;
                tipo = inputTipo.value;
                anio = inputAnio.value;
                actualizarBusqueda();
            }
        }, 300);
    });
    //Buscar cuando cambie el tipo
    inputTipo.addEventListener("input", () => {
        titulo = inputTitulo.value.trim();
        tipo = inputTipo.value;
        anio = inputAnio.value;
        actualizarBusqueda();
    });
    //Buscar cuando cambie el año
    inputAnio.addEventListener("input", () => {
        titulo = inputTitulo.value.trim();
        tipo = inputTipo.value;
        anio = inputAnio.value;
        actualizarBusqueda();
    });

    //Boton para ver los favoritos
    btnFavoritos.addEventListener("click", () => { 
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    titulo = "";
    tipo = "";
    anio = "";
    inputTitulo.value = "";
    inputTipo.value = "";
    inputAnio.value = "";
    contenedor.innerHTML = "";
    contadorPaginas = 1;
    viendoFavoritos = true;
    favoritos.forEach(id => {
        fetch(`https://www.omdbapi.com/?apikey=e8d14891&i=${id}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.Response !== "False") {
                    maquetarPelis([data]);
                }
            })
    });
});

    // Scroll infinito
    window.onscroll = () => {
        if (viendoFavoritos) return;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !peticionCurso) {
            contadorPaginas++;
            cargarPeliculas();
        }
    };

    // Volver arriba
    btnUp.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};