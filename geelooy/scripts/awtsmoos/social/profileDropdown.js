// B"H
// profileDropdown.js
export default function createProfileDropdown(parentElement) {
    // Create container
    const container = document.createElement('div');
    container.className = 'awtsmoosDrop';
    parentElement.appendChild(container);

    // Initial HTML structure
    container.innerHTML = /*html*/ `
    <div class="notLoggedIn">
        <div class="btn dropt" id="signinButton">
            Sign In <span class="arrow">▼</span>
        </div>
        <div id="signinDropdown" class="hidden dropdown-content">
            <div id="loginForm">
                <h3>Log In</h3>
                <input type="text" id="loginUsername" placeholder="Username">
                <input type="password" id="loginPassword" placeholder="Password">
                <button id="loginSubmit">Log In</button>
                <div class="description">
                <div class="msg">Need an account?</div><br>
                    <a href="#" id="toggleRegister">Create one</a> | 
                    <a href="/login">Full Login</a>
                </div>
            </div>
            <div id="registerForm" class="hidden">
                <h3>Create Account</h3>
                <input type="text" id="registerUsername" placeholder="Username">
                <input type="password" id="registerPassword" placeholder="Password">
                <button id="registerSubmit">Create Account</button>
                <div class="description">
                    <div class="msg">Have an account?</div><br>
                    <a href="#" id="toggleLogin">Log In</a> | 
                    <a href="/login">Full Login</a>
                </div>
            </div>
            <div id="authMessage" class="validation-message"></div>
        </div>
    </div>
    <div class="loggedIn hidden">
        <div class="btn dropt" id="dropdownProfile">
            <span class="currentAliasName prim">Profile</span>
            <span id="awtsDownIndicator" class="arrow">▼</span>
        </div>
        <div id="awtsmoosProfileDropContent" class="hidden dropdown-content">
            <div class="welcome">
                Welcome, <span class="highlight" id="usernameDisplay"></span>!
            </div>
            <div class="currentAlias hidden" id="aliasSection">
                You're current alias is: 
                <a class="currentAliasName" href="#">Profile</a>
            </div>
            <div class="btn dropt" id="switchAlias">
                Switch Alias? <span id="aliasIndicator" class="arrow">▼</span>
            </div>
            <div id="aliasInfo" class="hidden dropdown-content">
                <div class="center">
                    <div class="loading-circle"></div>
                </div>
            </div>
            <hr>
            <div class="settings">
                <a href="/profile">Manage Your Aliases</a>
            </div>
            <div id="logoutSection"></div>
        </div>
    </div>
    `;

    // Inject styles
    const style = document.createElement('link');
    style.type="text/css"
    style.rel="stylesheet";
    style.href="/style/social/profileStyles.css"
    document.head.appendChild(style);

    
    // Session check
    var notLogged = container.querySelector(".notLoggedIn");
    var logged = container.querySelector(".loggedIn");

    function aliasProfileHref(aliasId) {
        return aliasId ? `/@${encodeURIComponent(aliasId)}` : '#';
    }

    fetch(location.origin + '/api/social', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const session = data.session;
            const alias = session?.info?.hosuhfuh?.alias;
            const username = session?.info?.userId;

            document.getElementById('usernameDisplay').textContent = username;
            
            if (username) {
                // LOGGED IN
                logged.classList.remove("hidden");
                notLogged.classList.add("hidden");
                
                if (alias) {
                    window.curAlias = alias;
                    const aliasSection = document.getElementById('aliasSection');
                    aliasSection.classList.remove('hidden');
                    document.querySelectorAll('.currentAliasName').forEach(element => {
                        element.textContent = '@' + alias;
                        if (element.tagName === 'A') element.href = aliasProfileHref(alias);
                    });
                    
                    // Fire Success Event
                    window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id: alias } }));
                } else {
                    // Logged in but no alias selected yet
                    window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id: null } }));
                }

                const logoutSection = document.getElementById('logoutSection');
                const logoutLink = document.createElement('a');
                logoutLink.href = '/logout?redirect=' + encodeURIComponent(location.href);
                logoutLink.textContent = 'Logout';
                logoutSection.replaceChildren(logoutLink);
            } else {
                // NOT LOGGED IN
                logged.classList.add("hidden");
                notLogged.classList.remove("hidden");
                
                // IMPORTANT: Fire event with null so the app knows to show the Login Screen
                window.curAlias = null;
                window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id: null } }));
            }
        })
        .catch(error => {
            console.error('Error fetching session:', error);
            // Even on error, tell the app we are done loading so it doesn't hang
            window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id: null } }));
        });

    // Signin dropdown logic
    const signinButton = document.getElementById('signinButton');
    const signinDropdown = document.getElementById('signinDropdown');
    const signinArrow = signinButton.querySelector('.arrow');
    let signinBack = null;

    function dropdownify(content, arrow, custom="right") {
        const isHidden = content.classList.contains('hidden');
        if (isHidden) {
            content.classList.remove('hidden');
            arrow.classList.add(custom);
        } else {
            content.classList.add('hidden');
            arrow.classList.remove(custom);
        }
    }

    function makeBackdropForSignin() {
        const backdrop = document.createElement('div');
        signinDropdown.style.zIndex = 9999999;
        const id = 'BH_signin_' + Date.now();
        backdrop.classList.add(id + '-blocker', 'awtsBlock', 'awtsmoos-dropdown-backdrop');
        container.appendChild(backdrop);
        backdrop.addEventListener('click', () => {
            signinDropdown.classList.add('hidden');
            signinArrow.classList.remove('right');
            backdrop.remove();
        });
        return backdrop;
    }

    signinButton.addEventListener('click', () => {
        dropdownify(signinDropdown, signinArrow);
        if (!signinDropdown.classList.contains('hidden')) {
            signinBack = makeBackdropForSignin();
        } else if (signinBack) {
            signinBack.remove();
        }
    });

    // Toggle between login and register
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleRegister = document.getElementById('toggleRegister');
    const toggleLogin = document.getElementById('toggleLogin');
    const authMessage = document.getElementById('authMessage');

    toggleRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authMessage.textContent = '';
    });

    toggleLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authMessage.textContent = '';
    });

    // Login submission
    const loginSubmit = document.getElementById('loginSubmit');
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');

    loginSubmit.addEventListener('click', async () => {
        const username = loginUsername.value.trim();
        const password = loginPassword.value.trim();
        if (!username || !password) {
            authMessage.textContent = 'Please enter username and password';
            authMessage.className = 'validation-message invalid';
            return;
        }
        const resp = await fetch('/login/', {
            method: 'POST',
            body: new URLSearchParams({ username, password }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            credentials: 'include'
        }).then(r => r.text());

        if (resp.includes('success')) {
            location.reload(); // Reload to reflect logged-in state
        } else {
            authMessage.textContent = 'Login failed';
            authMessage.className = 'validation-message invalid';
        }
    });

    // Register submission
    const registerSubmit = document.getElementById('registerSubmit');
    const registerUsername = document.getElementById('registerUsername');
    const registerPassword = document.getElementById('registerPassword');

    registerSubmit.addEventListener('click', async () => {
        const username = registerUsername.value.trim();
        const password = registerPassword.value.trim();
        if (!username || !password) {
            authMessage.textContent = 'Please enter username and password';
            authMessage.className = 'validation-message invalid';
            return;
        }
        const resp = await fetch('/register/', {
            method: 'POST',
            body: new URLSearchParams({ username, password }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            credentials: 'include'
        }).then(r => r.text());

        if (resp.includes('success')) {
            authMessage.textContent = 'Account created! Please log in.';
            authMessage.className = 'validation-message valid';
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        } else {
            authMessage.textContent = 'Registration failed';
            authMessage.className = 'validation-message invalid';
        }
    });

    // Existing profile dropdown logic
    const dropdownProfile = document.getElementById('dropdownProfile');
    const awtsmoosProfileDropContent = document.getElementById('awtsmoosProfileDropContent');
    const awtsDownIndicator = document.getElementById('awtsDownIndicator');
    const switchAlias = document.getElementById('switchAlias');
    const aliasInfo = document.getElementById('aliasInfo');
    const aliasIndicator = document.getElementById('aliasIndicator');
    const aliasSection = document.getElementById('aliasSection');
    let aliasesGot = null;

    function makeBackdrop() {
        const backdrop = document.createElement('div');
        awtsmoosProfileDropContent.style.zIndex = 9999999;
        const id = 'BH_' + Date.now();
        backdrop.classList.add(id + '-blocker', 'awtsBlock', 'awtsmoos-dropdown-backdrop');
        container.appendChild(backdrop);
        backdrop.addEventListener('click', () => {
            awtsmoosProfileDropContent.classList.add('hidden');
            awtsDownIndicator.classList.remove('right');
            backdrop.remove();
        });
        return backdrop;
    }

    let profileBack = null;
    if(dropdownProfile) {
        dropdownProfile.addEventListener('click', () => {
            dropdownify(awtsmoosProfileDropContent, awtsDownIndicator);
            if (!awtsmoosProfileDropContent.classList.contains('hidden')) {
                profileBack = makeBackdrop();
            } else if (profileBack) {
                profileBack.remove();
            }
        });
    }

    let isShowingAliases = false;
    if(switchAlias) {
        switchAlias.addEventListener('click', async () => {
            dropdownify(aliasInfo, aliasIndicator);
            isShowingAliases = !isShowingAliases;
            if (!aliasesGot) {
                try {
                    aliasesGot = await (await fetch(`/api/social/aliases/details?${new URLSearchParams({
                        propertyMap: JSON.stringify({ name: true, id: true })
                    })}`, { credentials: 'include' })).json();
                } catch (e) {
                    console.error('Error fetching aliases:', e);
                }
            }
            showAliases(aliasesGot || []);
        });
    }

    
    function showAliases(aliases) {
        aliasInfo.innerHTML = '';
        if (!aliases.length) {
            const emptyAliases = document.createElement('div');
            emptyAliases.textContent = 'No aliases yet';
            aliasInfo.appendChild(emptyAliases);
        } else {
            aliases.forEach(w => {
                const h = document.createElement('div');
                h.className = 'aliasId' + (w.id === window.curAlias ? ' default' : '');
                h.textContent = '@' + w.id;
                const p = document.createElement('div');
                p.className = 'aliasName';
                p.textContent = w.name;
                h.appendChild(p);
                aliasInfo.appendChild(h);
                h.addEventListener('click', async () => {
                    h.textContent = 'Setting as default...';
                    const resp = await (await fetch(`/api/social/alias/default`, {
                        method: 'POST',
                        body: new URLSearchParams({ alias: w.id }).toString(),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        credentials: 'include'
                    })).json();
                    if (resp.success) {
                        window.curAlias = w.id;
                        window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id: w.id } }));
                        showAliases(aliasesGot);
                    } else {
                        h.textContent = 'Couldn\'t set default';
                    }
                });
            });
        }
    
        // Add the "Create New Alias" dropdown toggle button
        const createAliasToggle = document.createElement('div');
        createAliasToggle.className = 'btn dropt';
        createAliasToggle.id = 'createAliasToggle';
        createAliasToggle.innerHTML = 'Create New Alias <span class="arrow up">▼</span>';
        aliasInfo.appendChild(createAliasToggle);
    
        // Add the dropdown content for the alias creation form
        const createAliasDropdown = document.createElement('div');
        createAliasDropdown.className = 'hidden dropdown-content alias-form';
        createAliasDropdown.id = 'createAliasDropdown';
        createAliasDropdown.innerHTML = /*html*/`
            <input type="text" id="aliasName" placeholder="Alias Name">
            <textarea id="aliasDescription" placeholder='B"H\nDescription of Alias'></textarea>
            <input type="text" id="aliasId" placeholder="Alias ID">
            <div id="validationMessage" class="validation-message"></div>
            <button id="createAliasSubmit">Create</button>
        `;
        aliasInfo.appendChild(createAliasDropdown);
    
        // Toggle logic for the "Create New Alias" dropdown
        const createAliasArrow = createAliasToggle.querySelector('.arrow');
        let createAliasBack = null;
    
        createAliasToggle.addEventListener('click', () => {
            dropdownify(createAliasDropdown, createAliasArrow, "right2");
        });
    
    
        // Alias creation form logic
        const aliasNameInput = document.getElementById('aliasName');
        const aliasDescriptionInput = document.getElementById('aliasDescription');
        const aliasIdInput = document.getElementById('aliasId');
        const validationMessage = document.getElementById('validationMessage');
        const createAliasSubmit = document.getElementById('createAliasSubmit');
        let lastGeneratedId = '';
    
        async function checkAlias(input, isId = false) {
            const value = input.value.trim();
            if (!value) {
                validationMessage.textContent = '';
                return;
            }
            const resp = await fetch('/api/social/aliases/checkOrGenerateId', {
                method: 'POST',
                body: 'aliasName=' + encodeURIComponent(value),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include'
            }).then(r => r.json());
    
            if (resp.aliasId) {
                validationMessage.textContent = isId ? 'ID is available' : 'Generated ID available';
                validationMessage.className = 'validation-message valid';
                if (!isId) {
                    lastGeneratedId = resp.aliasId;
                    aliasIdInput.value = resp.aliasId;
                }
            } else if (resp.error) {
                if (resp.error.code === 'ALREADY_EXISTS') {
                    validationMessage.textContent = 'That alias already exists';
                } else if (resp.error.code === 'INVALID_ID_FORMAT') {
                    validationMessage.textContent = resp.error.message;
                } else {
                    validationMessage.textContent = 'Error checking alias';
                }
                validationMessage.className = 'validation-message invalid';
            }
        }
    
        aliasNameInput.addEventListener('input', () => checkAlias(aliasNameInput));
        aliasIdInput.addEventListener('input', () => {
            if (aliasIdInput.value !== lastGeneratedId) {
                checkAlias(aliasIdInput, true);
            }
        });
    
        createAliasSubmit.addEventListener('click', async () => {
            const name = aliasNameInput.value.trim();
            const description = aliasDescriptionInput.value.trim();
            const id = aliasIdInput.value.trim();
            if (!name || !id) {
                validationMessage.textContent = 'Please enter both name and ID';
                validationMessage.className = 'validation-message invalid';
                return;
            }
            createAliasSubmit.disabled = true;
            const resp = await fetch('/api/social/aliases', {
                method: 'POST',
                body: new URLSearchParams({
                    aliasName: name,
                    description: description || 'Created from dropdown',
                    inputId: id,
                    aliasId: id
                }).toString(),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                credentials: 'include'
            }).then(r => r.json());
    
            createAliasSubmit.disabled = false;
            if (!resp.error) {
                aliasesGot.push({ id, name });
                showAliases(aliasesGot);
                aliasNameInput.value = '';
                aliasDescriptionInput.value = '';
                aliasIdInput.value = '';
                validationMessage.textContent = 'Alias created!';
                validationMessage.className = 'validation-message valid';
                // Optionally close the dropdown after creation
                createAliasDropdown.classList.add('hidden');
                createAliasArrow.classList.remove('right');
                if (createAliasBack) createAliasBack.remove();
            } else {
                validationMessage.textContent = 'Failed to create alias: ' + (resp.error.message || 'Unknown error');
                validationMessage.className = 'validation-message invalid';
            }
        });
    }

    addEventListener('awtsmoosAliasChange', e => {
        window.curAlias = e.detail.id;
        document.querySelectorAll('.currentAliasName').forEach(d => {
            d.textContent = '@' + e.detail.id;
            if (d.tagName === 'A') d.href = aliasProfileHref(e.detail.id);
        });
        if (aliasSection.classList.contains('hidden')) aliasSection.classList.remove('hidden');
        if (aliasesGot && isShowingAliases) showAliases(aliasesGot);
    });
}