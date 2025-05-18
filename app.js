import bairros from "./bairos-data.js";

document.addEventListener("DOMContentLoaded", function (event) {
    const bairrosLista = [...bairros()]; // see above
    const container = document.getElementById('bairros-container');
    const resultado = document.getElementById('resultado');
    const threshold = 3200;

    function render() {
        container.innerHTML = '';
        let total = 0;

        bairrosLista.forEach((bairro, i) => {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = 0;
            input.value = bairro.plano;
            input.addEventListener('input', e => {
            bairrosLista[i].plano = Number(e.target.value);
            render();
            });

            total += bairro.plano;

            const label = document.createElement('label');
            label.innerHTML = `${bairro.nome} (${bairro.votosPassados} anteriores): `;
            label.appendChild(input);
            container.appendChild(label);
            container.appendChild(document.createElement('br'));
        });

        resultado.innerHTML = `
            <h3>Total planejado: ${total} votos</h3>
            <p>${total >= threshold ? '✅ Viável!' : `⚠️ Faltam ${threshold - total} votos.`}</p>
        `;
    }
    
    render();
    console.log("DOM completamente carregado e analisado");
});
