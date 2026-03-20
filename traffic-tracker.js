// ═══════════════════════════════════════════════════════════════
//  Juzzs Travel & Hospitality — Traffic Tracker
//  Regista automaticamente visitas e acções em todas as páginas
// ═══════════════════════════════════════════════════════════════

(function () {

    const STORAGE_KEY  = 'juzzs_traffic_log';
    const MAX_ENTRIES  = 2000; // limite para não encher o localStorage

    // ── Mapa de páginas legíveis ──────────────────────────────
    const PAGE_NAMES = {
        'index.html'               : 'Página Inicial',
        ''                         : 'Página Inicial',
        'hospedagem.html'          : 'Hospedagem',
        'destinos.html'            : 'Destinos',
        'pacotes.html'             : 'Pacotes',
        'sobre.html'               : 'Sobre Nós',
        'contacto.html'            : 'Contacto',
        'login.html'               : 'Login',
        'cadastro.html'            : 'Cadastro',
        'dashboard-admin.html'     : 'Dashboard Admin',
        'dashboard-cliente.html'   : 'Dashboard Cliente',
        'dashboard-funcionario.html': 'Dashboard Funcionário',
    };

    // ── Categorias de páginas ─────────────────────────────────
    const PAGE_CATEGORIES = {
        'Página Inicial'        : 'público',
        'Hospedagem'            : 'público',
        'Destinos'              : 'público',
        'Pacotes'               : 'público',
        'Sobre Nós'             : 'público',
        'Contacto'              : 'público',
        'Login'                 : 'autenticação',
        'Cadastro'              : 'autenticação',
        'Dashboard Admin'       : 'admin',
        'Dashboard Cliente'     : 'cliente',
        'Dashboard Funcionário' : 'funcionário',
    };

    // ── Utilitários ───────────────────────────────────────────
    function getPageName() {
        const path = window.location.pathname.split('/').pop();
        return PAGE_NAMES[path] || path || 'Desconhecida';
    }

    function getCurrentUser() {
        try {
            const u = JSON.parse(localStorage.getItem('juzzs_current_user'));
            if (u) return { id: u.id, name: u.name, email: u.email, role: u.role };
        } catch (_) {}
        return null;
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function getLog() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch (_) { return []; }
    }

    function saveLog(log) {
        // Mantém apenas os MAX_ENTRIES mais recentes
        if (log.length > MAX_ENTRIES) log = log.slice(-MAX_ENTRIES);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); }
        catch (_) { /* quota cheia */ }
    }

    // ── Função principal: registar evento ────────────────────
    window.trackEvent = function (action, details) {
        const user    = getCurrentUser();
        const pageName = getPageName();

        const entry = {
            id        : generateId(),
            timestamp : new Date().toISOString(),
            page      : pageName,
            category  : PAGE_CATEGORIES[pageName] || 'outro',
            url       : window.location.pathname.split('/').pop() || 'index.html',
            action    : action || 'visualização',
            details   : details || '',
            userName  : user ? user.name  : 'Visitante',
            userEmail : user ? user.email : '',
            userId    : user ? user.id    : null,
            userRole  : user ? user.role  : 'visitante',
        };

        const log = getLog();
        log.push(entry);
        saveLog(log);
        return entry;
    };

    // ── Regista visita de página automaticamente ──────────────
    function registerPageView() {
        // Evita duplicar se a mesma aba já registou esta visita nesta sessão
        const sessionKey = 'juzzs_session_pages';
        const visited = JSON.parse(sessionStorage.getItem(sessionKey) || '[]');
        const pageKey = window.location.href;

        if (!visited.includes(pageKey)) {
            visited.push(pageKey);
            sessionStorage.setItem(sessionKey, JSON.stringify(visited));
            trackEvent('visualização');
        }
    }

    // ── Intercepts de autenticação ────────────────────────────
    // Escuta eventos personalizados disparados pelo login.html e logout
    window.addEventListener('juzzs:login', function (e) {
        const u = e.detail || {};
        // Sobrepõe userName depois do login
        setTimeout(() => trackEvent('login', `${u.name || ''} (${u.role || ''})`), 100);
    });

    window.addEventListener('juzzs:logout', function (e) {
        const user = getCurrentUser(); // ainda disponível antes de limpar
        const name = user ? user.name : (e.detail?.name || 'Utilizador');
        trackEvent('logout', name);
    });

    // ── Rastrear criação de reservas ──────────────────────────
    // Qualquer página pode chamar: trackEvent('reserva_criada', 'Hotel X – 3 noites')
    // Esta função também expõe um helper conveniente:
    window.trackReservation = function (details) {
        trackEvent('reserva_criada', details);
    };

    window.trackSearch = function (query) {
        trackEvent('pesquisa', query);
    };

    // ── Init ──────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', registerPageView);
    } else {
        registerPageView();
    }

})();
