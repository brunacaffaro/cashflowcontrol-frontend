# 💰 Cashflow Tracker - Frontend

## 1. Título do Projeto

**Cashflow Tracker (Frontend)** - Interface visual responsável por gerenciar de forma simples o fluxo de caixa de um pequeno restaurante familiar, permitindo o controle das entradas e saídas em dinheiro de forma organizada e acessível.

---

## 2. Descrição do Projeto

Este é o frontend de uma aplicação de fluxo de caixa destinada aos **gestores principais de um restaurante**, desenvolvida como **Single Page Application (SPA)** com **HTML, CSS e JavaScript puro**. A proposta é auxiliar no controle das movimentações financeiras feitas em espécie, que não são automaticamente sincronizadas com o sistema oficial do restaurante.

A interface permite:

* Registro e visualização de lançamentos de caixa
* Visão dos saldos, com respectivas entradas e saídas
* Atualização de status com checkbox

O frontend foi projetado **exclusivamente para uso em computadores desktop**, com interface simples, direta e eficiente para operações do dia a dia.

---

## 3. Tabela de Conteúdos

1. [Project Title](#1-project-title)
2. [Project Description](#2-project-description)
3. [Table of Contents](#3-table-of-contents)
4. [Installation and Setup](#4-installation-and-setup)
5. [How to Use](#5-how-to-use)
6. [Test Plan](#6-test-plan)

---

## 4. Instalação e Setup

### Requisitos:

* Um navegador moderno (Google Chrome, Firefox, Edge...)
* API Backend em funcionamento no endereço: `http://localhost:5000`

### Passo a passo:

Passo a passo:
1. Abra o arquivo `index.html` no navegador de sua preferência.
2. Certifique-se de que a API backend está rodando (`http://localhost:5000`)
3. Interaja com os formulários e histórico na interface.

---

## 5. Como utilizar

### Funcionalidades principais:

* Cadastro de lançamentos financeiros: nome, valor, tipo, categoria, responsável, status, etc. (POST)
* Histórico com exibição em tabela dos lançamentos realizados (GET)
* Filtro automático: exibe apenas os lançamentos dos **últimos 90 dias**, para evitar excesso de dados e melhorar a performance
* Ordenação: os lançamentos são mostrados dos **mais recentes para os mais antigos** automaticamente
* Atualização de status (ex: marcar como "baixado") com um clique (PATCH)
* Exclusão de lançamentos com botão dedicado (DELETE)

### Recursos de acessibilidade e nativos do navegador:

Este projeto faz uso de **validações HTML5** para garantir simplicidade, compatibilidade e melhor experiência ao usuário:

* O campo de **data** usa `<input type="date">` com **ícone de calendário nativo**
* O campo monetário possui `type="number" step="0.01"`

#### Exemplos de mensagens automáticas:

* "Preencha este campo"
* "O valor deve ser 31/12/2100 ou anterior"
* "Insira um valor válido"

Essas mensagens e comportamentos são exibidos automaticamente pelo navegador com base nos atributos `required`, `max`, `step`, etc. É possível personalizá-los com JavaScript no futuro, caso desejado.


---
---

## 6. Plano de Testes

> A aplicação foi projetada exclusivamente para **dispositivos desktop**, com foco em navegadores modernos como **Google Chrome** e **Microsoft Edge**.

### 💻 Ambiente de Teste

* **Dispositivo:** Computador (Desktop)
* **Navegadores testados:** Google Chrome, Microsoft Edge
* **Resoluções testadas:** a partir de **1025px**

---

### 🔁 Funcionamento Geral

* ✅ Responsividade geral da página (em diferentes larguras de tela)
* ✅ Carregamento inicial de dados com backend ativo
* ✅ Mensagem de erro ao não conectar com backend ("Erro ao carregar transações")
* ✅ Visualização do histórico quando não há lançamentos: tabela ocultada

---

### 📝 Uso do Formulário

#### ✅ Validações obrigatórias

* ✅ Nome (campo obrigatório) -> "Preencha este campo" (HTML)
* ✅ Data (campo obrigatório) -> Dia de hoje como padrão inicialmente e após a limpeza do conteúdo
* ✅ Valor (campo obrigatório) -> "Preencha este campo" (HTML)
* ✅ Tipo (campo obrigatório) -> "Saída" como padrão 
* ✅ Categoria (campo obrigatório) -> "Selecione um item da lista" (HTML)

#### 🧪 Testes de integridade

* ✅ Nome duplicado (não permitido) -> Erro: "Lançamento de mesmo nome já salvo na base. Tente outro nome."
* ✅ Nome longo: inserção de novos caracteres não permitida acima de 50 caracteres
* ✅ Data inválida: erro exibido ao ultrapassar limite ou formato incorreto -> "Insira um valor válido. O campo está incompleto ou tem uma data inválida."
* ✅ Valor inválido: erro exibido ao digitar caracteres não numéricos ou inválidos -> "Insira um número"
* ✅ Comentário longo: inserção de novos caracteres não permitida acima de 50 caracteres
* ✅ Formulário limpo após submissão com sucesso (mantendo a data do dia atual)

---

### 📊 Histórico de Transações (Tabela)

#### 🔄 Inserção de novas transações

* ✅ Títulos da tabela corretamente exibidos
* ✅ Valores corretamente alinhados e formatados (R\$ e data)
* ✅ Suporte a nomes longos sem quebra visual - garantido também pela limitação de caracteres
* ✅ Suporte a comentários extensos - limitado a 50 caracteres
* ✅ Saldo reflete as novas transações

#### 🔄 Atualização de status

* ✅ Marcar lançamento como "Lançado"
* ✅ Reverter lançamento para "Pendente"
* ✅ Atualização reflete corretamente no campo de status no database

#### 🗑️ Remoção de lançamentos

* ✅ Remoção de entrada: saldo ajustado corretamente
* ✅ Remoção de saída: saldo ajustado corretamente
* ✅ Inserção de novo lançamento com mesmo nome de lançamento removido: permitido

---

Esse plano de teste garante a cobertura básica funcional e de usabilidade para a versão atual da aplicação.

