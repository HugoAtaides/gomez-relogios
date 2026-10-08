import { onRequestPost as shipping } from "../functions/shipping.js";
import { onRequestPost as checkout } from "../functions/checkout.js";
import { onRequestPost as webhook } from "../functions/mercadopago-webhook.js";

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ============================
    // API DE FRETE
    // ============================
    if (
      url.pathname === "/api/shipping" &&
      request.method === "POST"
    ) {
      return shipping({
        request,
        env,
        ctx
      });
    }

    // ============================
    // CHECKOUT MERCADO PAGO
    // ============================
    if (
      url.pathname === "/api/checkout" &&
      request.method === "POST"
    ) {
      return checkout({
        request,
        env,
        ctx
      });
    }

    // ============================
    // WEBHOOK MERCADO PAGO
    // ============================
    if (
      url.pathname === "/api/mercadopago-webhook" &&
      request.method === "POST"
    ) {
      return webhook({
        request,
        env,
        ctx
      });
    }

    // ============================
    // OUTRAS ROTAS /api
    // ============================
    if (url.pathname.startsWith("/api/")) {
      return json(
        {
          error: "Rota da API não encontrada."
        },
        404
      );
    }

    // ============================
    // SITE
    // ============================
    return env.ASSETS.fetch(request);
  }
};
