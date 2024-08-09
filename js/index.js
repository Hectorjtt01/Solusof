document.addEventListener('DOMContentLoaded', (event) => {
  const container = document.getElementById('container');
  const loginBtn = document.getElementById('index');

  loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
  });

  document.getElementById('index-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;
    const errorMessage = document.getElementById('error-message'); // Referencia al mensaje de error

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Inicio de sesión exitoso
        var user = userCredential.user;
        console.log('User logged in:', user);
        // Redirigir a la página de inicio (dashboard)
        window.location.href = 'html/dashboard.html';
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessageText = error.message;
        console.error('Error:', errorCode, errorMessageText);

        // Mostrar mensaje de error
        errorMessage.style.display = 'block';
      });
  });
});
