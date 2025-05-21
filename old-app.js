import bairros from "./src/data/bairros-data.js";
const bairrosLista = [...bairros()];
const container = document.getElementById('bairros-container');
const resultado = document.getElementById('resultado');
const threshold = 3200;

// Function to create and show the popup near the text of the clicked path
function showPopup(pathId) {
    // Find the corresponding <text> element for the clicked path
    const textElement = document.querySelector(`text[for="${pathId}"]`);
    if (!textElement) return;

    // Get the position of the <text> element
    const textRect = textElement.getBoundingClientRect();

    // Create the popup container
    const popup = document.createElement('div');
    popup.id = 'popup';
    popup.style.position = 'absolute';
    popup.style.top = `${textRect.top + window.scrollY + 24}px`; // Adjust for scrolling
    popup.style.left = `${textRect.left + window.scrollX}px`; // Adjust for scrolling
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '10px';
    popup.style.border = '1px solid #ccc';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.zIndex = '1000';

    // Add a form with an input field
    popup.innerHTML = `
        <h3>Update Value for ${pathId}</h3>
        <form id="popupForm">
            <label for="valueInput">Enter a value:</label>
            <input type="number" id="valueInput" name="valueInput" min="0" step="1" />
            <button type="submit">Save</button>
            <button type="button" id="closePopup">Cancel</button>
        </form>
    `;

    // Append the popup to the body
    document.body.appendChild(popup);

    // Handle form submission
    document.getElementById('popupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const value = document.getElementById('valueInput').value;
        console.log(`Value for ${pathId}: ${value}`); // Replace with your logic
        closePopup();
    });

    // Handle popup close
    document.getElementById('closePopup').addEventListener('click', closePopup);
}

// Function to close the popup
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        document.body.removeChild(popup);
    }
}


function handleImportCSV(event) {
    const file = event.target.files[0];
    const nomeArquivoSpan = document.getElementById('nome-arquivo');

    if (!file) return;

    // Mostra o nome do arquivo
    nomeArquivoSpan.textContent = `Carregado: ${file.name}`;

    // Show spinners immediately when CSV is selected
    const calculado = resultado.querySelector("#calculado");
    const faltam = resultado.querySelector("#faltam");
    
    if (calculado && faltam && !spinnerActive) {
        calculado.innerHTML = '<span class="loading-spinner"></span>';
        faltam.innerHTML = '<span class="loading-spinner"></span>';
        spinnerActive = true;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        // Clear any existing timeout to avoid conflicts
        clearTimeout(typingTimer);
        
        // Set a timeout to simulate the same debounce behavior as typing
        typingTimer = setTimeout(() => {
            const csv = e.target.result;
            const lines = csv.trim().split('\n');
            const [header, ...rows] = lines;

            rows.forEach((line) => {
                const [nome, ultimaEleicao, plano] = line.split(',');
                if (nome === 'TOTAL') return;

                const bairro = bairrosLista.find(b => b.nome === nome);
                if (bairro) {
                    bairro.ultimaEleicao = Number(ultimaEleicao);
                    bairro.plano = Number(plano);
                }
            });

            renderInputs();
            updateResultado(); // This will reset spinnerActive = false

            // Limpa o input de arquivo
            event.target.value = '';
        }, 500); // Same 500ms delay as in the typing function
    };

    reader.readAsText(file);
}

function exportToCSV() {
    // Create a popup container for file name input
    const popup = document.createElement('div');
    popup.id = 'fileNamePopup';
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '20px';
    popup.style.border = '1px solid #ccc';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.zIndex = '1000';

    // Add input field and buttons to the popup
    popup.innerHTML = `
        <h3>Exportar para CSV</h3>
        <label for="fileNameInput">Nome do arquivo:</label>
        <input type="text" id="fileNameInput" value="simulacao-campanha" />
        <div style="margin-top: 10px;">
            <button id="saveFileName">Exportar</button>
            <button id="cancelFileName">Cancelar</button>
        </div>
    `;

    // Append the popup to the body
    document.body.appendChild(popup);

    // Handle export button click
    document.getElementById('saveFileName').addEventListener('click', () => {
        const fileName = document.getElementById('fileNameInput').value.trim();
        if (!fileName) {
            alert('Por favor, insira um nome para o arquivo.');
            return;
        }

        // Generate CSV content
        const headers = ['Bairro', 'Última Eleição', 'Plano Atual'];
        const rows = bairrosLista.map(b => [b.nome, b.ultimaEleicao, b.plano]);

        // Calcular totais
        const totalultimaEleicao = bairrosLista.reduce((acc, b) => acc + b.ultimaEleicao, 0);
        const totalPlanoAtual = bairrosLista.reduce((acc, b) => acc + b.plano, 0);

        // Adicionar linha de totais
        rows.push(['TOTAL', totalultimaEleicao, totalPlanoAtual]);

        let csvContent = headers.join(',') + '\n';
        csvContent += rows.map(row => row.join(',')).join('\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Close the popup
        document.body.removeChild(popup);
    });

    // Handle cancel button click
    document.getElementById('cancelFileName').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
}

function useAnimatedUpdate({ container, delay = 600, render }) {
    let timeout;

    return function triggerUpdate(...args) {
        // Clear the previous timeout to debounce the updates
        clearTimeout(timeout);

        // Set a new timeout to render after the delay
        timeout = setTimeout(() => {
            render(...args);
        }, delay);
    };
}

let spinnerActive = false;
let typingTimer;

function attachInputListeners(input) {
    input.addEventListener('input', (event) => {
        const calculado = resultado.querySelector("#calculado");
        const faltam = resultado.querySelector("#faltam");
        
        // Only show spinner if it's not already active
        if (calculado && faltam && !spinnerActive) {
            calculado.innerHTML = '<span class="loading-spinner"></span>';
            faltam.innerHTML = '<span class="loading-spinner"></span>';
            spinnerActive = true;
        }

        // Clear any existing timeout
        clearTimeout(typingTimer);

        // Set new timeout
        typingTimer = setTimeout(() => {
            updateResultado();
            spinnerActive = false; // Reset spinner state after update
        }, 500);
    });
}

const updateResultado = useAnimatedUpdate({
    container: resultado,
    delay: 600,
    render: () => {
        const total = bairrosLista.reduce((acc, b) => acc + b.plano, 0);
        const faltam = Math.max(0, threshold - total); // Ensure faltam never goes negative

        // Update specific elements instead of replacing entire HTML
        resultado.querySelector("#calculado").textContent = total;
        resultado.querySelector("#faltam").textContent = faltam;

        const viableCampaign = resultado.querySelector("#viable");
        const faltamContainer = resultado.querySelector("#faltam-container");
        
        if (total >= threshold) {
            viableCampaign.style.display = 'flex';
        } else {
            viableCampaign.style.display = 'none';
        }

        // Reset spinner state after update
        spinnerActive = false;
    }
});

function renderInputs() {
    container.innerHTML = ''; // Clear the container

    bairrosLista.forEach((bairro, i) => {
        // Create a wrapper for each row
        const row = document.createElement('div');
        row.className = 'bairro-row';

        // Create the label for the bairro name and last election votes
        const label = document.createElement('div');
        label.className = 'bairro-label';
        label.innerHTML = `
            <strong>Bairro: ${bairro.nome}</strong>
            <p>Última eleição: ${bairro.ultimaEleicao} votos</p>
        `;

        // Create the input container
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';

        // Create the input field
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.max = 10000;
        input.value = bairro.plano;
        input.step = 1;
        input.id = `input-${i}`; // Assign a unique id to each input
        input.className = 'bairro-input';

        // Attach input listeners
        attachInputListeners(input);

        input.addEventListener('input', (e) => {
            bairrosLista[i].plano = Number(e.target.value);
            updateResultado(); // Trigger update when input changes
        });

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';
        
        // Create the increment button
        const incrementButton = document.createElement('button');
        incrementButton.className = 'increment-button';
        incrementButton.textContent = '+';
        incrementButton.addEventListener('click', () => {
            input.value = Number(input.value) + 1; // Increment the value
            input.dispatchEvent(new Event('input')); // Trigger the input event
        });

        // Create the decrement button
        const decrementButton = document.createElement('button');
        decrementButton.className = 'decrement-button';
        decrementButton.textContent = '-';
        decrementButton.addEventListener('click', () => {
            input.value = Math.max(0, Number(input.value) - 1); // Decrement the value
            input.dispatchEvent(new Event('input')); // Trigger the input event
        });

        // Append buttons and input to the input container
        buttonsContainer.appendChild(incrementButton);
        buttonsContainer.appendChild(decrementButton);
        inputContainer.appendChild(input);
        inputContainer.appendChild(buttonsContainer);

        // Create the planning label
        const planningLabel = document.createElement('div');
        planningLabel.className = 'planning-label';
        planningLabel.innerHTML = `
            Planejamento de Votos<br>
            <span>Antes: ${bairro.ultimaEleicao}</span><br>
            <span>Agora: ${bairro.plano}</span>
        `;

        // Add a click event listener to the row to focus the input
        row.addEventListener('click', () => {
            input.focus(); // Focus the input field
            input.select(); // Select the input's value
        });

        // Append all elements to the row
        row.appendChild(label);
        row.appendChild(inputContainer);
        row.appendChild(planningLabel);

        // Append the row to the container
        container.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", function (event) {
    // Show spinners immediately when DOM loads
    const calculado = resultado.querySelector("#calculado");
    const faltam = resultado.querySelector("#faltam");
    
    if (calculado && faltam && !spinnerActive) {
        calculado.innerHTML = '<span class="loading-spinner"></span>';
        faltam.innerHTML = '<span class="loading-spinner"></span>';
        spinnerActive = true;
    }
    
    // Set a timeout to simulate the same debounce behavior
    clearTimeout(typingTimer); // Clear any existing timeout just in case
    
    typingTimer = setTimeout(() => {
        updateResultado(); // This will reset spinnerActive = false        
        console.log("DOM carregado!");
    }, 500); // Same 500ms delay as in the typing function
    renderInputs();

});

document.getElementById('importInput').addEventListener('change', handleImportCSV);

document.getElementById('exportBtn').addEventListener('click', exportToCSV);

// Add click event listeners to all SVG paths
document.querySelectorAll('path').forEach((path) => {
    path.addEventListener('click', () => {
        showPopup(path.id);
    });
});
