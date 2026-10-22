document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SPA NAVIGATION LOGIC ---
    const landingPage = document.getElementById('home');
    const loginPage = document.getElementById('page-login');
    const dashboardPage = document.getElementById('page-dashboard');
    const addAssetPage = document.getElementById('page-add-asset');
    
    const loginBtn = document.getElementById('btn-login');
    const backHomeBtn = document.getElementById('btn-back-home');
    const logoutBtn = document.getElementById('btn-logout');
    const goToAddBtn = document.getElementById('btn-go-to-add');
    const backToDashBtn = document.getElementById('btn-back-to-dashboard');

    // Function to switch SPA views
    function switchPage(pageId) {
        [landingPage, loginPage, dashboardPage, addAssetPage].forEach(page => {
            if (page) page.style.display = 'none';
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'block';
        }
        
        window.scrollTo(0, 0);
    }

    // Event Listener 1: Click (Show Login Page)
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage('page-login'); 
        });
    }

    // Event Listener 2: Click (Back to Home from Login)
    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage('home'); 
        });
    }

    // Event Listener 3: Submit (Mock Login Form Validation)
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (email && password.length >= 4) {
                loginAlert.className = 'alert alert-success mt-3';
                loginAlert.textContent = 'Login successful! Redirecting to Dashboard...';
                loginAlert.classList.remove('d-none');
                
                setTimeout(() => {
                    loginForm.reset();
                    loginAlert.classList.add('d-none');
                    switchPage('page-dashboard'); 
                    
                    // Load both local assets AND external weather API on login
                    fetchInitialAssets(); 
                    fetchWeatherData();   
                }, 1000);
            } else {
                loginAlert.className = 'alert alert-danger mt-3';
                loginAlert.textContent = 'Invalid credentials. Password must be at least 4 characters.';
                loginAlert.classList.remove('d-none');
            }
        });
    }

    // Event Listener 4: Click (Logout)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            switchPage('home');
        });
    }

    // Event Listener 5: Click (Go to Add Asset from Dashboard)
    if (goToAddBtn) {
        goToAddBtn.addEventListener('click', () => {
            switchPage('page-add-asset');
        });
    }

    // Event Listener 6: Click (Back to Dashboard from Add Asset)
    if (backToDashBtn) {
        backToDashBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage('page-dashboard');
        });
    }

    // --- 2. API GET REQUEST (Real External API: Weather) ---
    async function fetchWeatherData() {
        const weatherDisplay = document.getElementById('weather-data');
        if (!weatherDisplay) return;

        weatherDisplay.innerHTML = '<span class="spinner-border spinner-border-sm text-success"></span> Fetching live weather...';

        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-1.2921&longitude=36.8219&current_weather=true');

            if (!response.ok) {
                throw new Error('Weather service unavailable');
            }

            const data = await response.json();
            const temp = data.current_weather.temperature;

            weatherDisplay.innerHTML = `
                <strong>Current Weather in Nairobi: ${temp}°C</strong><br>
                <small class="text-success">Use this to plan irrigation and harvest schedules.</small>
            `;

        } catch (error) {
            console.error('Weather API Error:', error);
            weatherDisplay.innerHTML = '<div class="alert alert-danger py-2 mb-0">Weather is unavailable right now. Please check your connection.</div>';
        }
    }

    // --- 3. API GET REQUEST (Fetch Initial Assets from local db.json) ---
    async function fetchInitialAssets() {
        try {
            // Check if we already have assets in LocalStorage (from previous POSTs)
            const storedAssets = localStorage.getItem('shambaAssets');
            if (storedAssets) {
                renderAssetList(JSON.parse(storedAssets));
                return; 
            }

            // GET request to our local JSON file
            const response = await fetch('./database/db.json');
            
            if (!response.ok) {
                throw new Error('Failed to load initial farm data');
            }

            const data = await response.json();
            localStorage.setItem('shambaAssets', JSON.stringify(data));
            renderAssetList(data);

        } catch (error) {
            console.error('GET API Error:', error);
            const assetList = document.getElementById('asset-list');
            if (assetList) {
                assetList.innerHTML = `<div class="alert alert-warning">Could not load farm data. Please ensure database/db.json exists.</div>`;
            }
        }
    }

    // Helper: Render Assets to the Dashboard
    function renderAssetList(assets) {
        const assetListEl = document.getElementById('asset-list');
        if (!assetListEl) return;

        if (assets.length === 0) {
            assetListEl.innerHTML = '<li class="list-group-item text-muted">No assets added yet.</li>';
            return;
        }

        assetListEl.innerHTML = assets.map(asset => {
            let badgeClass = 'bg-secondary';
            if (asset.type === 'Livestock') badgeClass = 'bg-primary';
            if (asset.type === 'Poultry') badgeClass = 'bg-warning text-dark';
            if (asset.type === 'Crop') badgeClass = 'bg-success';

            return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${asset.name}</strong><br>
                    <small class="text-muted">${asset.details || 'No additional details'}</small>
                </div>
                <span class="badge ${badgeClass} rounded-pill">${asset.type}</span>
            </li>`;
        }).join('');
    }

    // --- 4. EVENT LISTENER: 'change' (Dynamic Form Fields) ---
    const assetTypeSelect = document.getElementById('asset-type');
    if (assetTypeSelect) {
        assetTypeSelect.addEventListener('change', (e) => {
            // Hide all dynamic fields first
            document.querySelectorAll('.dynamic-fields').forEach(field => {
                field.style.display = 'none';
            });

            // Show the relevant field based on selection
            const selectedType = e.target.value;
            if (selectedType === 'Livestock') {
                document.getElementById('livestock-fields').style.display = 'block';
            } else if (selectedType === 'Poultry') {
                document.getElementById('poultry-fields').style.display = 'block';
            } else if (selectedType === 'Crop') {
                document.getElementById('crop-fields').style.display = 'block';
            }
        });
    }

    // --- 5. API POST REQUEST (Add New Asset) ---
    const assetForm = document.getElementById('asset-form');
    const assetAlert = document.getElementById('asset-alert');

    if (assetForm) {
        assetForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const assetType = document.getElementById('asset-type').value;
            const assetName = document.getElementById('asset-name').value;
            
            // Gather dynamic field data
            let details = '';
            if (assetType === 'Livestock') {
                details = `Tag: ${document.getElementById('livestock-tag').value || 'N/A'}`;
            } else if (assetType === 'Poultry') {
                details = `Size: ${document.getElementById('poultry-size').value || 'N/A'} birds`;
            } else if (assetType === 'Crop') {
                details = `Size: ${document.getElementById('crop-size').value || 'N/A'} Acres`;
            }

            const payload = {
                id: Date.now(),
                type: assetType,
                name: assetName,
                details: details
            };

            try {
                // POST request to external mock API
                const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Failed to save asset to server');

                // SUCCESS: Update LocalStorage with the new asset
                const currentAssets = JSON.parse(localStorage.getItem('shambaAssets')) || [];
                currentAssets.push(payload);
                localStorage.setItem('shambaAssets', JSON.stringify(currentAssets));

                // Show success alert
                assetAlert.className = 'alert alert-success mt-3';
                assetAlert.textContent = `Success! "${assetName}" has been saved to your farm.`;
                assetAlert.classList.remove('d-none');
                
                assetForm.reset();
                document.querySelectorAll('.dynamic-fields').forEach(f => f.style.display = 'none');
                
                renderAssetList(currentAssets); // Update dashboard immediately

            } catch (error) {
                console.error('POST API Error:', error);
                assetAlert.className = 'alert alert-danger mt-3';
                assetAlert.textContent = 'Error: Could not save asset. Please check your connection and try again.';
                assetAlert.classList.remove('d-none');
            }
        });
    }
});