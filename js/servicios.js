// Abrir y cerrar el modal para añadir servicio
const modal = document.getElementById("addServiceModal");
const btn = document.getElementById("addServiceBtn");
const span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  resetAddServiceModal(); // Llamar a la función para resetear el modal
  modal.style.display = "block";
  loadDropdowns();
  loadServiceTypesDropdown(); // Cargar tipos de servicio
} 

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Abrir y cerrar el modal para editar servicio
const editModal = document.getElementById("editServiceModal");
const closeEditSpan = document.getElementsByClassName("close-edit")[0];

closeEditSpan.onclick = function() {
  editModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == editModal) {
    editModal.style.display = "none";
  }
}

// Función para resetear el modal de añadir servicio
function resetAddServiceModal() {
  document.getElementById("addServiceForm").reset(); // Resetear el formulario
  document.getElementById("serviceProducts").innerHTML = ''; // Limpiar contenedor de productos
  document.getElementById("additionalFields").innerHTML = ''; // Limpiar campos adicionales
  document.getElementById("commentsField").innerHTML = ''; // Limpiar comentarios
}

// Cargar datos en los desplegables
function loadDropdowns() {
  const sopAttendedDropdown = document.getElementById("sopAttended");
  const technicianDropdown = document.getElementById("technician");
  const userReportDropdown = document.getElementById("userReport");

  // Limpiar los dropdowns
  sopAttendedDropdown.innerHTML = '<option value="">Seleccione SOP</option>';
  technicianDropdown.innerHTML = '<option value="">Seleccione Técnico</option>';
  userReportDropdown.innerHTML = '<option value="">Seleccione Usuario</option><option value="N/A">N/A</option>'; // Añadir opción N/A

  // Cargar usuarios en sopAttended y userReport
  db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      const option = document.createElement("option");
      option.value = user.name;
      option.text = user.name;
      sopAttendedDropdown.add(option.cloneNode(true));
      userReportDropdown.add(option);
    });
  });

  // Cargar técnicos en technician
  db.collection("technicians").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const technician = doc.data();
      const option = document.createElement("option");
      option.value = technician.name;
      option.text = technician.name;
      technicianDropdown.add(option);
    });
  });
}

function loadServiceTypesDropdown() {
  const serviceTypeDropdown = document.getElementById("serviceType");
  serviceTypeDropdown.innerHTML = '<option value="">Seleccione Tipo de Servicio</option>'; // Añadir opción en blanco

  db.collection("serviceTypes").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const serviceType = doc.data();
      const option = document.createElement("option");
      option.value = doc.id;
      option.text = serviceType.name;
      serviceTypeDropdown.add(option);
    });

    // Añadir evento para mostrar productos cuando se seleccione un tipo de servicio
    serviceTypeDropdown.addEventListener("change", function() {
      showServiceProducts(this.value);
    });
  }).catch((error) => {
    console.error("Error al cargar los tipos de servicio: ", error);
  });
}

function showServiceProducts(serviceTypeId) {
  const serviceProductsContainer = document.getElementById("serviceProducts");
  serviceProductsContainer.innerHTML = ''; // Limpiar contenedor

  if (serviceTypeId) {
    db.collection("serviceTypes").doc(serviceTypeId).get().then((doc) => {
      if (doc.exists) {
        const products = doc.data().products;
        const productList = Object.keys(products).map(key => {
          return `<p>${products[key].key} (${products[key].quantity})</p>`;
        }).join("");
        serviceProductsContainer.innerHTML = productList;
      }
    }).catch((error) => {
      console.error("Error al obtener los productos del tipo de servicio: ", error);
    });
  }
}

document.getElementById("serviceCategory").addEventListener("change", function() {
  const additionalFields = document.getElementById("additionalFields");
  const commentsField = document.getElementById("commentsField");
  const productListContainer = document.getElementById("productListContainer");
  additionalFields.innerHTML = ''; // Limpiar campos adicionales
  commentsField.innerHTML = ''; // Limpiar comentarios
  productListContainer.innerHTML = ''; // Limpiar productos utilizados

  if (this.value === "Revisión") {
    const causaRevGroup = document.createElement("div");
    causaRevGroup.className = "input-group";
    causaRevGroup.innerHTML = 
      `<label for="causaRev">Causa Rev:</label>
      <select id="causaRev" name="causaRev">
        <option value="Revisión General">Revisión General</option>
        <option value="Falla accesorio">Falla accesorio</option>
        <option value="Bloqueo movimiento">Bloqueo movimiento</option>
        <option value="Re activación">Re activación</option>
      </select>`;
    additionalFields.appendChild(causaRevGroup);

    const commentsGroup = document.createElement("div");
    commentsGroup.className = "input-group revision-comments";
    commentsGroup.innerHTML = 
      `<label for="comments">Comentarios:</label>
      <textarea id="comments" name="comments" rows="4"></textarea>`;
    commentsField.appendChild(commentsGroup);

    // Cargar y mostrar productos utilizados
    loadProducts().then(products => {
      const productList = document.createElement("div");
      productList.className = "input-group product-list"; // Añadir la clase product-list aquí
      productList.innerHTML = '<label>Productos Utilizados:</label>';
      products.forEach(product => {
        const productItem = document.createElement("div");
        productItem.className = "product-item";
        productItem.innerHTML = 
          `<input type="checkbox" id="product_${product.id}" name="products" value="${product.id}">
          <label for="product_${product.id}">${product.name}</label>`;
        productList.appendChild(productItem);
      });
      productListContainer.appendChild(productList);
    }).catch(error => {
      console.error("Error al cargar productos: ", error);
    });
  } else if (this.value === "Desinstalación") {
    const causaDesGroup = document.createElement("div");
    causaDesGroup.className = "input-group";
    causaDesGroup.innerHTML = 
      `<label for="causaDes">Causa Des:</label>
      <select id="causaDes" name="causaDes">
        <option value="Cambio equipo unidad">Cambio equipo unidad</option>
        <option value="Venta unidad">Venta unidad</option>
        <option value="Siniestro">Siniestro</option>
        <option value="Baja Servicio">Baja Servicio</option>
        <option value="Adeudo">Adeudo</option>
      </select>`;
    additionalFields.appendChild(causaDesGroup);

    const commentsGroup = document.createElement("div");
    commentsGroup.className = "input-group desinstalacion-comments";
    commentsGroup.innerHTML = 
      `<label for="commentsDes">Comentarios:</label>
      <textarea id="commentsDes" name="commentsDes" rows="4"></textarea>`;
    commentsField.appendChild(commentsGroup);
  }
});

// Función para cargar y mostrar productos utilizados
function loadProducts() {
  return db.collection("products").get().then(querySnapshot => {
    const products = [];
    querySnapshot.forEach(doc => {
      products.push({ id: doc.id, name: doc.data().key }); // Aquí se asume que 'key' es el nombre del producto
    });
    return products;
  });
}

// Función para manejar el envío del formulario para añadir servicio
const form = document.getElementById("addServiceForm");
form.addEventListener("submit", function(event) {
  event.preventDefault();

  const serviceCategory = document.getElementById("serviceCategory").value;
  const serviceType = document.getElementById("serviceType").value;
  const sopAttended = document.getElementById("sopAttended").value;
  const technician = document.getElementById("technician").value;
  const userReport = document.getElementById("userReport").value;
  const coordinated = document.getElementById("coordinated").value;

  if (!serviceCategory || !serviceType || !sopAttended || !technician || !userReport || !coordinated) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  const captureDate = document.getElementById("captureDate").value;
  const serviceDate = document.getElementById("serviceDate").value;
  const client = document.getElementById("client").value;
  const imei = document.getElementById("imei").value;
  const plate = document.getElementById("plate").value;
  const truperNew = document.getElementById("truperNew").checked;
  const equipment = document.getElementById("equipment").value;
  const module = document.getElementById("module").value;
  const repSent = document.getElementById("repSent").checked;
  const repSentDate = repSent ? getCurrentDate() : null;
  const causaRev = serviceCategory === "Revisión" ? document.getElementById("causaRev") ? document.getElementById("causaRev").value : null : null;
  const causaDes = serviceCategory === "Desinstalación" ? document.getElementById("causaDes") ? document.getElementById("causaDes").value : null : null;
  const comments = serviceCategory === "Revisión" ? document.getElementById("comments") ? document.getElementById("comments").value : null : document.getElementById("commentsDes") ? document.getElementById("commentsDes").value : null;

  // Obtener productos seleccionados
  const selectedProducts = Array.from(document.querySelectorAll('input[name="products"]:checked')).map(checkbox => checkbox.value);

  // Añadir el servicio a Firestore
  db.collection("services").add({
    serviceCategory: serviceCategory,
    serviceType: serviceType,
    captureDate: captureDate,
    serviceDate: serviceDate,
    sopAttended: sopAttended,
    technician: technician,
    client: client,
    imei: imei,
    plate: plate,
    truperNew: truperNew,
    equipment: equipment,
    module: module,
    userReport: userReport,
    repSent: repSent,
    coordinated: coordinated,
    repSentDate: repSentDate,
    causaRev: causaRev,
    causaDes: causaDes,
    comments: comments,
    products: selectedProducts // Añadir productos utilizados
  }).then((docRef) => {
    addServiceToTable(docRef.id, captureDate, serviceDate, sopAttended, technician, client, imei, plate, truperNew, equipment, module, userReport, repSent, coordinated);
    modal.style.display = "none";
    
    // Si se seleccionó "Rep Enviado", enviar datos a la página VoBo
    if (repSent) {
      // Obtener los nombres de serviceCategory y serviceType
      const serviceTypeNamePromise = db.collection("serviceTypes").doc(serviceType).get().then(doc => doc.exists ? doc.data().name : serviceType);
      
      Promise.all([serviceTypeNamePromise]).then(([serviceTypeName]) => {
        sendDataToVoBo(docRef.id, {
          date: repSentDate,
          client: client,
          plate: plate,
          imei: imei,
          serviceType: serviceTypeName, // Enviar el nombre del tipo de servicio
          coordinated: coordinated,
          serviceCategory: serviceCategory // Enviar la categoría del servicio
        });
      }).catch((error) => {
        console.error("Error al enviar datos a VoBo: ", error);
      });
    }
  }).catch((error) => {
    console.error("Error al añadir el servicio: ", error);
  });
});

// Función para añadir un servicio a la tabla
function addServiceToTable(id, captureDate, serviceDate, sopAttended, technician, client, imei, plate, truperNew, equipment, module, userReport, repSent, coordinated) {
  const table = document.getElementById("servicesTable").getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();
  newRow.setAttribute('data-id', id); // Añade el ID del servicio como un atributo de datos
  newRow.insertCell(0).innerText = table.rows.length;
  newRow.insertCell(1).innerText = captureDate;
  newRow.insertCell(2).innerText = serviceDate;
  newRow.insertCell(3).innerText = sopAttended;
  newRow.insertCell(4).innerText = technician;
  newRow.insertCell(5).innerText = client;
  newRow.insertCell(6).innerText = imei;
  newRow.insertCell(7).innerText = plate;
  newRow.insertCell(8).innerText = truperNew ? "Sí" : "No";
  newRow.insertCell(9).innerText = equipment;
  newRow.insertCell(10).innerText = module;
  newRow.insertCell(11).innerText = userReport;
  newRow.insertCell(12).innerText = coordinated;
  newRow.insertCell(13).innerText = repSent ? "Sí" : "No";
  const actionsCell = newRow.insertCell(14);

  const editButton = document.createElement('button');
  editButton.className = 'btn-edit';
  const editIcon = document.createElement('span');
  editIcon.className = 'material-icons-outlined';
  editIcon.innerText = 'edit';
  editButton.appendChild(editIcon);
  editButton.addEventListener('click', function() {
    openEditModal(id);
  });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn-delete';
  const deleteIcon = document.createElement('span');
  deleteIcon.className = 'material-icons-outlined';
  deleteIcon.innerText = 'delete';
  deleteButton.appendChild(deleteIcon);
  deleteButton.addEventListener('click', function() {
    deleteService(id, newRow);
  });

  actionsCell.appendChild(editButton);
  actionsCell.appendChild(deleteButton);
}

// Función para actualizar una fila en la tabla
function updateTableRow(id, captureDate, serviceDate, sopAttended, technician, client, imei, plate, truperNew, equipment, module, userReport, repSent, coordinated) {
  const row = document.querySelector(`tr[data-id='${id}']`);
  row.cells[1].innerText = captureDate;
  row.cells[2].innerText = serviceDate;
  row.cells[3].innerText = sopAttended;
  row.cells[4].innerText = technician;
  row.cells[5].innerText = client;
  row.cells[6].innerText = imei;
  row.cells[7].innerText = plate;
  row.cells[8].innerText = truperNew ? "Sí" : "No";
  row.cells[9].innerText = equipment;
  row.cells[10].innerText = module;
  row.cells[11].innerText = userReport;
  row.cells[12].innerText = coordinated;
  row.cells[13].innerText = repSent ? "Sí" : "No";
}

// Función para abrir el modal de edición con la información del servicio
function openEditModal(id) {
  db.collection("services").doc(id).get().then((doc) => {
    if (doc.exists) {
      const service = doc.data();
      document.getElementById("editServiceId").value = id;
      document.getElementById("editCaptureDate").value = service.captureDate;
      document.getElementById("editServiceDate").value = service.serviceDate;
      document.getElementById("editServiceCategory").value = service.serviceCategory;
      document.getElementById("editServiceType").value = service.serviceType; // Mostrar tipo de servicio
      document.getElementById("editTechnician").value = service.technician;
      document.getElementById("editClient").value = service.client;
      document.getElementById("editImei").value = service.imei;
      document.getElementById("editPlate").value = service.plate;
      document.getElementById("editTruperNew").checked = service.truperNew;
      document.getElementById("editEquipment").value = service.equipment;
      document.getElementById("editModule").value = service.module;
      document.getElementById("editUserReport").value = service.userReport;
      document.getElementById("editRepSent").checked = service.repSent;
      document.getElementById("editCoordinated").value = service.coordinated;

      // Mostrar campos adicionales si el servicio es de tipo "Revisión" o "Desinstalación"
      const editAdditionalFields = document.getElementById("editAdditionalFields");
      const editCommentsField = document.getElementById("editCommentsField");
      const editProductListContainer = document.getElementById("editProductListContainer");
      editAdditionalFields.innerHTML = ''; // Limpiar campos adicionales
      editCommentsField.innerHTML = ''; // Limpiar comentarios
      editProductListContainer.innerHTML = ''; // Limpiar productos utilizados

      if (service.serviceCategory === "Revisión") {
        const causaRevGroup = document.createElement("div");
        causaRevGroup.className = "input-group";
        causaRevGroup.innerHTML = `
          <label for="editCausaRev">Causa Rev:</label>
          <select id="editCausaRev" name="editCausaRev">
            <option value="Revisión General">Revisión General</option>
            <option value="Falla accesorio">Falla accesorio</option>
            <option value="Bloqueo movimiento">Bloqueo movimiento</option>
            <option value="Re activación">Re activación</option>
          </select>
        `;
        editAdditionalFields.appendChild(causaRevGroup);
        document.getElementById("editCausaRev").value = service.causaRev || "";

        const commentsGroup = document.createElement("div");
        commentsGroup.className = "input-group revision-comments";
        commentsGroup.innerHTML = `
          <label for="editComments">Comentarios:</label>
          <textarea id="editComments" name="editComments" rows="4">${service.comments || ""}</textarea>
        `;
        editCommentsField.appendChild(commentsGroup);

        // Cargar y mostrar productos utilizados
        loadProducts().then(products => {
          const productList = document.createElement("div");
          productList.className = "input-group product-list"; // Añadir la clase product-list aquí
          productList.innerHTML = '<label>Productos Utilizados:</label>';
          products.forEach(product => {
            const productItem = document.createElement("div");
            productItem.className = "product-item";
            productItem.innerHTML = `
              <input type="checkbox" id="edit_product_${product.id}" name="editProducts" value="${product.id}" ${service.products.includes(product.id) ? 'checked' : ''}>
              <label for="edit_product_${product.id}">${product.name}</label>
            `;
            productList.appendChild(productItem);
          });
          editProductListContainer.appendChild(productList);
        }).catch(error => {
          console.error("Error al cargar productos: ", error);
        });
      } else if (service.serviceCategory === "Desinstalación") {
        const causaDesGroup = document.createElement("div");
        causaDesGroup.className = "input-group";
        causaDesGroup.innerHTML = `
          <label for="editCausaDes">Causa Des:</label>
          <select id="editCausaDes" name="editCausaDes">
            <option value="Cambio equipo unidad">Cambio equipo unidad</option>
            <option value="Venta unidad">Venta unidad</option>
            <option value="Siniestro">Siniestro</option>
            <option value="Baja Servicio">Baja Servicio</option>
            <option value="Adeudo">Adeudo</option>
          </select>
        `;
        editAdditionalFields.appendChild(causaDesGroup);
        document.getElementById("editCausaDes").value = service.causaDes || "";

        const commentsGroup = document.createElement("div");
        commentsGroup.className = "input-group desinstalacion-comments";
        commentsGroup.innerHTML = `
          <label for="editCommentsDes">Comentarios:</label>
          <textarea id="editCommentsDes" name="editCommentsDes" rows="4">${service.comments || ""}</textarea>
        `;
        editCommentsField.appendChild(commentsGroup);
      }

      const repSentDateContainer = document.getElementById("editRepSentDateContainer");
      const repSentDate = service.repSent ? service.repSentDate : "";
      document.getElementById("editRepSentDate").innerText = repSentDate;
      repSentDateContainer.style.display = service.repSent ? "block" : "none";

      // Cargar las opciones de los dropdowns y establecer las seleccionadas
      loadEditDropdowns(service.sopAttended, service.technician, service.userReport, service.coordinated);

      loadEditServiceTypesDropdown(service.serviceType); // Cargar tipos de servicio
      editModal.style.display = "block";
    }
  }).catch((error) => {
    console.error("Error al obtener el servicio: ", error);
  });
}

// Cargar datos en los desplegables de edición
function loadEditDropdowns(selectedSopAttended, selectedTechnician, selectedUserReport, selectedCoordinated) {
  const editSopAttendedDropdown = document.getElementById("editSopAttended");
  const editTechnicianDropdown = document.getElementById("editTechnician");
  const editUserReportDropdown = document.getElementById("editUserReport");
  const editCoordinatedDropdown = document.getElementById("editCoordinated");

  // Limpiar los dropdowns
  editSopAttendedDropdown.innerHTML = '';
  editTechnicianDropdown.innerHTML = '';
  editUserReportDropdown.innerHTML = '<option value="N/A">N/A</option>'; // Añadir opción N/A
  editCoordinatedDropdown.innerHTML = '';

  // Cargar usuarios en editSopAttended y editUserReport
  db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      const option = document.createElement("option");
      option.value = user.name;
      option.text = user.name;
      if (user.name === selectedSopAttended) {
        option.selected = true;
      }
      editSopAttendedDropdown.add(option.cloneNode(true));
      if (user.name === selectedUserReport) {
        option.selected = true;
      }
      editUserReportDropdown.add(option);
    });
  });

  // Cargar técnicos en editTechnician
  db.collection("technicians").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const technician = doc.data();
      const option = document.createElement("option");
      option.value = technician.name;
      option.text = technician.name;
      if (technician.name === selectedTechnician) {
        option.selected = true;
      }
      editTechnicianDropdown.add(option);
    });
  });

  // Cargar opciones en editCoordinated
  const coordinatedOptions = ["Hector", "Victor", "Soporte"];
  coordinatedOptions.forEach((coordinated) => {
    const option = document.createElement("option");
    option.value = coordinated;
    option.text = coordinated;
    if (coordinated === selectedCoordinated) {
      option.selected = true;
    }
    editCoordinatedDropdown.add(option);
  });
}

// Cargar tipos de servicio en el modal de edición
function loadEditServiceTypesDropdown(selectedServiceType) {
  const editServiceTypeDropdown = document.getElementById("editServiceType");
  editServiceTypeDropdown.innerHTML = '<option value="">Seleccione Tipo de Servicio</option>'; // Añadir opción en blanco

  db.collection("serviceTypes").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const serviceType = doc.data();
      const option = document.createElement("option");
      option.value = doc.id;
      option.text = serviceType.name;
      if (doc.id === selectedServiceType) {
        option.selected = true;
      }
      editServiceTypeDropdown.add(option);
    });
  }).catch((error) => {
    console.error("Error al cargar los tipos de servicio: ", error);
  });
}

// Manejar el envío del formulario para editar servicio
const editForm = document.getElementById("editServiceForm");
editForm.addEventListener("submit", function(event) {
  event.preventDefault();

  // Validar que ningún campo select esté en blanco
  const serviceCategory = document.getElementById("editServiceCategory").value;
  const serviceType = document.getElementById("editServiceType").value;
  const sopAttended = document.getElementById("editSopAttended").value;
  const technician = document.getElementById("editTechnician").value;
  const userReport = document.getElementById("editUserReport").value;
  const coordinated = document.getElementById("editCoordinated").value;

  if (!serviceCategory || !serviceType || !sopAttended || !technician || !userReport || !coordinated) {
    alert("Por favor, complete todos los campos obligatorios.");
    return;
  }

  const id = document.getElementById("editServiceId").value;
  const captureDate = document.getElementById("editCaptureDate").value;
  const serviceDate = document.getElementById("editServiceDate").value;
  const client = document.getElementById("editClient").value;
  const imei = document.getElementById("editImei").value;
  const plate = document.getElementById("editPlate").value;
  const truperNew = document.getElementById("editTruperNew").checked;
  const equipment = document.getElementById("editEquipment").value;
  const module = document.getElementById("editModule").value;
  const repSent = document.getElementById("editRepSent").checked;
  const repSentDate = repSent ? getCurrentDate() : null;
  const causaRev = serviceCategory === "Revisión" ? document.getElementById("editCausaRev") ? document.getElementById("editCausaRev").value : null : null;
  const causaDes = serviceCategory === "Desinstalación" ? document.getElementById("editCausaDes") ? document.getElementById("editCausaDes").value : null : null;
  const comments = serviceCategory === "Revisión" ? document.getElementById("editComments") ? document.getElementById("editComments").value : null : document.getElementById("editCommentsDes") ? document.getElementById("editCommentsDes").value : null;

  // Obtener productos seleccionados
  const selectedProducts = Array.from(document.querySelectorAll('input[name="editProducts"]:checked')).map(checkbox => checkbox.value);

  // Actualizar el servicio en Firestore
  db.collection("services").doc(id).update({
    serviceCategory: serviceCategory,
    serviceType: serviceType,
    captureDate: captureDate,
    serviceDate: serviceDate,
    sopAttended: sopAttended,
    technician: technician,
    client: client,
    imei: imei,
    plate: plate,
    truperNew: truperNew,
    equipment: equipment,
    module: module,
    userReport: userReport,
    repSent: repSent,
    coordinated: coordinated,
    repSentDate: repSentDate,
    causaRev: causaRev,
    causaDes: causaDes,
    comments: comments,
    products: selectedProducts // Añadir productos utilizados
  }).then(() => {
    // Actualizar la fila en la tabla
    updateTableRow(id, captureDate, serviceDate, sopAttended, technician, client, imei, plate, truperNew, equipment, module, userReport, repSent, coordinated);
    
    // Si se seleccionó "Rep Enviado", enviar datos a la página VoBo
    if (repSent) {
      // Obtener los nombres de serviceCategory y serviceType
      const serviceTypeNamePromise = db.collection("serviceTypes").doc(serviceType).get().then(doc => doc.exists ? doc.data().name : serviceType);

      Promise.all([serviceTypeNamePromise]).then(([serviceTypeName]) => {
        sendDataToVoBo(id, {
          date: repSentDate,
          client: client,
          plate: plate,
          imei: imei,
          serviceType: serviceTypeName, // Enviar el nombre del tipo de servicio
          coordinated: coordinated,
          serviceCategory: serviceCategory // Enviar la categoría del servicio
        });
      }).catch((error) => {
        console.error("Error al enviar datos a VoBo: ", error);
      });
    } else {
      // Si "Rep Enviado" está desmarcado, eliminar el servicio de VoBo
      removeDataFromVoBo(id);
    }

    // Cerrar el modal
    editModal.style.display = "none";
  }).catch((error) => {
    console.error("Error al actualizar el servicio: ", error);
  });
});

/*  Boton delete funcionar
function deleteService(id, row) {
  if (confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
    db.collection("services").doc(id).delete().then(() => {
      row.remove();
      removeDataFromVoBo(id); // Eliminar el servicio de VoBo si existe
    }).catch((error) => {
      console.error("Error al eliminar el servicio: ", error);
    });
  }
}
*/


// Función para cargar los servicios desde Firestore y añadirlos a la tabla
function loadServices(filter = null) {
  const servicesTable = document.getElementById("servicesTable").getElementsByTagName("tbody")[0];
  servicesTable.innerHTML = ''; // Limpiar la tabla antes de cargar los datos

  const uniqueServices = new Set();

  db.collection("services").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const service = doc.data();
      const uniqueId = `${service.captureDate}-${service.serviceDate}-${service.client}-${service.imei}`;

      if (!uniqueServices.has(uniqueId)) {
        uniqueServices.add(uniqueId);

        if (filter === 'faltantes' && service.repSent) return;
        if (filter === 'completados' && !service.repSent) return;

        addServiceToTable(
          doc.id,
          service.captureDate,
          service.serviceDate,
          service.sopAttended,
          service.technician,
          service.client,
          service.imei,
          service.plate,
          service.truperNew,
          service.equipment,
          service.module,
          service.userReport,
          service.repSent,
          service.coordinated
        );
      }
    });
  }).catch((error) => {
    console.error("Error al cargar los servicios: ", error);
  });
}

// Función para añadir un servicio a la tabla
function addServiceToTable(id, captureDate, serviceDate, sopAttended, technician, client, imei, plate, truperNew, equipment, module, userReport, repSent, coordinated) {
  const table = document.getElementById("servicesTable").getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();
  newRow.setAttribute('data-id', id); // Añade el ID del servicio como un atributo de datos
  newRow.insertCell(0).innerText = table.rows.length;
  newRow.insertCell(1).innerText = captureDate;
  newRow.insertCell(2).innerText = serviceDate;
  newRow.insertCell(3).innerText = sopAttended;
  newRow.insertCell(4).innerText = technician;
  newRow.insertCell(5).innerText = client;
  newRow.insertCell(6).innerText = imei;
  newRow.insertCell(7).innerText = plate;
  newRow.insertCell(8).innerText = truperNew ? "Sí" : "No";
  newRow.insertCell(9).innerText = equipment;
  newRow.insertCell(10).innerText = module;
  newRow.insertCell(11).innerText = userReport;
  newRow.insertCell(12).innerText = coordinated;
  newRow.insertCell(13).innerText = repSent ? "Sí" : "No";
  const actionsCell = newRow.insertCell(14);

  const editButton = document.createElement('button');
  editButton.className = 'btn-edit';
  const editIcon = document.createElement('span');
  editIcon.className = 'material-icons-outlined';
  editIcon.innerText = 'edit';
  editButton.appendChild(editIcon);
  editButton.addEventListener('click', function() {
    openEditModal(id);
  });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn-delete';
  const deleteIcon = document.createElement('span');
  deleteIcon.className = 'material-icons-outlined';
  deleteIcon.innerText = 'delete';
  deleteButton.appendChild(deleteIcon);
  deleteButton.addEventListener('click', function() {
    deleteService(id, newRow);
  });

  actionsCell.appendChild(editButton);
  actionsCell.appendChild(deleteButton);
}

// Cargar servicios cuando la página se carga
document.addEventListener("DOMContentLoaded", function() {
  loadServices();

  // Agregar eventos para los botones de filtro
  document.getElementById("showFaltantes").addEventListener("click", function() {
    loadServices('faltantes');
  });

  document.getElementById("showCompletados").addEventListener("click", function() {
    loadServices('completados');
  });
});

// Función para obtener la fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  


// Función para enviar datos a la página VoBo
function sendDataToVoBo(serviceId, serviceData) {
  db.collection("voboServices").doc(serviceId).set(serviceData).then(() => {
    console.log("Datos enviados a VoBo correctamente.");
  }).catch((error) => {
    console.error("Error al enviar datos a VoBo: ", error);
  });
}

// Función para eliminar datos de la página VoBo
function removeDataFromVoBo(serviceId) {
  db.collection("voboServices").doc(serviceId).delete().then(() => {
    console.log("Datos eliminados de VoBo correctamente.");
  }).catch((error) => {
    console.error("Error al eliminar datos de VoBo: ", error);
  });
}
