window.addEventListener('load', function() {
    setTimeout(function() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('pago') === 'exitoso') {
            Swal.fire({
                icon: 'success',
                title: '¡Pago Exitoso!',
                text: 'Tu reserva ha sido confirmada. ¡Nos vemos pronto!',
                confirmButtonColor: '#198754'
            });
        }
    }, 500);
});