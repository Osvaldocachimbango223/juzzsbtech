// Admin Dashboard Main JavaScript

// Check authentication
const currentUser = JSON.parse(localStorage.getItem('juzzs_current_user'));
if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'login.html';
}

let allUsers = [];
let allReservations = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadAllData();
    
    // Set minimum dates
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('availCheckInAdmin')) {
        document.getElementById('availCheckInAdmin').min = today;
        document.getElementById('availCheckOutAdmin').min = today;
        document.getElementById('availCheckInAdmin').value = today;
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('availCheckOutAdmin').value = tomorrow.toISOString().split('T')[0];
    }
});

// Load user information
function loadUserInfo() {
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0);
}

// Load all data
function loadAllData() {
    allUsers = JSON.parse(localStorage.getItem('juzzs_users')) || [];
    allReservations = JSON.parse(localStorage.getItem('juzzs_reservations')) || [];
    
    updateDashboardStats();
    loadRecentActivity();
    filterReservations();
    filterClients();
    loadEmployees();
    loadReports();
}

// Update dashboard statistics
function updateDashboardStats() {
    const clients = allUsers.filter(u => u.role === 'client');
    const employees = allUsers.filter(u => u.role === 'employee');
    const confirmedReservations = allReservations.filter(r => r.status === 'confirmed');
    const pendingReservations = allReservations.filter(r => r.status === 'pending');
    
    const totalRevenue = confirmedReservations.reduce((sum, r) => sum + r.totalPrice, 0);
    const activeClients = clients.filter(c => !c.blocked).length;
    const avgTicket = confirmedReservations.length > 0 ? totalRevenue / confirmedReservations.length : 0;
    
    // Calculate occupancy rate
    const totalRoomDays = hotels.length * 10 * 30; // hotels * rooms * days
    const occupiedRoomDays = confirmedReservations
        .filter(r => r.type === 'hotel')
        .reduce((sum, r) => sum + (r.rooms * r.nights), 0);
    const occupancyRate = ((occupiedRoomDays / totalRoomDays) * 100).toFixed(1);
    
    document.getElementById('totalReceita').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalReservas').textContent = allReservations.length;
    document.getElementById('totalClientes').textContent = clients.length;
    document.getElementById('totalFuncionarios').textContent = employees.length;
    
    document.getElementById('reservasPendentes').textContent = pendingReservations.length;
    document.getElementById('clientesAtivos').textContent = activeClients;
    document.getElementById('taxaOcupacao').textContent = occupancyRate + '%';
    document.getElementById('ticketMedio').textContent = formatCurrency(avgTicket);
}

// Load recent activity
function loadRecentActivity() {
    const recent = allReservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    
    const container = document.getElementById('recentActivity');
    
    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <div class="empty-icon">📋</div>
                <p>Nenhuma atividade recente</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="activity-list">
            ${recent.map(r => `
                <div class="activity-item" onclick="viewReservationDetailsAdmin('${r.id}')">
                    <div class="activity-icon ${r.status}">
                        ${getStatusIcon(r.status)}
                    </div>
                    <div class="activity-details">
                        <h4>${r.userName}</h4>
                        <p>${r.itemName}</p>
                        <span class="activity-time">${formatTimeAgo(r.createdAt)}</span>
                    </div>
                    <div class="activity-amount">
                        ${formatCurrency(r.totalPrice)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Filter reservations
function filterReservations() {
    const searchTerm = document.getElementById('searchReservation')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('typeFilterRes')?.value || 'all';
    const statusFilter = document.getElementById('reservationStatusFilter')?.value || 'all';
    
    let filtered = [...allReservations];
    
    if (typeFilter !== 'all') {
        filtered = filtered.filter(r => r.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(r => 
            r.userName.toLowerCase().includes(searchTerm) ||
            r.itemName.toLowerCase().includes(searchTerm) ||
            r.id.toLowerCase().includes(searchTerm)
        );
    }
    
    displayReservations(filtered);
}

// Display reservations
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
                        <tr class="table-row-clickable" onclick="viewReservationDetailsAdmin('${r.id}')">
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
                                <div class="action-buttons">
                                    ${r.status === 'pending' ? `
                                        <button class="btn-action-small btn-confirm" onclick="confirmReservationAdmin('${r.id}')" title="Confirmar">✓</button>
                                        <button class="btn-action-small btn-reject" onclick="cancelReservationAdmin('${r.id}')" title="Cancelar">✗</button>
                                    ` : r.status === 'confirmed' ? `
                                        <button class="btn-action-small btn-invoice" onclick="generateInvoiceAdmin('${r.id}')" title="Fatura">🧾</button>
                                    ` : ''}
                                    <button class="btn-action-small btn-view" onclick="viewReservationDetailsAdmin('${r.id}')" title="Ver">👁️</button>
                                    <button class="btn-action-small btn-delete" onclick="deleteReservationAdmin('${r.id}')" title="Excluir">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// View reservation details
function viewReservationDetailsAdmin(reservationId) {
    const reservation = allReservations.find(r => r.id === reservationId);
    if (!reservation) return;
    
    const detailsContainer = document.getElementById('reservationDetailsAdmin');
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
                        <div class="detail-row"><span>Check-in:</span><strong>${formatDate(reservation.checkIn)}</strong></div>
                        <div class="detail-row"><span>Check-out:</span><strong>${formatDate(reservation.checkOut)}</strong></div>
                        <div class="detail-row"><span>Noites:</span><strong>${reservation.nights}</strong></div>
                        <div class="detail-row"><span>Quartos:</span><strong>${reservation.rooms} - ${reservation.roomType}</strong></div>
                        <div class="detail-row"><span>Hóspedes:</span><strong>${reservation.guests}</strong></div>
                    ` : `
                        <div class="detail-row"><span>Data início:</span><strong>${formatDate(reservation.checkIn)}</strong></div>
                        <div class="detail-row"><span>Duração:</span><strong>${reservation.duration}</strong></div>
                        <div class="detail-row"><span>Pessoas:</span><strong>${reservation.guests}</strong></div>
                    `}
                </div>
                
                <div class="detail-card">
                    <h4>💰 Informações Financeiras</h4>
                    <div class="detail-row total">
                        <span>Total:</span>
                        <strong class="price-highlight">${formatCurrency(reservation.totalPrice)}</strong>
                    </div>
                </div>
            </div>
            
            <div class="modal-actions-footer">
                ${reservation.status === 'pending' ? `
                    <button class="btn-modal-action btn-confirm-full" onclick="confirmReservationAdmin('${reservation.id}')">✓ Confirmar</button>
                    <button class="btn-modal-action btn-reject-full" onclick="cancelReservationAdmin('${reservation.id}')">✗ Cancelar</button>
                ` : reservation.status === 'confirmed' ? `
                    <button class="btn-modal-action btn-invoice-full" onclick="closeModal('reservationModalAdmin'); generateInvoiceAdmin('${reservation.id}')">🧾 Gerar Fatura</button>
                ` : ''}
                <button class="btn-modal-action btn-delete-full" onclick="deleteReservationAdmin('${reservation.id}')">🗑️ Excluir</button>
                <button class="btn-modal-action btn-close-full" onclick="closeModal('reservationModalAdmin')">Fechar</button>
            </div>
        </div>
    `;
    
    document.getElementById('reservationModalAdmin').classList.add('active');
}

// Confirm reservation
function confirmReservationAdmin(reservationId) {
    if (!confirm('Confirmar esta reserva?')) return;
    
    const index = allReservations.findIndex(r => r.id === reservationId);
    if (index !== -1) {
        allReservations[index].status = 'confirmed';
        allReservations[index].confirmedBy = currentUser.name;
        allReservations[index].confirmedAt = new Date().toISOString();
        
        localStorage.setItem('juzzs_reservations', JSON.stringify(allReservations));
        closeModal('reservationModalAdmin');
        loadAllData();
        showNotification('Reserva confirmada com sucesso!', 'success');
    }
}

// Cancel reservation
function cancelReservationAdmin(reservationId) {
    if (!confirm('Cancelar esta reserva?')) return;
    
    const index = allReservations.findIndex(r => r.id === reservationId);
    if (index !== -1) {
        allReservations[index].status = 'cancelled';
        allReservations[index].cancelledBy = currentUser.name;
        allReservations[index].cancelledAt = new Date().toISOString();
        
        localStorage.setItem('juzzs_reservations', JSON.stringify(allReservations));
        closeModal('reservationModalAdmin');
        loadAllData();
        showNotification('Reserva cancelada!', 'info');
    }
}

// Delete reservation
function deleteReservationAdmin(reservationId) {
    if (!confirm('Tem certeza que deseja EXCLUIR permanentemente esta reserva? Esta ação não pode ser desfeita!')) return;
    
    allReservations = allReservations.filter(r => r.id !== reservationId);
    localStorage.setItem('juzzs_reservations', JSON.stringify(allReservations));
    
    closeModal('reservationModalAdmin');
    loadAllData();
    showNotification('Reserva excluída permanentemente!', 'success');
}

// Generate invoice (reusing from employee dashboard)
function generateInvoiceAdmin(reservationId) {
    const reservation = allReservations.find(r => r.id === reservationId);
    if (!reservation) return;
    
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const today = new Date().toLocaleDateString('pt-BR');
    
    document.getElementById('invoiceContentAdmin').innerHTML = `
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
                                        `Check-in: ${formatDate(reservation.checkIn)}<br>Check-out: ${formatDate(reservation.checkOut)}<br>Tipo: ${reservation.roomType}` :
                                        `Início: ${formatDate(reservation.checkIn)}<br>Duração: ${reservation.duration}`
                                    }
                                </small>
                            </td>
                            <td>
                                ${reservation.type === 'hotel' ? 
                                    `${reservation.nights} ${reservation.nights === 1 ? 'noite' : 'noites'}<br>${reservation.rooms} ${reservation.rooms === 1 ? 'quarto' : 'quartos'}` :
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
    
    document.getElementById('invoiceModalAdmin').classList.add('active');
}

// Print invoice
function printInvoiceAdmin() {
    window.print();
}

// Check availability (reusing logic)
function checkAvailabilityAdmin() {
    const checkIn = document.getElementById('availCheckInAdmin').value;
    const checkOut = document.getElementById('availCheckOutAdmin').value;
    const guests = parseInt(document.getElementById('availGuestsAdmin').value);
    
    if (!checkIn || !checkOut) {
        alert('Por favor, selecione as datas');
        return;
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
        alert('A data de check-out deve ser posterior à data de check-in');
        return;
    }
    
    const overlappingReservations = allReservations.filter(r => {
        if (r.status === 'cancelled' || r.type !== 'hotel') return false;
        const resCheckIn = new Date(r.checkIn);
        const resCheckOut = new Date(r.checkOut);
        return (checkInDate < resCheckOut && checkOutDate > resCheckIn);
    });
    
    const availability = hotels.map(hotel => {
        const bookedRooms = overlappingReservations
            .filter(r => r.itemName === hotel.name)
            .reduce((sum, r) => sum + r.rooms, 0);
        
        const totalRooms = 10;
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
    
    displayAvailabilityAdmin(availability, checkIn, checkOut, guests);
}

// Display availability (reusing from employee)
function displayAvailabilityAdmin(availability, checkIn, checkOut, guests) {
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    const container = document.getElementById('availabilityResultsAdmin');
    
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
                            <div class="avail-warning">⚠️ Sem quartos disponíveis</div>
                        ` : `
                            <div class="avail-warning">⚠️ Não há quartos adequados</div>
                        `}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Filter clients
function filterClients() {
    const searchTerm = document.getElementById('searchClient')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('clientStatusFilter')?.value || 'all';
    
    let clients = allUsers.filter(u => u.role === 'client');
    
    if (statusFilter === 'active') {
        clients = clients.filter(c => !c.blocked);
    } else if (statusFilter === 'blocked') {
        clients = clients.filter(c => c.blocked);
    }
    
    if (searchTerm) {
        clients = clients.filter(c => 
            c.name.toLowerCase().includes(searchTerm) ||
            c.email.toLowerCase().includes(searchTerm)
        );
    }
    
    displayClients(clients);
}

// Display clients
function displayClients(clients) {
    const container = document.getElementById('clientsList');
    if (!container) return;
    
    if (clients.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>Nenhum cliente encontrado</h3>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="users-grid">
            ${clients.map(client => {
                const clientReservations = allReservations.filter(r => r.userId === client.id);
                const totalSpent = clientReservations
                    .filter(r => r.status === 'confirmed')
                    .reduce((sum, r) => sum + r.totalPrice, 0);
                
                return `
                    <div class="user-card ${client.blocked ? 'blocked' : ''}">
                        <div class="user-card-header">
                            <div class="user-avatar-card">${client.name.charAt(0)}</div>
                            <div class="user-info-card">
                                <h4>${client.name}</h4>
                                <p>${client.email}</p>
                            </div>
                            ${client.blocked ? '<span class="blocked-badge">🚫 Bloqueado</span>' : ''}
                        </div>
                        
                        <div class="user-stats">
                            <div class="user-stat">
                                <span class="stat-label">Reservas</span>
                                <span class="stat-value">${clientReservations.length}</span>
                            </div>
                            <div class="user-stat">
                                <span class="stat-label">Total Gasto</span>
                                <span class="stat-value">${formatCurrency(totalSpent)}</span>
                            </div>
                            <div class="user-stat">
                                <span class="stat-label">Membro desde</span>
                                <span class="stat-value">${new Date(client.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                        
                        <div class="user-actions">
                            <button class="btn-user-action" onclick="editUser('${client.id}')" title="Editar">✏️</button>
                            <button class="btn-user-action ${client.blocked ? 'success' : 'warning'}" onclick="toggleBlockUser('${client.id}')" title="${client.blocked ? 'Desbloquear' : 'Bloquear'}">
                                ${client.blocked ? '✓' : '🚫'}
                            </button>
                            <button class="btn-user-action danger" onclick="deleteUser('${client.id}')" title="Excluir">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Load employees
function loadEmployees() {
    const employees = allUsers.filter(u => u.role === 'employee');
    const container = document.getElementById('employeesList');
    if (!container) return;
    
    if (employees.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👔</div>
                <h3>Nenhum funcionário cadastrado</h3>
                <p>Adicione funcionários para ajudar na gestão</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="users-grid">
            ${employees.map(emp => `
                <div class="user-card employee">
                    <div class="user-card-header">
                        <div class="user-avatar-card employee-avatar">${emp.name.charAt(0)}</div>
                        <div class="user-info-card">
                            <h4>${emp.name}</h4>
                            <p>${emp.email}</p>
                        </div>
                    </div>
                    
                    <div class="user-details">
                        <div class="detail-row">
                            <span>📞 Telefone:</span>
                            <strong>${emp.phone}</strong>
                        </div>
                        <div class="detail-row">
                            <span>📅 Cadastrado:</span>
                            <strong>${formatDate(emp.createdAt)}</strong>
                        </div>
                    </div>
                    
                    <div class="user-actions">
                        <button class="btn-user-action" onclick="editUser('${emp.id}')" title="Editar">✏️</button>
                        <button class="btn-user-action danger" onclick="deleteUser('${emp.id}')" title="Excluir">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Add employee
document.getElementById('addEmployeeForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('empName').value;
    const email = document.getElementById('empEmail').value;
    const phone = document.getElementById('empPhone').value;
    const password = document.getElementById('empPassword').value;
    
    if (allUsers.find(u => u.email === email)) {
        alert('Este email já está em uso');
        return;
    }
    
    const newEmployee = {
        id: generateId(),
        name,
        email,
        phone,
        password,
        role: 'employee',
        createdAt: new Date().toISOString()
    };
    
    allUsers.push(newEmployee);
    localStorage.setItem('juzzs_users', JSON.stringify(allUsers));
    
    closeModal('addEmployeeModal');
    loadAllData();
    this.reset();
    showNotification('Funcionário adicionado com sucesso!', 'success');
});

// Edit user
function editUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserEmail').value = user.email;
    document.getElementById('editUserPhone').value = user.phone;
    document.getElementById('editUserPassword').value = '';
    
    document.getElementById('editUserModal').classList.add('active');
}

// Save user edits
document.getElementById('editUserForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const phone = document.getElementById('editUserPhone').value;
    const password = document.getElementById('editUserPassword').value;
    
    const index = allUsers.findIndex(u => u.id === userId);
    if (index !== -1) {
        // Check if email is already in use by another user
        if (allUsers.find(u => u.email === email && u.id !== userId)) {
            alert('Este email já está em uso');
            return;
        }
        
        allUsers[index].name = name;
        allUsers[index].email = email;
        allUsers[index].phone = phone;
        if (password) {
            allUsers[index].password = password;
        }
        
        localStorage.setItem('juzzs_users', JSON.stringify(allUsers));
        closeModal('editUserModal');
        loadAllData();
        showNotification('Usuário atualizado com sucesso!', 'success');
    }
});

// Toggle block user
function toggleBlockUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    const action = user.blocked ? 'desbloquear' : 'bloquear';
    if (!confirm(`Tem certeza que deseja ${action} ${user.name}?`)) return;
    
    const index = allUsers.findIndex(u => u.id === userId);
    allUsers[index].blocked = !allUsers[index].blocked;
    
    localStorage.setItem('juzzs_users', JSON.stringify(allUsers));
    loadAllData();
    showNotification(`Cliente ${action}ado com sucesso!`, 'success');
}

// Delete user
function deleteUser(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`Tem certeza que deseja EXCLUIR ${user.name}? Esta ação não pode ser desfeita!`)) return;
    
    allUsers = allUsers.filter(u => u.id !== userId);
    localStorage.setItem('juzzs_users', JSON.stringify(allUsers));
    loadAllData();
    showNotification('Usuário excluído permanentemente!', 'success');
}

// Load reports
function loadReports() {
    const confirmed = allReservations.filter(r => r.status === 'confirmed');
    const totalRevenue = confirmed.reduce((sum, r) => sum + r.totalPrice, 0);
    const avgTicket = confirmed.length > 0 ? totalRevenue / confirmed.length : 0;
    const conversionRate = allReservations.length > 0 ? ((confirmed.length / allReservations.length) * 100).toFixed(1) : 0;
    
    document.getElementById('reportReceitaTotal').textContent = formatCurrency(totalRevenue);
    document.getElementById('reportTotalReservasAdmin').textContent = allReservations.length;
    document.getElementById('reportTaxaConversao').textContent = conversionRate + '%';
    document.getElementById('reportTicketMedioAdmin').textContent = formatCurrency(avgTicket);
    
    // Top hotels
    const hotelStats = {};
    confirmed.filter(r => r.type === 'hotel').forEach(r => {
        if (!hotelStats[r.itemName]) hotelStats[r.itemName] = { count: 0, revenue: 0 };
        hotelStats[r.itemName].count++;
        hotelStats[r.itemName].revenue += r.totalPrice;
    });
    
    const topHotels = Object.entries(hotelStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    
    document.getElementById('topHotelsAdmin').innerHTML = topHotels.length > 0 ? `
        <div class="ranking-list">
            ${topHotels.map(([name, stats], i) => `
                <div class="ranking-item">
                    <span class="rank">#${i + 1}</span>
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
        if (!packageStats[r.itemName]) packageStats[r.itemName] = { count: 0, revenue: 0 };
        packageStats[r.itemName].count++;
        packageStats[r.itemName].revenue += r.totalPrice;
    });
    
    const topPackages = Object.entries(packageStats).sort((a, b) => b[1].count - a[1].count).slice(0, 5);
    
    document.getElementById('topPackagesAdmin').innerHTML = topPackages.length > 0 ? `
        <div class="ranking-list">
            ${topPackages.map(([name, stats], i) => `
                <div class="ranking-item">
                    <span class="rank">#${i + 1}</span>
                    <div class="rank-details">
                        <strong>${name}</strong>
                        <small>${stats.count} vendas • ${formatCurrency(stats.revenue)}</small>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : '<p class="empty-text">Nenhum dado disponível</p>';
}

// System actions
function clearAllData() {
    if (!confirm('⚠️ ATENÇÃO: Isso irá apagar TODOS os dados do sistema (exceto administradores). Esta ação não pode ser desfeita! Deseja continuar?')) return;
    if (!confirm('Tem CERTEZA ABSOLUTA? Todos os clientes, funcionários e reservas serão permanentemente excluídos!')) return;
    
    // Keep only admin users
    const admins = allUsers.filter(u => u.role === 'admin');
    localStorage.setItem('juzzs_users', JSON.stringify(admins));
    localStorage.setItem('juzzs_reservations', JSON.stringify([]));
    
    loadAllData();
    showNotification('Todos os dados foram limpos!', 'success');
}

function exportSystemData() {
    const data = {
        users: allUsers,
        reservations: allReservations,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `juzzs-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Dados exportados com sucesso!', 'success');
}

function exportReportAdmin() {
    alert('Funcionalidade de exportação de relatórios em desenvolvimento!');
}

function viewSystemLogs() {
    alert('Logs do sistema em desenvolvimento!');
}

// Helper functions
function openAddEmployeeModal() {
    document.getElementById('addEmployeeModal').classList.add('active');
}

function filterReservationsBy(status) {
    showSection('reservas');
    document.getElementById('reservationStatusFilter').value = status;
    filterReservations();
}

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
    if (menuItem) menuItem.classList.add('active');
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

function formatCurrency(value) {
    return Math.round(value).toLocaleString() + ' Kz';
}

function formatTimeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'Agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h atrás`;
    return `${Math.floor(seconds / 86400)} dias atrás`;
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
