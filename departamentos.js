// ============================================================
//  MÓDULO DE DEPARTAMENTOS — Juzzs Travel & Hospitality
//  Base de dados: localStorage ('juzzs_departamentos')
//  CRUD: Criar, Listar, Editar, Eliminar
// ============================================================

const DEPT_KEY = 'juzzs_departamentos';

// ── Dados iniciais (seed) ───────────────────────────────────
function seedDepartamentos() {
    const existentes = JSON.parse(localStorage.getItem(DEPT_KEY));
    if (existentes && existentes.length > 0) return;

    const seed = [
        {
            id: 'DEPT-001',
            nome: 'Recepção',
            codigo: 'REC',
            descricao: 'Atendimento ao cliente, check-in/check-out e gestão de reservas presenciais.',
            responsavel: 'Administrador',
            estado: 'activo',
            cor: '#3B82F6',
            dataCriacao: new Date().toISOString()
        },
        {
            id: 'DEPT-002',
            nome: 'Housekeeping',
            codigo: 'HSK',
            descricao: 'Limpeza e manutenção de quartos, zonas comuns e áreas de serviço.',
            responsavel: 'Administrador',
            estado: 'activo',
            cor: '#10B981',
            dataCriacao: new Date().toISOString()
        },
        {
            id: 'DEPT-003',
            nome: 'Restaurante & Bar',
            codigo: 'RBR',
            descricao: 'Serviço de alimentação, bebidas e eventos gastronómicos.',
            responsavel: 'Administrador',
            estado: 'activo',
            cor: '#F59E0B',
            dataCriacao: new Date().toISOString()
        },
        {
            id: 'DEPT-004',
            nome: 'Manutenção',
            codigo: 'MNT',
            descricao: 'Manutenção preventiva e correctiva de equipamentos e instalações.',
            responsavel: 'Administrador',
            estado: 'activo',
            cor: '#EF4444',
            dataCriacao: new Date().toISOString()
        },
        {
            id: 'DEPT-005',
            nome: 'Segurança',
            codigo: 'SEG',
            descricao: 'Vigilância das instalações, controlo de acesso e segurança dos hóspedes.',
            responsavel: 'Administrador',
            estado: 'activo',
            cor: '#8B5CF6',
            dataCriacao: new Date().toISOString()
        }
    ];

    localStorage.setItem(DEPT_KEY, JSON.stringify(seed));
}

// ── Utilitários ─────────────────────────────────────────────
function getDepartamentos() {
    return JSON.parse(localStorage.getItem(DEPT_KEY)) || [];
}

function saveDepartamentos(list) {
    localStorage.setItem(DEPT_KEY, JSON.stringify(list));
}

function gerarIdDept() {
    const depts = getDepartamentos();
    const nums = depts.map(d => parseInt(d.id.split('-')[1])).filter(n => !isNaN(n));
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return 'DEPT-' + String(max + 1).padStart(3, '0');
}

function getFuncionariosDoDept(deptId) {
    const users = JSON.parse(localStorage.getItem('juzzs_users')) || [];
    return users.filter(u => u.role === 'employee' && u.departamentoId === deptId);
}

function getTodosFuncionarios() {
    const users = JSON.parse(localStorage.getItem('juzzs_users')) || [];
    return users.filter(u => u.role === 'employee');
}

// ── Renderizar secção principal ──────────────────────────────
function renderDepartamentos() {
    const depts = getDepartamentos();
    const query = (document.getElementById('deptSearch') || {}).value || '';
    const estadoFilter = (document.getElementById('deptEstadoFilter') || {}).value || 'all';

    const filtrados = depts.filter(d => {
        const matchQuery = d.nome.toLowerCase().includes(query.toLowerCase()) ||
                           d.codigo.toLowerCase().includes(query.toLowerCase()) ||
                           (d.responsavel || '').toLowerCase().includes(query.toLowerCase());
        const matchEstado = estadoFilter === 'all' || d.estado === estadoFilter;
        return matchQuery && matchEstado;
    });

    // Stats
    const totalFunc = getTodosFuncionarios().length;
    const activos   = depts.filter(d => d.estado === 'activo').length;
    const inactivos = depts.filter(d => d.estado === 'inactivo').length;

    document.getElementById('deptStatTotal').textContent   = depts.length;
    document.getElementById('deptStatActivos').textContent  = activos;
    document.getElementById('deptStatInactivos').textContent = inactivos;
    document.getElementById('deptStatFuncs').textContent    = totalFunc;

    // Tabela
    const tbody = document.getElementById('deptTableBody');
    const empty  = document.getElementById('deptEmpty');

    if (filtrados.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
        tbody.innerHTML = filtrados.map(d => {
            const funcs = getFuncionariosDoDept(d.id);
            const estadoBadge = d.estado === 'activo'
                ? '<span class="badge badge-success">Activo</span>'
                : '<span class="badge badge-danger">Inactivo</span>';
            return `
            <tr>
                <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div style="width:10px;height:10px;border-radius:50%;background:${d.cor || '#6366F1'};flex-shrink:0;"></div>
                        <div>
                            <div style="font-weight:600;color:var(--text-primary);">${d.nome}</div>
                            <div style="font-size:12px;color:var(--text-secondary);">${d.descricao || '—'}</div>
                        </div>
                    </div>
                </td>
                <td><code style="background:var(--bg-tertiary);padding:2px 8px;border-radius:4px;font-size:12px;">${d.codigo}</code></td>
                <td style="color:var(--text-secondary);">${d.responsavel || '—'}</td>
                <td>
                    <span style="background:rgba(99,102,241,0.12);color:#6366F1;padding:3px 10px;border-radius:12px;font-size:13px;font-weight:600;">
                        ${funcs.length} func.
                    </span>
                </td>
                <td>${estadoBadge}</td>
                <td style="font-size:12px;color:var(--text-secondary);">${formatarData(d.dataCriacao)}</td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-table-action btn-edit" onclick="abrirModalDept('${d.id}')" title="Editar">✏️</button>
                        <button class="btn-table-action btn-view" onclick="verFuncionariosDept('${d.id}')" title="Ver funcionários">👥</button>
                        <button class="btn-table-action btn-delete" onclick="eliminarDept('${d.id}')" title="Eliminar">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    // Preencher select de departamento no modal de funcionário
    popularSelectDeptFuncionario();
}

function formatarData(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('pt-AO', { day:'2-digit', month:'short', year:'numeric' });
    } catch(e) { return iso; }
}

// ── Popular selects de departamento ─────────────────────────
function popularSelectDeptFuncionario() {
    const selects = document.querySelectorAll('.select-departamento');
    const depts = getDepartamentos().filter(d => d.estado === 'activo');
    const opts = `<option value="">— Sem departamento —</option>` +
        depts.map(d => `<option value="${d.id}">${d.nome} (${d.codigo})</option>`).join('');
    selects.forEach(s => {
        const current = s.value;
        s.innerHTML = opts;
        s.value = current;
    });
}

// ── Modal Criar / Editar ────────────────────────────────────
function abrirModalDept(id) {
    const modal = document.getElementById('deptModal');
    const depts = getDepartamentos();

    document.getElementById('deptModalTitle').textContent = id ? 'Editar Departamento' : 'Novo Departamento';
    document.getElementById('deptEditId').value = id || '';

    if (id) {
        const d = depts.find(x => x.id === id);
        if (!d) return;
        document.getElementById('deptNome').value       = d.nome;
        document.getElementById('deptCodigo').value     = d.codigo;
        document.getElementById('deptDescricao').value  = d.descricao || '';
        document.getElementById('deptResponsavel').value = d.responsavel || '';
        document.getElementById('deptEstado').value     = d.estado;
        document.getElementById('deptCor').value        = d.cor || '#6366F1';
    } else {
        document.getElementById('deptNome').value       = '';
        document.getElementById('deptCodigo').value     = '';
        document.getElementById('deptDescricao').value  = '';
        document.getElementById('deptResponsavel').value = '';
        document.getElementById('deptEstado').value     = 'activo';
        document.getElementById('deptCor').value        = '#6366F1';
    }

    modal.style.display = 'flex';
}

function fecharModalDept() {
    document.getElementById('deptModal').style.display = 'none';
}

function salvarDept() {
    const id     = document.getElementById('deptEditId').value;
    const nome   = document.getElementById('deptNome').value.trim();
    const codigo = document.getElementById('deptCodigo').value.trim().toUpperCase();
    const descricao    = document.getElementById('deptDescricao').value.trim();
    const responsavel  = document.getElementById('deptResponsavel').value.trim();
    const estado  = document.getElementById('deptEstado').value;
    const cor     = document.getElementById('deptCor').value;

    if (!nome || !codigo) {
        alert('Nome e Código são obrigatórios.');
        return;
    }

    const depts = getDepartamentos();

    // Verificar código duplicado
    const codDuplicado = depts.some(d => d.codigo === codigo && d.id !== id);
    if (codDuplicado) {
        alert('Já existe um departamento com esse código. Escolha outro.');
        return;
    }

    if (id) {
        // Editar
        const idx = depts.findIndex(d => d.id === id);
        if (idx >= 0) {
            depts[idx] = { ...depts[idx], nome, codigo, descricao, responsavel, estado, cor };
        }
    } else {
        // Criar novo
        depts.push({
            id: gerarIdDept(),
            nome, codigo, descricao, responsavel, estado, cor,
            dataCriacao: new Date().toISOString()
        });
    }

    saveDepartamentos(depts);
    fecharModalDept();
    renderDepartamentos();
    mostrarNotificacao(id ? 'Departamento actualizado com sucesso.' : 'Departamento criado com sucesso.', 'success');
}

// ── Eliminar ─────────────────────────────────────────────────
function eliminarDept(id) {
    const depts = getDepartamentos();
    const dept  = depts.find(d => d.id === id);
    if (!dept) return;

    const funcs = getFuncionariosDoDept(id);
    let msg = `Tem a certeza que deseja eliminar o departamento "${dept.nome}"?`;
    if (funcs.length > 0) {
        msg += `\n\nAtenção: ${funcs.length} funcionário(s) estão associados a este departamento. Serão desassociados automaticamente.`;
    }

    if (!confirm(msg)) return;

    // Desassociar funcionários
    if (funcs.length > 0) {
        const users = JSON.parse(localStorage.getItem('juzzs_users')) || [];
        users.forEach(u => { if (u.departamentoId === id) delete u.departamentoId; });
        localStorage.setItem('juzzs_users', JSON.stringify(users));
    }

    saveDepartamentos(depts.filter(d => d.id !== id));
    renderDepartamentos();
    mostrarNotificacao('Departamento eliminado.', 'warning');
}

// ── Modal: Ver funcionários do departamento ──────────────────
function verFuncionariosDept(deptId) {
    const depts = getDepartamentos();
    const dept  = depts.find(d => d.id === deptId);
    if (!dept) return;

    const funcs = getFuncionariosDoDept(deptId);
    const todos = getTodosFuncionarios();
    const semDept = todos.filter(f => !f.departamentoId);

    let html = `
        <div style="margin-bottom:20px;">
            <h4 style="margin:0 0 4px;color:var(--text-primary);">Departamento: ${dept.nome}</h4>
            <p style="margin:0;color:var(--text-secondary);font-size:13px;">Código: <code>${dept.codigo}</code> · ${dept.descricao || ''}</p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
            <div style="background:var(--bg-tertiary);border-radius:8px;padding:16px;text-align:center;">
                <div style="font-size:2rem;font-weight:700;color:#6366F1;">${funcs.length}</div>
                <div style="font-size:12px;color:var(--text-secondary);">Funcionários Associados</div>
            </div>
            <div style="background:var(--bg-tertiary);border-radius:8px;padding:16px;text-align:center;">
                <div style="font-size:2rem;font-weight:700;color:#F59E0B;">${semDept.length}</div>
                <div style="font-size:12px;color:var(--text-secondary);">Funcionários Sem Dept.</div>
            </div>
        </div>`;

    if (funcs.length === 0) {
        html += `<div style="text-align:center;padding:30px;color:var(--text-secondary);">
            <div style="font-size:2.5rem;">👥</div>
            <p>Nenhum funcionário associado a este departamento.</p>
        </div>`;
    } else {
        html += `<table class="data-table"><thead><tr>
            <th>Nome</th><th>Email</th><th>Telefone</th><th>Acção</th>
        </tr></thead><tbody>` +
        funcs.map(f => `<tr>
            <td style="font-weight:600;">${f.name}</td>
            <td style="color:var(--text-secondary);font-size:13px;">${f.email}</td>
            <td style="color:var(--text-secondary);font-size:13px;">${f.phone || '—'}</td>
            <td><button class="btn-table-action btn-delete" onclick="desassociarFuncDept('${f.id}','${deptId}')" title="Remover do departamento">✕</button></td>
        </tr>`).join('') + '</tbody></table>';
    }

    // Adicionar funcionários sem departamento
    if (semDept.length > 0) {
        html += `<div style="margin-top:20px;">
            <h5 style="margin:0 0 10px;color:var(--text-primary);">Adicionar funcionário a este departamento</h5>
            <div style="display:flex;gap:10px;">
                <select id="selectFuncParaDept" class="form-input" style="flex:1;">
                    <option value="">— Seleccionar funcionário —</option>
                    ${semDept.map(f => `<option value="${f.id}">${f.name} (${f.email})</option>`).join('')}
                </select>
                <button class="btn-primary-dash" onclick="associarFuncDept('${deptId}')">Adicionar</button>
            </div>
        </div>`;
    }

    document.getElementById('deptFuncsModalTitle').textContent = `Funcionários — ${dept.nome}`;
    document.getElementById('deptFuncsModalBody').innerHTML = html;
    document.getElementById('deptFuncsModal').style.display = 'flex';
}

function fecharModalFuncsDept() {
    document.getElementById('deptFuncsModal').style.display = 'none';
}

function associarFuncDept(deptId) {
    const sel = document.getElementById('selectFuncParaDept');
    const funcId = sel.value;
    if (!funcId) { alert('Seleccione um funcionário.'); return; }

    const users = JSON.parse(localStorage.getItem('juzzs_users')) || [];
    const idx = users.findIndex(u => u.id == funcId);
    if (idx >= 0) {
        users[idx].departamentoId = deptId;
        localStorage.setItem('juzzs_users', JSON.stringify(users));
        verFuncionariosDept(deptId);
        renderDepartamentos();
        mostrarNotificacao('Funcionário associado ao departamento.', 'success');
    }
}

function desassociarFuncDept(funcId, deptId) {
    if (!confirm('Remover este funcionário do departamento?')) return;
    const users = JSON.parse(localStorage.getItem('juzzs_users')) || [];
    const idx = users.findIndex(u => u.id == funcId);
    if (idx >= 0) {
        delete users[idx].departamentoId;
        localStorage.setItem('juzzs_users', JSON.stringify(users));
        verFuncionariosDept(deptId);
        renderDepartamentos();
        mostrarNotificacao('Funcionário removido do departamento.', 'warning');
    }
}

// ── Notificação toast ────────────────────────────────────────
function mostrarNotificacao(msg, tipo) {
    let toast = document.getElementById('deptToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'deptToast';
        toast.style.cssText = `
            position:fixed;bottom:24px;right:24px;z-index:9999;
            padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;
            color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.25);
            transition:opacity .3s;pointer-events:none;`;
        document.body.appendChild(toast);
    }
    const cores = { success:'#10B981', warning:'#F59E0B', error:'#EF4444' };
    toast.style.background = cores[tipo] || '#6366F1';
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

// ── Exportar CSV ─────────────────────────────────────────────
function exportarDeptCSV() {
    const depts = getDepartamentos();
    if (depts.length === 0) { alert('Sem departamentos para exportar.'); return; }

    const linhas = [
        ['ID','Nome','Código','Descrição','Responsável','Nº Funcionários','Estado','Data Criação'],
        ...depts.map(d => [
            d.id, d.nome, d.codigo, d.descricao || '', d.responsavel || '',
            getFuncionariosDoDept(d.id).length, d.estado, formatarData(d.dataCriacao)
        ])
    ];

    const csv = linhas.map(l => l.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'departamentos.csv'; a.click();
    URL.revokeObjectURL(url);
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    seedDepartamentos();

    // Quando a secção de departamentos ficar visível, renderizar
    const observer = new MutationObserver(() => {
        const sec = document.getElementById('departamentos-section');
        if (sec && sec.classList.contains('active')) {
            renderDepartamentos();
        }
    });

    const target = document.getElementById('departamentos-section');
    if (target) observer.observe(target, { attributes: true, attributeFilter: ['class'] });

    // Também popular selects de dept nos modais de funcionários ao abrir
    document.addEventListener('click', e => {
        if (e.target.closest('#addEmployeeModal') || e.target.closest('#editUserModal')) {
            popularSelectDeptFuncionario();
        }
    });
});
