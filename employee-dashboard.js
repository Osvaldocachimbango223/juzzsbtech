// Employee Dashboard Main JavaScript

// Check authentication
const currentUser = JSON.parse(localStorage.getItem('juzzs_current_user'));
if (!currentUser || currentUser.role !== 'employee') {
    window.location.href = 'login.html';
}

let allReservations = [];
let currentMonth = new Date();

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadReservations();
    
    // Set minimum dates for availability check
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('availCheckIn').min = today;
    document.getElementById('availCheckOut').min = today;
    document.getElementById('availCheckIn').value = today;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('availCheckOut').value = tomorrow.toISOString().split('T')[0];
});

// Load user information
function loadUserInfo() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0);
}

// Load all reservations
function loadReservations() {
    allReservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    updateStats();
    loadRecentReservations();
    loadTodayCheckins();
    filterReservations();
    loadReports();
    renderCalendar();
}

// Update dashboard statistics
function updateStats() {
    const total = allReservations.length;
    const pending = allReservations.filter(r => r.status === 'pending').length;
    const confirmed = allReservations.filter(r => r.status === 'confirmed').length;
    
    // Calculate total revenue from confirmed reservations
    const totalRevenue = allReservations
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => sum + r.totalPrice, 0);
    
    document.getElementById('totalReservas').textContent = total;
    document.getElementById('reservasPendentes').textContent = pending;
    document.getElementById('reservasConfirmadas').textContent = confirmed;
    document.getElementById('receitaTotal').textContent = formatCurrency(totalRevenue);
}

// Load recent pending reservations
function loadRecentReservations() {
    const pendingReservations = allReservations
        .filter(r => r.status === 'pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    const container = document.getElementById('recentReservations');
    
    if (pendingReservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <div class="empty-icon">✅</div>
                <p>Nenhuma reserva pendente no momento</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="reservations-mini-list">
                ${pendingReservations.map(reservation => `
                    <div class="reservation-mini-card" onclick="viewReservationDetails('${reservation.id}')">
                        <div class="mini-card-image">
                            <img src="${reservation.itemImage}" alt="${reservation.itemName}">
                        </div>
                        <div class="mini-card-details">
                            <h4>${reservation.userName}</h4>
                            <p>${reservation.itemName}</p>
                            <span class="mini-date">📅 ${formatDate(reservation.checkIn)}</span>
                        </div>
                        <div class="mini-card-actions">
                            <button class="btn-mini-confirm" onclick="event.stopPropagation(); confirmReservation('${reservation.id}')">✓</button>
                            <button class="btn-mini-reject" onclick="event.stopPropagation(); cancelReservation('${reservation.id}')">✗</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Load today's check-ins
function loadTodayCheckins() {
    const today = new Date().toISOString().split('T')[0];
    const todayCheckins = allReservations.filter(r => 
        r.status === 'confirmed' && 
        r.checkIn.split('T')[0] === today
    );
    
    const container = document.getElementById('todayCheckins');
    
    if (todayCheckins.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <div class="empty-icon">📅</div>
                <p>Nenhum check-in programado para hoje</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="checkin-list">
                ${todayCheckins.map(reservation => `
                    <div class="checkin-card">
                        <div class="checkin-info">
                            <h4>${reservation.userName}</h4>
                            <p>${reservation.itemName}</p>
                            ${reservation.type === 'hotel' ? 
                                `<span class="info-badge">🛏️ ${reservation.rooms} ${reservation.rooms === 1 ? 'quarto' : 'quartos'} • ${reservation.guests} ${reservation.guests === 1 ? 'hóspede' : 'hóspedes'}</span>` :
                                `<span class="info-badge">👥 ${reservation.guests} ${reservation.guests === 1 ? 'pessoa' : 'pessoas'}</span>`
                            }
                        </div>
                        <button class="btn-view-small" onclick="viewReservationDetails('${reservation.id}')">
                            Ver Detalhes →
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Filter reservations
function filterReservations() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    
    let filtered = [...allReservations];
    
    // Filter by type
    if (typeFilter !== 'all') {
        filtered = filtered.filter(r => r.type === typeFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    // Filter by date
    if (dateFilter) {
        filtered = filtered.filter(r => r.checkIn.split('T')[0] === dateFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(r => 
            r.userName.toLowerCase().includes(searchTerm) ||
            r.itemName.toLowerCase().includes(searchTerm) ||
            r.id.toLowerCase().includes(searchTerm)
        );
    }
    
    displayReservations(filtered);
}

// Display reservations in table
function displayReservations(reservations) {
    const container = document.getElementById('reservationsList');
    
    if (!container) return;
    
    if (reservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>Nenhuma reserva encontrada</h3>
                <p>Tente ajustar os filtros de busca</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (most recent first)
    reservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table-modern">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Cliente</th>
                        <th>Serviço</th>
                        <th>Check-in</th>
                        <th>Detalhes</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${reservations.map(r => `
                        <tr class="table-row-clickable" onclick="viewReservationDetails('${r.id}')">
                            <td>
                                <span class="type-badge ${r.type}">
                                    ${r.type === 'hotel' ? '🏨 Hotel' : '📦 Pacote'}
                                </span>
                            </td>
                            <td>
                                <div class="customer-cell">
                                    <strong>${r.userName}</strong>
                                    <small>${r.id.substr(0, 8)}</small>
                                </div>
                            </td>
                            <td><strong>${r.itemName}</strong></td>
                            <td>${formatDate(r.checkIn)}</td>
                            <td>
                                ${r.type === 'hotel' ? 
                                    `${r.nights} ${r.nights === 1 ? 'noite' : 'noites'} • ${r.rooms} ${r.rooms === 1 ? 'quarto' : 'quartos'}` :
                                    `${r.duration} • ${r.guests} ${r.guests === 1 ? 'pessoa' : 'pessoas'}`
                                }
                            </td>
                            <td><strong class="price-text">${formatCurrency(r.totalPrice)}</strong></td>
                            <td>
                                <span class="status-badge ${r.status}">
                                    ${getStatusIcon(r.status)} ${getStatusText(r.status)}
                                </span>
                            </td>
                            <td onclick="event.stopPropagation()">
                                ${r.status === 'pending' ? `
                                    <div class="action-buttons">
                                        <button class="btn-action-small btn-confirm" onclick="confirmReservation('${r.id}')" title="Confirmar">
                                            ✓
                                        </button>
                                        <button class="btn-action-small btn-reject" onclick="cancelReservation('${r.id}')" title="Cancelar">
                                            ✗
                                        </button>
                                        <button class="btn-action-small btn-view" onclick="viewReservationDetails('${r.id}')" title="Ver Detalhes">
                                            👁️
                                        </button>
                                    </div>
                                ` : r.status === 'confirmed' ? `
                                    <div class="action-buttons">
                                        <button class="btn-action-small btn-invoice" onclick="generateInvoice('${r.id}')" title="Gerar Fatura">
                                            🧾
                                        </button>
                                        <button class="btn-action-small btn-view" onclick="viewReservationDetails('${r.id}')" title="Ver Detalhes">
                                            👁️
                                        </button>
                                    </div>
                                ` : `
                                    <button class="btn-action-small btn-view" onclick="viewReservationDetails('${r.id}')" title="Ver Detalhes">
                                        👁️
                                    </button>
                                `}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// View reservation details
function viewReservationDetails(reservationId) {
    const reservation = allReservations.find(r => r.id === reservationId);
    if (!reservation) return;
    
    const detailsContainer = document.getElementById('reservationDetails');
    detailsContainer.innerHTML = `
        <div class="reservation-details-employee">
            <div class="details-section">
                <div class="details-image">
                    <img src="${reservation.itemImage}" alt="${reservation.itemName}">
                </div>
                <div class="details-header-info">
                    <h2>${reservation.itemName}</h2>
                    <p class="reservation-id">ID: ${reservation.id}</p>
                    <div class="status-badge-large ${reservation.status}">
                        ${getStatusIcon(reservation.status)} ${getStatusText(reservation.status)}
                    </div>
                </div>
            </div>
            
            <div class="details-grid-full">
                <div class="detail-card">
                    <h4>👤 Informações do Cliente</h4>
                    <div class="detail-row">
                        <span>Nome:</span>
                        <strong>${reservation.userName}</strong>
                    </div>
                </div>
                
                <div class="detail-card">
                    <h4>📅 Informações da Reserva</h4>
                    ${reservation.type === 'hotel' ? `
                        <div class="detail-row">
                            <span>Check-in:</span>
                            <strong>${formatDate(reservation.checkIn)}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Check-out:</span>
                            <strong>${formatDate(reservation.checkOut)}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Noites:</span>
                            <strong>${reservation.nights}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Quartos:</span>
                            <strong>${reservation.rooms} - ${reservation.roomType}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Hóspedes:</span>
                            <strong>${reservation.guests}</strong>
                        </div>
                    ` : `
                        <div class="detail-row">
                            <span>Data início:</span>
                            <strong>${formatDate(reservation.checkIn)}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Duração:</span>
                            <strong>${reservation.duration}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Pessoas:</span>
                            <strong>${reservation.guests}</strong>
                        </div>
                    `}
                </div>
                
                <div class="detail-card">
                    <h4>💰 Informações Financeiras</h4>
                    <div class="detail-row">
                        <span>Subtotal:</span>
                        <strong>${formatCurrency(reservation.totalPrice)}</strong>
                    </div>
                    <div class="detail-row total">
                        <span>Total:</span>
                        <strong class="price-highlight">${formatCurrency(reservation.totalPrice)}</strong>
                    </div>
                </div>
                
                ${reservation.status === 'confirmed' ? `
                    <div class="detail-card success">
                        <h4>✅ Confirmação</h4>
                        <div class="detail-row">
                            <span>Confirmada por:</span>
                            <strong>${reservation.confirmedBy || 'Sistema'}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Data:</span>
                            <strong>${formatDate(reservation.confirmedAt || reservation.createdAt)}</strong>
                        </div>
                    </div>
                ` : reservation.status === 'cancelled' ? `
                    <div class="detail-card error">
                        <h4>❌ Cancelamento</h4>
                        <div class="detail-row">
                            <span>Cancelada por:</span>
                            <strong>${reservation.cancelledBy || 'Cliente'}</strong>
                        </div>
                        <div class="detail-row">
                            <span>Data:</span>
                            <strong>${formatDate(reservation.cancelledAt || reservation.createdAt)}</strong>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${reservation.includes ? `
                <div class="includes-section-full">
                    <h4>📋 Incluído no ${reservation.type === 'hotel' ? 'Hotel' : 'Pacote'}</h4>
                    <ul class="includes-grid">
                        ${reservation.includes.map(item => `<li>✓ ${item}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            <div class="modal-actions-footer">
                ${reservation.status === 'pending' ? `
                    <button class="btn-modal-action btn-confirm-full" onclick="confirmReservation('${reservation.id}')">
                        ✓ Confirmar Reserva
                    </button>
                    <button class="btn-modal-action btn-reject-full" onclick="cancelReservation('${reservation.id}')">
                        ✗ Cancelar Reserva
                    </button>
                ` : reservation.status === 'confirmed' ? `
                    <button class="btn-modal-action btn-invoice-full" onclick="closeModal('reservationModal'); generateInvoice('${reservation.id}')">
                        🧾 Gerar Fatura
                    </button>
                ` : ''}
                <button class="btn-modal-action btn-close-full" onclick="closeModal('reservationModal')">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('reservationModal').classList.add('active');
}

// Confirm reservation
function confirmReservation(reservationId) {
    if (!confirm('Confirmar esta reserva?')) return;
    
    const reservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    const index = reservations.findIndex(r => r.id === reservationId);
    
    if (index !== -1) {
        reservations[index].status = 'confirmed';
        reservations[index].paymentStatus = 'paid';
        reservations[index].confirmedBy = currentUser.name;
        reservations[index].confirmedAt = new Date().toISOString();
        
        localStorage.setItem('juzzs_reservations', JSON.stringify(reservations));
        
        closeModal('reservationModal');
        loadReservations();
        
        showNotification('Reserva confirmada com sucesso!', 'success');
    }
}

// Cancel reservation
function cancelReservation(reservationId) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    
    const reservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    const index = reservations.findIndex(r => r.id === reservationId);
    
    if (index !== -1) {
        reservations[index].status = 'cancelled';
        reservations[index].cancelledBy = currentUser.name;
        reservations[index].cancelledAt = new Date().toISOString();
        
        localStorage.setItem('juzzs_reservations', JSON.stringify(reservations));
        
        closeModal('reservationModal');
        loadReservations();
        
        showNotification('Reserva cancelada!', 'info');
    }
}

// Generate invoice
function generateInvoice(reservationId) {
    const reservation = allReservations.find(r => r.id === reservationId);
    if (!reservation) return;
    
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const today = new Date().toLocaleDateString('pt-BR');
    
    const invoiceContent = document.getElementById('invoiceContent');
    invoiceContent.innerHTML = `
        <div class="invoice-document">
            <div class="invoice-header">
                <div class="invoice-logo">
                    <img src="logo.png" alt="Juzzs Logo" width="60px">
                    <div>
                        <h1>Juzzs Travel & Hospitality</h1>
                        <p>Experiências Turísticas em Angola</p>
                    </div>
                </div>
                <div class="invoice-number">
                    <h2>FATURA / RECIBO</h2>
                    <p>Nº ${invoiceNumber}</p>
                    <p>Data: ${today}</p>
                </div>
            </div>
            
            <div class="invoice-parties">
                <div class="invoice-party">
                    <h4>Emitido Por:</h4>
                    <p><strong>Juzzs Travel & Hospitality</strong></p>
                    <p>Menongue, Cuando Cubango</p>
                    <p>Angola</p>
                    <p>Tel: +244 935 144 360</p>
                    <p>Email: contato@juzzs.ao</p>
                </div>
                <div class="invoice-party">
                    <h4>Cliente:</h4>
                    <p><strong>${reservation.userName}</strong></p>
                    <p>ID Reserva: ${reservation.id}</p>
                    <p>Data Reserva: ${formatDate(reservation.createdAt)}</p>
                </div>
            </div>
            
            <div class="invoice-details">
                <h4>Detalhes do Serviço</h4>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Descrição</th>
                            <th>Quantidade</th>
                            <th>Preço Unit.</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <strong>${reservation.itemName}</strong><br>
                                <small>
                                    ${reservation.type === 'hotel' ? 
                                        `Check-in: ${formatDate(reservation.checkIn)}<br>
                                         Check-out: ${formatDate(reservation.checkOut)}<br>
                                         Tipo: ${reservation.roomType}` :
                                        `Início: ${formatDate(reservation.checkIn)}<br>
                                         Duração: ${reservation.duration}`
                                    }
                                </small>
                            </td>
                            <td>
                                ${reservation.type === 'hotel' ? 
                                    `${reservation.nights} ${reservation.nights === 1 ? 'noite' : 'noites'}<br>
                                     ${reservation.rooms} ${reservation.rooms === 1 ? 'quarto' : 'quartos'}` :
                                    `${reservation.guests} ${reservation.guests === 1 ? 'pessoa' : 'pessoas'}`
                                }
                            </td>
                            <td>
                                ${reservation.type === 'hotel' ? 
                                    formatCurrency(reservation.pricePerNight) + '/noite' :
                                    formatCurrency(reservation.pricePerPerson) + '/pessoa'
                                }
                            </td>
                            <td><strong>${formatCurrency(reservation.totalPrice)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            ${reservation.includes && reservation.includes.length > 0 ? `
                <div class="invoice-includes">
                    <h4>Incluído no Serviço:</h4>
                    <div class="includes-list-invoice">
                        ${reservation.includes.map(item => `<span>✓ ${item}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="invoice-totals">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <span>${formatCurrency(reservation.totalPrice)}</span>
                </div>
                <div class="totals-row">
                    <span>IVA (14%):</span>
                    <span>${formatCurrency(reservation.totalPrice * 0.14)}</span>
                </div>
                <div class="totals-row total">
                    <span>Total:</span>
                    <span>${formatCurrency(reservation.totalPrice * 1.14)}</span>
                </div>
            </div>
            
            <div class="invoice-payment">
                <p><strong>Status do Pagamento:</strong> ${reservation.status === 'confirmed' ? '✅ Pago' : '⏳ Pendente'}</p>
                <p><strong>Forma de Pagamento:</strong> Transferência Bancária / Dinheiro</p>
            </div>
            
            <div class="invoice-footer">
                <p>Obrigado por escolher a Juzzs Travel & Hospitality!</p>
                <p>Para dúvidas, entre em contato: contato@juzzs.ao | +244 935 144 360</p>
                <p><small>Este documento é válido como comprovante de reserva e pagamento.</small></p>
            </div>
        </div>
    `;
    
    document.getElementById('invoiceModal').classList.add('active');
}

// Print invoice
function printInvoice() {
    window.print();
}

// Check availability
function checkAvailability() {
    const checkIn = document.getElementById('availCheckIn').value;
    const checkOut = document.getElementById('availCheckOut').value;
    const guests = parseInt(document.getElementById('availGuests').value);
    
    if (!checkIn || !checkOut) {
        alert('Por favor, selecione as datas de check-in e check-out');
        return;
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
        alert('A data de check-out deve ser posterior à data de check-in');
        return;
    }
    
    // Get reservations that overlap with the selected dates
    const overlappingReservations = allReservations.filter(r => {
        if (r.status === 'cancelled' || r.type !== 'hotel') return false;
        
        const resCheckIn = new Date(r.checkIn);
        const resCheckOut = new Date(r.checkOut);
        
        return (checkInDate < resCheckOut && checkOutDate > resCheckIn);
    });
    
    // Calculate availability for each hotel
    const availability = hotels.map(hotel => {
        const bookedRooms = overlappingReservations
            .filter(r => r.itemName === hotel.name)
            .reduce((sum, r) => sum + r.rooms, 0);
        
        const totalRooms = 10; // Assuming 10 rooms per hotel
        const availableRooms = totalRooms - bookedRooms;
        const suitableRooms = hotel.roomTypes.filter(rt => rt.capacity >= guests);
        
        return {
            ...hotel,
            availableRooms,
            totalRooms,
            occupancyRate: ((bookedRooms / totalRooms) * 100).toFixed(0),
            suitable: suitableRooms.length > 0 && availableRooms > 0
        };
    });
    
    displayAvailability(availability, checkIn, checkOut, guests);
}

// Display availability results
function displayAvailability(availability, checkIn, checkOut, guests) {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const container = document.getElementById('availabilityResults');
    
    container.innerHTML = `
        <div class="availability-summary">
            <h3>Resultados da Consulta</h3>
            <p>📅 ${formatDate(checkIn)} até ${formatDate(checkOut)} (${nights} ${nights === 1 ? 'noite' : 'noites'})</p>
            <p>👥 ${guests} ${guests === 1 ? 'hóspede' : 'hóspedes'}</p>
        </div>
        
        <div class="availability-grid">
            ${availability.map(hotel => `
                <div class="availability-card ${hotel.suitable ? 'available' : 'unavailable'}">
                    <div class="avail-header">
                        <img src="${hotel.image}" alt="${hotel.name}">
                        <div class="avail-status ${hotel.availableRooms > 0 ? 'available' : 'full'}">
                            ${hotel.availableRooms > 0 ? '✓ Disponível' : '✗ Esgotado'}
                        </div>
                    </div>
                    <div class="avail-content">
                        <h4>${hotel.name}</h4>
                        <p class="location">📍 ${hotel.location}</p>
                        
                        <div class="avail-stats">
                            <div class="avail-stat">
                                <span class="stat-label">Quartos Disponíveis</span>
                                <span class="stat-value ${hotel.availableRooms === 0 ? 'zero' : ''}">${hotel.availableRooms} / ${hotel.totalRooms}</span>
                            </div>
                            <div class="avail-stat">
                                <span class="stat-label">Taxa de Ocupação</span>
                                <span class="stat-value">${hotel.occupancyRate}%</span>
                            </div>
                        </div>
                        
                        ${hotel.suitable && hotel.availableRooms > 0 ? `
                            <div class="avail-rooms">
                                <h5>Tipos Disponíveis:</h5>
                                ${hotel.roomTypes.filter(rt => rt.capacity >= guests).map(room => `
                                    <div class="room-option">
                                        <span>${room.type} (até ${room.capacity} pessoas)</span>
                                        <strong>${formatCurrency(room.price * nights)}</strong>
                                    </div>
                                `).join('')}
                            </div>
                        ` : hotel.availableRooms === 0 ? `
                            <div class="avail-warning">
                                ⚠️ Sem quartos disponíveis neste período
                            </div>
                        ` : `
                            <div class="avail-warning">
                                ⚠️ Não há quartos adequados para ${guests} ${guests === 1 ? 'hóspede' : 'hóspedes'}
                            </div>
                        `}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Calendar functions
function renderCalendar() {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    document.getElementById('calendarMonth').textContent = 
        `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    let calendarHTML = '<div class="calendar-grid"><div class="calendar-header">';
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-name">${day}</div>`;
    });
    calendarHTML += '</div><div class="calendar-days">';
    
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Count reservations for this day
        const dayReservations = allReservations.filter(r => {
            const checkIn = new Date(r.checkIn);
            const checkOut = r.checkOut ? new Date(r.checkOut) : new Date(r.checkIn);
            return r.status === 'confirmed' && currentDate >= checkIn && currentDate < checkOut;
        }).length;
        
        const isToday = currentDate.toDateString() === today.toDateString();
        const hasReservations = dayReservations > 0;
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasReservations ? 'has-reservations' : ''}"
                 onclick="viewDayReservations('${dateString}')">
                <span class="day-number">${day}</span>
                ${hasReservations ? `<span class="day-count">${dayReservations}</span>` : ''}
            </div>
        `;
    }
    
    calendarHTML += '</div></div>';
    document.getElementById('calendarView').innerHTML = calendarHTML;
}

function changeMonth(direction) {
    currentMonth.setMonth(currentMonth.getMonth() + direction);
    renderCalendar();
}

function viewDayReservations(dateString) {
    document.getElementById('dateFilter').value = dateString;
    showSection('reservas');
    filterReservations();
}

// Reports
function loadReports() {
    const confirmed = allReservations.filter(r => r.status === 'confirmed');
    const totalRevenue = confirmed.reduce((sum, r) => sum + r.totalPrice, 0);
    const avgTicket = confirmed.length > 0 ? totalRevenue / confirmed.length : 0;
    
    // Calculate occupancy rate (simplified)
    const totalRooms = hotels.length * 10 * 30; // hotels * rooms * days
    const occupiedRooms = confirmed
        .filter(r => r.type === 'hotel')
        .reduce((sum, r) => sum + (r.rooms * r.nights), 0);
    const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(1);
    
    document.getElementById('reportTotalReservas').textContent = allReservations.length;
    document.getElementById('reportReceita').textContent = formatCurrency(totalRevenue);
    document.getElementById('reportTaxaOcupacao').textContent = occupancyRate + '%';
    document.getElementById('reportTicketMedio').textContent = formatCurrency(avgTicket);
    
    // Top hotels
    const hotelStats = {};
    confirmed.filter(r => r.type === 'hotel').forEach(r => {
        if (!hotelStats[r.itemName]) {
            hotelStats[r.itemName] = { count: 0, revenue: 0 };
        }
        hotelStats[r.itemName].count++;
        hotelStats[r.itemName].revenue += r.totalPrice;
    });
    
    const topHotelsArray = Object.entries(hotelStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);
    
    document.getElementById('topHotels').innerHTML = topHotelsArray.length > 0 ? `
        <div class="ranking-list">
            ${topHotelsArray.map(([name, stats], index) => `
                <div class="ranking-item">
                    <span class="rank">#${index + 1}</span>
                    <div class="rank-details">
                        <strong>${name}</strong>
                        <small>${stats.count} reservas • ${formatCurrency(stats.revenue)}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<p class="empty-text">Nenhum dado disponível</p>';
    
    // Top packages
    const packageStats = {};
    confirmed.filter(r => r.type === 'package').forEach(r => {
        if (!packageStats[r.itemName]) {
            packageStats[r.itemName] = { count: 0, revenue: 0 };
        }
        packageStats[r.itemName].count++;
        packageStats[r.itemName].revenue += r.totalPrice;
    });
    
    const topPackagesArray = Object.entries(packageStats)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);
    
    document.getElementById('topPackages').innerHTML = topPackagesArray.length > 0 ? `
        <div class="ranking-list">
            ${topPackagesArray.map(([name, stats], index) => `
                <div class="ranking-item">
                    <span class="rank">#${index + 1}</span>
                    <div class="rank-details">
                        <strong>${name}</strong>
                        <small>${stats.count} vendas • ${formatCurrency(stats.revenue)}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<p class="empty-text">Nenhum dado disponível</p>';
}

// Export report
function exportReport() {
    alert('Funcionalidade de exportação será implementada em breve!');
}

// Filter by status from dashboard stats
function filterByStatus(status) {
    showSection('reservas');
    document.getElementById('statusFilter').value = status;
    filterReservations();
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
    
    const menuItem = Array.from(document.querySelectorAll('.sidebar-menu a'))
        .find(a => a.getAttribute('onclick')?.includes(`'${sectionName}'`));
    if (menuItem) {
        menuItem.classList.add('active');
    }
    
    // Load section-specific data
    if (sectionName === 'calendario') {
        renderCalendar();
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

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatCurrency(value) {
    return Math.round(value).toLocaleString() + ' Kz';
}

function getStatusText(status) {
    const map = { pending: 'Pendente', confirmed: 'Confirmada', cancelled: 'Cancelada' };
    return map[status] || status;
}

function getStatusIcon(status) {
    const map = { pending: '⏰', confirmed: '✓', cancelled: '✗' };
    return map[status] || '';
}

function showNotification(message, type = 'success') {
    alert(message);
}

// Add print styles
const printStyles = `
    @media print {
        body * {
            visibility: hidden;
        }
        #invoiceContent, #invoiceContent * {
            visibility: visible;
        }
        #invoiceContent {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
        }
        .no-print {
            display: none !important;
        }
        .invoice-document {
            box-shadow: none !important;
            border: none !important;
        }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = printStyles;
document.head.appendChild(styleSheet);
