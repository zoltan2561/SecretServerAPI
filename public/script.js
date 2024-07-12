document.getElementById('createSecretButton').addEventListener('click', async () => {
    const secretTextElement = document.getElementById('secretText');
    const expireAfterViewsElement = document.getElementById('expireAfterViews');
    const expireAfterElement = document.getElementById('expireAfter');

    // Ellenőrizze, hogy minden szükséges mező kitöltve van-e
    if (!secretTextElement.value || !expireAfterViewsElement.value || !expireAfterElement.value) {
        alert('Minden mezőt ki kell tölteni!');
        return;
    }

    const secretText = secretTextElement.value;
    const expireAfterViews = parseInt(expireAfterViewsElement.value);
    const expireAfter = parseInt(expireAfterElement.value);

    // Ellenőrizze, hogy a számértékek megfelelőek-e
    if (isNaN(expireAfterViews) || expireAfterViews <= 0 || isNaN(expireAfter) || expireAfter < 0) {
        alert('Érvénytelen számértékek! A "Max Reads" mező értéke nagyobbnak kell lennie, mint 0, és a "TTL" mező értéke 0 vagy nagyobb számnak kell lennie.');
        return;
    }

    const response = await fetch('/api/secret', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            secretText: secretText,
            expireAfterViews: expireAfterViews,
            expireAfter: expireAfter
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating secret:', errorData.error);
        return;
    }

    const data = await response.json();
    const secretUrl = `http://63.250.59.101:443/api/secret/${data.hash}`;

    document.getElementById('secretUrl').href = secretUrl;
    document.getElementById('secretUrl').textContent = secretUrl;
    document.getElementById('secretUrlContainer').classList.remove('hidden');
});

document.getElementById('getSecretButton').addEventListener('click', async () => {
    const secretUrlElement = document.getElementById('secretUrlInput');
    if (!secretUrlElement.value) {
        alert('Kérjük, adja meg a titkos URL-t!');
        return;
    }

    const secretUrl = secretUrlElement.value;
    const response = await fetch(secretUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error retrieving secret:', errorData.error);
        alert('Nem sikerült megszerezni a titkot. Kérjük, ellenőrizze a megadott URL-t és próbálkozzon újra.');
        return;
    }

    const data = await response.json();
    const secretTextElement = document.getElementById('retrievedSecret');
    secretTextElement.textContent = data.secretText;

    // szöveg törlése 5 mp után
    setTimeout(() => {
        secretTextElement.textContent = '';
    }, 5000); // 5 seconds
});
