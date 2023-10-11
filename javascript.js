/*!
 * Box Cutter (https://github.com/shes-a-rebel/boxcutter)
 */

const file = 'data.json'
const grid = document.getElementById('grid');

let filters = [];

let selectedAppid;
let selectedLaunch;

fetch(file).then(function (response) {
    return response.json();
}).then(function (data) {
    const status = document.getElementById('status');

    // Game tiles
    status.innerHTML = 'Unboxing games...';
    for (const game of data.games) {
        const gameCollection = game.collection;
        const gameHidden = game.hidden;
        const collectionHidden = data.collections[gameCollection].hidden;

        if (gameHidden !== true && collectionHidden !== true) {
            const gameDescription = game.description;
            const gameMax = game.max;
            const gameMin = game.min;
            const gameTitle = game.title;
            const gameType = game.type;
            const gameSorting = game.sorting;

            const collectionTitle = data.collections[gameCollection].title;
            const collectionSorting = data.collections[gameCollection].sorting;
            const collectionDisabled = data.collections[gameCollection].disabled;

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

            const gameDate = gameType === 'pack' ? data.collections[gameCollection].date : game.date;

            const appid = gameType === 'app' ? game.appid : data.collections[gameCollection].appid;
            const gameSwf = game.swf;
            const gameSubfolder = game.subfolder !== undefined ? game.subfolder : gameSwf;
            const gameImage = gameType === 'app' ? 'images/tiles/app/' + appid + '.jpg' : 'images/tiles/pack/' + gameCollection + '/' + gameSwf + '.png';

            const div = document.createElement('div');
            if (collectionDisabled === true || gameplayDisabled === true) {
                div.classList.add('hidden');
            }
            div.setAttribute('data-params', 'collection-' + gameCollection + ' gameplay-' + gameGameplay);
            div.classList.add('tile', 'game');

            // Set the sorting tags
            div.setAttribute('data-title', gameSorting !== undefined ? gameSorting : gameTitle);
            div.setAttribute('data-collection', collectionSorting);
            div.setAttribute('data-gameplay', gameplayTitle);
            div.setAttribute('data-date', gameDate);

            div.title = gameTitle;

            // Set the info click event
            div.addEventListener('click', function () {
                const infoDate = document.getElementById('info-date');
                const infoPlayers = document.getElementById('info-players');
                const right = document.getElementById('right');

                infoImage = document.getElementById('info-image');
                infoImage.style.backgroundImage = 'url(' + gameImage + ')';
                infoImage.style.backgroundSize = 'cover';
                infoImage.style.backgroundPosition = 'center';

                document.getElementById('info-game').innerHTML = gameTitle;
                document.getElementById('info-collection').innerHTML = collectionTitle;
                document.getElementById('info-description').innerHTML = '“' + gameDescription + '”';
                if (gameDate !== undefined) {
                    const date = new Date(gameDate);
                    const locale = navigator.language || 'en-US';
                    const formattedDate = new Intl.DateTimeFormat(locale).format(date);

                    infoDate.innerHTML = formattedDate;
                } else {
                    infoDate.innerHTML = '';
                }
                document.getElementById('info-gameplay').innerHTML = gameplayTitle;
                if ((gameMin === undefined || gameMin === 1) && gameMax !== undefined) {
                    infoPlayers.innerHTML = 'up to ' + gameMax;
                } else if (gameMin !== undefined && gameMax !== undefined) {
                    infoPlayers.innerHTML = gameMin + " - " + gameMax;
                } else if (gameMin !== undefined) {
                    infoPlayers.innerHTML = gameMin + '+';
                } else {
                    infoPlayers.innerHTML = '';
                }

                selectedAppid = appid;
                selectedLaunch = gameType === 'app' ? 'run/' + appid : 'rungameid/' + appid + '//-launchTo games\\' + gameSubfolder + '\\' + gameSwf + '.swf';

                if (right.style.display !== "block") {
                    right.style.display = "block";
                }
            });

            div.style.backgroundImage = 'url(' + gameImage + ')';
            div.style.backgroundSize = 'cover';
            div.style.backgroundPosition = 'center';

            grid.appendChild(div);
        }
    }

    document.getElementById('info-store').addEventListener('click', function () {
        window.open('steam://advertise/' + selectedAppid + '/', '_blank');
    });
    document.getElementById('info-install').addEventListener('click', function () {
        window.open('steam://install/' + selectedAppid + '/', '_blank');
    });
    document.getElementById('info-run').addEventListener('click', function () {
        window.open('steam://' + selectedLaunch);
    });

    status.innerHTML = 'Generating filters...';
    // Filter: collections
    const filtersCollection = document.getElementById('collection').querySelector("ul");

    for (const id in data.collections) {
        if (data.collections[id].hidden !== true) {
            const title = data.collections[id].title;
            const titleShort = data.collections[id].titleShort;

            const li = document.createElement('li');
            filtersCollection.appendChild(li);

            const label = document.createElement('label');
            label.htmlFor = 'filter-collection-' + id;
            label.title = title;
            label.textContent = titleShort !== undefined ? titleShort : title;
            li.appendChild(label);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'filter-collection-' + id;
            if (data.collections[id].disabled === undefined) {
                checkbox.checked = true;
            } else {
                filters.push('collection-' + id);
            }
            checkbox.addEventListener('change', setFilter);
            label.appendChild(checkbox);
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

            const label = document.createElement('label');
            label.htmlFor = 'filter-gameplay-' + id;
            // label.title = description;
            label.textContent = title;
            li.appendChild(label);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'filter-gameplay-' + id;
            if (data.gameplays[id].disabled === undefined) {
                checkbox.checked = true;
            } else {
                filters.push('gameplay-' + id);
            }
            checkbox.addEventListener('change', setFilter);
            label.appendChild(checkbox);
        }
    }

    sortTiles('title');
}).catch(function (error) {
    console.error('Error fetching JSON: ' + error);
}).finally(function () {
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
    let scaleCookie = getCookie('scale');
    if (scaleCookie) {
        if (scaleCookie > 1.0) {
            scaleCookie = 1.0;
        }
        slider.value = scaleCookie;
        setScale(scaleCookie);
    } else {
        setScale(0.5);
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

function setScale(scale) {
    const min = 0.25;
    const max = 1.0;
    const adjustedScale = min + scale * (max - min);
    const width = 512 * adjustedScale;
    const height = 240 * adjustedScale;
    grid.style.gridTemplateColumns = 'repeat(auto-fill, ' + width + 'px)';
    grid.style.gridAutoRows = height + 'px';
}

function sortTiles(option) {
    const tiles = Array.from(grid.getElementsByClassName('tile'));

    tiles.sort((a, b) => {
        const aValue = a.getAttribute(`data-title`);
        const bValue = b.getAttribute(`data-title`);
        return aValue.localeCompare(bValue);
    });

    if (option !== title) {
        let descending = false;
        if (option === 'date-desc') {
            option = 'date'
            descending = true;
        }
        tiles.sort((a, b) => {
            const aValue = a.getAttribute(`data-${option}`);
            const bValue = b.getAttribute(`data-${option}`);
            if (descending === false) {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });
    }

    // Clear the grid and append sorted tiles
    grid.innerHTML = '';
    tiles.forEach(tile => grid.appendChild(tile));
}

// Tile scale slider
document.getElementById('slider').addEventListener('input', () => {
    const scale = slider.value;
    setScale(scale);
    setCookie('scale', scale, 30);
});

// // Sorting event
document.getElementById('sortby').addEventListener('change', function () {
    const option = sortby.value;
    sortTiles(option)
});

// Close info bar
document.getElementById('info-close').addEventListener('click', function () {
    document.getElementById('right').style.display = 'none';
});