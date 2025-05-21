import { Bairro } from './entities/Bairro.js';
import { calculateResultado } from './useCases/UpdateResultado.js';
import { exportCSV } from './useCases/ExportCSV.js';
import { importCSV } from './useCases/ImportCSV.js';
import { renderInputs, renderResultado } from './adapters/RenderUI.js';

const container = document.getElementById('bairros-container');
const resultadoContainer = document.getElementById('resultado'); //Mudar o ID para resultado-container
const threshold = 3200;

const bairrosLista = [
    new Bairro('Centro', 731, 913),
    new Bairro('Conceição', 233, 291),
    // Add more bairros here
];

function updateResultado() {
    const { total, faltam } = calculateResultado(bairrosLista, threshold);
    renderResultado(resultadoContainer, total, faltam);
}

document.addEventListener('DOMContentLoaded', () => {
    renderInputs(container, bairrosLista, updateResultado);
    updateResultado();

    document.getElementById('importInput').addEventListener('change', (event) => {
        const file = event.target.files[0];
        importCSV(file, bairrosLista).then(() => {
            renderInputs(container, bairrosLista, updateResultado);
            updateResultado();
        });
    });

    document.getElementById('exportBtn').addEventListener('click', () => {
        exportCSV(bairrosLista, 'simulacao-campanha');
    });
});
