export class Bairro {
    #nome;
    #votosUltimaEleicao;
    #planejado;

    constructor(nome, votosUltimaEleicao, planejado = 0) {
        this.#nome = nome;
        this.#votosUltimaEleicao = votosUltimaEleicao;
        this.#planejado = planejado;

        // Freeze the instance to prevent adding new properties
        Object.freeze(this);
    }

    get nome() {
        return this.#nome;
    }

    get votosUltimaEleicao() {
        return this.#votosUltimaEleicao;
    }

    get planejado() {
        return this.#planejado;
    }

    updatePlanejado(novoValor) {
        if (novoValor < 0) {
            throw new Error('Digite valores positivos!');
        }
        this.#planejado = novoValor;
    }
}
