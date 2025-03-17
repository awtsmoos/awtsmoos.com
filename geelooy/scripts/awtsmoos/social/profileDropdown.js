// B"H
// profileDropdown.js
export default function createProfileDropdown(parentElement) {
    // Create container
    const container = document.createElement('div');
    container.className = 'awtsmoosDrop';
    parentElement.appendChild(container);

    // Initial HTML structure
    container.innerHTML = /*html*/`
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
            <span class="currentAliasName">Profile</span>
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
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.textContent = /*css*/`
        .awtsmoosDrop {
            z-index: 999999999999999999;
            font-family: Arial, sans-serif;
        }
        div#createAliasDropdown {
            transform: translate(0px, -61px);
        }
        .awtsmoosDrop .btn,
        .awtsmoosDrop button,
        .awtsmoosDrop a {
            padding: 10px 26px 10px 16px;
            background: linear-gradient(135deg,rgb(141, 121, 230), #00ddeb);
            
            border-radius: 8px;
            cursor: pointer;
            border: 1px solid black;
            border-radius: 26px;
            position: relative;
            font-weight: bold;
            user-select: none;
            transition: all 0.3s ease;
            color:black !important;
            display: inline-block;
        }
        .awtsmoosDrop .highlight {
            
            font-size: 1.4em;

        }
        .awtsmoosDrop .btn:hover,
        .awtsmoosDrop a:hover,
        .awtsmoosDrop button:hover {
            background: linear-gradient(135deg,rgb(75, 44, 177),rgb(25, 98, 107));
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            
            color: white !important;
        }
        .aliasId.default { background: #ffce00; }
        .aliasId.default:hover { background: #ffe066; }
        .aliasId:hover { background: #ffff99; cursor: pointer; }
        .aliasId {
            padding: 8px;
            word-break: break-word;
            display: inline-block;
            border: 2px solid #333;
            background: #a4f7f7;
            border-radius: 15px;
            transition: background 0.3s ease;
        }
        .aliasName { font-weight: bold; margin-top: 7px; color: #333; }
        #aliasInfo {
            display: flex;
            flex-direction: column;
            gap: 15px;
            max-width: 300px;
            max-height: 300px;
            border: 2px solid #333;
            margin-left: -36px;
            overflow-y: auto;
            background: #fff;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        }

        div#logoutSection {
            margin-top: 26px;
        }
        .awtsmoosDrop .currentAlias { padding: 10px; color: #333; }
        .awtsmoosDrop .currentAlias a {
            
            background: #ffd700;
            padding: 5px 10px;
            border-radius: 5px;
            color: white;
        }
        .awtsmoosDrop .currentAlias a:hover {background:rgb(42, 63, 99); color: #333; }
        .awtsmoosDrop .arrow { 
            
            display: inline-block;
           
          
            margin-right: -10px;
            transition: transform 0.3s ease; 
        }

        .awtsmoosDrop .arrow.up {
            transform: rotate(180deg)
        }
        .awtsmoosDrop .arrow.right { transform:  rotate(-90deg); }

        .awtsmoosDrop .arrow.right2 { transform:  rotate(270deg); }

        .awtsmoosDrop .dropdown-content {
            padding: 20px;
            color:black;

            position: fixed;
            right: 50px;
            background: linear-gradient(135deg, #ffffff, #f0f0ff);
            min-width: 200px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 9999999;
            border-radius: 12px;
            border: 1px solid #ddd;
        }
        .awtsmoosDrop .description {
            margin-top: 20px;
        }
        
        .alias-form {
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .alias-form input, .alias-form textarea {
            padding: 10px;
            border: 2px solid #999;
            border-radius: 6px;
            font-size: 14px;
            background: #f9f9f9;
            transition: border-color 0.3s ease;
        }
        .alias-form input:focus, .alias-form textarea:focus {
            border-color: #6b48ff;
            outline: none;
        }
        .alias-form textarea { min-height: 80px; resize: vertical; }
        
        .alias-form button:disabled { background: #ccc; cursor: not-allowed; }
        .validation-message { font-size: 12px; margin-top: 5px; }
        .valid { color: #00cc00; }
        .invalid { color: #ff3333; }
        .hidden { display: none; }
        .notLoggedIn { display: flex; align-items: center; }

        #signinDropdown {
            transform: translate(0, calc(50% + 50px));
            position: fixed;
            right: 50px;
            background: linear-gradient(135deg, #ffffff, #e6e6ff);
            min-width: 250px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 9999999;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #ccc;
        }
        #signinDropdown h3 {
            margin: 0 0 15px;
            color: #6b48ff;
            font-size: 20px;
            font-weight: bold;
        }
        .awtsmoosDrop input,
        .awtsmoosDrop textarea {

            font-size: 1.3em;
        }
        #signinDropdown input {
            width: calc(100% - 25px);
            padding: 10px;
            margin-bottom: 12px;
            border: 2px solid #999;
            border-radius: 6px;
            background: #f9f9f9;
            transition: border-color 0.3s ease;
        }
        #signinDropdown input:focus {
            border-color: #00ddeb;
            outline: none;
        }
        #signinDropdown button {
            width: 100%;
            padding: 12px;
            margin: 0px;
            font-weight: bold;
            font-size: 1.3em;
        }
       
        #signinDropdown p {
            margin-top: 12px;
            font-size: 14px;
            color: #333;
        }
        #signinDropdown a {
            
            font-weight: bold;
        }
        #signinDropdown a:hover {
            
            text-decoration: underline;
        }

        @media (max-width: 600px) {
            .awtsmoosDrop .dropdown-content, #signinDropdown {
                right: 10px;
                left: 10px;
                width: auto;
                margin: 0 auto;
                max-width: 90%;
            }
            .awtsmoosDrop .dropt { font-size: 14px; padding: 8px 20px 8px 12px; }
            #aliasInfo { max-width: 100%; margin-left: 0; }
        }
    `;

    // Session check
    var notLogged = container.querySelector(".notLoggedIn");
    var logged = container.querySelector(".loggedIn");
    fetch(location.origin + '/api/social', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            const session = data.session;
            const alias = session?.info?.hosuhfuh?.alias;
            const username = session?.info?.userId;

            document.getElementById('usernameDisplay').textContent = username;
            if (username) {
                logged.classList.remove("hidden");
                notLogged.classList.add("hidden");
                if (alias) {
                    window.curAlias = alias;
                    const aliasSection = document.getElementById('aliasSection');
                    aliasSection.classList.remove('hidden');
                    document.querySelectorAll('.currentAliasName').forEach(element => {
                        element.textContent = '@' + alias;
                        if (element.tagName === 'A') element.href = '/@' + alias;
                    });
                }
                document.getElementById('logoutSection').innerHTML = `<a href="/logout?redirect=${
                    encodeURIComponent(location.href)
                }">Logout</a>`;
            } else {
                logged.classList.add("hidden");
                notLogged.classList.remove("hidden");
            }
        })
        .catch(error => console.error('Error fetching session:', error));

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
        backdrop.classList.add(id + '-blocker', 'awtsBlock');
        const sty = document.createElement('style');
        backdrop.appendChild(sty);
        sty.innerHTML = `.${id}-blocker { position: fixed; left: 0; top: 0; margin: 0; z-index: 9999998; background: rgba(0,0,0,0.4); width: 100%; height: 100%; }`;
        document.body.appendChild(backdrop);
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
        backdrop.classList.add(id + '-blocker', 'awtsBlock');
        const sty = document.createElement('style');
        backdrop.appendChild(sty);
        sty.innerHTML = `.${id}-blocker { position: fixed; left: 0; top: 0; margin: 0; z-index: 9999998; background: rgba(0,0,0,0.4); width: 100%; height: 100%; }`;
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', () => {
            awtsmoosProfileDropContent.classList.add('hidden');
            awtsDownIndicator.classList.remove('right');
            backdrop.remove();
        });
        return backdrop;
    }

    let profileBack = null;
    dropdownProfile.addEventListener('click', () => {
        dropdownify(awtsmoosProfileDropContent, awtsDownIndicator);
        if (!awtsmoosProfileDropContent.classList.contains('hidden')) {
            profileBack = makeBackdrop();
        } else if (profileBack) {
            profileBack.remove();
        }
    });

    let isShowingAliases = false;
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

    
    
    function showAliases(aliases) {
        aliasInfo.innerHTML = '';
        if (!aliases.length) {
            aliasInfo.innerHTML = '<div>No aliases yet</div>';
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
                    h.innerHTML = 'Setting as default...';
                    const resp = await (await fetch(`/api/social/alias/default`, {
                        method: 'POST',
                        body: 'alias=' + w.id,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        credentials: 'include'
                    })).json();
                    if (resp.success) {
                        window.curAlias = w.id;
                        dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id: w.id } }));
                        showAliases(aliasesGot);
                    } else {
                        h.innerHTML = 'Couldn\'t set default';
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
            if (d.tagName === 'A') d.href = '/@' + e.detail.id;
        });
        if (aliasSection.classList.contains('hidden')) aliasSection.classList.remove('hidden');
        if (aliasesGot && isShowingAliases) showAliases(aliasesGot);
    });
}