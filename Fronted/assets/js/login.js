document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const mensaje = document.getElementById("mensaje");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value.trim();

    mensaje.textContent = "Procesando...";
    mensaje.style.color = "gray";

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        mensaje.textContent = data.error || "Credenciales inválidas";
        mensaje.style.color = "red";
        return;
      }

      // Guardar token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      mensaje.textContent = "Inicio de sesión exitoso. Redirigiendo...";
      mensaje.style.color = "green";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } catch (error) {
      console.error("Error en login:", error);
      mensaje.textContent = "Error de conexión con el servidor.";
      mensaje.style.color = "red";
    }
  });
});
