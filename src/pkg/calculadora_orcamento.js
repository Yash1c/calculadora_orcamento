let wasm;
let transactions = [];
let currentBalance = 0;

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                } else {
                    throw e;
                }
            }
        }
        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);
        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    return { wbg: {} };
}

function __wbg_init_memory(imports, memory) {}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;
    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module);
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead');
        }
    }
    const imports = __wbg_get_imports();
    __wbg_init_memory(imports);
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;
    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path);
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead');
        }
    }
    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('calculadora_orcamento_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();
    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }
    __wbg_init_memory(imports);
    const { instance, module } = await __wbg_load(await module_or_path, imports);
    return __wbg_finalize_init(instance, module);
}

// Função para adicionar uma transação
function add_transaction(type, description, amount, date) {
    const transaction = {
        type,
        description,
        amount: parseFloat(amount),
        date: new Date(date)
    };
    
    transactions.push(transaction);
    currentBalance += (type === "Receita" ? transaction.amount : -transaction.amount);
    updateBalance();
    renderTransactions();
}

// Função para obter o saldo mensal
function get_monthly_balance() {
    return currentBalance; // Retorna o saldo atual (pode ser ajustado para cálculo mensal)
}

// Função para prever o saldo do próximo mês
function predict_next_month() {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        if (transaction.date.getMonth() === new Date().getMonth() &&
            transaction.date.getFullYear() === new Date().getFullYear()) {
            if (transaction.type === "Receita") {
                totalIncome += transaction.amount;
            } else if (transaction.type === "Despesa") {
                totalExpenses += transaction.amount;
            }
        }
    });

    return currentBalance + totalIncome - totalExpenses; // Ajuste conforme necessário
}

// Atualiza a exibição do saldo atual e previsão do próximo mês
function updateBalance() {
    document.getElementById("currentBalance").innerText = `R$ ${currentBalance.toFixed(2).replace(".", ",")}`;
    const nextMonthPrediction = predict_next_month(); // Usa a previsão real
    document.getElementById("nextMonthPrediction").innerText = `R$ ${nextMonthPrediction.toFixed(2).replace(".", ",")}`;
}

// Renderiza as transações na tabela
function renderTransactions() {
    const tableBody = document.getElementById("transactionsBody");
    tableBody.innerHTML = ""; // Limpa as transações anteriores
    transactions.forEach(transaction => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${transaction.description}</td>
            <td>${transaction.type}</td>
            <td>R$ ${transaction.amount.toFixed(2).replace(".", ",")}</td>
            <td>${transaction.date.toLocaleDateString('pt-BR')}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Gerencia o envio do formulário de transação
document.getElementById("transactionForm").addEventListener("submit", function (event) {
    event.preventDefault();
    
    const type = document.getElementById("transactionType").value.trim();
    const description = document.getElementById("description").value.trim();
    const amount = document.getElementById("amount").value.trim();
    const date = document.getElementById("date").value.trim();

    // Log para depuração
    console.log("Tipo:", type, "Descrição:", description, "Quantia:", amount, "Data:", date);

    // Valida se todos os campos estão preenchidos
    if (!type || !description || !amount || !date) {
        alert("Por favor, preencha todos os campos"); // Mensagem alterada
        return; // Interrompe a execução se algum campo estiver vazio
    }

    // Verifica se o valor de 'amount' é um número válido
    const amountValue = parseFloat(amount.replace(',', '.')); // Converte a vírgula para ponto
    if (isNaN(amountValue) || amountValue <= 0) {
        alert("Por favor, insira um valor válido para a quantia");
        return; // Interrompe a execução se 'amount' não for um número válido
    }

    // Chama a função para adicionar a transação
    add_transaction(type, description, amountValue, date); // Passa amountValue em vez de amount

    // Limpa o formulário e fecha o modal
    this.reset();
    document.getElementById("transactionModal").style.display = 'none';
});

// Eventos para abrir e fechar o modal
document.getElementById("addIncomeBtn").addEventListener("click", function () {
    document.getElementById("transactionType").value = "Receita"; 
    document.getElementById("transactionModal").style.display = 'block'; 
});

document.getElementById("addExpenseBtn").addEventListener("click", function () {
    document.getElementById("transactionType").value = "Despesa"; 
    document.getElementById("transactionModal").style.display = 'block'; 
});

document.getElementById("cancelTransaction").addEventListener("click", function () {
    document.getElementById("transactionModal").style.display = 'none'; 
});

window.onload = async function() {
    await __wbg_init();
    updateBalance();
    renderTransactions();
};

// Exporta a função add_transaction para uso externo
export { initSync, add_transaction, get_monthly_balance, predict_next_month };
export default __wbg_init;