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

    let ampscript = `%%[\nSET @rows = LookupRows("${deName}", "${campoId}", ${campoId === "Email" ? "emailaddr" : "@" + campoId})\nSET @row = Row(@rows, 1)\n`;

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
