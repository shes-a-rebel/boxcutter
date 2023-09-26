const file = 'data.json'

let filters = [];

fetch(file).then(function (response) {
    return response.json();
}).then(function (data) {
    const status = document.getElementById('status');

    // Sort the game list
    data.games.sort(function (a, b) {
        const sortingA = a.sorting !== undefined ? a.sorting : a.title;
        const sortingB = b.sorting !== undefined ? b.sorting : b.title;
        return sortingA.localeCompare(sortingB);
    });

    // Game tiles
    status.innerHTML = 'Unboxing games...';
    for (const game of data.games) {
        const gameCollection = game.collection;
        const gameHidden = game.hidden;
        const collectionHidden = data.collections[gameCollection].hidden;

        if (gameHidden !== true && collectionHidden !== true) {
            const gameDescription = game.description;
            const gameLicense = game.license;
            const gameMax = game.max;
            const gameMin = game.min;
            const gameTime = game.time;
            const gameTitle = game.title;
            const gameType = game.type;

            const collectionTitle = data.collections[gameCollection].title;
            const collectionDisabled = data.collections[gameCollection].disabled;

            const licenseTitle = data.licenses[gameLicense].title;
            const licenseTooltip = data.licenses[gameLicense].tooltip;
            const licenseDisabled = data.licenses[gameLicense].disabled;

            let gameGameplay;
            if (game.gameplay !== undefined) {
                if (data.gameplays[game.gameplay].override !== undefined) {
                    gameGameplay = data.gameplays[game.gameplay].override
                } else {
                    gameGameplay = game.gameplay;
                }
            } else {
                gameGameplay = 'unknown';
            }

            const gameplayTitle = data.gameplays[gameGameplay].title;
            const gameplayDisabled = data.gameplays[gameGameplay].disabled;

            // Tile: params
            let params = 'collection-' + gameCollection + ' license-' + gameLicense + ' type-' + ((gameType === 'app' || gameType === 'pack') ? 'download' : 'website') + ' gameplay-' + gameGameplay;

            // Tile: anchor
            const grid = document.getElementById('grid');
            const anchor = document.createElement('a');
            if (collectionDisabled === true || licenseDisabled === true || gameType === 'web' || gameplayDisabled === true) {
                anchor.classList.add('hidden');
            }
            anchor.setAttribute('data-params', params);

            let tooltip = gameTitle;
            if (gameType === 'pack') {
                tooltip += ' (' + collectionTitle + ')';
            }
            tooltip += '\n“' + gameDescription + '”\n';
            tooltip += '\nGameplay: ' + gameplayTitle;
            // tooltip += '\nPlayers: ' + (gameMin !== undefined ? gameMin : "") + (gameMax !== undefined ? ' - ' + gameMax : '+');
            if ((gameMin === undefined || gameMin === 1) && gameMax !== undefined) {
                tooltip += "\nPlayers: up to " + gameMax;
            } else if (gameMin !== undefined && gameMax !== undefined) {
                tooltip += "\nPlayers: " + gameMin + " - " + gameMax;
            } else if (gameMin !== undefined) {
                tooltip += "\nPlayers: " + gameMin + "+";
            }
            if (gameTime !== undefined) {
                tooltip += '\nMinimum Time: ' + gameTime + ' minutes';
            }
            tooltip += '\n\n' + 'License: ' + licenseTooltip;

            anchor.title = tooltip;
            anchor.classList.add('tile');
            if (gameType === 'app') {
                const gameAppid = game.appid;

                anchor.href = 'steam://run/' + gameAppid;
                anchor.style.backgroundImage = 'url(images/tiles/app/' + gameAppid + '.jpg)';
            } else if (gameType === 'pack') {
                const collectionAppid = data.collections[gameCollection].appid;
                const gameSwf = game.swf;
                const gameSubfolder = game.subfolder !== undefined ? game.subfolder : gameSwf;

                anchor.href = 'steam://rungameid/' + collectionAppid + '//-launchTo games\\' + gameSubfolder + '\\' + gameSwf + '.swf';
                anchor.style.backgroundImage = 'url(images/tiles/pack/' + gameCollection + '/' + gameSwf + '.png)';
            } else if (gameType === 'web') {
                const gameWebsite = game.website;
                const gameImage = game.image;

                anchor.href = gameWebsite;
                anchor.setAttribute('target', '_blank');
                anchor.style.backgroundImage = 'url(images/tiles/web/' + gameImage + ')';
            }
            anchor.style.backgroundSize = 'cover';
            anchor.style.backgroundPosition = 'center';
            grid.appendChild(anchor);
        }
    }

    status.innerHTML = 'Generating filters...';
    // Filter: collections
    const filtersCollection = document.getElementById('collection').querySelector("ul");

    for (const id in data.collections) {
        if (data.collections[id].hidden !== true) {
            const title = data.collections[id].title;
            const titleShort = data.collections[id].titleShort;

            const li = document.createElement('li');
            filtersCollection.appendChild(li);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'filter-collection-' + id;
            if (data.collections[id].disabled === undefined) {
                checkbox.checked = true;
            } else {
                filters.push('collection-' + id);
            }
            checkbox.addEventListener('change', setFilter);
            li.appendChild(checkbox);

            const label = document.createElement('label');
            label.htmlFor = 'filter-collection-' + id;
            label.title = title;
            label.textContent = titleShort !== undefined ? titleShort : title;
            li.appendChild(label);
        }
    }

    // Filters: type
    const filtersType = document.getElementById('type').querySelector("ul");

    for (const id in data.types) {
        if (data.types[id].hidden !== true) {
            const title = data.types[id].title;
            const description = data.types[id].description;

            const li = document.createElement('li');
            filtersType.appendChild(li);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'filter-type-' + id;
            if (data.types[id].disabled === undefined) {
                checkbox.checked = true;
            } else {
                filters.push('type-' + id);
            }
            checkbox.addEventListener('change', setFilter);
            li.appendChild(checkbox);

            const label = document.createElement('label');
            label.htmlFor = 'filter-type-' + id;
            label.title = description;
            label.textContent = title;
            li.appendChild(label);
        }
    }

    // Filters: license
    const filtersLicense = document.getElementById('license').querySelector("ul");

    for (const id in data.licenses) {
        if (data.licenses[id].hidden !== true) {
            const title = data.licenses[id].title;
            const description = data.licenses[id].description;

            const li = document.createElement('li');
            filtersLicense.appendChild(li);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'filter-license-' + id;
            if (data.licenses[id].disabled === undefined) {
                checkbox.checked = true;
            } else {
                filters.push('license-' + id);
            }
            checkbox.addEventListener('change', setFilter);
            li.appendChild(checkbox);

            const label = document.createElement('label');
            label.htmlFor = 'filter-license-' + id;
            label.title = description;
            label.textContent = title;
            li.appendChild(label);
        }
    }

    // Filters: gameplay
    const filtersGameplay = document.getElementById('gameplay').querySelector("ul");

    for (const id in data.gameplays) {
        if (data.gameplays[id].override === undefined) {
            const title = data.gameplays[id].title;
            // const description = data.gameplays[id].description;

            const li = document.createElement('li');
            filtersGameplay.appendChild(li);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'filter-gameplay-' + id;
            if (data.gameplays[id].disabled === undefined) {
                checkbox.checked = true;
            } else {
                filters.push('gameplay-' + id);
            }
            checkbox.addEventListener('change', setFilter);
            li.appendChild(checkbox);

            const label = document.createElement('label');
            label.htmlFor = 'filter-gameplay-' + id;
            // label.title = description;
            label.textContent = title;
            li.appendChild(label);
        }
    }
}).catch(function (error) {
    console.error('Error fetching JSON: ' + error);
}).finally(function () {
    // status.innerHTML = 'Applying themes...';
    //     // Themes
    //     const themes = document.getElementById('themes');
    //     for (const id in data.themes) {
    //         const div = document.createElement('div');
    //         themes.appendChild(div);
    //         div.title = id;
    //         div.addEventListener('click', function () {
    //             setTheme(id);
    //         });

    //         const left = document.createElement('div');
    //         left.style.backgroundColor = data.themes[id].color1;
    //         left.classList.add('left');
    //         div.appendChild(left);

    //         const right = document.createElement('div');
    //         right.style.backgroundColor = data.themes[id].color2;
    //         right.classList.add('right');
    //         div.appendChild(right);

    //         if (getCookie('theme') === id) {
    //             setTheme(getCookie('theme'))
    //         }
    //     }

    // Warning prompt
    const testCookie = "agreeDevelopment20230921";
    if (getCookie(testCookie) !== "true") {
        const popupContainer = document.getElementById('popup-container');
        const agreeButton = document.getElementById('popup-agree');
        popupContainer.style.display = 'flex';
        agreeButton.addEventListener('click', () => {
            popupContainer.style.display = 'none';
            setCookie(testCookie, "true", 30);
        });
    }

    // Scale Slider
    const scaleCookie = getCookie('scale');
    if (scaleCookie) {
        slider.value = scaleCookie;
        const width = 256 * scaleCookie;
        const height = 118 * scaleCookie;
        grid.style.gridTemplateColumns = 'repeat(auto-fill, ' + width + 'px)';
        grid.style.gridAutoRows = height + 'px';
    }

    // Remove loading screen
    const loading = document.getElementById('loading');
    loading.style.display = 'none';
});

function applyFilters() {
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        const dataParams = tile.getAttribute('data-params').split(' ');
        if (filters.some(filter => dataParams.includes(filter))) {
            // hide the tile
            tile.classList.add('hidden');
        } else {
            // show the tile
            tile.classList.remove('hidden');
        }
    });
}

// Sidebar filter collapse
function collapseFilter(event, target) {
    if ((event.target.id === target && event.target.nodeName === "LI") || event.target.nodeName === "SPAN") {
        const parent = document.getElementById(target);
        // const child = parent.querySelector("ul");
        if (parent.classList.contains("collapsed")) {
            parent.classList.remove('collapsed');
        } else {
            parent.classList.add('collapsed');
        }
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expiration = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expiration + ";path=/";
}

function setFilter(event) {
    const checkbox = event.target;
    const filter = checkbox.id.replace('filter-', '');

    // toggle the filter
    if (checkbox.checked) {
        // remove the filter
        const index = filters.indexOf(filter);
        if (index !== -1) {
            filters.splice(index, 1);
        }
    } else {
        // add the filter
        if (!filters.includes(filter)) {
            filters.push(filter);
        }
    }

    applyFilters();
}

// function setTheme(id) {
//     const style = document.getElementById('colorscheme');
//     style.href = 'css/themes/' + id + '.css';
//     setCookie("theme", id, 30)
// }

// Tile scale slider
const slider = document.getElementById('slider');
slider.addEventListener('input', () => {
    const scale = slider.value;
    const width = 256 * scale;
    const height = 118 * scale;
    grid.style.gridTemplateColumns = 'repeat(auto-fill, ' + width + 'px)';
    grid.style.gridAutoRows = height + 'px';

    setCookie('scale', scale, 30);
});