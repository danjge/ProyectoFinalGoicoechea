let contenedorProductos = document.getElementById("contenedorProductos");
let buscador = document.getElementById("buscador");
let inputs = document.getElementsByClassName("input");
let carrito = [];
let total = 0;

// Cargo productos desde el archivo JSON
fetch('./json/data.json')
  .then(response => response.json())
  .then(data => {
    productos = data;
    renderizarTarjetas(productos);
  })
  .catch(error => {
    console.error('Error al cargar los productos:', error.message);
  });
    
// Agrego eventos a los elementos de categoría
for (const input of inputs) {
  input.addEventListener("click", filtrarPorCategoria);
}

// Agrego evento al buscador
buscador.addEventListener("input", filtrarPorNombre);

// Filtro productos por categoría
function filtrarPorCategoria() {
  let filtros = Array.from(inputs).filter(input => input.checked).map(input => input.id);
  let arrayFiltrado = productos.filter(producto => filtros.includes(producto.categoria));
  renderizarTarjetas(arrayFiltrado.length > 0 ? arrayFiltrado : productos);
  }

// Filtro productos por nombre
function filtrarPorNombre() {
  let arrayFiltrado = productos.filter(producto => producto.nombre.includes(buscador.value));
  renderizarTarjetas(arrayFiltrado);
}

// Renderizo las tarjetas de productos
function renderizarTarjetas(arrayDeProductos) {
  contenedorProductos.innerHTML = "";
  arrayDeProductos.forEach((producto, i) => {
    let tarjeta = document.createElement("div");
    tarjeta.className = "tarjetaProducto";
    tarjeta.innerHTML = `
      <h1>${producto.nombre}</h1>
      <p>Categoría: ${producto.categoria}</p>
      <p>Precio: ${producto.precio}</p>
      <p>Stock: ${producto.stock}</p> <!-- Mostrar la cantidad de stock disponible -->
      <div class="imagen" style="background-image: url(${producto.img})"></div>
      <button class="comprar" data-producto-id="${producto.id}">COMPRAR</button>
    `;
    tarjeta.addEventListener("click", agregarAlCarrito);
    contenedorProductos.appendChild(tarjeta);
  });
}

// Agrego productos al carrito
function agregarAlCarrito(event) {
  let productoId = event.target.dataset.productoId;
  let producto = productos.find(producto => producto.id == productoId);

  if (producto) {
    // Verificar si hay suficiente stock del producto
    if (producto.stock > 0) {
      let productoExistente = carrito.find(item => item.nombre === producto.nombre);

      if (productoExistente) {
        // Verificar si la cantidad en el carrito > 0 no supera el stock disponible
        if (productoExistente.cantidad <0 <= producto.stock) {
          productoExistente.cantidad++;
          total += producto.precio;
          producto.stock--; // Restar uno al stock del producto
        } else {
          mostrarMensaje("No hay suficiente stock disponible para este producto.", "warning");
          return;
        }
      } else {
        productoExistente = { ...producto, cantidad: 1 };
        carrito.push(productoExistente);
        total += producto.precio;
        producto.stock--; // Restar uno al stock del producto
      }

      guardarCarritoEnLocalStorage();
      renderizarCarrito();
      renderizarTarjetas(productos); // Actualizar las tarjetas con la nueva cantidad de stock
    } else {
      mostrarMensaje("Este producto está agotado.", "warning");
    }
  }
}
function eliminarDelCarrito(nombreProducto) {
  let productoEnCarrito = carrito.find(item => item.nombre === nombreProducto);
  if (productoEnCarrito) {
    total -= productoEnCarrito.precio * productoEnCarrito.cantidad;
    productoEnCarrito.stock += productoEnCarrito.cantidad; // Restituir la cantidad al stock
    carrito = carrito.filter(item => item.nombre !== nombreProducto);
    guardarCarritoEnLocalStorage();
    renderizarCarrito();
    renderizarTarjetas(productos); // Actualizar las tarjetas con la nueva cantidad de stock
  }
}

// Guardo el carrito en el Local Storage
function guardarCarritoEnLocalStorage() {
  try {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('total', total);
  } catch (error) {
    console.error('Error al guardar en el Local Storage:', error.message);
    mostrarMensaje('No se pudo guardar el carrito. Por favor, inténtalo de nuevo.', 'error');
  }
}

// Cargo el carrito desde el Local Storage
function cargarCarritoDesdeLocalStorage() {
  try {
    const carritoGuardado = localStorage.getItem('carrito');
    const totalGuardado = localStorage.getItem('total');

    if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado);
      total = parseInt(totalGuardado) || 0;
      renderizarCarrito();
    }
  } catch (error) {
    console.error('Error al cargar desde el Local Storage:', error.message);
    mostrarMensaje('No se pudo cargar el carrito. Iniciando carrito vacío.', 'warning');
  }
}


// Renderizo el carrito de compras
function renderizarCarrito() {
  let carritoHTML = document.getElementById("carrito");
  carritoHTML.innerHTML = "";

  carrito.forEach(({ nombre, precio, cantidad }) => {
    let itemCarrito = document.createElement("div");
    itemCarrito.innerHTML = `Producto: ${nombre}, Precio: $${precio}, Cantidad: ${cantidad}
      <button class="eliminar" data-producto-nombre="${nombre}">Eliminar</button>`;
    itemCarrito.querySelector(".eliminar").addEventListener("click", function() {
      eliminarDelCarrito(nombre);
    });
    carritoHTML.appendChild(itemCarrito);
  });

  let totalHTML = document.getElementById("total");
  totalHTML.innerHTML = `Precio total: $${total}`;
}

// Vacio el carrito
function vaciarCarrito() {
  carrito = [];
  total = 0;
  guardarCarritoEnLocalStorage();
  renderizarCarrito();
}

// Agrego evento al botón "Vaciar carrito"
let botonVaciarCarrito = document.getElementById("vaciarCarrito");
botonVaciarCarrito.addEventListener("click", vaciarCarrito);

// Finalizar la compra
function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarMensaje("No hay productos seleccionados.");
    return;
  }

  mostrarMensaje("Procesando pago...", "info");

  // Simulamos un tiempo de procesamiento
  setTimeout(() => {
    vaciarCarrito();
    mostrarMensaje("¡Gracias por su compra!", "success");
  }, 1000);
}

// Agrego evento al botón "Pagar ahora"
let botonPagarAhora = document.getElementById("finalizarCompra");
botonPagarAhora.addEventListener("click", finalizarCompra);

// Muestro mensaje
function mostrarMensaje(mensaje, tipo = "error") {
  Swal.fire({
    icon: tipo,
    title: mensaje,
    showConfirmButton: true,
    timer: 1000
  });
}

// Cargo el carrito desde el Local Storage al cargar la página
cargarCarritoDesdeLocalStorage();