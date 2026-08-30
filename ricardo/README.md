# SpotData — Projeto Ricardo
**Residência em IA · UnB · 2026**

Sistema completo de análise e recomendação musical baseado em dataset do Spotify, desenvolvido em 4 fases com motor de IA e interface visual estilo Spotify.

---

## Como baixar apenas esta pasta

O repositório da equipe contém pastas de vários alunos. Para baixar **somente a pasta `ricardo`** sem precisar clonar o repositório inteiro, siga um dos métodos abaixo:

### Método 1 — Download direto pelo navegador (mais fácil)

Acesse o site **Download Directory** e cole o link abaixo:

```
https://download-directory.github.io/?url=https://github.com/Muniz2811/ResidenciaSpotify/tree/main/ricardo
```

Clique em **Download** e um arquivo `.zip` com toda a pasta será baixado automaticamente. Não precisa instalar nada.

### Método 2 — Git Sparse Checkout (recomendado para desenvolvedores)

Use este método para baixar pelo terminal sem precisar do repositório inteiro:

```bash
# 1. Criar e entrar numa pasta vazia
mkdir SpotData-Ricardo
cd SpotData-Ricardo

# 2. Inicializar o git
git init

# 3. Configurar o repositório remoto
git remote add origin https://github.com/Muniz2811/ResidenciaSpotify.git

# 4. Ativar o sparse checkout (baixa só o que você pedir)
git sparse-checkout init --cone

# 5. Definir que só quer a pasta 'ricardo'
git sparse-checkout set ricardo

# 6. Baixar os arquivos
git pull origin main
```

Ao final, a pasta `ricardo/` estará disponível com todos os arquivos do projeto.

### Método 3 — Clonar completo e usar só a pasta (método tradicional)

```bash
git clone https://github.com/Muniz2811/ResidenciaSpotify.git
cd ResidenciaSpotify/ricardo
```

---

## Estrutura do projeto

```
ricardo/
├── main.py                   ← Ponto de entrada — execute: python main.py
├── frontend_spotify.html     ← Interface visual — abra no navegador
├── dataset_clean.csv         ← Dataset limpo (89.740 músicas × 34 colunas)
├── requirements.txt          ← Dependências Python
├── README.md                 ← Este arquivo
└── spotify/
    ├── __init__.py
    ├── dados.py              ← Carrega o dataset (compartilhado por todos)
    ├── top5.py               ← Módulo 1: Top 5 músicas por popularidade
    ├── recomendador.py       ← Módulos 2 e 5: Cosine Similarity + Perfil
    ├── playlist.py           ← Módulo 3: Playlist por gênero e humor
    └── podcasts.py           ← Módulo 4: Faixas longas > 20 min
```

---

## Como rodar o projeto

### 1. Criar e ativar o ambiente virtual

```powershell
# Criar o ambiente
python -m venv venv

# Ativar (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Se der erro de permissão, rode antes:
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

### 2. Instalar as dependências

```bash
pip install -r requirements.txt
```

As dependências são: `pandas`, `numpy` e `scikit-learn`.

### 3. Executar o projeto completo

```bash
python main.py
```

### 4. Testar módulos individualmente

```bash
python -m spotify.top5
python -m spotify.recomendador
python -m spotify.playlist
python -m spotify.podcasts
```

### 5. Abrir o frontend

Abra o arquivo `frontend_spotify.html` diretamente no navegador (duplo clique), ou use a extensão **Live Server** do VSCode.

---

## O que o sistema entrega

| Módulo | Função | Técnica usada |
|--------|--------|---------------|
| `top5.py` | Top 5 músicas mais populares (global e por gênero) | Ordenação por popularidade |
| `recomendador.py` | Músicas com perfil sonoro similar | Cosine Similarity (8 features) |
| `recomendador.py` | Recomendações pelo perfil do usuário | Vetor médio das favoritas |
| `playlist.py` | Playlist filtrada por gênero e humor | Filtro + diversidade de artistas |
| `podcasts.py` | Faixas longas e podcasts | Duração > 20 min + speechiness |

---

## Dataset

- **Original:** 114.000 linhas × 21 colunas
- **Após limpeza:** 89.740 músicas únicas × 34 colunas
- **Gêneros:** 114
- **Novas colunas:** `duration_min`, `mood`, `is_podcast`, `is_explicit`, `genre_main`, `all_genres`, 8 features `_scaled`

### Features usadas no recomendador

`danceability` · `energy` · `speechiness` · `acousticness` · `instrumentalness` · `liveness` · `valence` · `tempo`

Todas normalizadas com **StandardScaler** antes da comparação por cosseno.

---

## Fases do projeto

| Fase | Descrição | Resultado |
|------|-----------|-----------|
| Fase 1 | Limpeza e preparação dos dados | 114k → 89.740 músicas, 0 nulos, 0 duplicatas |
| Fase 2 | Motor de recomendação com IA | 5 módulos, Cosine Similarity em 7ms |
| Fase 3 | Frontend estilo Spotify | 5 seções, busca em tempo real, filtros |
| Fase 4 | Integração e validação final | Todos módulos validados, README, documentação |

---

## Principais descobertas

- **Apenas 4,8%** das faixas são hits (popularidade ≥ 70) — catálogo é cauda longa
- **35,9%** das linhas originais eram duplicatas — essencial deduplicar antes de modelar
- **38%** do catálogo é classificado como "Animado" (alta valência + alta energia)
- Músicas explícitas têm popularidade média **8 pontos acima** das não-explícitas
- O recomendador consulta 89.740 músicas em apenas **7 milissegundos**
- `popularidade = 0` não significa rejeição — pode ser ausência de sinal

---

## Referências

- Guia Pedagógico: Recomendações, Playlists e Agrupamento Musical
- Dicionário de Dados: Variáveis da Spotify API