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
├── api.py                    ← API FastAPI e servidor do frontend
├── main.py                   ← Ponto de entrada — execute: python main.py
├── frontend_spotify.html     ← Estrutura e estilos da interface
├── frontend_spotify.js       ← API, player, favoritas, capas e playlists locais
├── dataset_clean.csv         ← Dataset limpo (89.740 músicas × 34 colunas)
├── requirements.txt          ← Dependências Python
├── README.md                 ← Este arquivo
└── spotify/
    ├── __init__.py
    ├── dados.py              ← Carrega o dataset (compartilhado por todos)
    ├── top5.py               ← Módulo 1: Top 5 músicas por popularidade
    ├── recomendador.py       ← Módulos 2 e 4: Cosine Similarity + Perfil
    └── playlist.py           ← Módulo 3: Playlist por gênero e humor
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

As principais dependências são: `pandas`, `numpy`, `scikit-learn`, `FastAPI`
e `Uvicorn`.

### 3. Executar o projeto completo com frontend integrado

```bash
python -m uvicorn api:app --reload
```

Depois, acesse `http://127.0.0.1:8000`. O HTML deve ser aberto por esse
endereço, e não diretamente pelo arquivo, porque agora ele consulta a API
Python. A documentação interativa dos endpoints fica em
`http://127.0.0.1:8000/docs`.

O comando `python main.py` continua disponível para executar apenas a
demonstração no terminal.

### 4. Testar módulos individualmente

```bash
python -m spotify.top5
python -m spotify.recomendador
python -m spotify.playlist
```

### 5. Abrir o frontend

Com a API em execução, abra `http://127.0.0.1:8000` no navegador. O frontend
consulta o catálogo completo, solicita recomendações por faixa e envia as
favoritas do navegador para o perfil calculado no Python.

A área **Minhas Playlists** permite criar até 20 playlists, adicionar ou
retirar até 100 músicas de cada uma e recebe 5 recomendações calculadas pelo
vetor médio das características acústicas da lista. Playlists e favoritas ficam
no `localStorage`, portanto são separadas por navegador e não geram conflito
entre visitantes de um deploy.

Ao clicar em uma faixa, a aplicação abre o player incorporado oficial do
Spotify. Essa reprodução usa o `track_id` existente no dataset, requer conexão
com a internet e pode variar conforme a disponibilidade da música, o país e a
sessão do usuário no Spotify. Nenhuma credencial do Spotify precisa ser salva
no frontend para esse modo de reprodução.

As capas são consultadas no oEmbed público do Spotify e mantidas em cache na
sessão do navegador. Se uma capa não estiver disponível, a interface mantém a
capa colorida de fallback.

<img width="1912" height="958" alt="Captura de tela 2026-08-30 183739" src="https://github.com/user-attachments/assets/5e284c61-91f9-4fc5-a452-0a574adce044" />

---

## O que o sistema entrega

| Módulo | Função | Técnica usada |
|--------|--------|---------------|
| `top5.py` | Top 5 músicas mais populares (global e por gênero) | Ordenação por popularidade |
| `recomendador.py` | Músicas com perfil sonoro similar | Cosine Similarity (8 features) |
| `recomendador.py` | Recomendações pelo perfil do usuário | Vetor médio das favoritas |
| `recomendador.py` | 5 recomendações para cada playlist | Vetor médio da playlist + Cosine Similarity |
| `playlist.py` | Playlist filtrada por gênero e humor | Filtro + diversidade de artistas |

---

## Dataset

- **Original:** 114.000 linhas × 21 colunas
- **Após limpeza:** 89.740 músicas únicas × 34 colunas
- **Gêneros:** 114
- **Novas colunas:** `duration_min`, `mood`, `is_explicit`, `genre_main`, `all_genres`, 8 features `_scaled`

### Features usadas no recomendador

`danceability` · `energy` · `speechiness` · `acousticness` · `instrumentalness` · `liveness` · `valence` · `tempo`

Todas normalizadas com **StandardScaler** antes da comparação por cosseno.

---

## Fases do projeto

| Fase | Descrição | Resultado |
|------|-----------|-----------|
| Fase 1 | Limpeza e preparação dos dados | 114k → 89.740 músicas, 0 nulos, 0 duplicatas |
| Fase 2 | Motor de recomendação com IA | 4 módulos, Cosine Similarity em 7ms |
| Fase 3 | Frontend estilo Spotify | Player, busca, capas reais e múltiplas playlists |
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
