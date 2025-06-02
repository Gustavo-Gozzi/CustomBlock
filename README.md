# CustomBlock
# Geração de AMPscript com Base em Data Extension

## ✅ Como funciona o código?

1. O usuário preenche três campos em um formulário:  
   ➡️ **Nome da Data Extension**  
   ➡️ **Atributo de identificação**  
   ➡️ **Lista de campos separados por vírgula**

2. Conforme o usuário digita, o código JavaScript automaticamente monta um bloco de **AMPscript** baseado nesses valores.

3. O AMPscript gerado é exibido em um campo de texto, pronto para ser **copiado e colado**.

---

## 📝 Como preencher os campos:

### **1. Nome da Data Extension**  
🔹 Informe exatamente o nome da Data Extension que deseja consultar no Salesforce Marketing Cloud.  
📌 Exemplo: `Clientes_Ativos`

---

### **2. Atributo de Identificação**  
🔹 Este é o campo chave que será usado como filtro na busca dos dados.  
🔹 Normalmente, é o campo que garante que você recupere o dado correto de acordo com o destinatário.  
📌 Exemplo: `EmailAddress` ou `CustomerID`

---

### **3. Campos (separados por vírgula)**  
🔹 Aqui você insere os nomes dos atributos que deseja buscar da Data Extension.  
🔹 Eles devem ser separados por vírgula e sem espaço extra, mas o código já remove espaços caso coloque.  
📌 Exemplo: `FirstName,LastName,City`

---

## ✍️ Como funciona o AMPscript gerado?

O AMPscript gerado faz o seguinte:

1. **Captura o valor do atributo de identificação** que está no contexto:

   ```ampscript
   SET @campo = [<CampoId>]
    ```
2. **Busca os dados na Data Extension com LookupRows**, filtrando pelo atributo informado:

    ```ampscript
    SET @rows = LookupRows("<DataExtension>", "<CampoId>", @campo)
    SET @row = Row(@rows, 1)
    ```
3. **Atribui os campos desejados a variáveis, pegando a partir da linha recuperada:**

    ```ampscript
    SET @FirstName = Field(@row, "FirstName")
    SET @LastName = Field(@row, "LastName")
    SET @City = Field(@row, "City")
    ```

4. **Exibe os valores das variáveis diretamente no HTML**:
    ```ampscript
    FirstName: %%=v(@FirstName)=%%
    LastName: %%=v(@LastName)=%%
    City: %%=v(@City)=%%
    ```

**✅ Exemplo de AMPscript gerado:**
Se os campos forem preenchidos assim:

- Nome da Data Extension: Clientes_Ativos

- Atributo de identificação: EmailAddress

- Campos: FirstName,LastName,City

O AMPscript gerado será:
```ampscript
%%[
SET @campo = [EmailAddress]
SET @rows = LookupRows("Clientes_Ativos", "EmailAddress", @campo)
SET @row = Row(@rows, 1)
SET @FirstName = Field(@row, "FirstName")
SET @LastName = Field(@row, "LastName")
SET @City = Field(@row, "City")
]%%

FirstName: %%=v(@FirstName)=%%
LastName: %%=v(@LastName)=%%
City: %%=v(@City)=%%
```

## Segunda parte: Geração automática de AMPscript a partir de credenciais e Data Extension

### ✅ Como funciona o código

Nesta parte, o usuário deve preencher os seguintes campos:

1. **ClientId**  
   - Obtido no **Installed Package** do Salesforce Marketing Cloud.  
   - Serve para autenticar a requisição.

2. **ClientSecret**  
   - Também obtido no **Installed Package**.  
   - Funciona como senha para autenticação.

3. **MID**  
   - É o **ID da Business Unit (BU)** onde a Data Extension está localizada.

4. **ExternalKey**  
   - É o **identificador único da Data Extension**.

Depois que esses campos forem preenchidos, o usuário deve executar a função que:

1. Faz uma **requisição HTTP** para um **microsserviço** externo.
2. Esse microsserviço retorna:
   - Todos os **IDs** da Data Extension.
   - Todos os **atributos** configurados.

3. Com esses dados, o sistema automaticamente gera um **bloco de código AMPscript**.

---

### ✅ Como funciona o AMPscript gerado

O AMPscript gerado faz o seguinte:

1. Para cada **ID** e **atributo** retornado, é criada uma variável AMPscript que busca o respectivo valor na Data Extension:  
   Exemplo:  
   ```ampscript
   %%[
   SET @Id = [Id]
   SET @FirstName = [FirstName]
   ]%%

2. **Em seguida, também são gerados comandos para exibir os valores dessas variáveis:**
    Exemplo:
    ```ampscript
    %%=v(@Id)=%%
    %%=v(@FirstName)=%%
    ```

**Todo o código AMPscript é automaticamente exibido para que o usuário possa copiar e colar em emails, landing pages ou outros recursos do Marketing Cloud.**