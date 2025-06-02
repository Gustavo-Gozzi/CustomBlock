# CustomBlock
# Geração de AMPscript com Base em Data Extension

## ✅ Como funciona o código?

O usuário deve preencher os seguintes campos:

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