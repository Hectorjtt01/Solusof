document.addEventListener("DOMContentLoaded", function() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const uid = user.uid;
      const userDocRef = db.collection("users").doc(uid);

      // Bloquear la carga de la página si el usuario no tiene permiso
      userDocRef.get().then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const userRole = userData.role;

          // Obtener la URL actual
          const currentPage = window.location.pathname.split('/').pop();

          // Definir las páginas permitidas para cada rol
          const adminPages = ['dashboard.html', 'Usuarios.html', 'Productos.html', 'Facturacion.html', 'Tecnicos.html', 'TipoServicios.html', 'Servicios.html', 'Vobo.html']; // páginas accesibles para admin
          const soportePages = ['dashboard.html', 'Tecnicos.html', 'Servicios.html']; // páginas accesibles para soporte

          // Verificar si el rol tiene acceso a la página actual
          if ((userRole === 'admin' && adminPages.includes(currentPage)) || 
              (userRole === 'soporte' && soportePages.includes(currentPage))) {
            // Mostrar contenido si tiene acceso
            document.body.classList.remove('hidden-until-verified');
            setupSidebarBasedOnRole(userRole);
          } else {
            // Redirigir si no tiene acceso
            alert('No tienes permiso para acceder a esta página.');
            window.location.href = 'dashboard.html';
          }
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
    } else {
      // Redirigir al login si no está autenticado
      window.location.href = 'index.html';
    }
  });
});

function setupSidebarBasedOnRole(role) {
  // Ocultar todos los elementos por defecto
  const sidebarItems = document.querySelectorAll('.sidebar-list-item');
  sidebarItems.forEach(item => {
    item.style.display = 'none';
  });

  if (role === 'admin') {
    // Mostrar todos los elementos para el rol de administrador
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
