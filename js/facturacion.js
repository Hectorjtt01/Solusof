document.addEventListener("DOMContentLoaded", function() {
  // Cargar servicios de Facturación cuando la página se carga
  loadFacturacionServices();

  document.getElementById("showFaltantes").addEventListener("click", function() {
    loadFacturacionServices('faltantes');
  });

  document.getElementById("showCompletados").addEventListener("click", function() {
    loadFacturacionServices('completados');
  });

  // Cerrar el modal de No Folio y Fecha Factura
  document.querySelector('.close-folio').addEventListener('click', function() {
    document.getElementById("folioModal").style.display = "none";
  });

  // Cerrar el modal de No Folio y Fecha Factura al hacer clic fuera del modal
  window.onclick = function(event) {
    const folioModal = document.getElementById("folioModal");
    if (event.target == folioModal) {
      folioModal.style.display = "none";
    }
  };
});

// Función para cargar los datos de Facturación desde Firestore y añadirlos a la tabla
function loadFacturacionServices(filter = '') {
  const facturacionTable = document.getElementById("facturacionTable").getElementsByTagName("tbody")[0];
  facturacionTable.innerHTML = ''; // Limpiar la tabla antes de cargar los datos

  db.collection("voboServices").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const service = doc.data();
      let shouldDisplay = true;

      // Solo mostrar servicios que estén finalizados en VoBo
      if (!service.finalized) {
        shouldDisplay = false;
      }

      if (filter === 'faltantes' && service.folioNumber) {
        shouldDisplay = false;
      } else if (filter === 'completados' && !service.folioNumber) {
        shouldDisplay = false;
      }

      if (shouldDisplay) {
        const newRow = facturacionTable.insertRow();
        newRow.setAttribute('data-id', doc.id); // Añadir el ID del servicio como atributo de datos
        newRow.insertCell(0).innerText = service.fechaFinalizado ? service.fechaFinalizado.split('T')[0] : ''; // Mostrar fecha de finalización en formato YYYY-MM-DD
        newRow.insertCell(1).innerText = service.client;
        newRow.insertCell(2).innerText = service.plate;
        newRow.insertCell(3).innerText = service.imei;
        newRow.insertCell(4).innerText = service.serviceCategory;
        newRow.insertCell(5).innerText = service.serviceType;
        newRow.insertCell(6).innerText = `$${(parseFloat(service.total) || 0).toFixed(2)}`; // Asegurarse de que total es un número
        newRow.insertCell(7).innerText = service.folioNumber || '';
        newRow.insertCell(8).innerText = service.fechaFactura || '';

        // Columna de acciones
        const actionsCell = newRow.insertCell(9);
        const editButton = document.createElement('button');
        editButton.className = 'btn-edit';
        const editIcon = document.createElement('span');
        editIcon.className = 'material-icons-outlined';
        editIcon.innerText = 'edit';
        editButton.appendChild(editIcon);
        editButton.onclick = () => openFolioModal(doc.id, service.folioNumber || '', service.fechaFactura || '', service.products || []);
        actionsCell.appendChild(editButton);
      }
    });
  }).catch((error) => {
    console.error("Error al cargar los servicios de Facturación: ", error);
  });
}


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

// Manejar el envío del formulario de No Folio y Fecha Factura
const folioForm = document.getElementById("folioForm");
folioForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const serviceId = document.getElementById("serviceId").value;
  const folioNumber = document.getElementById("folioNumber").value;
  const fechaFactura = document.getElementById("fechaFactura").value;

  // Actualizar el No Folio y la Fecha Factura en Firestore
  db.collection("voboServices").doc(serviceId).update({
    folioNumber: folioNumber,
    fechaFactura: fechaFactura
  }).then(() => {
    // Recargar la tabla después de guardar cambios
    loadFacturacionServices();
    document.getElementById("folioModal").style.display = "none";
  }).catch((error) => {
    console.error("Error al actualizar el No Folio y la Fecha Factura:", error);
  });
});
