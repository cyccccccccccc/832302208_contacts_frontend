// 模拟数据存储（实际应用中会通过API与后端交互）
let contacts = [];
let currentEditId = null;
let activeGroup = 'all'; // 当前激活的分组

// DOM元素
const btnAddContact = document.getElementById('btnAddContact');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const contactsContainer = document.getElementById('contactsContainer');
const groupsList = document.getElementById('groupsList');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const searchInput = document.getElementById('searchInput');
const addPhoneInputs = document.getElementById('addPhoneInputs');
const addPhoneBtn = document.getElementById('addPhone');
const editPhoneInputs = document.getElementById('editPhoneInputs');
const addEditPhoneBtn = document.getElementById('addEditPhone');
const saveAddBtn = document.getElementById('saveAdd');
const saveEditBtn = document.getElementById('saveEdit');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从本地存储加载数据
    loadContacts();
    renderGroups();
    renderContacts();

    // 事件监听
    btnAddContact.addEventListener('click', openAddModal);
    saveAddBtn.addEventListener('click', handleAddContact);
    saveEditBtn.addEventListener('click', handleEditContact);
    searchInput.addEventListener('input', handleSearch);
    addPhoneBtn.addEventListener('click', addPhoneInput);
    addEditPhoneBtn.addEventListener('click', addEditPhoneInput);

    // 关闭模态框
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    document.getElementById('cancelAdd').addEventListener('click', closeModals);
    document.getElementById('cancelEdit').addEventListener('click', closeModals);

    // 点击模态框外部关闭
    addModal.addEventListener('click', function(e) {
        if (e.target === addModal) {
            closeModals();
        }
    });

    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeModals();
        }
    });
});

// 打开添加联系人模态框
function openAddModal() {
    addModal.style.display = 'flex';
    addForm.reset();
    resetAddPhoneInputs();
}

// 关闭所有模态框
function closeModals() {
    addModal.style.display = 'none';
    editModal.style.display = 'none';
    currentEditId = null;
}

// 添加联系人
function handleAddContact(e) {
    e.preventDefault();

    const name = document.getElementById('addName').value.trim();
    const email = document.getElementById('addEmail').value.trim();
    const address = document.getElementById('addAddress').value.trim();
    const birthDate = document.getElementById('addBirthDate').value;
    const group = document.getElementById('addGroup').value.trim();

    // 获取所有电话号码
    const phoneInputs = document.querySelectorAll('#addPhoneInputs .phone-number');
    const phones = [];
    phoneInputs.forEach(input => {
        if (input.value.trim()) {
            phones.push(input.value.trim());
        }
    });

    // 验证必填字段
    if (!name || phones.length === 0) {
        alert('姓名和电话号码是必填项！');
        return;
    }

    // 创建新联系人
    const newContact = {
        id: Date.now(), // 使用时间戳作为ID（实际应用中应由后端生成）
        name,
        phones,
        email,
        address,
        birthDate,
        group
    };

    // 添加到联系人列表
    contacts.push(newContact);

    // 保存到本地存储
    saveContacts();

    // 重新渲染分组列表和联系人列表
    renderGroups();
    renderContacts();

    // 关闭模态框
    closeModals();
    alert('联系人添加成功！');
}

// 编辑联系人
function handleEditContact(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('editId').value);
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const birthDate = document.getElementById('editBirthDate').value;
    const group = document.getElementById('editGroup').value.trim();

    // 获取所有电话号码
    const phoneInputs = document.querySelectorAll('#editPhoneInputs .phone-number');
    const phones = [];
    phoneInputs.forEach(input => {
        if (input.value.trim()) {
            phones.push(input.value.trim());
        }
    });

    // 验证必填字段
    if (!name || phones.length === 0) {
        alert('姓名和电话号码是必填项！');
        return;
    }

    // 更新联系人信息
    const contactIndex = contacts.findIndex(contact => contact.id === id);
    if (contactIndex !== -1) {
        contacts[contactIndex] = {
            id,
            name,
            phones,
            email,
            address,
            birthDate,
            group
        };

        // 保存到本地存储
        saveContacts();

        // 重新渲染分组列表和联系人列表
        renderGroups();
        renderContacts();

        // 关闭模态框
        closeModals();
        alert('联系人信息更新成功！');
    }
}

// 删除联系人
function deleteContact(id) {
    if (confirm('确定要删除这个联系人吗？')) {
        contacts = contacts.filter(contact => contact.id !== id);

        // 保存到本地存储
        saveContacts();

        // 重新渲染分组列表和联系人列表
        renderGroups();
        renderContacts();

        alert('联系人删除成功！');
    }
}

// 打开编辑模态框
function openEditModal(id) {
    const contact = contacts.find(contact => contact.id === id);
    if (contact) {
        currentEditId = id;

        document.getElementById('editId').value = contact.id;
        document.getElementById('editName').value = contact.name;
        document.getElementById('editEmail').value = contact.email || '';
        document.getElementById('editAddress').value = contact.address || '';
        document.getElementById('editBirthDate').value = contact.birthDate || '';
        document.getElementById('editGroup').value = contact.group || '';

        // 设置电话号码输入框
        editPhoneInputs.innerHTML = '';
        contact.phones.forEach((phone, index) => {
            addEditPhoneInput(phone, index === 0);
        });

        editModal.style.display = 'flex';
    }
}

// 搜索联系人
function handleSearch() {
    renderContacts();
}

// 渲染分组列表
function renderGroups() {
    // 获取所有分组（只显示有分组的）
    const groups = {};
    contacts.forEach(contact => {
        if (contact.group) {
            if (!groups[contact.group]) {
                groups[contact.group] = 0;
            }
            groups[contact.group]++;
        }
    });

    // 生成HTML
    let html = '';

    // 添加"全部分组"选项
    html += `
        <div class="group-item ${activeGroup === 'all' ? 'active' : ''}" data-group="all">
            <div class="group-name">全部分组</div>
            <div class="group-count">${contacts.length}</div>
        </div>
    `;

    // 添加各个分组（只显示有分组的）
    for (const groupName in groups) {
        html += `
            <div class="group-item ${activeGroup === groupName ? 'active' : ''}" data-group="${groupName}">
                <div class="group-name">${groupName}</div>
                <div class="group-count">${groups[groupName]}</div>
            </div>
        `;
    }

    groupsList.innerHTML = html;

    // 添加分组点击事件
    document.querySelectorAll('.group-item').forEach(item => {
        item.addEventListener('click', function() {
            activeGroup = this.getAttribute('data-group');
            renderGroups();
            renderContacts();
        });
    });
}

// 渲染联系人列表
function renderContacts() {
    const searchTerm = searchInput.value.toLowerCase();

    // 过滤联系人
    let filteredContacts = contacts;
    if (searchTerm) {
        filteredContacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.phones.some(phone => phone.includes(searchTerm)) ||
            (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
            (contact.address && contact.address.toLowerCase().includes(searchTerm)) ||
            (contact.group && contact.group.toLowerCase().includes(searchTerm))
        );
    }

    // 按分组筛选联系人
    if (activeGroup !== 'all') {
        filteredContacts = filteredContacts.filter(contact =>
            contact.group === activeGroup
        );
    }

    // 按分组组织联系人
    const groupedContacts = {};
    filteredContacts.forEach(contact => {
        const groupName = contact.group || '未分组';
        if (!groupedContacts[groupName]) {
            groupedContacts[groupName] = [];
        }
        groupedContacts[groupName].push(contact);
    });

    // 生成HTML
    let html = '';

    if (Object.keys(groupedContacts).length === 0) {
        html = '<div class="contact-card" style="justify-content: center; color: #999;">暂无联系人</div>';
    } else {
        for (const group in groupedContacts) {
            // 只有在显示全部分组时才显示分组标题
            if (activeGroup === 'all') {
                // 不显示"未分组"标题
                if (group !== '未分组') {
                    html += `<div class="group-header">${group}</div>`;
                }
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
                                ${contact.phones.length > 1 ? contact.phones.slice(1).map(phone => `<div class="contact-detail">${phone}</div>`).join('') : ''}
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

    contactsContainer.innerHTML = html;

    // 添加联系人卡片点击事件
    document.querySelectorAll('.contact-card').forEach(card => {
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

// 添加电话输入框
function addPhoneInput() {
    const phoneInput = document.createElement('div');
    phoneInput.className = 'phone-input';

    // 获取当前电话输入框数量
    const phoneCount = addPhoneInputs.children.length;

    // 只有当有多个电话时才显示删除按钮
    phoneInput.innerHTML = `
        <input type="tel" class="form-control phone-number">
        ${phoneCount > 0 ? '<button type="button" class="btn-remove-phone">-</button>' : ''}
    `;

    addPhoneInputs.appendChild(phoneInput);

    // 更新所有电话输入框的删除按钮显示状态
    updateAddPhoneDeleteButtons();

    // 添加删除事件
    if (phoneCount > 0) {
        phoneInput.querySelector('.btn-remove-phone').addEventListener('click', function() {
            if (addPhoneInputs.children.length > 1) {
                phoneInput.remove();
                updateAddPhoneDeleteButtons();
            }
        });
    }
}

// 添加编辑电话输入框
function addEditPhoneInput(value = '', isFirst = false) {
    const phoneInput = document.createElement('div');
    phoneInput.className = 'phone-input';

    // 获取当前电话输入框数量
    const phoneCount = editPhoneInputs.children.length;

    // 只有当有多个电话时才显示删除按钮
    phoneInput.innerHTML = `
        <input type="tel" class="form-control phone-number" value="${value}" ${isFirst ? 'required' : ''}>
        ${phoneCount > 0 ? '<button type="button" class="btn-remove-phone">-</button>' : ''}
    `;

    editPhoneInputs.appendChild(phoneInput);

    // 更新所有电话输入框的删除按钮显示状态
    updateEditPhoneDeleteButtons();

    // 添加删除事件
    if (phoneCount > 0) {
        phoneInput.querySelector('.btn-remove-phone').addEventListener('click', function() {
            if (editPhoneInputs.children.length > 1) {
                phoneInput.remove();
                updateEditPhoneDeleteButtons();
            }
        });
    }
}

// 更新添加电话输入框删除按钮显示状态
function updateAddPhoneDeleteButtons() {
    const phoneInputs = document.querySelectorAll('#addPhoneInputs .phone-input');
    phoneInputs.forEach((input, index) => {
        const deleteBtn = input.querySelector('.btn-remove-phone');
        if (deleteBtn) {
            // 只有一个电话时不显示删除按钮
            deleteBtn.style.display = phoneInputs.length > 1 ? 'block' : 'none';
        }
    });
}

// 更新编辑电话输入框删除按钮显示状态
function updateEditPhoneDeleteButtons() {
    const phoneInputs = document.querySelectorAll('#editPhoneInputs .phone-input');
    phoneInputs.forEach((input, index) => {
        const deleteBtn = input.querySelector('.btn-remove-phone');
        if (deleteBtn) {
            // 只有一个电话时不显示删除按钮
            deleteBtn.style.display = phoneInputs.length > 1 ? 'block' : 'none';
        }
    });
}

// 重置添加电话输入框
function resetAddPhoneInputs() {
    addPhoneInputs.innerHTML = `
        <div class="phone-input">
            <input type="tel" class="form-control phone-number" required>
        </div>
    `;
}

// 保存联系人到本地存储
function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// 从本地存储加载联系人
function loadContacts() {
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
        contacts = JSON.parse(savedContacts);
    }
}
