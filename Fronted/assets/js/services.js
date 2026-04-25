
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const offset = document.querySelector('.navbar')?.offsetHeight || 0;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
        });
    });
});

async function loadComponents() {
    try {
        const basePath = 'C:/Users/ng080/Desktop/BarberHouse/';
        const [navbarResponse, footerResponse] = await Promise.all([
            fetch(`${basePath}components/navbar.html`),
            fetch(`${basePath}components/footer.html`)
        ]);
        document.getElementById('navbar').innerHTML = await navbarResponse.text();
        document.getElementById('footer').innerHTML = await footerResponse.text();
    } catch (error) {
        console.error('Error loading components:', error);

        document.getElementById('navbar').innerHTML = '<nav class="navbar bg-dark"></nav>';
        document.getElementById('footer').innerHTML = '<footer class="footer bg-black text-white py-4"></footer>';
    }
}

async function loadServices() {
    const pages = ['index', 'catalogo'];
    pages.forEach(page => {
        const grid = document.getElementById('services-grid');
        if (grid) {
            fetch('assets/data/services.json')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    data.forEach(service => {
                        const card = document.createElement('div');
                        card.classList.add('col-12', 'col-md-6', 'col-lg-4', 'service-card', `service-${service.id}`);
                        card.innerHTML = `
                            <div class="card h-100 border-0 shadow-sm">
                                <img src="assets/img/${service.image}" class="card-img-top" alt="${service.name}">
                                <div class="card-body d-flex flex-column">
                                    <h3 class="card-title fw-bold mb-3">${service.name}</h3>
                                    <p class="card-text flex-grow-1">${service.description}</p>
                                    <p class="price fw-bold fs-4 text-primary">$${service.price}</p>
                                    <a href="reserva.html?service=${service.id}" class="btn btn-primary mt-3">Reservar Ahora</a>
                                </div>
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                })
                .catch(error => {
                    console.error('Error loading services:', error);

                    const fallbackData = [
                        { id: "clasico", name: "Corte Clásico", description: "Elegante y atemporal.", price: 25, image: "service1.jpg" },
                        { id: "fade", name: "Fade Moderno", description: "Degradado personalizado.", price: 30, image: "service2.jpg" },
                        { id: "barba", name: "Afeitado y Barba", description: "Diseño premium.", price: 10, image: "service3.jpg" }
                    ];
                    fallbackData.forEach(service => {
                        const card = document.createElement('div');
                        card.classList.add('col-12', 'col-md-6', 'col-lg-4', 'service-card', `service-${service.id}`);
                        card.innerHTML = `
                            <div class="card h-100 border-0 shadow-sm">
                                <img src="assets/images/${service.image}" class="card-img-top" alt="${service.name}">
                                <div class="card-body d-flex flex-column">
                                    <h3 class="card-title fw-bold mb-3">${service.name}</h3>
                                    <p class="card-text flex-grow-1">${service.description}</p>
                                    <p class="price fw-bold fs-4 text-primary">$${service.price}</p>
                                    <a href="reserva.html?service=${service.id}" class="btn btn-primary mt-3">Reservar Ahora</a>
                                </div>
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                });
        }
    });
}

loadComponents();
loadServices();

document.getElementById('reservaForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reservation = {
        name: formData.get('name'),
        service: formData.get('service'),
        date: formData.get('date'),
        time: formData.get('time')
    };
    console.log('Reserva enviada:', reservation);
    alert('¡Reserva confirmada! Pronto recibirás un correo de confirmación. (Simulación)');
    e.target.reset();
});

const urlParams = new URLSearchParams(window.location.search);
const serviceParam = urlParams.get('service');
if (serviceParam && document.getElementById('service')) {
    document.getElementById('service').value = serviceParam;
}