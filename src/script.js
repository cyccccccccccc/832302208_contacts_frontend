// 数据存储
let contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
let currentEditId = null;
let activeGroup = 'all';

// DOM元素
const elements = {
    btnAddContact: document.getElementById('btnAddContact'),
    addModal: document.getElementById('addModal'),
    addForm: document.getElementById('addForm'),
    contactsContainer: document.getElementById('contactsContainer'),
    groupsList: document.getElementById('groupsList'),
    editModal: document.getElementById('editModal'),
    editForm: document.getElementById('editForm'),
    searchInput: document.getElementById('searchInput'),
    addPhoneInputs: document.getElementById('addPhoneInputs'),
    addPhoneBtn: document.getElementById('addPhone'),
    editPhoneInputs: document.getElementById('editPhoneInputs'),
    addEditPhoneBtn: document.getElementById('addEditPhone'),
    saveAddBtn: document.getElementById('saveAdd'),
    saveEditBtn: document.getElementById('saveEdit')
};

// 初始化
document.addEventListener('DOMContentLoaded', init);

function init() {
    renderGroups();
    renderContacts();
    setupEventListeners();
}

function setupEventListeners() {
    // 添加联系人
    elements.btnAddContact.addEventListener('click', openAddModal);
    elements.addForm.addEventListener('submit', handleAddContact);

    // 编辑联系人
    elements.editForm.addEventListener('submit', handleEditContact);

    // 搜索
    elements.searchInput.addEventListener('input', renderContacts);

    // 电话输入框
    elements.addPhoneBtn.addEventListener('click', () => addPhoneInput(elements.addPhoneInputs));
    elements.addEditPhoneBtn.addEventListener('click', () => addPhoneInput(elements.editPhoneInputs));

    // 模态框控制
    document.querySelectorAll('.close-modal, #cancelAdd, #cancelEdit').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // 点击模态框外部关闭
    [elements.addModal, elements.editModal].forEach(modal => {
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModals();
        });
    });
}

// 联系人管理功能
function handleAddContact(e) {
    e.preventDefault();

    const formData = getFormData(elements.addForm);
    if (!validateForm(formData)) return;

    const newContact = {
        id: Date.now(),
        ...formData,
        expanded: false
    };

    contacts.push(newContact);
    saveContacts();
    renderGroups();
    renderContacts();
    closeModals();
    alert('联系人添加成功！');
}

function handleEditContact(e) {
    e.preventDefault();

    const formData = getFormData(elements.editForm);
    if (!validateForm(formData)) return;

    const contactIndex = contacts.findIndex(c => c.id === currentEditId);
    if (contactIndex === -1) return;

    contacts[contactIndex] = { ...contacts[contactIndex], ...formData };
    saveContacts();
    renderGroups();
    renderContacts();
    closeModals();
    alert('联系人信息更新成功！');
}

function deleteContact(id) {
    if (!confirm('确定要删除这个联系人吗？')) return;

    contacts = contacts.filter(c => c.id !== id);
    saveContacts();
    renderGroups();
    renderContacts();
    alert('联系人删除成功！');
}

function openEditModal(id) {
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    currentEditId = id;
    populateEditForm(contact);
    elements.editModal.style.display = 'flex';
}

function openAddModal() {
    elements.addModal.style.display = 'flex';
    elements.addForm.reset();
    resetPhoneInputs(elements.addPhoneInputs);
}

function closeModals() {
    elements.addModal.style.display = 'none';
    elements.editModal.style.display = 'none';
    currentEditId = null;
}

// 表单处理
function getFormData(form) {
    const formData = new FormData(form);
    const phones = Array.from(form.querySelectorAll('.phone-number'))
        .map(input => input.value.trim())
        .filter(phone => phone);

    return {
        name: formData.get('addName') || formData.get('editName') || '',
        phones: phones,
        email: formData.get('addEmail') || formData.get('editEmail') || '',
        address: formData.get('addAddress') || formData.get('editAddress') || '',
        birthDate: formData.get('addBirthDate') || formData.get('editBirthDate') || '',
        group: formData.get('addGroup') || formData.get('editGroup') || ''
    };
}

function validateForm(data) {
    if (!data.name || data.phones.length === 0) {
        alert('姓名和电话号码是必填项！');
        return false;
    }
    return true;
}

function populateEditForm(contact) {
    document.getElementById('editId').value = contact.id;
    document.getElementById('editName').value = contact.name;
    document.getElementById('editEmail').value = contact.email;
    document.getElementById('editAddress').value = contact.address;
    document.getElementById('editBirthDate').value = contact.birthDate;
    document.getElementById('editGroup').value = contact.group;

    resetPhoneInputs(elements.editPhoneInputs);
    contact.phones.forEach((phone, i) => addPhoneInput(elements.editPhoneInputs, phone, i === 0));
}

// 电话输入框管理
function addPhoneInput(container, value = '', isRequired = false) {
    const phoneInput = document.createElement('div');
    phoneInput.className = 'phone-input';

    const phoneCount = container.children.length;
    const showDeleteBtn = phoneCount > 0;

    phoneInput.innerHTML = `
        <input type="tel" class="form-control phone-number" value="${value}" ${isRequired ? 'required' : ''}>
        ${showDeleteBtn ? '<button type="button" class="btn-remove-phone">-</button>' : ''}
    `;

    container.appendChild(phoneInput);
    updatePhoneDeleteButtons(container);

    if (showDeleteBtn) {
        phoneInput.querySelector('.btn-remove-phone').addEventListener('click', () => {
            if (container.children.length > 1) {
                phoneInput.remove();
                updatePhoneDeleteButtons(container);
            }
        });
    }
}

function resetPhoneInputs(container) {
    container.innerHTML = '<div class="phone-input"><input type="tel" class="form-control phone-number" required></div>';
}

function updatePhoneDeleteButtons(container) {
    const inputs = container.querySelectorAll('.phone-input');
    inputs.forEach(input => {
        const deleteBtn = input.querySelector('.btn-remove-phone');
        if (deleteBtn) {
            deleteBtn.style.display = inputs.length > 1 ? 'block' : 'none';
        }
    });
}

// 渲染功能
function renderGroups() {
    const groups = {};
    contacts.forEach(contact => {
        if (contact.group) {
            groups[contact.group] = (groups[contact.group] || 0) + 1;
        }
    });

    let html = `
        <div class="group-item ${activeGroup === 'all' ? 'active' : ''}" data-group="all">
            <div class="group-name">全部分组</div>
            <div class="group-count">${contacts.length}</div>
        </div>
    `;

    for (const group in groups) {
        html += `
            <div class="group-item ${activeGroup === group ? 'active' : ''}" data-group="${group}">
                <div class="group-name">${group}</div>
                <div class="group-count">${groups[group]}</div>
            </div>
        `;
    }

    elements.groupsList.innerHTML = html;

    // 添加分组点击事件
    elements.groupsList.querySelectorAll('.group-item').forEach(item => {
        item.addEventListener('click', function() {
            activeGroup = this.getAttribute('data-group');
            renderGroups();
            renderContacts();
        });
    });
}

function renderContacts() {
    const searchTerm = elements.searchInput.value.toLowerCase();

    // 过滤联系人
    let filteredContacts = contacts.filter(contact =>
        !searchTerm ||
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.phones.some(phone => phone.includes(searchTerm)) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
        (contact.address && contact.address.toLowerCase().includes(searchTerm)) ||
        (contact.group && contact.group.toLowerCase().includes(searchTerm))
    );

    // 按分组筛选
    if (activeGroup !== 'all') {
        filteredContacts = filteredContacts.filter(contact => contact.group === activeGroup);
    }

    // 按分组组织
    const groupedContacts = {};
    filteredContacts.forEach(contact => {
        const groupName = contact.group || '未分组';
        if (!groupedContacts[groupName]) groupedContacts[groupName] = [];
        groupedContacts[groupName].push(contact);
    });

    // 生成HTML
    let html = '';

    if (Object.keys(groupedContacts).length === 0) {
        html = '<div class="contact-card" style="justify-content: center; color: #999;">暂无联系人</div>';
    } else {
        for (const group in groupedContacts) {
            if (activeGroup === 'all' && group !== '未分组') {
                html += `<div class="group-header">${group}</div>`;
            }

            groupedContacts[group].forEach(contact => {
                const isExpanded = contact.expanded ? 'expanded' : '';
                html += `
                    <div class="contact-card ${isExpanded}" data-id="${contact.id}">
                        <div class="contact-avatar">${contact.name.charAt(0)}</div>
                        <div class="contact-info">
                            <div class="contact-name">${contact.name}</div>
                            <div class="contact-phone">${contact.phones[0]}</div>
                            <div class="contact-details">
                                ${contact.phones.slice(1).map(phone => `<div class="contact-detail">${phone}</div>`).join('')}
                                ${contact.birthDate ? `<div class="contact-detail">出生日期: ${contact.birthDate}</div>` : ''}
                                ${contact.email ? `<div class="contact-detail">${contact.email}</div>` : ''}
                                ${contact.address ? `<div class="contact-detail">${contact.address}</div>` : ''}
                                ${contact.group ? `<div class="contact-detail">分组: ${contact.group}</div>` : ''}
                            </div>
                        </div>
                        <div class="contact-actions">
                            <button class="btn-edit" onclick="event.stopPropagation(); openEditModal(${contact.id})">编辑</button>
                            <button class="btn-delete" onclick="event.stopPropagation(); deleteContact(${contact.id})">删除</button>
                        </div>
                    </div>
                `;
            });
        }
    }

    elements.contactsContainer.innerHTML = html;

    // 添加联系人卡片点击事件
    elements.contactsContainer.querySelectorAll('.contact-card').forEach(card => {
        card.addEventListener('click', function() {
            const contactId = parseInt(this.getAttribute('data-id'));
            const contact = contacts.find(c => c.id === contactId);
            if (contact) {
                contact.expanded = !contact.expanded;
                renderContacts();
            }
        });
    });
}

// 数据持久化
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}