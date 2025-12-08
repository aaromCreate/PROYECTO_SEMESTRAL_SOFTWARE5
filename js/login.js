document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector("#loginForm");
  const error = document.querySelector("#loginError");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const id = document.querySelector("#idMedico").value.trim();
    const pwd = document.querySelector("#password").value.trim();

    if (!id || !pwd) {
      error.textContent = "Completa todos los campos.";
      return;
    }
    error.textContent = "";
    window.location.href = "credenciales.html";
  });
});
