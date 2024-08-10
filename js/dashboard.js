document.addEventListener("DOMContentLoaded", function() {
  loadPendingServicesCount();
  loadVobosNotFinalizedCount();
  loadFacturasSinFolioCount();
  loadActiveUsersCount();
});

// Función para cargar el conteo de servicios pendientes
function loadPendingServicesCount() {
  db.collection("services").where("repSent", "==", false).get().then((querySnapshot) => {
    const pendingServicesCount = querySnapshot.size;
    document.getElementById("pending-services-count").innerText = pendingServicesCount;
  }).catch((error) => {
    console.error("Error al cargar el conteo de servicios pendientes: ", error);
  });
}

// Función para cargar el conteo de VoBos no finalizados
function loadVobosNotFinalizedCount() {
  db.collection("voboServices").get().then((querySnapshot) => {
    let vobosNotFinalizedCount = 0;
    querySnapshot.forEach(doc => {
      const service = doc.data();
      if (!service.finalized) {
        vobosNotFinalizedCount++;
      }
    });
    document.getElementById("vobos-not-finalized-count").innerText = vobosNotFinalizedCount;
  }).catch((error) => {
    console.error("Error al cargar el conteo de VoBos no finalizados: ", error);
  });
}

// Función para cargar el conteo de facturas sin folio
function loadFacturasSinFolioCount() {
  db.collection("voboServices").where("finalized", "==", true).get().then((querySnapshot) => {
    let facturasSinFolioCount = 0;
    querySnapshot.forEach(doc => {
      const service = doc.data();
      if (!service.folioNumber || service.folioNumber.trim() === "") {
        facturasSinFolioCount++;
      }
    });
    document.getElementById("facturas-sin-folio-count").innerText = facturasSinFolioCount;
  }).catch((error) => {
    console.error("Error al cargar el conteo de facturas sin folio: ", error);
  });
}

// Función para cargar el conteo de usuarios activos
function loadActiveUsersCount() {
  db.collection("activeUsers").get().then((querySnapshot) => {
    const activeUsersCount = querySnapshot.size;
    document.getElementById("active-users-count").innerText = activeUsersCount;
  }).catch((error) => {
    console.error("Error al cargar el conteo de usuarios activos: ", error);
  });
}

// Función para actualizar la colección de usuarios activos en Firestore
function updateActiveUsers() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userId = user.uid;

    // Obtener el nombre del usuario desde la colección "users"
    db.collection("users").doc(userId).get().then((doc) => {
      if (doc.exists) {
        const userName = doc.data().name;

        // Guardar en la colección "activeUsers" con el campo "name"
        db.collection("activeUsers").doc(userId).set({
          uid: userId,
          lastActive: firebase.firestore.FieldValue.serverTimestamp(),
          name: userName  // Agregar el nombre aquí
        }).catch((error) => {
          console.error("Error al actualizar usuario activo: ", error);
        });

        // Remover usuario de la colección de usuarios activos al desconectarse
        function handleUnload() {
          db.collection("activeUsers").doc(userId).delete().catch((error) => {
            console.error("Error al remover usuario activo: ", error);
          });
        }
        window.addEventListener("beforeunload", handleUnload);

        // Remover el evento al cerrar sesión para evitar duplicados
        return function cleanup() {
          window.removeEventListener("beforeunload", handleUnload);
        };
      } else {
        console.error("El documento no existe en la colección 'users'");
      }
    }).catch((error) => {
      console.error("Error al obtener el documento 'users': ", error);
    });
  }
}

// Verificar autenticación del usuario
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const cleanup = updateActiveUsers();
    const uid = user.uid;
    const userDocRef = db.collection("users").doc(uid);

    userDocRef.get().then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const userName = userData.name;

        // Actualizar el mensaje de bienvenida
        document.getElementById('welcome-message').textContent = `Bienvenido ${userName}`;
      } else {
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document:", error);
    });

    // Función para cerrar sesión
    function signOutUser() {
      if (cleanup) cleanup();  // Remueve el manejador de 'beforeunload' antes de cerrar sesión

      firebase.auth().signOut().then(() => {
        window.location.href = '/index.html';
      }).catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
    }

  } else {
    // Redirigir al login si no está autenticado
    window.location.href = '/index.html';
  }
});
