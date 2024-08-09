document.addEventListener("DOMContentLoaded", function() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const uid = user.uid;
      const userDocRef = db.collection("users").doc(uid);

      userDocRef.get().then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const userRole = userData.role;

          // Llamar a una función para mostrar el contenido adecuado basado en el rol
          setupSidebarBasedOnRole(userRole);
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
    }
  });
});

function setupSidebarBasedOnRole(role) {
  // Mostrar elementos según el rol del usuario
  if (role === 'admin') {
    // Mostrar todos los elementos para el rol de administrador
    const sidebarItems = document.querySelectorAll('.sidebar-list-item');
    sidebarItems.forEach(item => {
      item.style.display = 'block';
    });
  } else if (role === 'soporte') {
    // Mostrar solo ciertos elementos para el rol de soporte
    document.getElementById('sidebar-home').style.display = 'block';
    document.getElementById('sidebar-services').style.display = 'block';
    document.getElementById('sidebar-technicians').style.display = 'block';
    document.getElementById('sidebar-logout').style.display = 'block'; // Asegúrate de que el usuario pueda cerrar sesión
  }
}
