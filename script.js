document.addEventListener("DOMContentLoaded", function () {
  const deInput = document.getElementById("de-select");
  const campoIdInput = document.getElementById("CampoId");
  const camposInput = document.getElementById("campos");
  const output = document.getElementById("ampscript-output");

  function generateAMPscript() {
    const deName = deInput.value.trim();
    const campoId = campoIdInput.value.trim();
    const camposTexto = camposInput.value.trim();

    if (!deName || !campoId || !camposTexto) {
      output.value = "Preencha todos os campos para gerar o AMPscript.";
      return;
    }

    const campos = camposTexto.split(",").map(c => c.trim()).filter(Boolean);

    if (campos.length === 0) {
      output.value = "Informe ao menos um campo para buscar.";
      return;
    }

    let ampscript = `%%[SET @campo = [${campoId}]\nSET @rows = LookupRows("${deName}", "${campoId}", @campo)\nSET @row = Row(@rows, 1)\n`;

    campos.forEach(field => {
      ampscript += `SET @${field} = Field(@row, "${field}")\n`;
    });

    ampscript += "]%%\n\n";

    campos.forEach(field => {
      ampscript += `${field}: %%=v(@${field})=%%\n`;
    });

    output.value = ampscript;
  }

  // Gera dinamicamente ao digitar
  [deInput, campoIdInput, camposInput].forEach(input => {
    input.addEventListener("input", generateAMPscript);
  });
});

// Variáveis globais existentes
let clientId, clientSecret, mid, externalKey;
let ids = [];
let attributes = [];

// Novas variáveis para SDK
let connection;
let selectedAttributes = [];
let allAttributes = [];

// Inicialização do SDK quando o Postmonger estiver disponível
function initSDK() {
    if (typeof Postmonger !== 'undefined') {
        connection = new Postmonger.Session();
        
        // Configuração do SDK
        connection.trigger('requestedInteraction', { "name": "myinteraction" });
        
        connection.on('initCustomContentBlock', function(data) {
            // Carrega dados salvos anteriormente se existirem
            if (data && data.selectedAttributes) {
                selectedAttributes = data.selectedAttributes;
            }
        });

        // Configurações adicionais do SDK
        connection.on('requestedInteractionEndpoints', function(data) {
            // Configurações de endpoints se necessário
        });

        connection.on('requestedInteractionSave', function(data) {
            console.log('Content Block salvo:', data);
        });

        // Inicializa o SDK
        connection.trigger('ready');
    } else {
        // Tenta novamente após 100ms se Postmonger não estiver carregado
        setTimeout(initSDK, 100);
    }
}

// Inicializa quando a página carregar
window.addEventListener('load', initSDK);

// Função original mantida
async function getValues(){
    clientId = document.getElementById("clientId").value;
    clientSecret = document.getElementById("clientSecret").value;
    mid = document.getElementById("mid").value;
    externalKey = document.getElementById("externalKey").value;
    const output = document.getElementById("ampscriptOut")

    if(!clientId || !clientSecret || !mid || !externalKey){
        alert("Preencha todos os campos!!!")
        return
    }

    const data = {                           
        "client_id": clientId,    
        "client_secret": clientSecret,
        "external_key": externalKey, 
        "mid": mid           
    }

    const response = await fetch("https://microsservicocustomblock.onrender.com/dataextension", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    
    const json = await response.json();
    ids = json.id
    attributes = json.atributos

    let amp = `%%[\n`
    let variavel = ``
    ids.forEach(id => {
        amp += `SET @${id} = [${id}] \n`
        variavel += `\n%%=v(@${id})==%%\n`
    })

    attributes.forEach(attribute => {
        amp += `SET @${attribute} = [${attribute}] \n`
        variavel += `%%=v(@${attribute})==%%\n`
    })

    amp += `]%%\n`
    output.value = amp + variavel 

    // Nova funcionalidade: mostrar atributos selecionáveis
    displaySelectableAttributes();
}

// Nova função para exibir atributos selecionáveis
function displaySelectableAttributes() {
    const container = document.getElementById('attributesContainer');
    const section = document.getElementById('attributesSection');
    
    // Combina IDs e atributos em um array único
    allAttributes = [...(ids || []), ...(attributes || [])];
    
    container.innerHTML = '';
    
    if (allAttributes.length === 0) {
        container.innerHTML = '<p>Nenhum atributo encontrado.</p>';
        return;
    }
    
    allAttributes.forEach((attr, index) => {
        const item = document.createElement('div');
        item.className = 'attribute-item';
        item.onclick = () => toggleAttribute(attr, item);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'attribute-checkbox';
        checkbox.id = `attr_${index}`;
        checkbox.checked = selectedAttributes.includes(attr);
        
        const label = document.createElement('label');
        label.htmlFor = `attr_${index}`;
        label.innerHTML = `<span class="attribute-code">%%=v(@${attr})==%%</span>`;
        
        item.appendChild(checkbox);
        item.appendChild(label);
        
        if (checkbox.checked) {
            item.classList.add('selected');
        }
        
        container.appendChild(item);
    });
    
    // Mostra a seção de atributos
    section.classList.remove('hidden');
}

// Nova função para alternar seleção de atributo
function toggleAttribute(attr, element) {
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        element.classList.add('selected');
        if (!selectedAttributes.includes(attr)) {
            selectedAttributes.push(attr);
        }
    } else {
        element.classList.remove('selected');
        selectedAttributes = selectedAttributes.filter(a => a !== attr);
    }
}

// Nova função para salvar atributos selecionados
function saveSelectedAttributes() {
    if (selectedAttributes.length === 0) {
        alert('Selecione pelo menos um atributo!');
        return;
    }

    // Gera o AMPscript apenas com os atributos selecionados
    let selectedAmp = `%%[\n`;
    selectedAttributes.forEach(attr => {
        selectedAmp += `SET @${attr} = [${attr}] \n`;
    });
    selectedAmp += `]%%\n`;

    let selectedVariables = '';
    selectedAttributes.forEach(attr => {
        selectedVariables += `%%=v(@${attr})==%%\n`;
    });

    const finalContent = selectedAmp + selectedVariables;

    // Salva no SDK se estiver disponível
    if (connection) {
        const contentBlockData = {
            selectedAttributes: selectedAttributes,
            ampScript: selectedAmp,
            variables: selectedVariables,
            fullContent: finalContent
        };

        connection.trigger('requestedInteraction', {
            "name": "myinteraction",
            "data": contentBlockData
        });

        connection.trigger('requestedInteractionSave', {
            "content": finalContent
        });
    }

    alert(`${selectedAttributes.length} atributo(s) selecionado(s) e salvos no Content Block!`);
}

// Configurações adicionais do SDK
connection.on('requestedInteractionEndpoints', function(data) {
    // Configurações de endpoints se necessário
});

connection.on('requestedInteractionSave', function(data) {
    console.log('Content Block salvo:', data);
});

// Inicializa o SDK
connection.trigger('ready');