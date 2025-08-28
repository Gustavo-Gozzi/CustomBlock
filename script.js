document.addEventListener("DOMContentLoaded", function () {
  sdk.getData(function(data){
    console.log("Dados recuperados do bloco:", data);

    if(data){
      document.getElementById("clientId").value = data.clientId || "";
      document.getElementById("clientSecret").value = data.clientSecret || "";
      document.getElementById("mid").value = data.mid || "";
      document.getElementById("externalKey").value = data.externalKey || "";
      document.getElementById("ampscriptOut").value = data.ampscript || "";
    }

  }) 
  
});

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
  //console.log("Resposta JSON:", json); /*Talvez seja melhor colocar em uma lista!*/
  function deSemJson(json){
    console.log("Entrando função sem JSON")
    ids = json.id
    attributes = json.atributos

  let amp = `%%[\n`
  let variavel = ``
  ids.forEach(id => {
    amp += `SET @${id} = [${id}] \n`
    variavel += `\n%%=v(@${id})=%%\n`

  })

  attributes.forEach(attribute => {
    amp += `SET @${attribute} = [${attribute}] \n`
    variavel += `%%=v(@${attribute})=%%\n`

  })

  amp += `]%%\n`

  output.value = amp + variavel
  }

function deComJsonSimples(json){
    console.log("Entrando função com JSON simples")
    ids = json.id
    attributes = json.atributos
    atrJons = json.atributojson
    chavesAtrJsons = json.chaveatributojson

  let amp = `%%[\n`
  let variavel = ``
  ids.forEach(id => {
    amp += `SET @${id} = [${id}] \n`
    variavel += `\n%%=v(@${id})=%%\n`

  })

  attributes.forEach(attribute => {
    amp += `SET @${attribute} = [${attribute}] \n`
    if(attribute != json.atributojson[0]){
        variavel += `%%=v(@${attribute})=%%\n`
    }

  })

  atrJons.forEach(atr => {
    amp +=`SET @json = BuildRowSetFromJSON(@${atr}, '$[0]', 1)\nSET @row = Row(@json, 1)\n`
  })

  chavesAtrJsons.forEach(chave => {
    amp +=`SET @${chave} = Field(@row, '${chave}')\n`
    variavel += `%%=v(@${chave})=%%\n`
  })


  amp += `]%%\n`

  output.value = amp + variavel

}

function deComJsonComplexo(json){
    console.log("Entrando função com JSON Complexo")
    ids = json.id;
    attributes = json.atributos;
    atrJson = json.atributojson;
    chavesAtrJsons = json.chaveatributojson;
    atribJsonIn = json.atributoJsonInterno;
    chaveJsonIn = json.chavesJsonInterno;

  let amp = `%%[\n`
  let variavel = ``
  let inside = ``
  ids.forEach(id => {
    amp += `SET @${id} = [${id}] \n`
    variavel += `\n%%=v(@${id})=%%\n`

  })

  attributes.forEach(attribute => {
    amp += `SET @${attribute} = [${attribute}] \n`
    if(attribute != json.atributojson[0]){
        variavel += `%%=v(@${attribute})=%%\n`
    }

  })

  amp += `\n/* Extrai o primeiro item do array usando o índice [0] */\n`;
    
    atrJson.forEach(atr => {
        amp += `set @json = BuildRowSetFromJSON(@${atr}, '$[0]', 1)\n`;
    });

    amp += `\nset @row = Row(@json, 1)\n`;
    
    chavesAtrJsons.forEach(chave => {
        amp += `set @${chave} = Field(@row, "${chave}")\n`;
    });

    amp += `\n`;

    atribJsonIn.forEach(atrIn => {
        amp += `/* Extrai os ${atrIn} (que é um array de objetos) */\n`;
        amp += `set @json${atrIn} = BuildRowSetFromJSON(@${atrJson[0]}, '$[0].${atrIn}[*]', 1)\n`;
        amp += `set @rowCount = RowCount(@json${atrIn})\n`;
    });

    amp += `]%%\n`;

    // HTML - Mostra dados
    variavel += `<!-- Mostra dados do cliente -->\n`;
    chavesAtrJsons.forEach(chave => {
        if(chave != json.atributoJsonInterno[0]){
            variavel += `<p>${chave}: %%=v(@${chave})=%%</p>\n`;
        }
        
    });

    // Loop dos internos
    atribJsonIn.forEach(atrIn => {
        amp += `%%[\nfor @i = 1 to @rowCount do\n`;
        amp += `  set @item = Row(@json${atrIn}, @i)\n`;
        chaveJsonIn.forEach(chaveIn => {
            amp += `  set @${chaveIn} = Field(@item, "${chaveIn}")\n`;
        });
        amp += `]%%\n`;
        amp += `<p>\n`;
        chaveJsonIn.forEach((chaveIn, idx) => {
            amp += `  %%=v(@${chaveIn})=%%`;
            if (idx < chaveJsonIn.length - 1) {
                amp += ` | `;
            }
        });
        amp += `\n</p>\n`;
        amp += `%%[next @i]%%\n`;
    });

  output.value = amp + variavel
}

  if('atributoJsonInterno' in json && json.atributoJsonInterno.length <= 0){
    deComJsonSimples(json)
} 
  else if('atributoJsonInterno' in json){
    deComJsonComplexo(json)
}
  else{
    deSemJson(json)
}
  
   

}

function copiarTexto() {
    // Seleciona o textarea
    const textArea = document.getElementById("ampscriptOut");
    try {
          salvarAmpScriptNoBlock();
          console.log("Teoricamente passamos pela função")
          alert("Texto copiado com sucesso!");
      }
      catch {
          alert("Não deu")
      }
}
