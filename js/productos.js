// Abrir y cerrar el modal para añadir productos
const addModal = document.getElementById("addProductModal");
const addBtn = document.getElementById("addProductBtn");
const addSpan = document.getElementsByClassName("close")[0];

addBtn.onclick = function() {
  clearAddProductForm(); // Limpiar los campos del formulario
  addModal.style.display = "block";
}

addSpan.onclick = function() {
  addModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == addModal) {
    addModal.style.display = "none";
  }
}

// Abrir y cerrar el modal para editar productos
const editModal = document.getElementById("editProductModal");
const editSpan = document.getElementsByClassName("close-edit")[0];

editSpan.onclick = function() {
  editModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == editModal) {
    editModal.style.display = "none";
  }
}

// Función para limpiar los campos del formulario de añadir producto
function clearAddProductForm() {
  document.getElementById("productKey").value = '';
  document.getElementById("productDescription").value = '';
  document.getElementById("productPrice").value = '';
}

// Manejar el envío del formulario para añadir productos
const addForm = document.getElementById("addProductForm");
addForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const key = document.getElementById("productKey").value;
  const description = document.getElementById("productDescription").value;
  const price = document.getElementById("productPrice").value;

  // Añadir el producto a Firestore
  db.collection("products").add({
    key: key,
    description: description,
    price: price
  }).then((docRef) => {
    // Añadir el producto a la tabla
    addProductToTable(docRef.id, key, description, price);
    // Cerrar el modal
    addModal.style.display = "none";
  }).catch((error) => {
    console.error("Error al añadir el producto: ", error);
  });
});

// Manejar el envío del formulario para editar productos
const editForm = document.getElementById("editProductForm");
editForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const id = document.getElementById("editProductId").value;
  const key = document.getElementById("editProductKey").value;
  const description = document.getElementById("editProductDescription").value;
  const price = document.getElementById("editProductPrice").value;

  // Actualizar el producto en Firestore
  db.collection("products").doc(id).update({
    key: key,
    description: description,
    price: price
  }).then(() => {
    // Actualizar la tabla
    const row = document.querySelector(`tr[data-id='${id}']`);
    row.cells[1].innerText = key;
    row.cells[2].innerText = description;
    row.cells[3].innerText = price;
    // Cerrar el modal
    editModal.style.display = "none";
  }).catch((error) => {
    console.error("Error al actualizar el producto: ", error);
  });
});

// Función para añadir un producto a la tabla
function addProductToTable(id, key, description, price) {
  const table = document.getElementById("productsTable").getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();
  newRow.setAttribute('data-id', id); // Añade el ID del producto como un atributo de datos
  newRow.insertCell(0).innerText = table.rows.length;
  newRow.insertCell(1).innerText = key;
  newRow.insertCell(2).innerText = description;
  newRow.insertCell(3).innerText = price;
  const actionsCell = newRow.insertCell(4);

  // Botón Editar
  const editButton = document.createElement('button');
  editButton.className = 'btn-edit';
  const editIcon = document.createElement('span');
  editIcon.className = 'material-icons-outlined';
  editIcon.innerText = 'edit';
  editButton.appendChild(editIcon);
  editButton.addEventListener('click', function() {
    openEditModal(id);
  });
  actionsCell.appendChild(editButton);

  // Botón Eliminar
  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn-delete';
  const deleteIcon = document.createElement('span');
  deleteIcon.className = 'material-icons-outlined';
  deleteIcon.innerText = 'delete';
  deleteButton.appendChild(deleteIcon);
  deleteButton.addEventListener('click', function() {
    deleteProduct(id, newRow);
  });
  actionsCell.appendChild(deleteButton);
}

// Función para abrir el modal de edición con la información actual
function openEditModal(id) {
  db.collection("products").doc(id).get().then((doc) => {
    if (doc.exists) {
      const product = doc.data();
      document.getElementById("editProductId").value = id;
      document.getElementById("editProductKey").value = product.key;
      document.getElementById("editProductDescription").value = product.description;
      document.getElementById("editProductPrice").value = product.price;
      editModal.style.display = "block";
    }
  }).catch((error) => {
    console.error("Error al obtener el producto: ", error);
  });
}

// Función para eliminar un producto
function deleteProduct(id, row) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    db.collection("products").doc(id).delete().then(() => {
      row.remove(); // Elimina la fila de la tabla
      console.log("Producto eliminado con éxito");
    }).catch((error) => {
      console.error("Error al eliminar el producto: ", error);
    });
  }
}

// Cargar los productos de Firebase Firestore y mostrarlos en la tabla
function loadProducts() {
  db.collection("products").get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const product = doc.data();
        addProductToTable(doc.id, product.key, product.description, product.price); // Pasa el ID del documento
      });
    })
    .catch((error) => {
      console.error("Error al obtener los productos: ", error);
    });
}

// Cargar los productos al cargar la página
window.onload = function() {
  loadProducts();
};
