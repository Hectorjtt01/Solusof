// Función para cargar los servicios de VoBo desde Firestore y añadirlos a la tabla
function loadVoBoServices(filter = 'all') {
  const voboTable = document.getElementById("voboTable").getElementsByTagName("tbody")[0];
  voboTable.innerHTML = ''; // Limpiar la tabla antes de cargar los datos

  db.collection("voboServices").get().then((querySnapshot) => {
    const promises = [];
    const uniqueServices = new Set();

    querySnapshot.forEach((doc) => {
      const service = doc.data();
      if (filter === 'faltantes' && service.finalized) return;
      if (filter === 'completados' && !service.finalized) return;

      const serviceKey = `${service.date}-${service.client}-${service.plate}-${service.imei}-${service.serviceCategory}-${service.serviceType}-${service.coordinated}-${service.total}`;
      
      if (uniqueServices.has(serviceKey)) {
        return; // Skip adding this service if it already exists
      }
      
      uniqueServices.add(serviceKey);

      const newRow = voboTable.insertRow();
      newRow.setAttribute('data-id', doc.id); // Añadir el ID del servicio como atributo de datos
      newRow.insertCell(0).innerText = service.date;
      newRow.insertCell(1).innerText = service.client;
      newRow.insertCell(2).innerText = service.plate;
      newRow.insertCell(3).innerText = service.imei;

      const serviceCategoryCell = newRow.insertCell(4);
      const serviceTypeCell = newRow.insertCell(5);
      newRow.insertCell(6).innerText = service.coordinated;
      newRow.insertCell(7).innerText = `$${(parseFloat(service.total) || 0).toFixed(2)}`; // Asegurarse de que total es un número

      // Crear celda de acciones
      const actionsCell = newRow.insertCell(8);

      const editButton = document.createElement('button');
      editButton.className = 'btn-edit';
      const editIcon = document.createElement('span');
      editIcon.className = 'material-icons-outlined';
      editIcon.innerText = 'edit';
      editButton.appendChild(editIcon);
      editButton.addEventListener('click', () => openEditModal(doc.id));
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.className = 'btn-delete';
      const deleteIcon = document.createElement('span');
      deleteIcon.className = 'material-icons-outlined';
      deleteIcon.innerText = 'delete';
      deleteButton.appendChild(deleteIcon);
      deleteButton.addEventListener('click', () => deleteService(doc.id, newRow));
      actionsCell.appendChild(deleteButton);

      const serviceTypePromise = db.collection("serviceTypes").doc(service.serviceType).get().then((serviceTypeDoc) => {
        if (serviceTypeDoc.exists) {
          serviceTypeCell.innerText = serviceTypeDoc.data().name;
        } else {
          serviceTypeCell.innerText = service.serviceType;
        }
      }).catch((error) => {
        serviceTypeCell.innerText = service.serviceType;
        console.error("Error al obtener el tipo de servicio: ", error);
      });

      const serviceCategoryPromise = db.collection("serviceCategories").doc(service.serviceCategory).get().then((serviceCategoryDoc) => {
        if (serviceCategoryDoc.exists) {
          serviceCategoryCell.innerText = serviceCategoryDoc.data().name;
        } else {
          serviceCategoryCell.innerText = service.serviceCategory;
        }
      }).catch((error) => {
        serviceCategoryCell.innerText = service.serviceCategory;
        console.error("Error al obtener la categoría de servicio: ", error);
      });

      const finalizedCell = newRow.insertCell(9); // Añadir la columna de finalizado
      finalizedCell.innerHTML = service.finalized ? '✔️' : ''; // Mostrar palomita si está finalizado

      promises.push(serviceTypePromise, serviceCategoryPromise);
    });

    return Promise.all(promises);
  }).catch((error) => {
    console.error("Error al cargar los servicios de VoBo: ", error);
  });
}

// Añadir eventos a los botones de filtro
document.getElementById('showFaltantes').addEventListener('click', function() {
  loadVoBoServices('faltantes');
});

document.getElementById('showCompletados').addEventListener('click', function() {
  loadVoBoServices('completados');
});

// Cargar servicios de VoBo cuando la página se carga
document.addEventListener("DOMContentLoaded", function() {
  loadVoBoServices();
});

// Función para abrir el modal de edición con la información del servicio
function openEditModal(serviceId) {
  db.collection("services").doc(serviceId).get().then((doc) => {
    if (doc.exists) {
      const service = doc.data();
      document.getElementById("editServiceId").value = serviceId;

      const productsContainer = document.getElementById("productsContainer");
      productsContainer.innerHTML = ''; // Limpiar el contenido anterior

      db.collection("products").get().then((querySnapshot) => {
        let total = 0;
        querySnapshot.forEach((productDoc) => {
          const product = productDoc.data();
          const productItem = document.createElement("div");
          productItem.className = "product-item";
          const isChecked = service.products && service.products.includes(productDoc.id);
          const productPrice = (service.prices && service.prices[productDoc.id]) || product.price; // Obtener el precio actualizado si existe
          if (isChecked) {
            total += productPrice;
          }
          productItem.innerHTML = `
            <input type="checkbox" id="product_${productDoc.id}" name="editProducts" value="${productDoc.id}" data-price="${productPrice}" ${isChecked ? 'checked' : ''}>
            <label for="product_${productDoc.id}">${product.key}</label>
            <input type="number" id="price_${productDoc.id}" name="editPrices" value="${productPrice}" min="0" step="0.01" data-original-price="${product.price}">
          `;
          productsContainer.appendChild(productItem);
        });
        updateTotal(total); // Actualizar el total inicialmente

        // Si el servicio es "Revisión", marcar productos utilizados
        if (service.serviceCategory === "Revisión") {
          markUsedProducts(service.products);
        }
      }).catch((error) => {
        console.error("Error al obtener productos: ", error);
      });

      // Rellenar otros campos del formulario con los datos del servicio
      const commentsContainer = document.getElementById("commentsContainer");
      commentsContainer.innerHTML = `<textarea id="editComments" name="editComments" rows="4">${service.comments || ''}</textarea>`;

      // Añadir el checkbox de finalizado
      const finalizedContainer = document.getElementById("finalizedContainer");
      finalizedContainer.innerHTML = `
        <label for="editFinalized">Finalizado:</label>
        <input type="checkbox" id="editFinalized" name="editFinalized" ${service.finalized ? 'checked' : ''}>
      `;

      document.getElementById("editServiceModal").style.display = "block";
    }
  }).catch((error) => {
    console.error("Error al obtener el servicio: ", error);
  });
}

// Función para marcar los productos utilizados en la revisión y actualizar el total
function markUsedProducts(usedProducts) {
  let total = 0;
  if (usedProducts && usedProducts.length > 0) {
    usedProducts.forEach(productId => {
      const productCheckbox = document.getElementById(`product_${productId}`);
      if (productCheckbox) {
        productCheckbox.checked = true;
        total += parseFloat(productCheckbox.getAttribute("data-price")) || 0;
      }
    });
  }
  updateTotal(total); // Actualizar el total al marcar los productos
}

// Función para eliminar un servicio
function deleteService(serviceId, row) {
  if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
    db.collection("voboServices").doc(serviceId).delete().then(() => {
      row.remove(); // Eliminar la fila de la tabla
    }).catch((error) => {
      console.error("Error al eliminar el servicio: ", error);
    });
  }
}

// Manejar el envío del formulario para editar servicios
const editForm = document.getElementById("editServiceForm");
editForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const id = document.getElementById("editServiceId").value;
  const selectedProducts = Array.from(document.querySelectorAll('input[name="editProducts"]:checked')).map(checkbox => checkbox.value);
  const selectedPrices = {};
  selectedProducts.forEach(productId => {
    const priceInput = document.getElementById(`price_${productId}`);
    selectedPrices[productId] = parseFloat(priceInput.value);
  });
  const total = Object.values(selectedPrices).reduce((sum, price) => sum + price, 0);
  const comments = document.getElementById("editComments").value;
  const finalized = document.getElementById("editFinalized").checked;

  const updateData = {
    products: selectedProducts,
    prices: selectedPrices,
    total: total,
    comments: comments,
    finalized: finalized
  };

  if (finalized) {
    updateData.fechaFinalizado = new Date().toISOString(); // Añadir fecha de finalización
  }

  // Actualizar el servicio en Firestore
  db.collection("services").doc(id).update(updateData).then(() => {
    // Actualizar el servicio en voboServices
    db.collection("voboServices").doc(id).update(updateData).then(() => {
      // Recargar la tabla después de guardar cambios
      loadVoBoServices();
    }).catch((error) => {
      console.error("Error al actualizar el servicio en VoBo:", error);
    });

    document.getElementById("editServiceModal").style.display = "none";
  }).catch((error) => {
    console.error("Error al actualizar el servicio:", error);
  });
});



function updateTotal(total) {
  total = parseFloat(total) || 0;
  document.getElementById("totalPrice").innerText = total.toFixed(2);
}

document.getElementById("editServiceModal").addEventListener("change", function(event) {
  if (event.target.name === "editProducts" || event.target.name === "editPrices") {
    const checkboxes = document.querySelectorAll('input[name="editProducts"]:checked');
    const total = Array.from(checkboxes).reduce((sum, checkbox) => {
      const priceInput = document.getElementById(`price_${checkbox.value}`);
      return sum + parseFloat(priceInput.value);
    }, 0);
    updateTotal(total);
  }
});

// Cerrar el modal de edición al hacer clic fuera del modal
window.onclick = function(event) {
  const editModal = document.getElementById("editServiceModal");
  if (event.target == editModal) {
    editModal.style.display = "none";
  }
};

// Cerrar el modal de edición
document.querySelector('.close-edit').addEventListener('click', function() {
  document.getElementById("editServiceModal").style.display = "none";
});

// Función para abrir el modal de No Folio y Fecha Factura y cargar productos
function openFolioModal(serviceId, folioNumber, fechaFactura, products) {
  document.getElementById("serviceId").value = serviceId;
  document.getElementById("folioNumber").value = folioNumber;
  document.getElementById("fechaFactura").value = fechaFactura;
  const productList = document.getElementById("productList");
  productList.innerHTML = '';

  if (products.length > 0) {
    console.log("Productos seleccionados para este servicio:", products);
    const promises = products.map(productId => {
      return db.collection("products").doc(productId).get().then(productDoc => {
        if (productDoc.exists) {
          const product = productDoc.data();
          const price = parseFloat(product.price); // Asegurarse de que el precio es un número
          if (isNaN(price)) {
            console.error("Precio no válido para el producto:", productId);
          } else {
            const productItem = document.createElement("div");
            productItem.className = "product-item";
            productItem.innerHTML = `<p>${product.key} - $${price.toFixed(2)}</p>`;
            productList.appendChild(productItem);
          }
        } else {
          console.error("Producto no encontrado:", productId);
        }
      }).catch(error => {
        console.error("Error al obtener producto:", productId, error);
      });
    });

    Promise.all(promises).then(() => {
      document.getElementById("folioModal").style.display = "block";
    }).catch(error => {
      console.error("Error al obtener todos los productos:", error);
    });
  } else {
    console.log("No hay productos seleccionados para este servicio.");
    document.getElementById("folioModal").style.display = "block";
  }
}
