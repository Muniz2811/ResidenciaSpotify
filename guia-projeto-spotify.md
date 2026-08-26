# Guia de Orientação: Projeto Spotify — Recomendação e Insights

## 1. Objetivo do Projeto: Sistema de Recomendação Baseado em Conteúdo

O objetivo principal é construir um modelo de recomendação que sugira músicas com base nas características sonoras de uma faixa escolhida pelo usuário.

## 2. Dicionário de Dados

A tabela abaixo apresenta a descrição de cada coluna do conjunto de dados.

| Coluna | Descrição técnica |
| --- | --- |
| `track_id` | Chave primária única gerada pelo sistema para identificar a faixa de forma inequívoca, evitando confusão entre músicas de mesmo nome. |
| `artists` | Nome do(s) artista(s) responsável(is) pela música. Múltiplos artistas são geralmente separados por ponto e vírgula (`;`). |
| `album_name` | Nome do álbum ou projeto de lançamento ao qual a música pertence. |
| `track_name` | Título da faixa. |
| `popularity` | Métrica de popularidade baseada no número total de reproduções e em quão recentes elas são. Valores próximos de 100 indicam hits atuais de alcance global. |
| `duration_ms` | Duração total da música, medida em milissegundos. |
| `explicit` | Indica se a música contém linguagem explícita ou conteúdo impróprio (`True`) ou não (`False`). |
| `danceability` | Indica quão adequada é a faixa para dançar. Combina andamento, regularidade do ritmo e força da batida. Valores próximos de 1,0 representam faixas altamente dançáveis. |
| `energy` | Representa uma medida perceptiva de intensidade e atividade. Faixas de heavy metal costumam ter alta energia, enquanto prelúdios de piano clássico apresentam baixa energia. |
| `key` | Chave tonal da música usando a notação *Pitch Class* (`0 = Dó`, `1 = Dó#`, `2 = Ré` etc.). O valor `-1` indica que nenhum tom foi detectado. |
| `loudness` | Volume médio da faixa, medido em decibéis (dB). Os valores típicos variam de -60 a 0 dB. Quanto mais próximo de 0, mais alta é a música. |
| `mode` | Modalidade da escala da faixa. O valor `1` representa o modo maior, geralmente associado a uma sonoridade mais alegre, e `0` representa o modo menor, normalmente mais melancólico ou dramático. |
| `speechiness` | Indica a presença de palavras faladas. Valores altos (acima de 0,66) sugerem conteúdos como podcasts ou poesia; valores entre 0,33 e 0,66 podem representar faixas focadas na voz, como rap. |
| `acousticness` | Mede a probabilidade de a faixa ser acústica. Valores próximos de 1,0 indicam maior presença de instrumentos acústicos e menor uso de elementos eletrônicos. |
| `instrumentalness` | Indica a probabilidade de a faixa não conter vocais. Valores acima de 0,5 sugerem músicas majoritariamente instrumentais. O rap, por exemplo, costuma apresentar valores próximos de 0,0. |
| `liveness` | Detecta a presença de audiência na gravação. Valores altos indicam maior probabilidade de a faixa ter sido gravada ao vivo, em vez de em estúdio. |
| `valence` | Representa a positividade musical. Faixas com valência alta, próxima de 1,0, tendem a soar mais felizes, eufóricas ou animadas; valores baixos indicam sonoridades mais tristes, tensas ou melancólicas. |
| `tempo` | Andamento estimado da música em batidas por minuto (BPM), indicando a velocidade geral da faixa. |
| `time_signature` | Fórmula de compasso estimada. O valor indica quantas batidas existem em cada compasso. O mais comum na música ocidental é `4`, correspondente ao compasso 4/4. |
| `track_genre` | Gênero musical atribuído à faixa, como `acoustic`, `pop`, `metal` ou `sertanejo`. |

## 3. Insights e Análise Exploratória de Dados (EDA)

Além do desenvolvimento do modelo de recomendação, o projeto busca extrair inteligência dos dados. A análise exploratória procurará responder às seguintes questões de negócio:

- Existe uma duração ideal de música (`duration_ms`) que maximize as chances de alcançar uma pontuação alta de popularidade?
- Quais gêneros musicais (`track_genre`) ou artistas dominam o topo do ranking de popularidade neste conjunto de dados?
- Com base em agrupamentos matemáticos, quais são as principais “vibes” sonoras — por exemplo, músicas calmas e tristes ou agitadas e felizes — mais consumidas pelo público atual?
- Quais características sonoras apresentam maior relação com a popularidade das faixas?
- Há diferenças relevantes de popularidade entre músicas explícitas e não explícitas?
- Quais gêneros possuem maior diversidade sonora em termos de energia, valência, dançabilidade e acústica?
- Existem padrões de duração, andamento ou energia entre as faixas mais populares?
- Quais artistas apresentam maior consistência de popularidade entre suas músicas?

## 4. Passo a Passo do Sistema de Recomendação Baseado em Conteúdo

### Passo 1: Seleção de Atributos (*Features*)

Primeiro, serão selecionadas apenas as colunas numéricas que descrevem a “vibe” e as características sonoras da música. Nomes e identificadores não serão utilizados nos cálculos de similaridade.

**Atributos selecionados:**

- `danceability`
- `energy`
- `valence`
- `acousticness`
- `instrumentalness`
- `speechiness`
- `liveness`
- `tempo`

### Passo 2: Preparação dos Dados — Escalonamento

Algumas colunas variam de 0 a 1, como `danceability`, enquanto outras apresentam valores muito maiores, como `tempo`, que pode ultrapassar 150 BPM. Por isso, é necessário colocar todos os atributos em uma escala comparável.

**Como fazer:** aplicar um método de escalonamento, como `StandardScaler` ou `MinMaxScaler`, em Python. Assim, o atributo `tempo` não terá um peso desproporcional em relação às demais características durante o cálculo.

### Passo 3: Cálculo de Similaridade

Cada música será representada como um ponto em um espaço multidimensional, definido pelos atributos selecionados. Em seguida, será calculada a proximidade entre as faixas.

**Técnica utilizada:** Similaridade de Cossenos (*Cosine Similarity*). Esse método compara a orientação dos vetores de características e produz uma pontuação de similaridade. Quanto mais próxima de 1 for a pontuação, maior será a semelhança entre duas músicas.

### Passo 4: Geração das Recomendações

Quando o usuário escolher uma música de que gosta — por exemplo, **“Comedy”**, de Gen Hoshino —, o modelo executará as seguintes etapas:

1. Recuperará os atributos sonoros da música escolhida.
2. Calculará a Similaridade de Cossenos entre essa faixa e todas as demais músicas do conjunto de dados.
3. Removerá a própria música escolhida dos resultados.
4. Ordenará as demais faixas da maior para a menor pontuação de similaridade.
5. Retornará as 5 ou 10 músicas mais semelhantes.

O modelo é relativamente simples, rápido de implementar e capaz de produzir recomendações relevantes ao agrupar músicas com características semelhantes de energia, acústica, ritmo e positividade.
