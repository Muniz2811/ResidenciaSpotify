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

# ❓ Perguntas Orientadoras

O desenvolvimento do SpotData foi guiado por perguntas relacionadas a **popularidade, comportamento do mercado musical, características sonoras e recomendação**.

Essas perguntas servem como direcionadores para as análises exploratórias e ajudam a transformar os dados disponíveis em hipóteses que podem ser investigadas.

---

## 📈 1. Popularidade e Tendências de Mercado

A popularidade é uma das principais variáveis disponíveis no dataset. A partir dela, buscamos entender quais características estão associadas ao sucesso das músicas.

### Perguntas investigadas

* **O que a média de popularidade realmente representa dentro do catálogo?**
* **Músicas mais curtas tendem a apresentar maior popularidade?**
* **Músicas explícitas possuem maior ou menor popularidade?**
* **Devemos considerar músicas com popularidade zero nas análises ou elas podem representar um problema de qualidade dos dados?**
* **A popularidade de um artista influencia mais o sucesso de uma música do que suas características sonoras?**
* **A baixa popularidade de determinados gêneros, como músicas latinas, representa um fenômeno real ou pode estar relacionada à composição do dataset?**
* **Remixes apresentam diferenças de popularidade em relação às versões originais?**
* **Existe relação entre duração, gênero e popularidade?**
* **Quais características musicais aparecem com maior frequência entre as músicas mais populares?**
* **A popularidade está relacionada principalmente às características sonoras ou a fatores externos ao áudio?**

> **Observação:** O dataset permite investigar associações entre essas variáveis, mas não necessariamente determinar relações de causa e efeito.

---

## 🎧 2. Perfil Emocional e Sensorial

As características sonoras também permitem investigar como diferentes propriedades de uma música podem estar relacionadas à percepção de humor, energia e contexto de consumo.

### Perguntas investigadas

* **Como podemos utilizar características sonoras para estimar se uma música possui um perfil mais feliz, triste, energético ou melancólico?**
* **A combinação entre energia e valência é suficiente para representar o "humor" de uma música?**
* **Músicas mais acústicas tendem a apresentar menor energia?**
* **O nível de *acousticness* influencia a intensidade percebida de uma música?**
* **O volume (*loudness*) está relacionado à energia de uma faixa?**
* **Músicas muito rápidas são necessariamente mais adequadas para dançar?**
* **Existe relação entre *danceability* e energia?**
* **Uma música pode possuir alta *danceability* mesmo apresentando baixa energia?**
* **Músicas acústicas são necessariamente mais adequadas para momentos tranquilos?**
* **Uma música altamente acústica seria recomendada pelo sistema para uma festa?**
* **Como diferentes combinações de características podem ser utilizadas para criar playlists para contextos específicos?**

---

## 🤖 3. Recomendação e Inteligência Artificial

Além da análise exploratória, o projeto busca investigar como técnicas de Inteligência Artificial podem transformar as características musicais em recomendações.

### Perguntas investigadas

* **É possível recomendar músicas apenas com base em suas características sonoras?**
* **Duas músicas com características semelhantes necessariamente serão percebidas como semelhantes pelos usuários?**
* **Quais características possuem maior influência na similaridade entre duas músicas?**
* **A Cosine Similarity é adequada para encontrar músicas semelhantes nesse tipo de dataset?**
* **O sistema consegue encontrar recomendações relevantes para músicas pouco populares?**
* **Um perfil construído a partir das músicas favoritas consegue representar as preferências de um usuário?**
* **Recomendações baseadas no perfil do usuário são diferentes das recomendações baseadas em uma única música?**
* **Como equilibrar similaridade e diversidade nas recomendações?**
* **É possível criar playlists personalizadas apenas utilizando características presentes no dataset?**

---

## 🎶 4. Música, Contexto e Experiência

Uma das propostas do SpotData é utilizar os dados para ir além da simples busca por músicas semelhantes.

A partir das características analisadas, investigamos possibilidades como:

* **Quais características definem uma boa música para dançar?**
* **Quais características aparecem em músicas adequadas para relaxamento?**
* **É possível criar uma playlist para exercícios utilizando apenas dados musicais?**
* **Como criar playlists que mantenham um determinado humor sem deixar as músicas excessivamente semelhantes?**
* **Como a diversidade musical pode ser incorporada ao sistema de recomendação?**
* **Uma playlist pode combinar músicas de diferentes gêneros mantendo características sonoras semelhantes?**
* **O sistema consegue adaptar as recomendações ao contexto escolhido pelo usuário?**

---

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

# 🚀 Como Executar

## 1. Clonar o repositório

```bash
git clone https://github.com/Muniz2811/ResidenciaSpotify.git
```

Acesse a pasta da aplicação:

```bash
cd ResidenciaSpotify/ricardo
```

---

## 2. Criar um ambiente virtual

### Windows

```bash
python -m venv venv
```

Ative o ambiente:

```bash
.\venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
```

Ative o ambiente:

```bash
source venv/bin/activate
```

---

## 3. Instalar as dependências

```bash
pip install -r requirements.txt
```

---

## 4. Executar o backend

```bash
python main.py
```

---

## 5. Executar o frontend

A interface está disponível no arquivo:

```text
frontend_spotify.html
```

O arquivo pode ser aberto diretamente em um navegador ou executado utilizando uma extensão como **Live Server**.

---

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
