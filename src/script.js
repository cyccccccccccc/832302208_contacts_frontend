// 根据环境自动选择API地址
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';

// 全局变量
let contacts = [];
let currentEditId = null;
let activeGroup = 'all';

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
const birthdaysList = document.getElementById('birthdaysList');

// API调用函数
async function apiCall(endpoint, options = {}) {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        alert(`操作失败: ${error.message}`);
        throw error;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    loadContacts();

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

// 加载联系人
async function loadContacts() {
    try {
        contacts = await apiCall('/contacts');
        await renderBirthdays();
        renderGroups();
        renderContacts();
    } catch (error) {
        console.error('Failed to load contacts:', error);
    }
}

// 渲染近期生日列表
async function renderBirthdays() {
    try {
        const upcomingBirthdays = await apiCall('/birthdays');

        if (upcomingBirthdays.length === 0) {
            birthdaysList.innerHTML = '<div class="birthday-item" style="justify-content: center; color: #999; font-style: italic;">近期无生日</div>';
            return;
        }

        let html = '';
        upcomingBirthdays.forEach(contact => {
            const birthDate = new Date(contact.birth_date);
            const formattedDate = `${birthDate.getMonth() + 1}月${birthDate.getDate()}日`;

            html += `
                <div class="birthday-item">
                    <div class="birthday-info">
                        <div class="birthday-name">${contact.name}</div>
                        <div class="birthday-phone">${contact.phones[0] || '无电话'}</div>
                    </div>
                    <div class="birthday-date">${formattedDate}</div>
                </div>
            `;
        });

        birthdaysList.innerHTML = html;
    } catch (error) {
        console.error('Failed to load birthdays:', error);
        birthdaysList.innerHTML = '<div class="birthday-item" style="justify-content: center; color: #999; font-style: italic;">加载生日数据失败</div>';
    }
}

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
async function handleAddContact(e) {
    e.preventDefault();

    const name = document.getElementById('addName').value.trim();
    const email = document.getElementById('addEmail').value.trim();
    const address = document.getElementById('addAddress').value.trim();
    const birthDate = document.getElementById('addBirthDate').value;
    const group = document.getElementById('addGroup').value.trim() || '默认分组';

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

    try {
        const contactData = {
            name,
            phones,
            email: email || null,
            address: address || null,
            birth_date: birthDate || null,
            group
        };

        await apiCall('/contacts', {
            method: 'POST',
            body: contactData
        });

        // 重新加载数据
        await loadContacts();
        closeModals();
        alert('联系人添加成功！');
    } catch (error) {
        console.error('Failed to add contact:', error);
    }
}

// 编辑联系人
async function handleEditContact(e) {
    e.preventDefault();

    const id = parseInt(document.getElementById('editId').value);
    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    const birthDate = document.getElementById('editBirthDate').value;
    const group = document.getElementById('editGroup').value.trim() || '默认分组';

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

    try {
        const contactData = {
            name,
            phones,
            email: email || null,
            address: address || null,
            birth_date: birthDate || null,
            group
        };

        await apiCall(`/contacts/${id}`, {
            method: 'PUT',
            body: contactData
        });

        // 重新加载数据
        await loadContacts();
        closeModals();
        alert('联系人信息更新成功！');
    } catch (error) {
        console.error('Failed to update contact:', error);
    }
}

// 删除联系人
async function deleteContact(id) {
    if (confirm('确定要删除这个联系人吗？')) {
        try {
            await apiCall(`/contacts/${id}`, {
                method: 'DELETE'
            });

            // 重新加载数据
            await loadContacts();
            alert('联系人删除成功！');
        } catch (error) {
            console.error('Failed to delete contact:', error);
        }
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
        document.getElementById('editBirthDate').value = contact.birth_date || '';
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
async function renderGroups() {
    try {
        const groups = await apiCall('/groups');

        let html = '';

        // 添加"全部分组"选项
        html += `
            <div class="group-item ${activeGroup === 'all' ? 'active' : ''}" data-group="all">
                <div class="group-name">全部分组</div>
                <div class="group-count">${contacts.length}</div>
            </div>
        `;

        // 添加各个分组
        groups.forEach(groupName => {
            const count = contacts.filter(contact => contact.group === groupName).length;
            html += `
                <div class="group-item ${activeGroup === groupName ? 'active' : ''}" data-group="${groupName}">
                    <div class="group-name">${groupName}</div>
                    <div class="group-count">${count}</div>
                </div>
            `;
        });

        groupsList.innerHTML = html;

        // 添加分组点击事件
        document.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', function() {
                activeGroup = this.getAttribute('data-group');
                renderGroups();
                renderContacts();
            });
        });
    } catch (error) {
        console.error('Failed to load groups:', error);
    }
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
                                ${contact.phones.length > 1 ? contact.phones.slice(1).map(phone => `<div class="contact-detail">${phone}</div>`).join('') : ''}
                                ${contact.birth_date ? `<div class="contact-detail">出生日期: ${contact.birth_date}</div>` : ''}
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

    const phoneCount = addPhoneInputs.children.length;

    phoneInput.innerHTML = `
        <input type="tel" class="form-control phone-number">
        ${phoneCount > 0 ? '<button type="button" class="btn-remove-phone">-</button>' : ''}
    `;

    addPhoneInputs.appendChild(phoneInput);

    updateAddPhoneDeleteButtons();

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

    const phoneCount = editPhoneInputs.children.length;

    phoneInput.innerHTML = `
        <input type="tel" class="form-control phone-number" value="${value}" ${isFirst ? 'required' : ''}>
        ${phoneCount > 0 ? '<button type="button" class="btn-remove-phone">-</button>' : ''}
    `;

    editPhoneInputs.appendChild(phoneInput);

    updateEditPhoneDeleteButtons();

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
