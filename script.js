// Initialiser le stockage des données
let trainData = JSON.parse(localStorage.getItem('trainData')) || {};

// Sauvegarder les données dans le localStorage
function saveData() {
    localStorage.setItem('trainData', JSON.stringify(trainData));
}

// DOM Elements
const stationForm = document.getElementById('stationForm');
const stationSelect = document.getElementById('stationSelect');
const arrivalsTab = document.getElementById('arrivalsTab');
const departuresTab = document.getElementById('departuresTab');
const arrivalsTable = document.getElementById('arrivalsTable');
const departuresTable = document.getElementById('departuresTable');

// Tab Switching
arrivalsTab.addEventListener('click', () => switchTab('arrivals'));
departuresTab.addEventListener('click', () => switchTab('departures'));

function switchTab(tab) {
    // Désactiver tous les onglets
    [arrivalsTab, departuresTab].forEach(tab => {
        tab.classList.remove(
            'active', 
            'text-blue-600', 
            'border-b-2', 
            'border-blue-600'
        );
        tab.classList.add('text-gray-500');
    });

    // Cacher tous les tableaux
    [arrivalsTable, departuresTable].forEach(table => {
        table.classList.add('hidden');
    });

    // Activer l'onglet sélectionné
    const activeTab = tab === 'arrivals' ? arrivalsTab : departuresTab;
    const activeTable = tab === 'arrivals' ? arrivalsTable : departuresTable;

    activeTab.classList.add(
        'active',
        'text-blue-600',
        'border-b-2',
        'border-blue-600'
    );
    activeTab.classList.remove('text-gray-500');
    activeTable.classList.remove('hidden');
}

// Form Submission
stationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedStation = stationSelect.value;
    
    if (!selectedStation) {
        alert('Veuillez sélectionner une gare');
        return;
    }
    
    displayTrainData(selectedStation);
});

// Display Train Data
function displayTrainData(station) {
    const stationData = trainData[station];
    
    // Show loading state
    arrivalsTable.innerHTML = '<div class="p-4 text-center"><div class="loading-spinner mx-auto"></div></div>';
    departuresTable.innerHTML = '<div class="p-4 text-center"><div class="loading-spinner mx-auto"></div></div>';
    
    // Simulate API delay
    setTimeout(() => {
        // Generate arrivals table
        if (stationData.arrivals.length > 0) {
            arrivalsTable.innerHTML = `
                <table class="train-table">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Provenance</th>
                            <th>Numéro</th>
                            <th>Quai</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stationData.arrivals.map(train => `
                            <tr>
                                <td>${train.time}</td>
                                <td>${train.origin}</td>
                                <td>${train.number}</td>
                                <td>${train.platform}</td>
                                <td>
                                    <span class="status-badge ${train.status === 'on-time' ? 'on-time' : 'delayed'}">
                                        ${train.status === 'on-time' ? 'À l\'heure' : `Retard: ${train.delay}`}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            arrivalsTable.innerHTML = '<div class="p-4 text-center text-gray-500">Aucun train en provenance</div>';
        }
        
        // Generate departures table
        if (stationData.departures.length > 0) {
            departuresTable.innerHTML = `
                <table class="train-table">
                    <thead>
                        <tr>
                            <th>Heure</th>
                            <th>Destination</th>
                            <th>Numéro</th>
                            <th>Voie</th>
                            <th>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stationData.departures.map(train => `
                            <tr>
                                <td>${train.time}</td>
                                <td>${train.destination}</td>
                                <td>${train.number}</td>
                                <td>${train.platform}</td>
                                <td>
                                    <span class="status-badge ${train.status === 'on-time' ? 'on-time' : 'delayed'}">
                                        ${train.status === 'on-time' ? 'À l\'heure' : `Retard: ${train.delay}`}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            departuresTable.innerHTML = '<div class="p-4 text-center text-gray-500">Aucun train au départ</div>';
        }
    }, 800);
}

// Admin functionality
const adminLink = document.getElementById('adminLink');
const adminModal = document.getElementById('adminModal');
const adminLoginForm = document.getElementById('adminLoginForm');
let isAdmin = false;

// Ensure admin elements exist before adding event listeners
document.addEventListener('DOMContentLoaded', () => {
    const adminLink = document.getElementById('adminLink');
    const adminModal = document.getElementById('adminModal');
    
    if (adminLink && adminModal) {
        // Toggle admin modal with better error handling
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            try {
                adminModal.classList.remove('hidden');
                // Bring modal to front
                adminModal.style.zIndex = '100';
            } catch (error) {
                console.error('Error opening admin modal:', error);
            }
        });
    } else {
        console.error('Admin elements not found');
    }
});

// Admin login
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === 'admin' && password === 'admin') {
        isAdmin = true;
        adminModal.classList.add('hidden');
        showAdminPanel();
        // Mettre à jour la liste des gares
        updateStationSelect();
    } else {
        alert('Identifiants incorrects');
    }
});

// Mettre à jour la liste des gares dans le select
function updateStationSelect() {
    const select = document.getElementById('stationSelect');
    select.innerHTML = '<option value="" selected disabled>Choisissez une gare</option>';
    
    // Ajouter les gares existantes
    Object.keys(trainData).forEach(station => {
        const option = document.createElement('option');
        option.value = station;
        option.textContent = station.charAt(0).toUpperCase() + station.slice(1) + 
                           (station === 'paris' ? ' Gare de Lyon' : 
                            station === 'lyon' ? ' Part-Dieu' : 
                            station === 'marseille' ? ' Saint-Charles' : '');
        select.appendChild(option);
    });
}

// Créer une nouvelle gare si elle n'existe pas
function createStationIfNotExists(stationName) {
    const normalized = stationName.toLowerCase().replace(/\s+/g, '');
    if (!trainData[normalized]) {
        trainData[normalized] = {
            arrivals: [],
            departures: []
        };
        updateStationSelect();
        return normalized;
    }
    return normalized;
}

function showAdminPanel() {
    // Create admin panel HTML
    const adminHTML = `
        <div class="admin-panel">
            <h3 class="text-xl font-bold mb-4">Espace Administrateur</h3>
            
            <div class="admin-form">
                <h4 class="font-semibold mb-2">Créer un horaire</h4>
                <form id="addScheduleForm">
                    <input type="text" id="trainNumber" placeholder="Numéro de train" required>
                    <input type="text" id="trainStation" placeholder="Gare d'origine/destination" required>
                    <input type="time" id="trainTime" placeholder="Heure" required>
                    <select id="trainType" required>
                        <option value="">Type</option>
                        <option value="arrival">Arrivée</option>
                        <option value="departure">Départ</option>
                    </select>
                    <input type="text" id="trainPlatform" placeholder="Quai">
                    <button type="submit">Ajouter</button>
                </form>
            </div>
            
            <div class="admin-form">
                <h4 class="font-semibold mb-2">Attribuer un quai</h4>
                <form id="assignPlatformForm">
                    <input type="text" placeholder="Numéro de train" required>
                    <input type="text" placeholder="Quai" required>
                    <button type="submit">Attribuer</button>
                </form>
            </div>
        </div>
    `;
    
    // Insert admin panel into DOM
    const container = document.querySelector('.container');
    container.insertAdjacentHTML('beforeend', adminHTML);
}

// Initialize with arrivals tab active by default
switchTab('arrivals');

// Gérer l'ajout d'un nouvel horaire
document.addEventListener('submit', function(e) {
    if (e.target.id === 'addScheduleForm') {
        e.preventDefault();
        
        const number = document.getElementById('trainNumber').value;
        const station = document.getElementById('trainStation').value;
        const time = document.getElementById('trainTime').value;
        const type = document.getElementById('trainType').value;
        const platform = document.getElementById('trainPlatform').value;
        
        // Créer la gare si elle n'existe pas
        const stationKey = createStationIfNotExists(station);
        
        // Ajouter le nouvel horaire
        const newTrain = {
            time: time,
            number: number,
            status: 'on-time',
            platform: platform || 'À déterminer'
        };

        if (type === 'arrival') {
            newTrain.origin = station;
            trainData[stationKey].arrivals.push(newTrain);
        } else {
            newTrain.destination = station;
            trainData[stationKey].departures.push(newTrain);
        }

        // Mettre à jour l'affichage
        if (document.getElementById('stationSelect').value === stationKey) {
            displayTrainData(stationKey);
        }

        // Réinitialiser le formulaire
        e.target.reset();
        alert('Horaire ajouté avec succès!');
    }
});

// Configuration API
const API_BASE = 'http://localhost:3000/api';

// Fonctions pour interagir avec l'API backend
async function fetchStations() {
    try {
        const response = await fetch(`${API_BASE}/stations`);
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de la récupération des gares:", error);
        return [];
    }
}

async function addStation(name) {
    try {
        const response = await fetch(`${API_BASE}/stations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de l'ajout de la gare:", error);
        return null;
    }
}

async function addTrain(trainData) {
    try {
        const response = await fetch(`${API_BASE}/trains`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trainData)
        });
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de l'ajout du train:", error);
        return null;
    }
}

// Initialisation de l'interface admin
async function initAdmin() {
    // Vérification mot de passe
    const password = prompt("Entrez le mot de passe admin:");
    if (password !== "admin") {
        alert("Accès refusé");
        window.location.href = "index.html";
        return;
    }

    // Chargement des gares
    const stations = await fetchStations();
    const stationSelect = document.getElementById('stationSelect');
    
    // Mise à jour du select des gares
    stationSelect.innerHTML = '<option value="" disabled selected>Sélectionnez une gare</option>' + 
        stations.map(station => 
            `<option value="${station.id}">${station.name}</option>`
        ).join('');

    // Gestion du formulaire d'ajout de train
    document.getElementById('addScheduleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const trainData = {
            number: document.getElementById('trainNumber').value,
            time: document.getElementById('trainTime').value,
            type: document.getElementById('trainType').value,
            platform: document.getElementById('trainPlatform').value || 'À déterminer',
            station_id: stationSelect.value,
            status: 'on-time'
        };

        if (trainData.type === 'arrival') {
            trainData.origin = document.getElementById('trainStation').value;
        } else {
            trainData.destination = document.getElementById('trainStation').value;
        }

        const result = await addTrain(trainData);
        if (result) {
            alert('Horaire ajouté avec succès!');
            e.target.reset();
        } else {
            alert("Erreur lors de l'ajout de l'horaire");
        }
    });
}

// Initialisation si sur la page admin
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', initAdmin);
}