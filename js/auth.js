document.addEventListener('DOMContentLoaded', (event) => {
    const mainContent = document.getElementById('main-content');
    const welcomeMessage = document.getElementById('welcome-message');
  
    // Oculta el contenido principal inicialmente
    if (mainContent) {
      mainContent.style.display = 'none';
    }
  
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const uid = user.uid;
        const userDocRef = db.collection("users").doc(uid);
  
        userDocRef.get().then((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            const userName = userData.name;
  
            // Actualizar el mensaje de bienvenida en el dashboard
            if (welcomeMessage) {
              welcomeMessage.textContent = ` - Bienvenido, ${userName}`;
            }
  
            // Mostrar el contenido principal
            if (mainContent) {
              mainContent.style.display = 'block';
            }
          } else {
            console.log("No such document!");
            // Redirigir al login si no hay tal documento
            window.location.href = '/index.html';
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
          // Redirigir al login en caso de error
          window.location.href = '/index.html';
        });
      } else {
        // Redirigir al login si no está autenticado
        window.location.href = '/index.html';
      }
    });
  });
  