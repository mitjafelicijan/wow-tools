const assetUrl = 'https://raw.githubusercontent.com/mitjafelicijan/wow-tools/master/interface/1.12/assets';
// const indexFile = 'https://raw.githubusercontent.com/mitjafelicijan/wow-tools/master/interface/1.12/assets/';
const assetDirectory = [];

// async self executing function
(async () => {
    const response = await fetch(`${assetUrl}/listfile.txt?token=AABCIPALAGOZX5R`);
    const text = await response.text();
    const lines = text.split('\n');

    // Parses the index file and creates an array of objects
    lines.forEach(line => {
        if (line) {
            try {
                const [namespace, asset] = line.split(';');
                assetDirectory.push({ namespace, asset: asset.replace(/\.blp/g, '') });
            } catch (error) {
                console.log(`Error parsing line: ${line}`);
            }
        }
    });

    // Finds unique namespaces
    const namespaces = [...new Set(assetDirectory.map(asset => asset.namespace))];

    // Attaches namespaces to the DOM
    const namespaceList = document.querySelector('aside');
    namespaceList.innerHTML = '';
    namespaces.forEach(namespace => {
        const namespaceElement = document.createElement('div');
        namespaceElement.innerHTML = namespace.replace(/\//g, '\\');
        namespaceElement.addEventListener('click', () => {
            findAssetsForNamespace(namespaceElement.innerText);
        });

        namespaceList.appendChild(namespaceElement);
    });

    const assetList = document.querySelector('main');
    function findAssetsForNamespace(namespaceName) {
        // Finds assets for the selected namespace and attaches them to the DOM.
        assetList.innerHTML = '';
        assetDirectory.forEach(asset => {
            if (asset.namespace == namespaceName.replace(/\\/g, '\/')) {
                const assetElement = document.createElement('div');

                // Adds image
                const image = document.createElement('img');
                image.src = `${assetUrl}/${asset.namespace}/${asset.asset}.png`;
                assetElement.appendChild(image);

                // Asset name
                const assetName = document.createElement('p');
                assetName.innerHTML = `${namespaceName}\\${asset.asset}`.replace(/\\/g, '\\\\');
                assetElement.appendChild(assetName);

                assetList.appendChild(assetElement);
            }
        });
    }
})();