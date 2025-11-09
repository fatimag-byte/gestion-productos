document.addEventListener("DOMContentLoaded", () => {
  const formGestion = document.getElementById("formGestion");
  const listaProductos = document.getElementById("listaProductos");


  const nombre = document.getElementById("nombre");
  const descripcion = document.getElementById("descripcion");
  const precio = document.getElementById("precio");
  const stock = document.getElementById("stock");
  const categoria = document.getElementById("categoria");

  let productoEditando = null; 

  formGestion.addEventListener("submit", (e) => {
    e.preventDefault();

    const campos = [nombre, descripcion, precio, stock, categoria];
    let vacio = false;

    campos.forEach(campo => {
      if (campo.value.trim() === "") {
        campo.classList.add("is-invalid");
        vacio = true;
      } else {
        campo.classList.remove("is-invalid");
      }
    });

    if (vacio) return;

    if (productoEditando) {
      // actualizar
      actualizarProducto(nombre.value, descripcion.value, precio.value, stock.value, categoria.value);
    } else {
      // agregar
      agregarProducto(nombre.value, descripcion.value, precio.value, stock.value, categoria.value);
    }

    formGestion.reset();
    productoEditando = null;
  });

  // agregar producto
  function agregarProducto(nombre, descripcion, precio, stock, categoria) {
    const item = document.createElement("div");
    item.classList.add("producto-item");
    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div class="info-producto">
          <strong>${nombre}</strong><br>
          <small>${descripcion}</small><br>
          <span class="text-secondary">Precio: $${precio} | Stock: ${stock} | ${categoria}</span>
        </div>
        <div class="btn-group">
          <button class="btn btn-sm btn-warning editar me-2">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;

    const mensaje = listaProductos.querySelector("p");
    if (mensaje) mensaje.remove();

    listaProductos.appendChild(item);

    //eliminar
    item.querySelector(".eliminar").addEventListener("click", () => {
      item.remove();
      if (listaProductos.children.length === 0) {
        listaProductos.innerHTML = `<p class="text-muted">No hay productos registrados</p>`;
      }
    });

    // evento editar
    item.querySelector(".editar").addEventListener("click", () => {
      editarProducto(item);
    });
  }

  // editar
  function editarProducto(item) {
    const info = item.querySelector(".info-producto");
    const texto = info.innerHTML;

    //obtener valores
    const nombreActual = info.querySelector("strong").textContent;
    const descripcionActual = info.querySelector("small").textContent;
    const detalle = info.querySelector("span").textContent;

    const precioMatch = detalle.match(/Precio: \$(\d+)/);
    const stockMatch = detalle.match(/Stock: (\d+)/);
    const categoriaMatch = detalle.split("|")[2].trim();

    nombre.value = nombreActual;
    descripcion.value = descripcionActual;
    precio.value = precioMatch ? precioMatch[1] : "";
    stock.value = stockMatch ? stockMatch[1] : "";
    categoria.value = categoriaMatch || "";

    productoEditando = item;
  }


  function actualizarProducto(nombreNuevo, descripcionNueva, precioNuevo, stockNuevo, categoriaNueva) {
    const info = productoEditando.querySelector(".info-producto");
    info.innerHTML = `
      <strong>${nombreNuevo}</strong><br>
      <small>${descripcionNueva}</small><br>
      <span class="text-secondary">Precio: $${precioNuevo} | Stock: ${stockNuevo} | ${categoriaNueva}</span>
    `;

    productoEditando = null;
  }
});
