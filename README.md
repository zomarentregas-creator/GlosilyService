# GlosilyService

Website de importação de mochilas, pastas e acessórios. Os clientes pedem uma cotação pelo formulário; a equipa gere os pedidos numa área de gestão protegida por login. Os dados ficam numa base de dados [Supabase](https://supabase.com).

## Funcionalidades

- **Site público**: apresentação, catálogo (sob cotação), processo e formulário de pedido, com botão flutuante de WhatsApp.
- **Área de gestão** (só para a equipa autorizada):
  - lista de clientes e pedidos, com pesquisa e filtro por estado (Novo, Contactado, Qualificado, Fechado, Perdido);
  - criar, editar e apagar clientes, com notas de pré-atendimento;
  - botão "Contactar", que abre o WhatsApp ou o e-mail do cliente com mensagem pronta;
  - configuração do WhatsApp e e-mail da empresa.
- **Protecções**: campo anti-spam (honeypot), limite de envios no navegador, validação na base de dados e Row Level Security.

## Estrutura

```
index.html                         Página e área de gestão
css/styles.css                     Estilos
js/config.js                       URL e chave pública do Supabase
js/app.js                          Lógica do site e da gestão
supabase/migrations/*.sql          Esquema da base de dados e políticas de segurança
supabase/seed_staff.sql            Dar acesso de gestão a um utilizador
.github/workflows/pages.yml        Publicação automática no GitHub Pages
```

## Configuração

O projecto Supabase **GlosilyService** já está criado (região `eu-west-1`), com a migração aplicada e o `js/config.js` preenchido. Falta apenas o que só se faz no painel:

### 1. Criar a conta da equipa
1. **Authentication → Users → Add user**: e-mail e palavra-passe (marque "Auto confirm").
2. Edite o e-mail em `supabase/seed_staff.sql` e execute-o no **SQL Editor**. Só quem estiver na tabela `staff` entra na gestão.
3. **Authentication → Sign In / Providers → Email**: desligue **"Allow new users to sign up"**, para que ninguém se registe sozinho.

### 2. Definir os contactos da empresa
Entre na gestão → Configurações → preencha o WhatsApp (com indicativo, ex.: `258841234567`) e o e-mail.

### Recriar noutro projecto Supabase
Execute por ordem os ficheiros de `supabase/migrations/` e actualize `js/config.js` com o URL e a chave *anon public* (Project Settings → API). Nunca use a `service_role` no site.

## Publicar

O workflow `.github/workflows/pages.yml` publica o site no GitHub Pages a cada push em `main`.
Active em **Settings → Pages → Source: GitHub Actions**. O site fica em `https://zomarentregas-creator.github.io/GlosilyService/`.

Depois de ter o endereço final (ou um domínio próprio), em Supabase → **Authentication → URL Configuration** defina o *Site URL* para esse endereço.

## Segurança

| Quem | O que pode fazer |
| --- | --- |
| Visitante | Criar um pedido novo (estado "Novo", sem notas) e ler o WhatsApp/e-mail públicos da empresa |
| Equipa (`staff`) | Ler, criar, editar e apagar pedidos; alterar as configurações |
| Qualquer outra conta | Nada |

Os visitantes **não conseguem ler** os pedidos de ninguém. Tudo isto é imposto na base de dados (RLS), não apenas no navegador.

## Executar localmente

```bash
python3 -m http.server 8000
```

Abra http://localhost:8000. Usa o projecto Supabase configurado em `js/config.js`.

## Antes de lançar: lista de verificação

- [x] Projecto Supabase criado, migração aplicada e `config.js` preenchido
- [ ] Conta da equipa criada e registo público desligado
- [ ] WhatsApp e e-mail da empresa definidos
- [ ] Enviar um pedido de teste pelo site e confirmar que aparece na gestão
- [ ] Confirmar que, sem login, a gestão não abre
- [ ] Substituir as ilustrações por fotografias reais dos produtos
- [ ] (Recomendado) Domínio próprio e SMTP próprio no Supabase para e-mails de autenticação
