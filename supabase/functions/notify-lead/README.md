# notify-lead — e-mail à equipa quando entra um pedido
Não está activo: precisa de uma conta Resend (resend.com) e de ser publicado por si.
1. Crie uma chave em Resend e verifique o domínio/e-mail remetente.
2. `supabase functions deploy notify-lead --no-verify-jwt`
3. `supabase secrets set RESEND_API_KEY=... NOTIFY_FROM="GlosilyService <pedidos@seudominio>" NOTIFY_TO=equipa@seudominio WEBHOOK_SECRET=uma-frase-longa-aleatoria`
4. No painel: Database → Webhooks → Create: tabela `leads`, evento `INSERT`, tipo HTTP Request (POST) para o URL da função, com o cabeçalho `x-webhook-secret` igual ao segredo acima.
5. Faça um pedido de teste no site e confirme que o e-mail chega.
