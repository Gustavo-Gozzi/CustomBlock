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
