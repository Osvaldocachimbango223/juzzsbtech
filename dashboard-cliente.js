// Dashboard Client Main JavaScript

// Check authentication
const currentUser = JSON.parse(localStorage.getItem('juzzs_current_user'));
if (!currentUser || currentUser.role !== 'client') {
    window.location.href = 'login.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadStats();
    loadFeaturedDestinations();
    loadDestinations();
    loadHotels();
    loadPackages();
    loadReservations();
    
    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkInHotel').min = today;
    document.getElementById('checkOutHotel').min = today;
    document.getElementById('checkInPackage').min = today;
    
    // Event listeners
    document.getElementById('checkInHotel').addEventListener('change', calculateHotelPrice);
    document.getElementById('checkOutHotel').addEventListener('change', calculateHotelPrice);
    document.getElementById('roomsHotel').addEventListener('input', calculateHotelPrice);
    document.getElementById('guestsPackage').addEventListener('input', calculatePackagePrice);
});

// Load user information
function loadUserInfo() {
    const firstName = currentUser.name.split(' ')[0];
    document.getElementById('userName').textContent = firstName;
    document.getElementById('welcomeName').textContent = firstName;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0);
    document.getElementById('profileAvatar').textContent = currentUser.name.charAt(0);
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileCreated').textContent = new Date(currentUser.createdAt).toLocaleDateString('pt-BR');
}

// Load statistics
function loadStats() {
    const reservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    const userReservations = reservations.filter(r => r.userId === currentUser.id);
    
    document.getElementById('totalReservas').textContent = userReservations.length;
    document.getElementById('reservasPendentes').textContent = userReservations.filter(r => r.status === 'pending').length;
    document.getElementById('reservasConfirmadas').textContent = userReservations.filter(r => r.status === 'confirmed').length;
    
    // Calculate total spent
    const totalSpent = userReservations
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => sum + r.totalPrice, 0);
    document.getElementById('totalSpent').textContent = totalSpent.toLocaleString() + ' Kz';
}

// Load featured destinations
function loadFeaturedDestinations() {
    const featured = destinations.filter(d => d.featured).slice(0, 3);
    const container = document.getElementById('featuredDestinations');
    
    container.innerHTML = `
        <div class="destinations-featured-grid">
            ${featured.map(dest => `
                <div class="destination-featured-card">
                    <div class="destination-featured-image">
                        <img src="${dest.image}" alt="${dest.name}">
                    </div>
                    <div class="destination-featured-content">
                        <h4>${dest.name}</h4>
                        <p class="location">📍 ${dest.location}</p>
                        <p class="description">${dest.description}</p>
                        <div class="highlights">
                            ${dest.highlights.map(h => `<span class="highlight">${h}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Load all destinations
function loadDestinations() {
    const container = document.getElementById('destinationsList');
    
    container.innerHTML = `
        <div class="destinations-full-grid">
            ${destinations.map(dest => `
                <div class="destination-full-card">
                    <div class="destination-full-image">
                        <img src="${dest.image}" alt="${dest.name}">
                        ${dest.featured ? '<div class="featured-badge">Destaque</div>' : ''}
                    </div>
                    <div class="destination-full-content">
                        <h3>${dest.name}</h3>
                        <p class="location">📍 ${dest.location}</p>
                        <p class="description">${dest.description}</p>
                        <div class="highlights-row">
                            ${dest.highlights.map(h => `<span class="highlight-badge">${h}</span>`).join('')}
                        </div>
                        <button class="btn-explore" onclick="showSection('pacotes')">
                            Ver Pacotes →
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Load hotels
let currentFilter = 'all';

function loadHotels(filter = 'all') {
    currentFilter = filter;
    const filtered = filter === 'all' ? hotels : hotels.filter(h => h.category === filter);
    const container = document.getElementById('hotelsList');
    
    container.innerHTML = `
        <div class="hotels-grid">
            ${filtered.map(hotel => `
                <div class="hotel-full-card" onclick="viewHotelDetails(${hotel.id})">
                    <div class="hotel-full-image">
                        <img src="${hotel.image}" alt="${hotel.name}">
                        <div class="hotel-rating-badge">
                            <span>⭐ ${hotel.rating}</span>
                            <span class="reviews">(${hotel.reviews} avaliações)</span>
                        </div>
                    </div>
                    <div class="hotel-full-content">
                        <div class="hotel-header">
                            <h3>${hotel.name}</h3>
                            <div class="hotel-price">
                                <span class="price">${hotel.pricePerNight.toLocaleString()} Kz</span>
                                <span class="period">/noite</span>
                            </div>
                        </div>
                        
                        <p class="location">📍 ${hotel.location} • ${hotel.distance}</p>
                        <p class="description">${hotel.description}</p>
                        
                        <div class="amenities-preview">
                            ${hotel.amenities.slice(0, 6).map(a => `
                                <span class="amenity-badge">${a.icon} ${a.name}</span>
                            `).join('')}
                            ${hotel.amenities.length > 6 ? `<span class="more-amenities">+${hotel.amenities.length - 6} mais</span>` : ''}
                        </div>
                        
                        <button class="btn-reserve" onclick="event.stopPropagation(); openHotelBooking(${hotel.id})">
                            Reservar Agora
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function filterHotels(category) {
    // Update active filter button
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadHotels(category);
}

// View hotel details in modal
function viewHotelDetails(hotelId) {
    const hotel = hotels.find(h => h.id === hotelId);
    // Here you could open a detailed modal if needed
    console.log('Viewing hotel:', hotel);
}

// Load packages
function loadPackages() {
    const container = document.getElementById('packagesList');
    
    container.innerHTML = `
        <div class="packages-full-grid">
            ${packages.map(pkg => `
                <div class="package-full-card ${pkg.featured ? 'featured-package' : ''}">
                    ${pkg.featured ? '<div class="package-featured-badge">Mais Popular</div>' : ''}
                    <div class="package-full-image">
                        <img src="${pkg.image}" alt="${pkg.name}">
                    </div>
                    <div class="package-full-content">
                        <div class="package-category">${pkg.duration}</div>
                        <h3>${pkg.name}</h3>
                        
                        <div class="package-price-box">
                            <span class="price">${pkg.price.toLocaleString()} Kz</span>
                            <span class="per-person">por pessoa</span>
                        </div>
                        
                        <p class="description">${pkg.description}</p>
                        
                        <div class="package-includes-section">
                            <h4>O que está incluído:</h4>
                            <ul class="includes-list">
                                ${pkg.includes.map(item => `<li>✓ ${item}</li>`).join('')}
                            </ul>
                        </div>
                        
                        ${pkg.itinerary ? `
                            <div class="package-itinerary-preview">
                                <h4>Roteiro:</h4>
                                <div class="itinerary-days">
                                    ${pkg.itinerary.slice(0, 2).map(day => `
                                        <div class="itinerary-day">
                                            <strong>Dia ${day.day}:</strong> ${day.activities[0]}
                                        </div>
                                    `).join('')}
                                    ${pkg.itinerary.length > 2 ? '<div class="more-days">+ mais atividades...</div>' : ''}
                                </div>
                            </div>
                        ` : ''}
                        
                        <button class="btn-reserve-package" onclick="openPackageBooking(${pkg.id})">
                            Reservar Pacote
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Open hotel booking modal
function openHotelBooking(hotelId) {
    const hotel = hotels.find(h => h.id === hotelId);
    document.getElementById('selectedHotelId').value = hotelId;
    
    document.getElementById('selectedHotelInfo').innerHTML = `
        <div class="selected-item-info">
            <img src="${hotel.image}" alt="${hotel.name}">
            <div class="item-details">
                <h4>${hotel.name}</h4>
                <p>📍 ${hotel.location}</p>
                <div class="rating">⭐ ${hotel.rating} (${hotel.reviews} avaliações)</div>
                <div class="price-info">${hotel.pricePerNight.toLocaleString()} Kz/noite</div>
            </div>
        </div>
        
        <div class="room-types-select">
            <label>Tipo de Quarto:</label>
            <select id="roomType" onchange="calculateHotelPrice()">
                ${hotel.roomTypes.map(room => `
                    <option value="${room.price}" data-capacity="${room.capacity}">
                        ${room.type} - ${room.capacity} pessoas - ${room.price.toLocaleString()} Kz/noite
                    </option>
                `).join('')}
            </select>
        </div>
    `;
    
    document.getElementById('hotelBookingModal').classList.add('active');
    calculateHotelPrice();
}

// Calculate hotel booking price
function calculateHotelPrice() {
    const checkIn = document.getElementById('checkInHotel').value;
    const checkOut = document.getElementById('checkOutHotel').value;
    const rooms = parseInt(document.getElementById('roomsHotel').value) || 1;
    const roomTypeSelect = document.getElementById('roomType');
    const pricePerNight = parseFloat(roomTypeSelect.value) || 0;
    
    if (checkIn && checkOut) {
        const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
        const total = pricePerNight * nights * rooms;
        
        document.getElementById('nightsCount').textContent = `${nights} ${nights === 1 ? 'noite' : 'noites'}`;
        document.getElementById('pricePerNight').textContent = pricePerNight.toLocaleString() + ' Kz';
        document.getElementById('totalPriceHotel').textContent = total.toLocaleString() + ' Kz';
    }
}

// Handle hotel booking form
document.getElementById('hotelBookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const hotelId = parseInt(document.getElementById('selectedHotelId').value);
    const hotel = hotels.find(h => h.id === hotelId);
    const checkIn = document.getElementById('checkInHotel').value;
    const checkOut = document.getElementById('checkOutHotel').value;
    const rooms = parseInt(document.getElementById('roomsHotel').value);
    const guests = parseInt(document.getElementById('guestsHotel').value);
    const roomType = document.getElementById('roomType').selectedOptions[0].text.split(' - ')[0];
    const pricePerNight = parseFloat(document.getElementById('roomType').value);
    
    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
    const totalPrice = pricePerNight * nights * rooms;
    
    const newReservation = {
        id: generateId(),
        type: 'hotel',
        userId: currentUser.id,
        userName: currentUser.name,
        itemName: hotel.name,
        itemImage: hotel.image,
        roomType: roomType,
        checkIn: checkIn,
        checkOut: checkOut,
        nights: nights,
        rooms: rooms,
        guests: guests,
        pricePerNight: pricePerNight,
        totalPrice: totalPrice,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
    };
    
    const reservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    reservations.push(newReservation);
    localStorage.setItem('juzzs_reservations', JSON.stringify(reservations));
    
    closeModal('hotelBookingModal');
    showSection('reservas');
    loadStats();
    loadReservations();
    
    showNotification('Reserva de hotel criada com sucesso!', 'success');
});

// Open package booking modal
function openPackageBooking(packageId) {
    const pkg = packages.find(p => p.id === packageId);
    document.getElementById('selectedPackageId').value = packageId;
    
    document.getElementById('selectedPackageInfo').innerHTML = `
        <div class="selected-item-info">
            <img src="${pkg.image}" alt="${pkg.name}">
            <div class="item-details">
                <h4>${pkg.name}</h4>
                <p>${pkg.duration}</p>
                <div class="price-info">${pkg.price.toLocaleString()} Kz/pessoa</div>
            </div>
        </div>
        
        <div class="package-details-preview">
            <h4>Inclui:</h4>
            <ul>
                ${pkg.includes.slice(0, 4).map(item => `<li>✓ ${item}</li>`).join('')}
                ${pkg.includes.length > 4 ? `<li class="more-items">+ ${pkg.includes.length - 4} mais itens</li>` : ''}
            </ul>
        </div>
    `;
    
    document.getElementById('packageBookingModal').classList.add('active');
    calculatePackagePrice();
}

// Calculate package price
function calculatePackagePrice() {
    const packageId = parseInt(document.getElementById('selectedPackageId').value);
    const pkg = packages.find(p => p.id === packageId);
    const guests = parseInt(document.getElementById('guestsPackage').value) || 1;
    const total = pkg.price * guests;
    
    document.getElementById('totalPricePackage').textContent = total.toLocaleString() + ' Kz';
}

// Handle package booking form
document.getElementById('packageBookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const packageId = parseInt(document.getElementById('selectedPackageId').value);
    const pkg = packages.find(p => p.id === packageId);
    const checkIn = document.getElementById('checkInPackage').value;
    const guests = parseInt(document.getElementById('guestsPackage').value);
    
    const newReservation = {
        id: generateId(),
        type: 'package',
        userId: currentUser.id,
        userName: currentUser.name,
        itemName: pkg.name,
        itemImage: pkg.image,
        duration: pkg.duration,
        checkIn: checkIn,
        guests: guests,
        pricePerPerson: pkg.price,
        totalPrice: pkg.price * guests,
        includes: pkg.includes,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
    };
    
    const reservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    reservations.push(newReservation);
    localStorage.setItem('juzzs_reservations', JSON.stringify(reservations));
    
    closeModal('packageBookingModal');
    showSection('reservas');
    loadStats();
    loadReservations();
    
    showNotification('Reserva de pacote criada com sucesso!', 'success');
});

// Load reservations
function loadReservations() {
    const reservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    const userReservations = reservations.filter(r => r.userId === currentUser.id);
    
    const container = document.getElementById('reservationsList');
    
    if (userReservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>Nenhuma reserva ainda</h3>
                <p>Explore nossos hotéis e pacotes e faça sua primeira reserva!</p>
                <button class="btn-empty" onclick="showSection('hoteis')">Explorar Hotéis</button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="reservations-list">
                ${userReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(reservation => `
                    <div class="reservation-card ${reservation.status}" onclick="viewReservationDetails('${reservation.id}')">
                        <div class="reservation-image">
                            <img src="${reservation.itemImage}" alt="${reservation.itemName}">
                            <div class="reservation-type-badge">${reservation.type === 'hotel' ? '🏨 Hotel' : '📦 Pacote'}</div>
                        </div>
                        
                        <div class="reservation-details">
                            <div class="reservation-header">
                                <h4>${reservation.itemName}</h4>
                                <div class="reservation-status ${reservation.status}">
                                    ${getStatusText(reservation.status)}
                                </div>
                            </div>
                            
                            <div class="reservation-info">
                                ${reservation.type === 'hotel' ? `
                                    <div class="info-item">
                                        <span class="label">Check-in:</span>
                                        <span class="value">${formatDate(reservation.checkIn)}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Check-out:</span>
                                        <span class="value">${formatDate(reservation.checkOut)}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Quartos:</span>
                                        <span class="value">${reservation.rooms} ${reservation.rooms === 1 ? 'quarto' : 'quartos'}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Hóspedes:</span>
                                        <span class="value">${reservation.guests} ${reservation.guests === 1 ? 'pessoa' : 'pessoas'}</span>
                                    </div>
                                ` : `
                                    <div class="info-item">
                                        <span class="label">Data início:</span>
                                        <span class="value">${formatDate(reservation.checkIn)}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Duração:</span>
                                        <span class="value">${reservation.duration}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Pessoas:</span>
                                        <span class="value">${reservation.guests} ${reservation.guests === 1 ? 'pessoa' : 'pessoas'}</span>
                                    </div>
                                `}
                            </div>
                            
                            <div class="reservation-footer">
                                <div class="reservation-price">
                                    <span class="label">Total:</span>
                                    <span class="value">${reservation.totalPrice.toLocaleString()} Kz</span>
                                </div>
                                <button class="btn-view-details" onclick="event.stopPropagation(); viewReservationDetails('${reservation.id}')">
                                    Ver Detalhes →
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// View reservation details
function viewReservationDetails(reservationId) {
    const reservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    const reservation = reservations.find(r => r.id === reservationId);
    
    if (!reservation) return;
    
    const content = document.getElementById('reservationDetailsContent');
    content.innerHTML = `
        <div class="reservation-details-full">
            <div class="details-image-section">
                <img src="${reservation.itemImage}" alt="${reservation.itemName}">
            </div>
            
            <div class="details-info-section">
                <div class="details-header">
                    <div>
                        <h2>${reservation.itemName}</h2>
                        <p class="reservation-id">ID: ${reservation.id}</p>
                    </div>
                    <div class="status-badge-large ${reservation.status}">
                        ${getStatusText(reservation.status)}
                    </div>
                </div>
                
                <div class="details-grid">
                    ${reservation.type === 'hotel' ? `
                        <div class="detail-item">
                            <div class="detail-icon">📅</div>
                            <div>
                                <div class="detail-label">Check-in</div>
                                <div class="detail-value">${formatDate(reservation.checkIn)}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-icon">📅</div>
                            <div>
                                <div class="detail-label">Check-out</div>
                                <div class="detail-value">${formatDate(reservation.checkOut)}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-icon">🛏️</div>
                            <div>
                                <div class="detail-label">Tipo de Quarto</div>
                                <div class="detail-value">${reservation.roomType}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-icon">🏨</div>
                            <div>
                                <div class="detail-label">Quartos</div>
                                <div class="detail-value">${reservation.rooms}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-icon">👥</div>
                            <div>
                                <div class="detail-label">Hóspedes</div>
                                <div class="detail-value">${reservation.guests}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-icon">🌙</div>
                            <div>
                                <div class="detail-label">Noites</div>
                                <div class="detail-value">${reservation.nights}</div>
                            </div>
                        </div>
                    ` : `
                        <div class="detail-item">
                            <div class="detail-icon">📅</div>
                            <div>
                                <div class="detail-label">Data de Início</div>
                                <div class="detail-value">${formatDate(reservation.checkIn)}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-icon">⏱️</div>
                            <div>
                                <div class="detail-label">Duração</div>
                                <div class="detail-value">${reservation.duration}</div>
                            </div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-icon">👥</div>
                            <div>
                                <div class="detail-label">Pessoas</div>
                                <div class="detail-value">${reservation.guests}</div>
                            </div>
                        </div>
                    `}
                </div>
                
                ${reservation.includes ? `
                    <div class="includes-section">
                        <h4>O que está incluído:</h4>
                        <ul>
                            ${reservation.includes.map(item => `<li>✓ ${item}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="price-breakdown">
                    <div class="breakdown-row">
                        <span>${reservation.type === 'hotel' ? 'Preço por noite' : 'Preço por pessoa'}:</span>
                        <span>${(reservation.type === 'hotel' ? reservation.pricePerNight : reservation.pricePerPerson).toLocaleString()} Kz</span>
                    </div>
                    ${reservation.type === 'hotel' ? `
                        <div class="breakdown-row">
                            <span>Noites:</span>
                            <span>${reservation.nights}</span>
                        </div>
                        <div class="breakdown-row">
                            <span>Quartos:</span>
                            <span>${reservation.rooms}</span>
                        </div>
                    ` : `
                        <div class="breakdown-row">
                            <span>Pessoas:</span>
                            <span>${reservation.guests}</span>
                        </div>
                    `}
                    <div class="breakdown-row total">
                        <span>Total:</span>
                        <span>${reservation.totalPrice.toLocaleString()} Kz</span>
                    </div>
                </div>
                
                <div class="details-actions">
                    ${reservation.status === 'pending' ? `
                        <button class="btn-cancel" onclick="cancelReservation('${reservation.id}')">
                            Cancelar Reserva
                        </button>
                    ` : ''}
                    <button class="btn-close-modal" onclick="closeModal('reservationDetailsModal')">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('reservationDetailsModal').classList.add('active');
}

// Cancel reservation
function cancelReservation(reservationId) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    
    const reservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    const index = reservations.findIndex(r => r.id === reservationId);
    
    if (index !== -1) {
        reservations[index].status = 'cancelled';
        localStorage.setItem('juzzs_reservations', JSON.stringify(reservations));
        
        closeModal('reservationDetailsModal');
        loadStats();
        loadReservations();
        showNotification('Reserva cancelada com sucesso', 'info');
    }
}

// Helper functions
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName + '-section').classList.add('active');
    
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the correct menu item
    const menuItem = Array.from(document.querySelectorAll('.sidebar-menu a'))
        .find(a => a.getAttribute('onclick')?.includes(`'${sectionName}'`));
    if (menuItem) {
        menuItem.classList.add('active');
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('juzzs_current_user');
        window.location.href = 'index.html';
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'confirmed': 'Confirmada',
        'cancelled': 'Cancelada',
        'completed': 'Concluída'
    };
    return statusMap[status] || status;
}

function showNotification(message, type = 'success') {
    alert(message); // For now, using alert. Can be replaced with a better notification system
}