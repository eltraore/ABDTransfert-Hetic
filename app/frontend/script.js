const API_URL = 'http://localhost:3000'; // URL de votre backend
console.log("script chargé");

// --- Inscription ---
document.getElementById('signupForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        alert(data.message || data.error);

        if (response.ok) {
            window.location.href = 'index.html'; // Redirection vers la page de connexion
        }

    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
    }
});

// --- Connexion ---
document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token); // Stocke le token dans localStorage
            alert("Connexion réussie !");
            window.location.href = 'compte.html'; // Redirige vers la page compte
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Erreur lors de la connexion :', error);
    }
});

// --- Profil Utilisateur ---
async function displayUserProfile() {
    const token = localStorage.getItem('token');
    const emailElement = document.getElementById('accountEmail');
    const passwordElement = document.getElementById('accountPassword');

    if (!emailElement || !passwordElement) return; // Exécuter seulement si les éléments sont présents

    try {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const userData = await response.json();
            emailElement.textContent = `Email : ${userData.email}`;
            passwordElement.textContent = `Mot de passe : ********`; // Par sécurité, n'affichez pas le mot de passe en clair
        } else {
            console.error("Erreur lors de la récupération des informations utilisateur.");
        }
    } catch (error) {
        console.error("Erreur de connexion :", error);
    }
}

// Appel du profil si l'utilisateur est sur compte.html
displayUserProfile();

// --- Récupération des Fichiers de l'Utilisateur ---
async function loadUserFiles() {
    const token = localStorage.getItem('token');
    const fileList = document.getElementById('fileList');

    if (!fileList) return; // Exécuter seulement si fileList existe

    try {
        const response = await fetch(`${API_URL}/files/myfiles`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erreur lors de la récupération des fichiers');
        
        const files = await response.json();
        fileList.innerHTML = ''; // Réinitialiser la liste

        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.classList.add('file-item'); // Nouvelle classe ajoutée
            fileElement.innerHTML = `
                <span class="file-name">${file.filename} (${(file.size / 1024).toFixed(2)} KB)</span>
                <button class="action-button generate-button" onclick="generateShareLink(${file.id})">Générer</button>
                <button class="action-button delete-button" onclick="deleteFile(${file.id})">Supprimer</button>
            `;
            fileList.appendChild(fileElement);
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement des fichiers :', error);
    }
}

// Chargement des fichiers si la page contient fileList
loadUserFiles();

// --- Gestion de l'Upload de Fichiers ---
document.getElementById('uploadForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        return alert('Veuillez sélectionner un fichier à télécharger.');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const uploadResponse = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const uploadData = await uploadResponse.json();

        if (uploadResponse.ok && uploadData.fileId) {
            // Après upload, générer le lien de partage
            const shareResponse = await fetch(`${API_URL}/files/${uploadData.fileId}/share`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const shareData = await shareResponse.json();
            if (shareResponse.ok && shareData.link) {
                window.location.href = `link.html?shareLink=${encodeURIComponent(shareData.link)}`;
            } else {
                alert(shareData.error || 'Erreur lors de la génération du lien de partage');
            }
        } else {
            alert(uploadData.error || 'Erreur lors du téléchargement du fichier');
        }
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error);
    }
});

// --- Génération de lien de partage dans link.html ---
async function generateShareLink(fileId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/files/${fileId}/share`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (response.ok && data.link) {
            window.location.href = `link.html?shareLink=${encodeURIComponent(data.link)}`;
        } else {
            alert(data.error || 'Erreur lors de la génération du lien de partage');
        }
    } catch (error) {
        console.error('Erreur lors de la génération du lien de partage :', error);
    }
}

// --- Fonction pour supprimer un fichier ---
async function deleteFile(fileId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/files/myfiles/${fileId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        alert(data.message || data.error);
        if (response.ok) loadUserFiles(); // Recharger la liste des fichiers
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier :', error);
    }
}

// Gestion de la mise à jour du mot de passe
document.getElementById('updatePasswordForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/update-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        alert(data.message || data.error);

        if (response.ok) {
            window.location.href = 'compte.html'; // Redirige vers la page de compte après la mise à jour
        }
    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe :', error);
    }
});

// Vérification et redirection si l'utilisateur n'est pas authentifié
const token = localStorage.getItem('token');
if (!token) {
    alert("Veuillez vous connecter.");
    window.location.href = 'index.html';
}

document.getElementById('fileInput')?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const fileDetails = document.getElementById('fileDetails');
    
    if (file) {
        const fileSize = (file.size / 1024).toFixed(2); // Taille en KB
        fileDetails.textContent = `Fichier sélectionné : ${file.name} (${fileSize} KB)`;
    } else {
        fileDetails.textContent = '';
    }
});
