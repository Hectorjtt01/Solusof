// Abrir y cerrar el modal para añadir técnicos
const addModal = document.getElementById("addTechnicianModal");
const addBtn = document.getElementById("addTechnicianBtn");
const addSpan = document.getElementsByClassName("close")[0];

addBtn.onclick = function() {
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
  const zone = document.getElementById("technicianZone").value;

  // Añadir el técnico a Firestore
  db.collection("technicians").add({
    name: name,
    phone: phone,
    zone: zone
  }).then((docRef) => {
    // Añadir el técnico a la tabla
    addTechnicianToTable(docRef.id, name, phone, zone);
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
  const zone = document.getElementById("editTechnicianZone").value;

  // Actualizar el técnico en Firestore
  db.collection("technicians").doc(id).update({
    name: name,
    phone: phone,
    zone: zone
  }).then(() => {
    // Actualizar la tabla
    const row = document.querySelector(`tr[data-id='${id}']`);
    row.cells[1].innerText = name;
    row.cells[2].innerText = phone;
    row.cells[3].innerText = zone;
    // Cerrar el modal
    editModal.style.display = "none";
  }).catch((error) => {
    console.error("Error al actualizar el técnico: ", error);
  });
});

// Función para añadir un técnico a la tabla
function addTechnicianToTable(id, name, phone, zone) {
  const table = document.getElementById("techniciansTable").getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();
  newRow.setAttribute('data-id', id); // Añade el ID del técnico como un atributo de datos
  newRow.insertCell(0).innerText = table.rows.length;
  newRow.insertCell(1).innerText = name;
  newRow.insertCell(2).innerText = phone;
  newRow.insertCell(3).innerText = zone;
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
    deleteTechnician(id, newRow);
  });
  actionsCell.appendChild(deleteButton);
}

// Función para abrir el modal de edición con la información actual
function openEditModal(id) {
  db.collection("technicians").doc(id).get().then((doc) => {
    if (doc.exists) {
      const technician = doc.data();
      document.getElementById("editTechnicianId").value = id;
      document.getElementById("editTechnicianName").value = technician.name;
      document.getElementById("editTechnicianPhone").value = technician.phone;
      document.getElementById("editTechnicianZone").value = technician.zone;
      editModal.style.display = "block";
    }
  }).catch((error) => {
    console.error("Error al obtener el técnico: ", error);
  });
}

// Función para eliminar un técnico
function deleteTechnician(id, row) {
  if (confirm("¿Estás seguro de que quieres eliminar este técnico?")) {
    db.collection("technicians").doc(id).delete().then(() => {
      row.remove(); // Elimina la fila de la tabla
      console.log("Técnico eliminado con éxito");
    }).catch((error) => {
      console.error("Error al eliminar el técnico: ", error);
    });
  }
}

// Cargar los técnicos de Firebase Firestore y mostrarlos en la tabla
function loadTechnicians() {
  db.collection("technicians").get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const technician = doc.data();
        addTechnicianToTable(doc.id, technician.name, technician.phone, technician.zone); // Pasa el ID del documento
      });
    })
    .catch((error) => {
      console.error("Error al obtener los técnicos: ", error);
    });
}

// Cargar los técnicos al cargar la página
window.onload = function() {
  loadTechnicians();
};
