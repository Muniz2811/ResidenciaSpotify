# 🎵 SpotData — Residência em IA

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge\&logo=python)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Machine_Learning-orange?style=for-the-badge\&logo=scikit-learn)
![Pandas](https://img.shields.io/badge/Pandas-Data_Analysis-150458?style=for-the-badge\&logo=pandas)
![HTML/CSS](https://img.shields.io/badge/Frontend-HTML_CSS_JS-E34F26?style=for-the-badge\&logo=html5)

> **Residência em IA · Universidade de Brasília (UnB) · 2026**
> Sistema completo de análise de dados e recomendação musical baseado em dados do Spotify.

O **SpotData** é um projeto acadêmico desenvolvido durante a **Residência em Inteligência Artificial da Universidade de Brasília (UnB)**. O projeto combina **engenharia de dados, análise exploratória, estatística e Inteligência Artificial** para investigar padrões presentes em um grande catálogo musical.

A proposta vai além de simplesmente recomendar músicas. O sistema busca compreender **o que caracteriza uma música popular, como diferentes atributos sonoros se relacionam e de que maneira essas informações podem ser utilizadas para gerar recomendações personalizadas**.

A partir de um dataset com aproximadamente **114 mil registros**, foram realizadas etapas de limpeza, deduplicação, análise e *feature engineering*, resultando em um catálogo de **89.740 faixas únicas**.

O sistema utiliza **Cosine Similarity (similaridade de cosseno)** para comparar características musicais e identificar faixas semelhantes. Além disso, conta com uma interface visual inspirada na experiência do Spotify, permitindo explorar os dados e interagir com os resultados das análises.

---

## 📑 Índice

1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Perguntas Orientadoras](#-perguntas-orientadoras)
3. [Objetivos](#-objetivos)
4. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
5. [Estrutura do Repositório](#-estrutura-do-repositório)
6. [Funcionalidades e Módulos](#-funcionalidades-e-módulos)
7. [Tratamento e Preparação dos Dados](#-tratamento-e-preparação-dos-dados)
8. [Sistema de Recomendação](#-sistema-de-recomendação)
9. [Análise de Dados e Descobertas](#-análise-de-dados-e-descobertas)
10. [Como Executar](#-como-executar)
11. [Equipe e Metodologia](#-equipe-e-metodologia)
12. [Referências](#-referências)

---

# 🎯 Sobre o Projeto

O **SpotData** foi desenvolvido com o objetivo de aplicar conceitos de **análise de dados, engenharia de dados e aprendizado de máquina** em um problema relacionado ao consumo e à descoberta de músicas.

O dataset utilizado contém diferentes características relacionadas às faixas musicais, permitindo investigar aspectos como:

* Popularidade;
* Gênero;
* Energia;
* Valência;
* *Danceability*;
* *Acousticness*;
* *Instrumentalness*;
* *Liveness*;
* *Speechiness*;
* Duração;
* Explicitidade.

A partir dessas informações, o projeto realiza o tratamento dos dados, cria novas variáveis e desenvolve métodos para identificar padrões e similaridades entre as músicas.

O desenvolvimento foi organizado em **4 fases incrementais**, permitindo a evolução do projeto desde a preparação dos dados até a integração da aplicação final.

### 🔹 Fase 1 — Preparação dos Dados

* Limpeza dos dados;
* Tratamento de valores nulos;
* Identificação de duplicatas;
* Remoção de registros duplicados;
* Análise exploratória;
* Engenharia de características (*feature engineering*).

**Resultado:**

> 114.000 registros → **89.740 faixas únicas**

---

### 🔹 Fase 2 — Inteligência Artificial

Desenvolvimento do motor de recomendação musical utilizando:

* Normalização das características;
* Vetorização das músicas;
* Cálculo da **similaridade de cosseno**;
* Comparação entre faixas;
* Busca pelas músicas mais semelhantes.

---

### 🔹 Fase 3 — Frontend

Desenvolvimento de uma interface visual inspirada na experiência do Spotify, permitindo:

* Buscar músicas;
* Visualizar informações das faixas;
* Encontrar recomendações;
* Explorar o catálogo;
* Interagir com os resultados das análises.

---

### 🔹 Fase 4 — Validação e Documentação

* Testes dos módulos;
* Validação da integração;
* Organização do repositório;
* Documentação técnica;
* Registro das descobertas;
* Validação da aplicação final.

---

# Guiding Questions (GQs)
## Perguntas Orientadoras Respondidas

O desenvolvimento do SpotData foi guiado por perguntas relacionadas à popularidade, às características sonoras e à recomendação musical.

As respostas abaixo representam associações observadas no dataset e o comportamento atual do sistema. Elas não demonstram necessariamente relações de causa e efeito.

---

## 1. Popularidade

### O que a média de popularidade representa dentro do catálogo?

A popularidade média das 89.740 músicas é aproximadamente 33,21 (pontos), enquanto a mediana é 33 (pontos).

Isso indica que a maior parte do catálogo possui popularidade baixa ou intermediária. Apenas 3,49% das músicas apresentam uma popularidade igual ou superior a 70.

### Músicas explícitas possuem maior ou menor popularidade?

- **Não explícitas:** 32,86 pontos
- **Explícitas:** 36,89 pontos
- **Diferença:** aproximadamente 4,03 pontos

### Devemos considerar músicas com popularidade zero?

O dataset possui 9.347 músicas com popularidade zero, correspondendo a aproximadamente 10,42% do catálogo limpo.

Essas músicas não devem ser removidas automaticamente. O zero pode representar:

- música pouco conhecida;
- ausência de dados suficientes;
- indisponibilidade do indicador;
- popularidade registrada em momentos diferentes.

---

## 2. Perfil Emocional e Sensorial

### Como utilizar características sonoras para estimar o humor de uma música?

O SpotData utiliza `energy` e `valence` para dividir as músicas em quatro quadrantes:

- **Animado 🟡:** energia alta e valência alta;
- **Intenso 🔴:** energia alta e valência baixa;
- **Triste 🔵:** energia baixa e valência baixa;
- **Relaxado 🟢:** energia baixa e valência alta.

A classificação encontrada no dataset é:

| Humor | Quantidade de músicas |
|---|---|
| Animado | 33.220 |
| Intenso | 30.211 |
| Triste | 19.030 |
| Relaxado | 7.279 |

### Energia e valência são suficientes para representar o humor?

Elas são suficientes para criar uma classificação operacional simples, como a utilizada no projeto, mas não representam toda a complexidade emocional de uma música.

Letra, contexto cultural, tonalidade, instrumentação e percepção individual também podem influenciar o humor percebido.

Portanto, o resultado deve ser apresentado como uma aproximação baseada em dados acústicos.

### Como criar playlists para contextos específicos?

O sistema combina:

- gênero;
- humor;
- nível de energia;
- popularidade;
- filtro de conteúdo explícito;
- diversidade de artistas.

Esses filtros permitem criar playlists direcionadas, como samba animado, músicas relaxadas ou playlists sem conteúdo explícito.

---

## 3. Recomendação e Inteligência Artificial

### É possível recomendar músicas apenas pelas características sonoras?

Sim. O SpotData representa cada música utilizando oito características:

- danceability;
- energy;
- speechiness;
- acousticness;
- instrumentalness;
- liveness;
- valence;
- tempo.

As características são normalizadas com `StandardScaler` e comparadas utilizando similaridade de cossenos.

O resultado é um recomendador baseado em conteúdo, capaz de encontrar músicas com perfis acústicos semelhantes.

### Quais características influenciam a similaridade?

Atualmente, as oito características possuem a mesma importância após a padronização.

O sistema ainda não aprende pesos personalizados. Portanto, não é possível afirmar que uma característica específica seja mais importante para os usuários.

### A Cosine Similarity (similaridade do cosseno) é adequada para esse dataset?

Ela é adequada como algoritmo inicial porque:

- trabalha com vetores numéricos;
- compara o perfil acústico das músicas;
- é rápida para aproximadamente 90 mil faixas;
- não exige histórico prévio de usuários;
- permite recomendações para músicas pouco conhecidas.

Entretanto, a relevância subjetiva das recomendações ainda precisaria ser validada com usuários reais.

### O sistema recomenda músicas pouco populares?

Sim. A popularidade não participa diretamente do cálculo de similaridade.

Uma música pouco popular pode ser recomendada quando suas características acústicas forem semelhantes às da referência ou às favoritas do usuário.

A popularidade é utilizada apenas como critério auxiliar de ordenação.

### Como o perfil das favoritas representa o usuário?

O sistema calcula a média dos vetores acústicos das músicas favoritas.

Esse vetor médio funciona como uma representação inicial das preferências sonoras do usuário. Quanto mais coerentes forem as favoritas, mais representativo tende a ser o perfil.

Caso o usuário possua gostos muito diferentes, um único vetor médio pode não representar adequadamente todos os seus interesses.

### Recomendações por perfil são diferentes das recomendações por uma música?

Sim.

Na recomendação por música, o sistema compara o catálogo com uma única faixa de referência.

Na recomendação por perfil, ele compara o catálogo com o vetor médio de todas as favoritas. Dessa forma, o resultado tenta representar o conjunto de preferências do usuário.

### Como o sistema equilibra similaridade e diversidade?

Nas recomendações por similaridade, o sistema permite no máximo uma música por artista.

Nas playlists, permite no máximo duas músicas por artista.

Essa regra evita listas dominadas pelo mesmo artista.

### É possível criar recomendações personalizadas apenas com o dataset?

Sim, utilizando recomendação baseada em conteúdo.

O usuário seleciona músicas favoritas, a API envia os `track_id` para o backend e o Python calcula um perfil acústico. O sistema então procura músicas semelhantes no catálogo.

Essa abordagem personaliza pelo conteúdo, mas ainda não utiliza comportamento coletivo de outros usuários.

---

## 4. Contexto e Experiência

### Como manter um humor sem deixar a playlist excessivamente repetitiva?

O sistema permite filtrar as músicas pelo mesmo humor e aplica limites por artista.

Isso ajuda a manter uma característica emocional comum sem preencher toda a playlist com músicas do mesmo artista.

A diversidade acústica entre as próprias faixas ainda não é calculada diretamente.

### Como a diversidade musical é incorporada?

Atualmente, a diversidade é aplicada por meio de limites de músicas por artista:

- uma música por artista nas recomendações;
- até duas músicas por artista nas playlists.

### Uma playlist pode combinar gêneros diferentes mantendo características sonoras semelhantes?

Sim. O recomendador por similaridade não exige que as músicas pertençam ao mesmo gênero.

Isso permite encontrar músicas de gêneros diferentes que compartilham características como energia, valência, ritmo, acústica e dançabilidade.

### O sistema adapta as recomendações ao contexto escolhido?

Parcialmente.

O usuário pode escolher:

- gênero;
- humor;
- exclusão de conteúdo explícito;
- uma música de referência;
- um conjunto de músicas favoritas.

Essas escolhas alteram dinamicamente os resultados consultados pela API.

# 🎯 Objetivos

## Objetivo Geral

Desenvolver um sistema capaz de analisar um grande catálogo musical e utilizar técnicas de Inteligência Artificial para identificar padrões e gerar recomendações personalizadas com base nas características das músicas.

## Objetivos Específicos

* Realizar a limpeza e preparação de um dataset musical;
* Identificar padrões relacionados à popularidade;
* Investigar relações entre características sonoras;
* Desenvolver análises estatísticas;
* Criar novas características a partir dos dados existentes;
* Implementar um sistema de recomendação;
* Utilizar similaridade de cosseno para comparar músicas;
* Criar recomendações baseadas no perfil do usuário;
* Desenvolver playlists contextuais;
* Explorar diferentes perfis emocionais das músicas;
* Criar uma interface visual para interação com o sistema;
* Validar os resultados obtidos;
* Documentar o processo de desenvolvimento e as descobertas realizadas.

---

# 🛠️ Tecnologias Utilizadas

| Tecnologia       | Utilização                                               |
| ---------------- | -------------------------------------------------------- |
| **Python**       | Desenvolvimento do sistema e processamento dos dados     |
| **Pandas**       | Manipulação e análise dos dados                          |
| **Scikit-Learn** | Algoritmos de Machine Learning e cálculo de similaridade |
| **HTML**         | Estrutura da interface                                   |
| **CSS**          | Estilização da interface                                 |
| **JavaScript**   | Interatividade do frontend                               |
| **Git/GitHub**   | Controle de versão e colaboração                         |

---

# 📂 Estrutura do Repositório

O repositório foi estruturado de forma colaborativa, permitindo que diferentes fluxos de desenvolvimento e experimentação fossem mantidos em diretórios próprios.

```text
ResidenciaSpotify/
│
├── ricardo/
│   ├── main.py
│   ├── frontend_spotify.html
│   ├── dataset_clean.csv
│   │
│   └── spotify/
│       ├── top5.py
│       ├── recomendador.py
│       ├── playlist.py
│       └── podcasts.py
│
├── integrante_2/
│   └── ...
│
├── integrante_3/
│   └── ...
│
├── docs/
│   └── ...
│
└── README.md
```

## 📌 Diretórios principais

### `ricardo/`

Contém a versão principal e integrada da aplicação.

Inclui:

* Código da aplicação;
* Interface frontend;
* Dataset processado;
* Módulos analíticos;
* Sistema de recomendação.

### `integrante_2/`

Espaço destinado aos experimentos, notebooks e implementações desenvolvidas pelo segundo integrante.

### `integrante_3/`

Espaço destinado aos experimentos e implementações desenvolvidas pelo terceiro integrante.

### `docs/`

Contém a documentação complementar do projeto, incluindo:

* Dicionário de dados;
* Documentação técnica;
* Registros das análises;
* Materiais de apoio.

> **Nota:** Para utilizar apenas a versão final e consolidada da aplicação, consulte as instruções relacionadas ao **Sparse Checkout** e à pasta `/ricardo`.

---

# ⚙️ Funcionalidades e Módulos

O núcleo analítico da aplicação está localizado em:

```text
/ricardo/spotify/
```

| Módulo            | Função Principal                             | Técnica / Filtro                       |
| ----------------- | -------------------------------------------- | -------------------------------------- |
| `top5.py`         | Top 5 músicas globais ou por gênero          | Ordenação por popularidade             |
| `recomendador.py` | Recomendação por similaridade sonora         | Cosine Similarity                      |
| `recomendador.py` | Recomendação baseada no perfil do usuário    | Vetor médio das músicas favoritas      |
| `playlist.py`     | Criação de playlists contextuais             | Filtros de gênero, humor e diversidade |
| `podcasts.py`     | Detecção de possíveis podcasts/faixas longas | Duração > 20 min + alta *speechiness*  |

---

# 🧹 Tratamento e Preparação dos Dados

O dataset original possuía aproximadamente:

```text
114.000 registros
21 variáveis
```

Durante o processo de preparação foram realizadas etapas de:

1. Limpeza dos dados;
2. Tratamento de valores ausentes;
3. Identificação de duplicatas;
4. Remoção de registros duplicados;
5. Padronização dos dados;
6. Engenharia de características;
7. Preparação para os algoritmos de recomendação.

Após o tratamento:

```text
Dataset original
      │
      ▼
114.000 registros
      │
      ▼
Limpeza e deduplicação
      │
      ▼
89.740 faixas únicas
```

---

# 🤖 Sistema de Recomendação

O sistema utiliza **Cosine Similarity** como mecanismo principal para comparar as características das músicas.

Para cada faixa, suas características são representadas numericamente e normalizadas antes da comparação.

### Processo

```text
                Música escolhida
                       │
                       ▼
              Extração das features
                       │
                       ▼
              Normalização dos dados
                       │
                       ▼
             Representação vetorial
                       │
                       ▼
             Cálculo da similaridade
                       │
                       ▼
              Comparação com o catálogo
                       │
                       ▼
             Ordenação dos resultados
                       │
                       ▼
             🎵 Recomendações musicais
```

---

# 👤 Recomendação por Perfil de Usuário

O sistema também permite construir um perfil musical a partir das músicas favoritas do usuário.

```text
Músicas favoritas
       │
       ▼
Extração das features
       │
       ▼
Cálculo do vetor médio
       │
       ▼
Perfil musical
       │
       ▼
Comparação com o catálogo
       │
       ▼
Recomendações personalizadas
```

Essa abordagem permite que a recomendação considere um **conjunto de preferências**, em vez de depender exclusivamente de uma única música.

---

# 🎶 Playlists Contextuais

O módulo `playlist.py` permite criar playlists utilizando diferentes critérios.

Os filtros podem combinar:

* Gênero;
* Humor;
* Energia;
* Valência;
* *Danceability*;
* Diversidade musical.

Exemplos de contextos:

```text
🎉 Playlist Animada
→ Alta energia + alta valência

😌 Playlist Relaxante
→ Baixa energia + características acústicas

💃 Playlist para Dançar
→ Alta danceability

🏋️ Playlist para Exercícios
→ Maior energia + maior danceability

🎸 Playlist por Gênero
→ Filtro de gênero específico
```

---

# 📊 Análise de Dados e Descobertas

Após o processo de limpeza e análise, foram identificados alguns padrões relevantes no catálogo.

## 📈 O catálogo apresenta uma cauda longa

Aproximadamente **4,8% das faixas** são consideradas hits absolutos utilizando como critério:

```text
Popularidade ≥ 70
```

Esse resultado indica que uma pequena parcela do catálogo concentra níveis elevados de popularidade.

---

## ⚡ Humor predominante

Aproximadamente **38% do catálogo** foi classificado como **"Animado"**.

A classificação considera principalmente a combinação entre:

* Energia;
* Valência.

---

## 🔞 Popularidade e conteúdo explícito

As músicas classificadas como explícitas apresentam, em média, aproximadamente **8 pontos a mais de popularidade** em comparação às não explícitas.

Esse resultado representa uma **associação observada nos dados** e não deve ser interpretado como uma relação de causalidade.

---

## 🚀 Desempenho do recomendador

Durante os testes realizados, o motor de recomendação conseguiu comparar a música selecionada com o catálogo de aproximadamente **89.740 músicas em cerca de 7 milissegundos**.

> O tempo pode variar de acordo com o ambiente de execução, hardware, quantidade de dados carregados e implementação utilizada.

---

## 🚀 Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/Muniz2811/ResidenciaSpotify.git
cd ResidenciaSpotify/ricardo
```

### 2. Criar e ativar um ambiente virtual

#### Windows — PowerShell

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar as dependências

Com o ambiente virtual ativado:

```bash
python -m pip install -r requirements.txt
```

As principais dependências são `pandas`, `numpy`, `scikit-learn`, `FastAPI` e `Uvicorn`.

### 4. Executar a aplicação

O Uvicorn inicia a API Python e disponibiliza o frontend integrado:

```bash
python -m uvicorn api:app --reload
```

Mantenha o terminal aberto enquanto estiver usando a aplicação.

### 5. Acessar o frontend

Abra no navegador:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

A documentação interativa da API está disponível em:

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

# 🤝 Equipe e Metodologia

O projeto foi desenvolvido de forma colaborativa durante a **Residência em Inteligência Artificial da Universidade de Brasília (UnB)**.

A organização do trabalho foi baseada na divisão de responsabilidades, integração dos módulos e entregas incrementais.

## 👩‍💻 Maria Eduarda Denis Duarte Marques 

**Papel:** Documentação Técnica e Validação

### Responsabilidades

* Estruturação da documentação técnica;
* Organização da arquitetura do repositório;
* Elaboração dos guias de inicialização;
* Padronização da comunicação dos resultados;
* Registro das descobertas analíticas;
* Validação final da integração dos módulos.

---

## 👤 Integrante 2

**Papel:** Engenharia de Dados

### Responsabilidades

* Desenvolvimento do pipeline de limpeza;
* Deduplicação do dataset;
* Tratamento dos dados;
* Engenharia de features;
* Preparação dos dados para análise.

> **Observação:** Substituir pelo nome real do integrante.

---

## 👤 Integrante 3

**Papel:** Machine Learning

### Responsabilidades

* Desenvolvimento do modelo de recomendação;
* Modelagem matemática;
* Implementação da Cosine Similarity;
* Definição das features utilizadas;
* Testes e validação do algoritmo.

> **Observação:** Substituir pelo nome real do integrante.

---

## 👨‍💻 Ricardo Correa Ribeiro

**Papel:** Desenvolvimento de Software e Integração

### Responsabilidades

* Desenvolvimento da interface frontend;
* Integração entre frontend e backend;
* Consolidação dos scripts;
* Organização da estrutura final da aplicação;
* Integração dos módulos desenvolvidos pela equipe.

---

# 🔄 Metodologia de Desenvolvimento

O projeto foi desenvolvido de maneira incremental, permitindo que cada etapa fosse analisada e validada antes da integração final.

```text
┌─────────────────────────┐
│  1. Exploração dos      │
│       dados             │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  2. Limpeza e           │
│     preparação          │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  3. Desenvolvimento     │
│  do recomendador        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  4. Desenvolvimento     │
│     da interface        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  5. Integração e        │
│       validação         │
└─────────────────────────┘
```

---

# 📚 Referências

* **Dicionário de Dados:** Variáveis utilizadas no dataset relacionado ao Spotify.
* **Guia Pedagógico UnB:** Recomendações, Playlists e Agrupamento Musical.
* **Scikit-Learn:** Biblioteca utilizada para os algoritmos de Machine Learning e cálculo de similaridade.
* **Pandas:** Biblioteca utilizada para manipulação e análise dos dados.

---

# 📌 Status do Projeto

```text
🟢 Análise de dados        → Concluída
🟢 Limpeza dos dados       → Concluída
🟢 Engenharia de features  → Concluída
🟢 Recomendador            → Concluído
🟢 Playlists contextuais   → Concluídas
🟢 Frontend                → Concluído
🟢 Integração              → Concluída
🟢 Documentação            → Concluída
```

---

# 🎵 SpotData

> **Transformando dados musicais em descobertas, análises e recomendações.**

Desenvolvido durante a **Residência em Inteligência Artificial — Universidade de Brasília (UnB), 2026**.
