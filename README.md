# Gerenciador de Campanhas com Next.js (Fullstack)

Este projeto implementa um sistema de gerenciamento de campanhas web completo, utilizando Next.js para o frontend e o backend (API Routes), com um banco de dados PostgreSQL.

## Funcionalidades

### Backend (Next.js API Routes)

- **Criação de Campanhas:** Permite registrar novas campanhas com nome, data de início, data final, status e categoria.
- **Leitura de Campanhas:**
  - Listagem de todas as campanhas ativas (não "deletadas").
  - Visualização de detalhes de uma campanha específica por ID.
- **Atualização de Campanhas:** Edição de informações de campanhas existentes.
- **Exclusão de Campanhas (Soft Delete):** As campanhas são marcadas como "deletadas" em vez de serem removidas permanentemente do banco de dados.

**Regras e Validações Implementadas:**

- A `dataFim` deve ser sempre maior que a `dataInicio`.
- A `dataInicio` deve ser igual ou posterior à data atual no momento da criação.
- Se a `dataFim` for inferior à data atual, a campanha é automaticamente marcada como "expirada" na leitura ou atualização.

### Frontend (Next.js - App Router)

- **Listar todas as campanhas:** Página principal que exibe uma lista das campanhas ativas, com informações essenciais.
- **Criar uma nova campanha:** Formulário para adicionar novas campanhas, com validações de campos.
- **Editar uma campanha existente:** Formulário preenchido com dados da campanha selecionada para edição.
- **Excluir uma campanha:** Botão de exclusão (soft delete).
- **Exibir detalhes de uma campanha:** Funcionalidade dedicada para ver todas as informações de uma campanha específica.

## Tecnologias Utilizadas

- **Next.js:** Framework React para construção fullstack (frontend e API Routes).
- **React:** Biblioteca para construção da interface de usuário.
- **Tailwind CSS:** Framework CSS para estilização rápida e responsiva.
- **TypeScript:** Linguagem de programação para tipagem estática.
- **Prisma:** ORM para interação com o banco de dados.
- **PostgreSQL:** Sistema de gerenciamento de banco de dados relacional (utilizado via Docker Compose).
- **Zod:** Biblioteca de validação de schemas para entrada de dados.
- **ShadCN UI:** Componentes acessíveis, estilizados com Tailwind e otimizados para aplicações modernas.
- **Jest:** Framework de testes (backend).
- **Docker Compose:** Para orquestrar o banco de dados PostgreSQL.

## Como Configurar e Executar o Projeto

### Pré-requisitos

- Node.js (versão 18.x ou superior)
- npm ou yarn
- Docker e Docker Compose

### Passos para Executar

1.  **Clone o Repositório:**

    ```bash
    git clone https://github.com/gustavogk/campaign-manager
    cd campaign-manager
    ```

2.  **Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto, copiando o conteúdo de `.env.example` e preenchendo as variáveis, especialmente a `DATABASE_URL`.

    ```
    # .env
    DATABASE_URL="postgresql://user:password@localhost:5432/campaign_manager_db?schema=public"
    ```

3.  **Inicie o Banco de Dados com Docker Compose:**
    Certifique-se de que o Docker esteja em execução em sua máquina.

    ```bash
    docker-compose up -d
    ```

    Isso iniciará um contêiner PostgreSQL na porta `5432`.

4.  **Instale as Dependências do Projeto:**

    ```bash
    npm install
    # ou
    yarn install
    ```

5.  **Gere o Cliente Prisma e Aplique as Migrações:**

    ```bash
    npx prisma db push
    # OU (se preferir gerenciar migrações explícitas)
    # npx prisma migrate dev --name init_campaigns
    ```

    Isso criará as tabelas no seu banco de dados PostgreSQL.

6.  **Inicie a Aplicação Next.js:**

    ```bash
    npm run dev
    # ou
    yarn dev
    ```

    A aplicação estará disponível em `http://localhost:3000`.

## Como Executar os Testes

### Testes de Backend (API Routes)

Para executar os testes unitários e de integração das rotas da API (backend), utilize o comando:

```bash
npm test

```

## 📚 Documentação das Rotas da API

### 🔹 GET /api/campaigns

- Lista todas as campanhas ativas (ou seja, que **não** possuem `deletedAt`).
- O campo `status` pode retornar `"expired"` dinamicamente se a `endDate` for anterior à data atual.

Resposta de exemplo:
```json
[
  {
    "id": "uuid",
    "name": "Campanha de Produto",
    "createdAt": "2025-05-01T10:00:00.000Z",
    "startDate": "2025-05-01T00:00:00.000Z",
    "endDate": "2025-06-01T00:00:00.000Z",
    "status": "active",
    "category": "product"
  }
]
```

---

### 🔹 POST /api/campaigns

- Cria uma nova campanha.
- Campos obrigatórios: `name`, `startDate`, `endDate`, `category`.
- `status` é opcional e, por padrão, será `"active"`.

Body JSON de exemplo:
```json
{
  "name": "Lançamento de Novo Produto",
  "startDate": "2025-06-01T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "category": "product",
  "status": "active"
}
```

Enums válidos:

- `status`: `"active"`, `"paused"`, `"expired"`
- `category`: `"marketing"`, `"sales"`, `"product"`, `"events"`, `"other"`

---

### 🔹 GET /api/campaigns/:id

- Retorna os detalhes de uma campanha pelo `id`.
- Retorna erro `404` se a campanha não existir ou estiver "soft deleted".

Resposta de exemplo:
```json
{
  "id": "uuid",
  "name": "Campanha de Marketing",
  "createdAt": "2025-04-15T10:00:00.000Z",
  "startDate": "2025-05-01T00:00:00.000Z",
  "endDate": "2025-05-31T00:00:00.000Z",
  "status": "expired",
  "category": "marketing"
}
```

---

### 🔹 PUT /api/campaigns/:id

- Atualiza os dados de uma campanha existente.
- Todos os campos podem ser atualizados, exceto `id` e `createdAt`.
- Retorna erro `404` se a campanha não for encontrada.

Body JSON de exemplo:
```json
{
  "name": "Campanha Atualizada",
  "startDate": "2025-06-10T00:00:00.000Z",
  "endDate": "2025-07-10T00:00:00.000Z",
  "status": "paused",
  "category": "sales"
}
```

---

### 🔹 DELETE /api/campaigns/:id

- Realiza um **soft delete** da campanha, atribuindo um valor ao campo `deletedAt`.
- A campanha deixa de aparecer nas listagens, mas permanece no banco.
- Retorna 200 se bem-sucedido, 404 se não encontrada.

Resposta de sucesso:
```json
{
  "message": "Campanha excluída com sucesso (soft delete)."
}
```


