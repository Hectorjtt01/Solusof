// Abrir y cerrar el modal para añadir usuario
const modal = document.getElementById("addUserModal");
const btn = document.getElementById("addUserBtn");
const span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Abrir y cerrar el modal para editar usuario
const editModal = document.getElementById("editUserModal");
const spanEdit = document.getElementsByClassName("close-edit")[0];

spanEdit.onclick = function() {
  editModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == editModal) {
    editModal.style.display = "none";
  }
}

// Abrir y cerrar el modal de re-auth
const reauthModal = document.getElementById("reauthModal");
const spanReauth = document.getElementsByClassName("close-reauth")[0];

spanReauth.onclick = function() {
  reauthModal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == reauthModal) {
    reauthModal.style.display = "none";
  }
}

let userToDelete = null;
let rowToDelete = null;

// Manejar el envío del formulario de re-auth
const reauthForm = document.getElementById("reauthForm");
reauthForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("reauthEmail").value;
  const password = document.getElementById("reauthPassword").value;
  const credential = firebase.auth.EmailAuthProvider.credential(email, password);

  userToDelete.reauthenticateWithCredential(credential)
    .then(() => {
      console.log("Re-authentication successful");
      deleteUserConfirmed();
    })
    .catch((error) => {
      console.error("Error re-authenticating user: ", error);
    });
});

// Manejar el envío del formulario para añadir usuario
const form = document.getElementById("addUserForm");
form.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("userName").value;
  const email = document.getElementById("userEmail").value;
  const password = document.getElementById("userPassword").value;

  // Añadir el usuario a Firebase Authentication y Firestore
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const uid = user.uid;

      // Asignar el rol de 'soporte' por defecto en Firestore
      const userDocRef = db.collection("users").doc(uid);
      userDocRef.set({
        name: name,
        email: email,
        role: 'soporte' // Asignar el rol de soporte por defecto
      }).then(() => {
        // Añadir el usuario a la tabla
        addUserToTable(uid, name, email);
        // Cerrar el modal
        modal.style.display = "none";
      }).catch((error) => {
        console.error("Error al asignar rol: ", error);
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error:", errorCode, errorMessage);
    });
});


// Manejar el envío del formulario para editar usuario
const editForm = document.getElementById("editUserForm");
editForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const uid = document.getElementById("editUserId").value;
  const name = document.getElementById("editUserName").value;
  const email = document.getElementById("editUserEmail").value;
  const password = document.getElementById("editUserPassword").value;

  // Actualizar el correo electrónico y la contraseña en Firebase Authentication
  const user = firebase.auth().currentUser;

  if (user && user.uid === uid) {
    const promises = [];

    if (email !== user.email) {
      promises.push(user.updateEmail(email));
    }

    if (password) {
      promises.push(user.updatePassword(password));
    }

    Promise.all(promises).then(() => {
      console.log("Correo electrónico y/o contraseña actualizados en Firebase Authentication");

      // Actualizar la información del usuario en Firestore
      return db.collection("users").doc(uid).update({
        name: name,
        email: email
      }).then(() => {
        // Actualizar la información del usuario en la tabla
        updateUserInTable(uid, name, email);
        // Cerrar el modal
        editModal.style.display = "none";
      }).catch((error) => {
        console.error("Error al actualizar el usuario en Firestore: ", error);
      });
    }).catch((error) => {
      console.error("Error al actualizar el correo electrónico y/o contraseña en Firebase Authentication: ", error);
    });
  } else {
    // Actualizar la información del usuario en Firestore
    db.collection("users").doc(uid).update({
      name: name,
      email: email
    }).then(() => {
      // Actualizar la información del usuario en la tabla
      updateUserInTable(uid, name, email);
      // Cerrar el modal
      editModal.style.display = "none";
    }).catch((error) => {
      console.error("Error al actualizar el usuario: ", error);
    });
  }
});

// Función para añadir un usuario a la tabla
function addUserToTable(uid, name, email) {
  const table = document.getElementById("usersTable").getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();
  newRow.setAttribute('data-uid', uid); // Añade el ID del usuario como un atributo de datos
  newRow.insertCell(0).innerText = table.rows.length;
  newRow.insertCell(1).innerText = name;
  newRow.insertCell(2).innerText = email;
  const actionsCell = newRow.insertCell(3);
  const editButton = document.createElement('button');
  editButton.className = 'btn-edit';
  const editIcon = document.createElement('span');
  editIcon.className = 'material-icons-outlined';
  editIcon.innerText = 'edit';
  editButton.appendChild(editIcon);
  editButton.addEventListener('click', function() {
    openEditModal(uid);
  });
  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn-delete';
  const deleteIcon = document.createElement('span');
  deleteIcon.className = 'material-icons-outlined';
  deleteIcon.innerText = 'delete';
  deleteButton.appendChild(deleteIcon);
  deleteButton.addEventListener('click', function() {
    deleteUser(uid, newRow);
  });
  actionsCell.appendChild(editButton);
  actionsCell.appendChild(deleteButton);
}

// Función para abrir el modal de edición con la información del usuario
function openEditModal(uid) {
  db.collection("users").doc(uid).get().then((doc) => {
    if (doc.exists) {
      const user = doc.data();
      document.getElementById("editUserId").value = uid;
      document.getElementById("editUserName").value = user.name;
      document.getElementById("editUserEmail").value = user.email;
      editModal.style.display = "block";
    }
  }).catch((error) => {
    console.error("Error al obtener el usuario: ", error);
  });
}

// Función para actualizar la información del usuario en la tabla
function updateUserInTable(uid, name, email) {
  const table = document.getElementById("usersTable").getElementsByTagName("tbody")[0];
  const rows = table.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.getAttribute('data-uid') === uid) {
      row.cells[1].innerText = name;
      row.cells[2].innerText = email;
      break;
    }
  }
}

// Cargar los usuarios de Firebase Firestore y mostrarlos en la tabla
function loadUsers() {
  db.collection("users").get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        addUserToTable(doc.id, user.name, user.email); // Pasa el ID del documento
      });
    })
    .catch((error) => {
      console.error("Error al obtener los usuarios:", error);
    });
}

// Función para eliminar un usuario de Firebase Authentication y Firestore
function deleteUser(uid, row) {
  userToDelete = firebase.auth().currentUser;
  rowToDelete = row;

  if (userToDelete.uid === uid) {
    reauthModal.style.display = "block";
  } else {
    // Eliminar el usuario de Firestore
    db.collection("users").doc(uid).delete().then(() => {
      console.log("Usuario eliminado de Firestore");
      // Eliminar la fila de la tabla
      row.remove();
    }).catch((error) => {
      console.error("Error al eliminar el usuario de Firestore: ", error);
    });
  }
}

function deleteUserConfirmed() {
  userToDelete.delete().then(() => {
    console.log("Usuario eliminado de Firebase Authentication");

    // Eliminar el usuario de Firestore
    db.collection("users").doc(userToDelete.uid).delete().then(() => {
      console.log("Usuario eliminado de Firestore");
      // Eliminar la fila de la tabla
      rowToDelete.remove();
      reauthModal.style.display = "none";
    }).catch((error) => {
      console.error("Error al eliminar el usuario de Firestore: ", error);
    });
  }).catch((error) => {
    console.error("Error al eliminar el usuario de Firebase Authentication: ", error);
  });
}

// Cargar los usuarios al cargar la página
window.onload = function() {
  loadUsers();
};
