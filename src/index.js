import { onRequestPost as shipping } from "../functions/api/shipping.js";
import { onRequestPost as checkout } from "../functions/api/checkout.js";
import { onRequestPost as webhook } from "../functions/api/mercadopago-webhook.js";

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

    /*
     * APIs da Gomez
     */

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

    /*
     * Outras rotas /api
     */

    if (url.pathname.startsWith("/api/")) {
      return json(
        {
          error: "Rota da API não encontrada."
        },
        404
      );
    }

    /*
     * Todas as demais requisições:
     * HTML, CSS, JS, imagens etc.
     */

    return env.ASSETS.fetch(request);
  }
};
