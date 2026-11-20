# GlosilyService

Website de importação de mochilas, pastas e acessórios. Os clientes pedem uma cotação através do formulário e a equipa gere os pedidos numa área de gestão simples.

## Funcionalidades

- **Página pública**: apresentação, catálogo de exemplo (sob cotação), explicação do processo e formulário de pedido.
- **Área de gestão** (botão "Área de gestão" no topo):
  - lista de clientes e pedidos, com pesquisa e filtro por estado;
  - estados do atendimento: Novo, Contactado, Qualificado, Fechado e Perdido;
  - criação e edição de clientes, com notas de pré-atendimento;
  - botão "Contactar", que abre o WhatsApp ou o e-mail com uma mensagem pronta;
  - configurações do número de WhatsApp e do e-mail de atendimento.

## Estrutura

```
index.html        Página e área de gestão
css/styles.css    Estilos
js/app.js         Lógica (formulário, clientes, configurações)
```

## Como executar

Não precisa de instalação. Abra o `index.html` no navegador, ou sirva a pasta localmente:

```bash
python3 -m http.server 8000
```

Depois aceda a http://localhost:8000.

## Limitações actuais

Este é um protótipo funcional. Os pedidos e as configurações ficam guardados no `localStorage` do navegador de cada visitante. Isto significa que:

- os pedidos enviados por clientes **não chegam** à área de gestão de outro dispositivo;
- limpar os dados do navegador apaga os pedidos.

Para uso real é preciso um backend ou serviço que receba os pedidos (por exemplo, uma base de dados com API, ou um serviço de formulários), e proteger a área de gestão com autenticação, pois hoje qualquer visitante a pode abrir.

## Próximos passos sugeridos

1. Ligar o formulário a um backend e guardar os pedidos num local central.
2. Adicionar login à área de gestão.
3. Substituir as ilustrações por fotografias reais dos produtos.
4. Publicar o site (GitHub Pages, Netlify ou Vercel).
