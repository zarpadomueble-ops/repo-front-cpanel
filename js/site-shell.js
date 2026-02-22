(function siteShellBootstrap() {
    const pathname = String(window.location.pathname || '').toLowerCase();

    function sanitizePath(path) {
        return String(path || '').trim().replace(/^\/+/, '');
    }

    function rootRelative(path) {
        const cleanPath = sanitizePath(path);
        if (!cleanPath) {
            return '/';
        }

        return `/${cleanPath}`;
    }

    function pageRelative(fileName) {
        const cleanFileName = sanitizePath(fileName);
        if (!cleanFileName) {
            return '/';
        }

        return `/${cleanFileName}`;
    }

    const homeHref = '/';

    const navLinks = [
        { key: 'inicio', href: homeHref, label: 'Inicio', type: 'link' },
        { key: 'tienda', href: pageRelative('tienda'), label: 'Tienda', type: 'link' },
        { key: 'amedida', href: pageRelative('a-medida'), label: 'A Medida', type: 'link' },
        { key: 'nosotros', href: pageRelative('nosotros'), label: 'Nosotros', type: 'link' },
        { key: 'contacto', href: pageRelative('contacto'), label: 'Contacto', type: 'button' }
    ];

    const legalLinks = [
        { href: pageRelative('envios'), label: 'Politica de Envios' },
        { href: pageRelative('garantia'), label: 'Garantia' },
        { href: pageRelative('privacidad'), label: 'Politica de Privacidad' },
        { href: pageRelative('reembolso'), label: 'Politica de Reembolso' },
        { href: pageRelative('terminos'), label: 'Terminos de Servicio' }
    ];

    function getPageKeyFromPath() {
        const fileName = (pathname.split('/').pop() || '').replace(/\.html$/, '');

        if (!fileName || fileName === 'index') return 'inicio';
        if (fileName === 'catalogo' || fileName === 'tienda' || fileName.startsWith('tienda-')) return 'tienda';
        if (fileName === 'a-medida' || fileName === 'amedida' || fileName === 'servicios') return 'amedida';
        if (fileName === 'nosotros') return 'nosotros';
        if (fileName === 'contacto') return 'contacto';
        return '';
    }

    function buildNavMarkup(activeKey) {
        const linksMarkup = navLinks.map(link => {
            const isActive = activeKey === link.key;
            if (link.type === 'button') {
                return `<li><a href="${link.href}" class="btn-nav${isActive ? ' active' : ''}">${link.label}</a></li>`;
            }

            return `<li><a href="${link.href}" class="nav-link${isActive ? ' active' : ''}">${link.label}</a></li>`;
        }).join('');

        return `
            <header class="navbar">
                <div class="container navbar-container">
                    <a href="${homeHref}" class="logo" aria-label="Zarpado Mueble - Inicio">
                        <img
                            class="logo-dinamico"
                            src="${rootRelative('Assets/favicon/android-chrome-192x192blanco.png')}"
                            data-logo-light="${rootRelative('Assets/favicon/android-chrome-192x192.png')}"
                            data-logo-dark="${rootRelative('Assets/favicon/android-chrome-192x192blanco.png')}"
                            alt="Zarpado Mueble"
                        >
                    </a>

                    <nav id="primary-navigation" class="nav-menu" aria-label="Menu principal">
                        <ul>
                            ${linksMarkup}
                        </ul>
                    </nav>

                    <div class="nav-icons">
                        <button class="cart-icon js-toggle-cart" type="button" aria-label="Abrir carrito" aria-expanded="false" aria-controls="cartSidebar">
                            <i class="fas fa-shopping-bag" aria-hidden="true"></i>
                            <span class="cart-count">0</span>
                        </button>
                        <button class="hamburger" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="primary-navigation">
                            <span class="bar"></span>
                            <span class="bar"></span>
                            <span class="bar"></span>
                        </button>
                    </div>
                </div>
            </header>
        `;
    }

    function buildCartMarkup() {
        return `
            <div class="cart-sidebar" id="cartSidebar" aria-label="Carrito de compras">
                <div class="cart-header">
                    <h3>Tu carrito</h3>
                    <button class="close-cart js-toggle-cart" type="button" aria-label="Cerrar carrito">&times;</button>
                </div>
                <div class="cart-items" id="cartItems">
                    <p style="text-align:center; color: #888; margin-top: 2rem;">Tu carrito esta vacio.</p>
                </div>
                <div class="cart-footer">
                    <div class="cart-total-row">
                        <span>Total:</span>
                        <span id="cartTotal">$0</span>
                    </div>
                    <button class="btn btn-primary js-checkout" type="button" style="width: 100%;">Iniciar compra</button>
                </div>
            </div>

            <div id="cart-notification" class="cart-notification" aria-live="polite">
                <i class="fas fa-shopping-bag" style="color: var(--color-accent); font-size: 1.5rem;" aria-hidden="true"></i>
                <div>
                    <p>Tenes productos en tu carrito</p>
                    <p style="font-size: 0.8rem; color: #aaa;">Finaliza la compra cuando quieras.</p>
                </div>
                <button class="cart-notification-close js-close-notification" type="button" aria-label="Cerrar aviso">&times;</button>
            </div>
        `;
    }

    function buildFooterMarkup() {
        const navMarkup = navLinks.map(link => `<a href="${link.href}" class="nav-link" style="font-size: 0.9rem;">${link.label}</a>`).join('');
        const legalMarkup = legalLinks.map(link => `<a href="${link.href}" class="nav-link" style="font-size: 0.8rem; color: #666;">${link.label}</a>`).join('');

        return `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-brand">
                            <a href="${homeHref}" class="logo" aria-label="Zarpado Mueble - Inicio">
                                <img
                                    class="logo-dinamico"
                                    src="${rootRelative('Assets/favicon/android-chrome-192x192blanco.png')}"
                                    data-logo-light="${rootRelative('Assets/favicon/android-chrome-192x192.png')}"
                                    data-logo-dark="${rootRelative('Assets/favicon/android-chrome-192x192blanco.png')}"
                                    alt="Zarpado Mueble"
                                >
                            </a>
                            <p style="color: var(--color-text-muted); margin-top: 10px; font-size: 0.9rem;">Diseno, fabricacion local y atencion personalizada.</p>
                        </div>
                        <div class="footer-links" style="display: flex; gap: 20px; flex-wrap: wrap;">
                            ${navMarkup}
                        </div>
                        <div class="footer-socials">
                            <a href="https://www.instagram.com/zarpadomuebleoficial/" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Instagram"><i class="fab fa-instagram" aria-hidden="true"></i></a>
                            <a href="https://www.facebook.com/profile.php?id=61583196106459" target="_blank" rel="noopener noreferrer" class="social-icon" aria-label="Facebook"><i class="fab fa-facebook" aria-hidden="true"></i></a>
                            <a href="mailto:contacto@zarpadomueble.com" class="social-icon" aria-label="Email"><i class="fas fa-envelope" aria-hidden="true"></i></a>
                        </div>
                    </div>
                    <div class="text-center" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem;">
                            ${legalMarkup}
                        </div>
                        <p style="font-size: 0.8rem; color: #444;">&copy; 2026 Zarpado Mueble. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer>
        `;
    }

    function buildTrustBlockMarkup() {
        return `
            <section class="section trust-block-section" aria-label="Beneficios Zarpado Mueble">
                <div class="container">
                    <div class="text-center reveal">
                        <span class="section-tag">Confianza</span>
                        <h2 class="section-title">Por que elegirnos para comprar y para cotizar</h2>
                    </div>
                    <div class="grid-3 trust-grid">
                        <article class="feature-card reveal-up">
                            <i class="fas fa-map-marker-alt feature-icon" aria-hidden="true"></i>
                            <h3 class="feature-title">Fabricacion local</h3>
                            <p class="feature-text">Disenamos y fabricamos en Buenos Aires, con seguimiento humano en cada etapa.</p>
                        </article>
                        <article class="feature-card reveal-up" style="transition-delay: 0.1s;">
                            <i class="fas fa-credit-card feature-icon" aria-hidden="true"></i>
                            <h3 class="feature-title">Pagos en Argentina</h3>
                            <p class="feature-text">Mercado Pago, transferencia y efectivo en retiro (segun modalidad). Plazos: 48/72 hs (stock) o 10-20 dias habiles (bajo pedido).</p>
                        </article>
                        <article class="feature-card reveal-up" style="transition-delay: 0.2s;">
                            <i class="fas fa-shield-alt feature-icon" aria-hidden="true"></i>
                            <h3 class="feature-title">Garantia real</h3>
                            <p class="feature-text">Todos los trabajos incluyen 12 meses de garantia por defectos de fabricacion.</p>
                        </article>
                    </div>
                </div>
            </section>
        `;
    }

    function replaceHeader(activeKey) {
        const existingHeader = document.querySelector('.navbar');
        const headerMarkup = buildNavMarkup(activeKey);

        if (existingHeader) {
            existingHeader.outerHTML = headerMarkup;
            return;
        }

        const firstChild = document.body.firstElementChild;
        if (firstChild) {
            firstChild.insertAdjacentHTML('beforebegin', headerMarkup);
        } else {
            document.body.insertAdjacentHTML('afterbegin', headerMarkup);
        }
    }

    function replaceCart(cartEnabled) {
        document.getElementById('cartSidebar')?.remove();
        document.getElementById('cart-notification')?.remove();

        if (!cartEnabled) {
            document.querySelector('.cart-icon')?.remove();
            return;
        }

        const navIcons = document.querySelector('.nav-icons');
        if (!navIcons?.querySelector('.cart-icon')) {
            navIcons?.insertAdjacentHTML(
                'afterbegin',
                '<button class="cart-icon js-toggle-cart" type="button" aria-label="Abrir carrito" aria-expanded="false" aria-controls="cartSidebar"><i class="fas fa-shopping-bag" aria-hidden="true"></i><span class="cart-count">0</span></button>'
            );
        }

        const header = document.querySelector('.navbar');
        if (!header) {
            return;
        }

        header.insertAdjacentHTML('afterend', buildCartMarkup());
    }

    function replaceFooter() {
        const existingFooter = document.querySelector('.footer');
        const footerMarkup = buildFooterMarkup();

        if (existingFooter) {
            existingFooter.outerHTML = footerMarkup;
            return;
        }

        document.body.insertAdjacentHTML('beforeend', footerMarkup);
    }

    function replaceTrustBlocks() {
        const trustTargets = document.querySelectorAll('[data-trust-block]');
        trustTargets.forEach(target => {
            target.outerHTML = buildTrustBlockMarkup();
        });
    }

    function init() {
        if (!document.body) {
            return;
        }

        const pageKey = document.body.dataset.page || getPageKeyFromPath();
        const cartEnabled = document.body.dataset.cart !== 'off';

        replaceHeader(pageKey);
        replaceCart(cartEnabled);
        replaceTrustBlocks();
        replaceFooter();
    }

    init();
})();
