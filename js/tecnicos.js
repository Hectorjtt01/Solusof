// Abrir y cerrar el modal para añadir técnicos
const addModal = document.getElementById("addTechnicianModal");
const addBtn = document.getElementById("addTechnicianBtn");
const addSpan = document.getElementsByClassName("close")[0];

addBtn.onclick = function() {
  // Limpiar los campos del formulario
  document.getElementById("technicianName").value = "";
  document.getElementById("technicianPhone").value = "";
  document.getElementById("technicianPhone2").value = "";
  document.getElementById("technicianAddress").value = "";
  document.getElementById("technicianZone").value = "";
  document.getElementById("technicianComments").value = ""; // Limpiar comentarios

  // Mostrar el modal
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

// Abrir y cerrar el modal para editar técnicos
const editModal = document.getElementById("editTechnicianModal");
const editSpan = document.getElementsByClassName("close-edit")[0];

editSpan.onclick = function() {
  editModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == editModal) {
    editModal.style.display = "none";
  }
}

// Manejar el envío del formulario para añadir técnicos
const addForm = document.getElementById("addTechnicianForm");
addForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("technicianName").value;
  const phone = document.getElementById("technicianPhone").value;
  const phone2 = document.getElementById("technicianPhone2").value;
  const address = document.getElementById("technicianAddress").value;
  const zone = document.getElementById("technicianZone").value;
  const comments = document.getElementById("technicianComments").value; // Capturar comentarios

  // Añadir el técnico a Firestore
  db.collection("technicians").add({
    name, phone, phone2, address, zone, comments // Añadir comentarios al objeto
  }).then((docRef) => {
    // Añadir el técnico a la tabla
    addTechnicianToTable(docRef.id, name, phone, phone2, zone);
    // Cerrar el modal
    addModal.style.display = "none";
  }).catch((error) => {
    console.error("Error al añadir el técnico: ", error);
  });
});

// Manejar el envío del formulario para editar técnicos
const editForm = document.getElementById("editTechnicianForm");
editForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const id = document.getElementById("editTechnicianId").value;
  const name = document.getElementById("editTechnicianName").value;
  const phone = document.getElementById("editTechnicianPhone").value;
  const phone2 = document.getElementById("editTechnicianPhone2").value;
  const address = document.getElementById("editTechnicianAddress").value;
  const zone = document.getElementById("editTechnicianZone").value;
  const comments = document.getElementById("editTechnicianComments").value; // Capturar comentarios

  // Actualizar el técnico en Firestore
  db.collection("technicians").doc(id).update({
    name, phone, phone2, address, zone, comments // Añadir comentarios al objeto
  }).then(() => {
    // Actualizar la tabla
    updateTechnicianInTable(id, name, phone, phone2, zone);
    // Cerrar el modal
    editModal.style.display = "none";
  }).catch((error) => {
    console.error("Error al actualizar el técnico: ", error);
  });
});

// Función para añadir un técnico a la tabla
function addTechnicianToTable(id, name, phone, phone2, zone) {
  const table = document.getElementById("techniciansTable").getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();
  newRow.setAttribute('data-id', id);
  newRow.insertCell(0).innerText = table.rows.length;
  newRow.insertCell(1).innerText = name;
  newRow.insertCell(2).innerText = phone;
  newRow.insertCell(3).innerText = phone2;
  newRow.insertCell(4).innerText = zone; // Ajusta el índice
  const actionsCell = newRow.insertCell(5); // Ajusta el índice
  appendActions(actionsCell, id);
}

// Función para actualizar un técnico en la tabla
function updateTechnicianInTable(id, name, phone, phone2, zone) {
  const row = document.querySelector(`tr[data-id='${id}']`);
  row.cells[1].innerText = name;
  row.cells[2].innerText = phone;
  row.cells[3].innerText = phone2;
  row.cells[4].innerText = zone; // Ajusta el índice
}

// Función para añadir botones de acciones
function appendActions(cell, id) {
  const editButton = document.createElement('button');
  editButton.className = 'btn-edit';
  editButton.innerHTML = '<span class="material-icons-outlined">edit</span>';
  editButton.onclick = () => openEditModal(id);
  cell.appendChild(editButton);

  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn-delete';
  deleteButton.innerHTML = '<span class="material-icons-outlined">delete</span>';
  deleteButton.onclick = () => deleteTechnician(id);
  cell.appendChild(deleteButton);
}

// Función para abrir el modal de edición con la información actual
function openEditModal(id) {
  db.collection("technicians").doc(id).get().then((doc) => {
    if (doc.exists) {
      const technician = doc.data();
      document.getElementById("editTechnicianId").value = id;
      document.getElementById("editTechnicianName").value = technician.name;
      document.getElementById("editTechnicianPhone").value = technician.phone;
      document.getElementById("editTechnicianPhone2").value = technician.phone2;
      document.getElementById("editTechnicianAddress").value = technician.address;
      document.getElementById("editTechnicianZone").value = technician.zone;
      document.getElementById("editTechnicianComments").value = technician.comments || ""; // Cargar comentarios
      editModal.style.display = "block";
    }
  }).catch((error) => {
    console.error("Error al obtener el técnico: ", error);
  });
}

// Función para eliminar un técnico
function deleteTechnician(id) {
  if (confirm("¿Estás seguro de que quieres eliminar este técnico?")) {
    db.collection("technicians").doc(id).delete().then(() => {
      document.querySelector(`tr[data-id='${id}']`).remove();
    }).catch((error) => {
      console.error("Error al eliminar el técnico: ", error);
    });
  }
}

// Cargar los técnicos de Firebase Firestore y mostrarlos en la tabla
function loadTechnicians() {
  db.collection("technicians").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const technician = doc.data();
      // No pasamos el 'address' ni 'comments' a la función de la tabla
      addTechnicianToTable(doc.id, technician.name, technician.phone, technician.phone2, technician.zone);
    });
  }).catch((error) => {
    console.error("Error al obtener los técnicos: ", error);
  });
}

// Cargar los técnicos al cargar la página
window.onload = loadTechnicians;
