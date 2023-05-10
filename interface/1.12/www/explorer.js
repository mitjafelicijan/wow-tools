const assetUrl = 'https://raw.githubusercontent.com/mitjafelicijan/wow-tools/master/interface/1.12/assets';
const cacheBustingToken = 'AABCIPALAGOZX5R';

window.interfaces = {
    index: [],
    directory: {},
};

function processFile(text) {
    const lines = text.split('\n');
    const directory = {};

    for (const line of lines) {
        const combinedLine = line.replace(';', '/');
        const parts = combinedLine.split('/');

        let current = directory;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
        if (!parts[parts.length - 1].endsWith('.blp')) {
            current[parts[parts.length - 1]] = true;
        }
    }

    return directory;
}

function createTreeView(directory, parent, path = []) {
    const ul = document.createElement('ul');
    parent.appendChild(ul);
    for (const key in directory) {
        if (key && !key.endsWith('.blp')) {
            const li = document.createElement('li');

            const text = document.createElement('span');
            text.textContent = key;
            li.appendChild(text);

            ul.appendChild(li);

            if (typeof directory[key] === 'object') {
                li.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const fullPath = [...path, key].join('/');

                    const listItems = filterByNamespace(fullPath);
                    renderListView(listItems);
                });
                createTreeView(directory[key], li, [...path, key]);
            }
        }
    }
}

function filterByNamespace(directory) {
    const listItems = [];
    window.interfaces.index.forEach(asset => {
        if (asset.namespace === directory) {
            listItems.push(asset);
        }
    });

    return listItems;
}

function filterByQuery(query) {
    const listItems = [];
    window.interfaces.index.forEach(asset => {
        if (asset.namespace.toLowerCase().includes(query) || asset.asset.toLowerCase().includes(query)) {
            listItems.push(asset);
        }
    });

    return listItems;
}

function renderListView(listItems) {
    const assetContainer = document.querySelector('main');
    const assetList = document.createElement('div');
    assetList.classList.add('asset-list');

    assetContainer.innerHTML = '';
    assetContainer.appendChild(assetList);

    if (listItems.length > 0) {
        listItems.forEach(asset => {
            const assetElement = document.createElement('div');
            assetElement.classList.add('asset');

            // Adds image
            const image = document.createElement('img');
            image.src = `${assetUrl}/${asset.namespace}/${asset.asset}.png`;
            image.addEventListener('click', () => {
                window.open(`${assetUrl}/${asset.namespace}/${asset.asset}.png`);
            });
            assetElement.appendChild(image);

            // Asset name
            const assetProperName = `${asset.namespace}\\${asset.asset}`.replace(/\\/g, '\\\\').replace(/\//g, '\\\\\;').replace(/;/g, '');
            const assetName = document.createElement('p');
            assetName.innerHTML = assetProperName;
            assetName.addEventListener('click', () => {
                navigator.clipboard.writeText(assetProperName);
            });
            assetElement.appendChild(assetName);

            assetList.appendChild(assetElement);
        });
    }
}

// Main function.
(async () => {
    // Fetches the index file from remote server/repository.
    const response = await fetch(`${assetUrl}/listfile.txt?token=${cacheBustingToken}`);
    const content = await response.text();

    // Creates an index of all assets
    content.split('\n').forEach(line => {
        const [namespace, asset] = line.split(';');
        if (namespace && asset) {
            try {
                window.interfaces.index.push({
                    namespace: line.split(';')[0],
                    asset: asset.replace(/\.blp/g, ''),
                });
            } catch (error) {
                new Error(`Error parsing line: ${line}`);
            }
        }
    });

    // Creates left side navigation tree.
    window.interfaces.directory = processFile(content);
    createTreeView(window.interfaces.directory, document.querySelector('aside'));

    // Search functionality
    const searchForm = document.querySelector('form');
    searchForm.addEventListener('submit', event => {
        event.preventDefault();

        const searchInput = document.querySelector('input');
        const searchTerm = searchInput.value;

        if (!searchTerm) {
            alert('Please enter a search term.');
            return
        };

        const listItems = filterByQuery(searchTerm.toLowerCase());
        renderListView(listItems);
    });
})();