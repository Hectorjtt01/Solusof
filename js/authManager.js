// Función para actualizar o añadir usuario activo en Firestore
function updateActiveUser() {
  const user = firebase.auth().currentUser;
  if (user) {
    const userId = user.uid;
    const userDocRef = db.collection("users").doc(userId);

    userDocRef.get().then((doc) => {
      if (doc.exists) {
        const userName = doc.data().name;

        db.collection("activeUsers").doc(userId).set({
          uid: userId,
          lastActive: firebase.firestore.FieldValue.serverTimestamp(),
          name: userName
        }, { merge: true });

        window.onbeforeunload = () => {
          // Solo eliminar al usuario activo si cierra la pestaña o el navegador
          if (!sessionStorage.getItem('navigating')) {
            db.collection("activeUsers").doc(userId).delete();
          }
        };

        sessionStorage.setItem('navigating', true);
        setTimeout(() => sessionStorage.removeItem('navigating'), 5000);
      } else {
        console.error("El usuario no existe en la colección 'users'");
      }
    });
  }
}

// Evento de cambio de estado de autenticación
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    updateActiveUser();
    document.getElementById('welcome-message').textContent = `Bienvenido, ${user.displayName || user.email}`;
  } else {
    window.location.href = '/index.html'; // Asegúrate de redirigir al login si el usuario no está autenticado
  }
});
