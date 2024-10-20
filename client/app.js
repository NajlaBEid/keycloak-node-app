document.addEventListener('DOMContentLoaded', async () => {
    const keycloakConfig = {
        url: 'http://localhost:8080/auth',
        realm: 'nodeAppRealm',
        clientId: 'nodeAppClient',
        redirectUri: 'http://localhost:9000/welcome.html',
    };

    const code = new URLSearchParams(window.location.search).get('code');

    if (!code) {
        const authUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`;
        window.location.href = `${authUrl}?client_id=${keycloakConfig.clientId}&redirect_uri=${keycloakConfig.redirectUri}&response_type=code&scope=openid`;
    } else {
        
            const token = await exchangeCodeForToken(code);
            if (token) {
                localStorage.setItem('access_token', token);
                document.getElementById('getUserInfoBtn')?.addEventListener('click', () => fetchUserInfo(token));

        } 
        
    }

    async function exchangeCodeForToken(code) {
        const tokenUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`;
        const data = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: keycloakConfig.clientId,
            redirect_uri: keycloakConfig.redirectUri,
            code: code,
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data.toString(),
        });

        if (response.ok) {
            const tokenResponse = await response.json();
            return tokenResponse.access_token;
        } else {
            throw new Error('Failed to exchange code for token');
        }
    }

    async function fetchUserInfo(token) {
        const userInfoUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/userinfo`;
        
            const response = await fetch(userInfoUrl, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const userInfo = await response.json();
                document.getElementById('userInfo').innerHTML = `
                    <p><strong>Username:</strong> ${userInfo.preferred_username}</p>
                    <p><strong>Email:</strong> ${userInfo.email}</p>
                    <p><strong>Full Name:</strong> ${userInfo.name}</p>
                `;
            } else {
                throw new Error('Failed to fetch user info');
            }
    }

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        logoutUser();
    });

    function logoutUser() {
        const logoutUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout?redirect_uri=${keycloakConfig.redirectUri}`;
        localStorage.removeItem('access_token');
        window.location.href = logoutUrl;
    }
});
