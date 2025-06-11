// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';

// Referencias a elementos del DOM
const userForm = document.getElementById('userForm');
const usersList = document.getElementById('usersList');
const loading = document.getElementById('loading');
const backendStatus = document.getElementById('backendStatus');
const dbStatus = document.getElementById('dbStatus');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    checkSystemStatus();
    
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addUser();
    });
});

// Función para verificar el estado del sistema
async function checkSystemStatus() {
    try {
        // Verificar backend
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        if (healthResponse.ok) {
            backendStatus.textContent = '🟢 Online';
            backendStatus.className = 'status online';
            
            // Verificar base de datos
            const dbResponse = await fetch(`${API_BASE_URL}/db-status`);
            if (dbResponse.ok) {
                dbStatus.textContent = '🟢 Conectada';
                dbStatus.className = 'status online';
            } else {
                dbStatus.textContent = '🔴 Error';
                dbStatus.className = 'status offline';
            }
        } else {
            backendStatus.textContent = '🔴 Offline';
            backendStatus.className = 'status offline';
            dbStatus.textContent = '🔴 Sin conexión';
            dbStatus.className = 'status offline';
        }
    } catch (error) {
        backendStatus.textContent = '🔴 Error';
        backendStatus.className = 'status offline';
        dbStatus.textContent = '🔴 Sin conexión';
        dbStatus.className = 'status offline';
        console.error('Error checking system status:', error);
    }
}

// Función para cargar usuarios
async function loadUsers() {
    try {
        loading.style.display = 'block';
        usersList.innerHTML = '';
        
        const response = await fetch(`${API_BASE_URL}/users`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const users = await response.json();
        loading.style.display = 'none';
        
        if (users.length === 0) {
            usersList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay usuarios registrados</p>';
            return;
        }
        
        users.forEach(user => {
            const userCard = createUserCard(user);
            usersList.appendChild(userCard);
        });
        
    } catch (error) {
        loading.style.display = 'none';
        usersList.innerHTML = '<p style="text-align: center; color: #f44336; padding: 20px;">❌ Error al cargar usuarios: ' + error.message + '</p>';
        console.error('Error loading users:', error);
    }
}

// Función para crear tarjeta de usuario
function createUserCard(user) {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    userCard.innerHTML = `
        <div class="user-info">
            <div class="user-detail">
                <span class="user-label">Nombre</span>
                <span class="user-value">${user.nombre}</span>
            </div>
            <div class="user-detail">
                <span class="user-label">Email</span>
                <span class="user-value">${user.email}</span>
            </div>
            <div class="user-detail">
                <span class="user-label">Teléfono</span>
                <span class="user-value">${user.telefono}</span>
            </div>
            <button class="delete-btn" onclick="deleteUser(${user.id})">
                🗑️ Eliminar
            </button>
        </div>
    `;
    return userCard;
}

// Función para agregar usuario
async function addUser() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    
    if (!nombre || !email || !telefono) {
        showMessage('Por favor, complete todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: nombre,
                email: email,
                telefono: telefono
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al agregar usuario');
        }
        
        const newUser = await response.json();
        showMessage('Usuario agregado exitosamente', 'success');
        
        // Limpiar formulario
        userForm.reset();
        
        // Recargar lista de usuarios
        loadUsers();
        
    } catch (error) {
        showMessage('Error al agregar usuario: ' + error.message, 'error');
        console.error('Error adding user:', error);
    }
}

// Función para eliminar usuario
async function deleteUser(userId) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar usuario');
        }
        
        showMessage('Usuario eliminado exitosamente', 'success');
        loadUsers();
        
    } catch (error) {
        showMessage('Error al eliminar usuario: ' + error.message, 'error');
        console.error('Error deleting user:', error);
    }
}

// Función para mostrar mensajes
function showMessage(message, type) {
    // Remover mensajes anteriores
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insertar después del formulario
    userForm.parentNode.insertBefore(messageDiv, userForm.nextSibling);
    
    // Remover mensaje después de 5 segundos
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Actualizar lista cada 30 segundos
setInterval(loadUsers, 30000);

// Verificar estado del sistema cada 60 segundos
setInterval(checkSystemStatus, 60000);