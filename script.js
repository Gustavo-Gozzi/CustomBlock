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
      output.value = "Informe ao menos um campo.";
      return;
    }

    let ampscript = `%%[\nSET @campo = [${campoId}]\nSET @rows = LookupRows("${deName}", "${campoId}", @campo)\nSET @row = Row(@rows, 1)\n`;

    campos.forEach(field => {
      ampscript += `SET @${field} = Field(@row, "${field}")\n`;
    });

    ampscript += "]%%\n\n";

    campos.forEach(field => {
      ampscript += `${field}: %%=v(@${field})=%%\n`;
    });

    output.value = ampscript;

    // Atualiza o conteúdo do bloco no editor
    if (sdk) {
      sdk.setContent(output.value);
      sdk.setData({
        deName,
        campoId,
        camposSelecionados: campos
      });
    }
  }

  // Escuta mudanças nos campos
  [deInput, campoIdInput, camposInput].forEach(input => {
    input.addEventListener("input", generateAMPscript);
  });

  // Inicializa o SDK
  window.onload = function () {
    contentBuilderSDK.init(function (_sdk) {
      sdk = _sdk;

      // Se já tiver dados salvos, carregar no UI
      sdk.getData(function (data) {
        if (data) {
          if (data.deName) deInput.value = data.deName;
          if (data.campoId) campoIdInput.value = data.campoId;
          if (data.camposSelecionados) camposInput.value = data.camposSelecionados.join(", ");
          generateAMPscript();
        }
      });
    });
  };
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

  const response = await fetch("http://127.0.0.1:3000/dataextension", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  
  const json = await response.json();
  //console.log("Resposta JSON:", json); /*Talvez seja melhor colocar em uma lista!*/
  for(item in json){
    console.log(item)
  }
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

    console.log(atribJsonIn, chaveJsonIn)


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

  atrJson.forEach(atr => {
    amp +=`SET @json = BuildRowSetFromJSON(@${atr}, '$[0]', 1)\nSET @row = Row(@json, 1)\n`
  })

  chavesAtrJsons.forEach(chave => {
    amp +=`SET @${chave} = Field(@row, '${chave}')\n`
    if(chave != json.atributoJsonInterno[0]){
        variavel += `%%=v(@${chave})=%%\n`
    }
    
  })

  atribJsonIn.forEach(atrIn => {
        console.log(atrIn)
        amp +=`SET @json${atrIn} = BuildRowSetFromJSON(@json, '$[0].${atrIn}[*]', 1)\nSET @rowCount = RowCount(@json${atrIn})\n
    
        for @i = 1 to @rowCount do\n 
        SET @item = Row(@json${atrIn}, @i)\n`

        chaveJsonIn.forEach(chaveIn => {
            amp += `SET @${chaveIn} = Field(@item, '${chaveIn}')\n`

        })
        
        amp += `]%%\n %%=v(@${chaveJsonIn[0]})=%% | %%=v(@${chaveJsonIn[1]})=%%\n`

        amp += `%%[next @i`

    })


  amp += `]%%\n`

  output.value = amp + variavel
}

    console.log(json)
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