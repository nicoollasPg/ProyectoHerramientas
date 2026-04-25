document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initAnimations();
  initNavbarEffects();
});

/**
 * Cargar componentes HTML dinámicamente (navbar y footer)
 */
function loadComponents() {
  // Navbar
  fetch('./assets/components/navbar.html')
    .then(res => res.text())
    .then(html => {
      const headerEl = document.getElementById('header');
      if (headerEl) {
        headerEl.innerHTML = html;
        manejarSesionNavbar(); // actualizar estado de sesión
        agregarEventosNavbar(); // eventos navbar
      }

      // 
      // Redirección automática si el usuario es admin y NO está en páginas de admin
      const usuario = JSON.parse(localStorage.getItem('usuario'));
      const pathname = window.location.pathname;
      const isAdminPage = pathname.includes('admin');

      if (
        usuario &&
        usuario.rol === 'admin' &&
        !isAdminPage
      ) {
        console.log('Redirigiendo al panel de administración...');
        window.location.href = 'admin.html';
      }
    })
    .catch(err => console.error('Error al cargar el navbar:', err));

  // Footer
  fetch('./assets/components/footer.html')
    .then(res => res.text())
    .then(html => {
      const footerEl = document.getElementById('footer');
      if (footerEl) {
        footerEl.innerHTML = html;
      }
    })
    .catch(err => console.error('Error al cargar el footer:', err));
}
/**
 * Mostrar u ocultar opciones según si el usuario está logueado
 */
function manejarSesionNavbar() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const loginContainer = document.getElementById('login-container');

  if (!loginContainer) return;

  // Limpiar contenido previo
  loginContainer.innerHTML = '';

  if (usuario) {
    // Agregamos enlace adicional si es administrador
    const adminLink = usuario.rol === 'admin'
      ? `<li><a class="dropdown-item" href="admin.html">Panel de Administración</a></li><li><hr class="dropdown-divider"></li>`
      : '';

    // Si hay sesión activa → mostrar nombre y menú
    loginContainer.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle px-3 py-2 rounded-pill" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fa-solid fa-user"></i> ${usuario.nombre_usuario}
        </a>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          ${adminLink}
          <li><a class="dropdown-item" href="perfil.html">Ver perfil</a></li>
          <li><a class="dropdown-item" href="login.html" id="cambiarCuenta">Cambiar de cuenta</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Cerrar sesión</a></li>
        </ul>
      </li>
    `;
  } else {
    // Si no hay sesión activa → solo mostrar “Iniciar sesión”
    loginContainer.innerHTML = `
      <li class="nav-item" id="loginLink">
        <a class="nav-link px-3 py-2 rounded-pill" href="login.html">Iniciar sesión</a>
      </li>
    `;
  }
}


/**
 * Mostrar alerta personalizada usando SweetAlert2
 */
function showAlert(icon, title, text) {
  if (typeof Swal !== 'undefined') {
    Swal.fire({
      icon: icon,
      title: title,
      text: text,
      confirmButtonColor: '#6c757d'
    });
  } else {
    alert(`${title}: ${text}`);
  }
}

/**
 * Agregar eventos al navbar (reservar / cerrar sesión / cambiar cuenta)
 */
function agregarEventosNavbar() {
  document.addEventListener('click', (e) => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    // Interceptar cualquier clic en enlaces que lleven a reserva.html
    const targetLink = e.target.closest('a');
    if (targetLink && targetLink.getAttribute('href') && targetLink.getAttribute('href').includes('reserva.html')) {
      e.preventDefault();
      if (!usuario) {
        showAlert('warning', 'Acceso Restringido', 'Debes iniciar sesión para hacer una reserva.');
        setTimeout(() => window.location.href = 'login.html', 1500);
      } else {
        window.location.href = targetLink.getAttribute('href');
      }
    }

    // Cerrar sesión
    if (e.target.id === 'logoutBtn') {
      e.preventDefault();
      localStorage.removeItem('usuario');
      showAlert('success', 'Sesión Cerrada', 'Has cerrado sesión correctamente.');
      setTimeout(() => window.location.href = 'index.html', 1500);
    }

    // Cambiar cuenta
    if (e.target.id === 'cambiarCuenta') {
      e.preventDefault();
      localStorage.removeItem('usuario');
      window.location.href = 'login.html';
    }
  });
}

/**
 * Animaciones suaves
 */
function initAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(el => {
    el.style.opacity = 0;
    el.style.transition = 'opacity 1s ease-in';
    setTimeout(() => (el.style.opacity = 1), 300);
  });
}

/**
 * Efectos del Navbar (scroll y sección activa)
 */
function initNavbarEffects() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  // Efecto de scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  });

  // Indicador de sección activa
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === current) {
        link.classList.add('active');
      }
    });
  });
}
