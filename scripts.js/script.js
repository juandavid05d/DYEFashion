
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Esto es un ARRAY (lista) de productos
const productos = [
  {
    id: 1,
    nombre: "Camiseta Oversize Negra",
    precio: 85000,
    categoria: "hombre",
    imagen: "img/producto1.jpg"
  },
  {
    id: 2,
    nombre: "Hoodie Beige",
    precio: 150000,
    categoria: "mujer",
    imagen: "img/producto2.jpg"
  }
];

const contenedor = document.getElementById("productos");

function saveCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContador() {
  const conts = document.querySelectorAll('#cart-count, .cart-count');
  const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
  conts.forEach(c => { if (c) c.textContent = total; });
}

// Agregar al carrito (manejo de cantidades)
function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const existente = carrito.find(item => item.id === id);
  if (existente) {
    existente.cantidad = (existente.cantidad || 1) + 1;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  saveCarrito();
  actualizarContador();
  // Si quieres puedes abrir la vista previa automáticamente
  // abrirCarrito();
}

// Render del modal de carrito
function abrirCarrito() {
  const modal = document.getElementById('cart-modal');
  const itemsDiv = document.getElementById('cart-items');
  const totalSpan = document.getElementById('cart-total');
  if (!modal || !itemsDiv || !totalSpan) return;

  itemsDiv.innerHTML = '';
  let total = 0;

  if (carrito.length === 0) {
    itemsDiv.innerHTML = '<p>Tu carrito está vacío.</p>';
  } else {
    carrito.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}">
        <div style="flex:1">
          <strong>${item.nombre}</strong>
          <div>$${item.precio}</div>
          <div>
            <button class="qty-btn" data-op="-" data-id="${item.id}">-</button>
            <span class="qty">${item.cantidad}</span>
            <button class="qty-btn" data-op="+" data-id="${item.id}">+</button>
            <button class="remove-btn" data-id="${item.id}">Eliminar</button>
          </div>
        </div>
      `;
      itemsDiv.appendChild(row);
      total += item.precio * item.cantidad;
    });
  }

  totalSpan.textContent = `$${total}`;
  modal.style.display = 'block';
  modal.setAttribute('aria-hidden', 'false');
}

function cerrarCarrito() {
  const modal = document.getElementById('cart-modal');
  if (!modal) return;
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

// Render de la página de carrito (carrito.html)
function renderCartPage() {
  const pageItems = document.getElementById('cart-page-items');
  const pageTotal = document.getElementById('cart-page-total');
  if (!pageItems) return;
  pageItems.innerHTML = '';

  if (carrito.length === 0) {
    pageItems.innerHTML = '<p>No hay productos en el carrito.</p>';
    if (pageTotal) pageTotal.textContent = '$0';
    return;
  }

  let total = 0;
  carrito.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}">
      <div style="flex:1">
        <strong>${item.nombre}</strong>
        <div>$${item.precio}</div>
        <div>
          <button class="qty-btn" data-op="-" data-id="${item.id}">-</button>
          <span class="qty">${item.cantidad}</span>
          <button class="qty-btn" data-op="+" data-id="${item.id}">+</button>
          <button class="remove-btn" data-id="${item.id}">Eliminar</button>
        </div>
      </div>
    `;
    pageItems.appendChild(row);
    total += item.precio * item.cantidad;
  });
  if (pageTotal) pageTotal.textContent = `$${total}`;
}

// Soporte de acciones en la página de carrito
const cartPage = document.getElementById('cart-page');
if (cartPage) {
  cartPage.addEventListener('click', (e) => {
    const remove = e.target.closest('.remove-btn');
    if (remove) {
      const id = Number(remove.dataset.id);
      carrito = carrito.filter(i => i.id !== id);
      saveCarrito();
      actualizarContador();
      renderCartPage();
      return;
    }
    const qtyBtn = e.target.closest('.qty-btn');
    if (qtyBtn) {
      const id = Number(qtyBtn.dataset.id);
      const op = qtyBtn.dataset.op;
      const item = carrito.find(i => i.id === id);
      if (!item) return;
      if (op === '+') item.cantidad += 1;
      if (op === '-') item.cantidad = Math.max(1, item.cantidad - 1);
      saveCarrito();
      actualizarContador();
      renderCartPage();
    }
  });
}

// Listeners para botones en modal
function initCartModal() {
  const modal = document.getElementById('cart-modal');
  const closeBtn = document.getElementById('cart-close');
  const cartButton = document.getElementById('cart-button');

  if (cartButton) {
    cartButton.addEventListener('click', () => abrirCarrito());
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => cerrarCarrito());
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('cart-overlay')) cerrarCarrito();

      const remove = e.target.closest('.remove-btn');
      if (remove) {
        const id = Number(remove.dataset.id);
        carrito = carrito.filter(i => i.id !== id);
        saveCarrito();
        actualizarContador();
        abrirCarrito();
      }

      const qtyBtn = e.target.closest('.qty-btn');
      if (qtyBtn) {
        const id = Number(qtyBtn.dataset.id);
        const op = qtyBtn.dataset.op;
        const item = carrito.find(i => i.id === id);
        if (!item) return;
        if (op === '+') item.cantidad += 1;
        if (op === '-') item.cantidad = Math.max(1, item.cantidad - 1);
        saveCarrito();
        actualizarContador();
        abrirCarrito();
      }
    });
  }
}

// Soporte global para botones `.btn[data-id]` (index, tienda, producto)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('button.btn[data-id]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (Number.isNaN(id)) return;

  agregarAlCarrito(id);
  // feedback visual en cualquier botón
  const original = btn.textContent;
  btn.textContent = 'Agregado ✓';
  setTimeout(() => { btn.textContent = original }, 1000);
});

// Iniciar contador, modal y página
actualizarContador();
initCartModal();
renderCartPage();

if (contenedor) {
  // Rellenamos el contenedor creando elementos DOM
  productos.forEach(producto => {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p class="precio">$${producto.precio}</p>
      <button class="btn" data-id="${producto.id}">Agregar al carrito</button>
    `;
    contenedor.appendChild(article);
  });

  // Delegación de eventos: un listener para todos los botones
  contenedor.addEventListener('click', (e) => {
    const btn = e.target.closest('button.btn');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (!Number.isNaN(id)) agregarAlCarrito(id);
  });
} else {
  console.warn("Elemento con id 'productos' no encontrado.");
}
