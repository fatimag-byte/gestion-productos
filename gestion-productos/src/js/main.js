document.addEventListener("DOMContentLoaded", () => {
  const formGestion = document.getElementById("formGestion");
  const listaProductos = document.getElementById("listaProductos");

  const nombre = document.getElementById("nombre");
  const descripcion = document.getElementById("descripcion");
  const precio = document.getElementById("precio");
  const stock = document.getElementById("stock");
  const categoria = document.getElementById("categoria");

  const buscarProducto = document.getElementById("buscarProducto");
  const filtroCategoria = document.getElementById("filtroCategoria");

  let productoEditando = null;
  let productos = []; // array para guardar los productos

  // contador de categorias
  const categoriaCards = {
    Electronica: document.querySelector(".categoria-card:nth-child(1) small"),
    Ropa: document.querySelector(".categoria-card:nth-child(2) small"),
    Hogar: document.querySelector(".categoria-card:nth-child(3) small"),
    Libros: document.querySelector(".categoria-card:nth-child(4) small"),
    Otros: document.querySelector(".categoria-card:nth-child(5) small"),
  };

  const contadores = {
    Electronica: 0,
    Ropa: 0,
    Hogar: 0,
    Libros: 0,
    Otros: 0,
  };

  function actualizarCategorias() {
    for (const cat in contadores) {
      categoriaCards[cat].textContent = `${contadores[cat]} producto${contadores[cat] !== 1 ? "s" : ""}`;
    }
  }
  actualizarCategorias();

  // renderizar productos filtrados
  function renderProductos(filtrados = productos) {
    listaProductos.innerHTML = "";

    if (filtrados.length === 0) {
      listaProductos.innerHTML = `<p class="text-muted">No hay productos registrados</p>`;
      return;
    }

    filtrados.forEach((p) => {
      const item = document.createElement("div");
      item.classList.add("producto-item");
      item.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <div class="info-producto">
            <strong>${p.nombre}</strong><br>
            <small>${p.descripcion}</small><br>
            <span class="text-secondary">Precio: $${p.precio} | Stock: ${p.stock} | ${p.categoria}</span>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-warning editar me-2"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-danger eliminar"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      `;

      // eliminar
      item.querySelector(".eliminar").addEventListener("click", () => {
        productos = productos.filter((prod) => prod !== p);
        if (contadores[p.categoria] > 0) contadores[p.categoria]--;
        actualizarCategorias();
        renderProductos();
      });

      // editar
      item.querySelector(".editar").addEventListener("click", () => {
        editarProducto(p);
      });

      listaProductos.appendChild(item);
    });
  }

  formGestion.addEventListener("submit", (e) => {
    e.preventDefault();
    obtenerDatos();

    const campos = [nombre, descripcion, precio, stock, categoria];
    let vacio = false;

    campos.forEach((campo) => {
      if (campo.value.trim() === "") {
        campo.classList.add("is-invalid");
        vacio = true;
      } else {
        campo.classList.remove("is-invalid");
      }
    });

    if (vacio) return;

    if (productoEditando) {
      productoEditando.nombre = nombre.value;
      productoEditando.descripcion = descripcion.value;
      productoEditando.precio = precio.value;
      productoEditando.stock = stock.value;

      // si cambio la cat actualizar
      if (productoEditando.categoria !== categoria.value) {
        if (contadores[productoEditando.categoria] > 0) contadores[productoEditando.categoria]--;
        contadores[categoria.value]++;
        productoEditando.categoria = categoria.value;
      }
      productoEditando = null;
    } else {
      const nuevo = {
        nombre: nombre.value,
        descripcion: descripcion.value,
        precio: precio.value,
        stock: stock.value,
        categoria: categoria.value,
      };
      productos.push(nuevo);
      contadores[categoria.value]++;
    }

    actualizarCategorias();
    formGestion.reset();
    renderProductos();
  });

  function editarProducto(p) {
    nombre.value = p.nombre;
    descripcion.value = p.descripcion;
    precio.value = p.precio;
    stock.value = p.stock;
    categoria.value = p.categoria;
    productoEditando = p;
  }

  //filtro nombre
  buscarProducto.addEventListener("input", () => {
    aplicarFiltros();
  });

  //filtro categoria
  filtroCategoria.addEventListener("change", () => {
    aplicarFiltros();
  });

  // aplicar ambos filtros
  function aplicarFiltros() {
    const texto = buscarProducto.value.toLowerCase();
    const categoriaSel = filtroCategoria.value;

    let filtrados = productos.filter((p) =>
      p.nombre.toLowerCase().includes(texto)
    );

    if (categoriaSel && categoriaSel !== "Seleccionar...") {
      filtrados = filtrados.filter((p) => p.categoria === categoriaSel);
    }

    renderProductos(filtrados);
  }
});


async function obtenerDatostest() {
  try {
    const respuesta = await fetch('http://localhost:3000/api/productos');
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
    const datos = await respuesta.json(); // Convierte la respuesta en JSON
    console.log(datos);
  } catch (error) {
    console.error('Hubo un problema con la petición:', error);
  }
}



async function obtenerDatos() {
  try {
  fetch('http://localhost:3000/api/productos')
  .then(respuesta => {
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }
  })
  .then(datos => {
        const datoss = respuesta.json(); // Convierte la respuesta en JSON
    console.log(datoss);
  })
  .catch(error => {
    console.error('Hubo un problema con la petición:', error);
  });
  } 
  catch (error) {
    console.error('Hubo un problema con la petición:', error);
  }
}


