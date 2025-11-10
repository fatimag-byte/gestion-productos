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

    const tabla = document.createElement("table");
    tabla.classList.add("table", "table-hover", "table-bordered", "align-middle", "shadow-sm");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr class="table-primary text-center">
        <th>Nombre</th>
        <th>Descripcion</th>
        <th>Precio</th>
        <th>Stock</th>
        <th>Categoria</th>
        <th>Acciones</th>
      </tr>`;
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");

    filtrados.forEach((p) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td><strong>${p.nombre}</strong></td>
        <td>${p.descripcion}</td>
        <td>$${p.precio}</td>
        <td>${p.stock}</td>
        <td>${p.categoria}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-warning editar me-2"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-danger eliminar"><i class="bi bi-trash"></i></button>
        </td>
      `;

      // eliminar
      fila.querySelector(".eliminar").addEventListener("click", async () => {
        if (p._id) {
          // si viene de la bd
          try {
            const res = await fetch(`http://localhost:3000/api/productos/${p._id}`, {
              method: "DELETE",
            });
            if (res.ok) {
              productos = productos.filter((prod) => prod._id !== p._id);
              if (contadores[p.categoria] > 0) contadores[p.categoria]--;
              actualizarCategorias();
              renderProductos();
            }
          } catch (error) {
            console.error("error al eliminar producto:", error);
          }
        } else {
          // si es local
          productos = productos.filter((prod) => prod !== p);
          if (contadores[p.categoria] > 0) contadores[p.categoria]--;
          actualizarCategorias();
          renderProductos();
        }
      });

      // editar
      fila.querySelector(".editar").addEventListener("click", () => {
        editarProducto(p);
      });

      tbody.appendChild(fila);
    });

    tabla.appendChild(tbody);
    listaProductos.appendChild(tabla);
  }

  formGestion.addEventListener("submit", (e) => {
    e.preventDefault();
    enviarDatos();

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

  //ambos filtros
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

  // obtener datos de la bd
  fetch("http://localhost:3000/api/productos")
    .then((respuesta) => respuesta.json())
    .then((data) => {
      productos = [...productos, ...data];
      data.forEach((p) => {
        if (contadores[p.categoria] !== undefined) contadores[p.categoria]++;
      });
      actualizarCategorias();
      renderProductos();
    })
    .catch((err) => console.error("error al traer productos:", err));
});

async function enviarDatos() {
  const producto = {
    nombre: nombre.value,
    descripcion: descripcion.value,
    precio: precio.value,
    stock: stock.value,
    categoria: categoria.value,
  };

  try {
    const respuesta = await fetch("http://localhost:3000/api/productos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(producto),
    });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    console.log("Datos enviados correctamente:", resultado);
  } catch (error) {
    console.error("Error al enviar datos:", error);
  }
}
