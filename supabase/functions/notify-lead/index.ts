// Envia um e-mail à equipa quando entra um pedido novo (via Resend). Ver README.md desta pasta.
Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) return new Response("forbidden", { status: 403 });
  const { record: r } = await req.json();
  if (!r) return new Response("no record", { status: 400 });
  const text = [`Novo pedido ${r.track_code}`, `Nome: ${r.name}`, `Telefone: ${r.phone}`, `E-mail: ${r.email ?? "-"}`,
    `Produto: ${r.product} (${r.quantity ?? "-"})`, `Canal preferido: ${r.channel}`, `Detalhes: ${r.message ?? "-"}`].join("\n");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: Deno.env.get("NOTIFY_FROM"), to: [Deno.env.get("NOTIFY_TO")], subject: `Novo pedido ${r.track_code}: ${r.product}`, text }),
  });
  return new Response(res.ok ? "ok" : await res.text(), { status: res.ok ? 200 : 502 });
});
