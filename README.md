# Receipt Roast

MVP de una web app que recibe la foto de un **ticket o extracto**, extrae los gastos con un modelo de visión (xAI / Grok) y genera un **roast sarcástico** (o coach sarcástico) más un **insight útil**. Al final puedes generar una **tarjeta PNG** para compartir.

> Diseño mobile-first, contraste alto, dark + acento “ember”. Sin login, sin base de datos, sin historial. Las imágenes se procesan **en memoria** y **no se guardan**.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- API de **xAI** (compatible con OpenAI) en `https://api.x.ai/v1`
- `html-to-image` para la tarjeta de compartir

## Requisitos

- Node.js 18+
- npm 9+
- (Opcional) API key de xAI → [console.x.ai](https://console.x.ai/)

## Instalación

```bash
unzip receipt-roast.zip
cd receipt-roast
npm install
```

## Variables de entorno

Copia la plantilla y edita:

```bash
cp .env.example .env.local
```

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `XAI_API_KEY` | Para modo real | API key de xAI. Solo se lee en el servidor. |
| `DEMO_MODE` | No | Si es `true`, usa datos mock aunque haya key. |
| `XAI_VISION_MODEL` | No | Modelo para extracción con visión. Default: `grok-4`. |
| `XAI_TEXT_MODEL` | No | Modelo para el roast + insight. Default: `grok-4`. |

**Nunca** pongas la key en el código fuente ni la subas a git. `.env*` está en `.gitignore` (excepto `.env.example`).

## Modo demo

Si **no** hay `XAI_API_KEY` (o si `DEMO_MODE=true`), el backend responde con un roast de ejemplo realista. Sirve para probar la UI completa sin gastar créditos.

```bash
# Sin .env.local → demo automático
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000), elige un modo y sube **cualquier** JPG/PNG.

## Desarrollo

```bash
npm run dev
```

## Build de producción

```bash
npm run build
npm start
```

## Flujo de la app (3 pantallas)

1. **Inicio** — logo, tagline, selector Roast Duro / Coach Sarcástico, botón grande de subida (JPG/PNG).
2. **Procesando** — frases rotativas tipo “Analizando tus decisiones financieras…”.
3. **Resultado** — roast grande, recuadro de insight útil, desglose de gastos, “Generar tarjeta para compartir”, “Probar otro ticket”.

### Pipeline del API (`POST /api/roast`)

1. Valida imagen en memoria (tipo + tamaño).
2. Si demo → mock y listo.
3. Visión → JSON `{ expenses, categories, total, isReceipt, … }`.
4. Si no es un ticket → error amigable.
5. Texto → JSON `{ roast, insight }` según el modo.
6. La imagen **no** se escribe a disco.

## Personalidades

- **Roast Duro** — comediante de stand-up, sarcástico, humor negro elegante.
- **Coach Sarcástico** — igual de irónico, menos agresivo, consejo disfrazado de broma.

Regla de seguridad: se roastan **hábitos de gasto**, nunca la identidad ni atributos protegidos. Los prompts viven en un solo archivo: [`src/lib/prompts.ts`](src/lib/prompts.ts). Ver también [`PROMPTS.md`](PROMPTS.md).

## Ajustar los prompts

1. Edita `src/lib/prompts.ts`.
2. Reinicia `npm run dev` (el servidor lee el archivo en cada request en dev).
3. Documenta el cambio en `PROMPTS.md` si quieres dejar constancia.

## Estructura

```
src/
  app/
    api/roast/route.ts   # Endpoint de visión + roast
    layout.tsx
    page.tsx
    globals.css
  components/
    ReceiptRoastApp.tsx  # Orquestador de pasos
    HomeScreen.tsx
    LoadingScreen.tsx
    ResultScreen.tsx
    ModeSelector.tsx
    ShareCard.tsx        # Tarjeta 1080×1350 para PNG
  lib/
    prompts.ts           # Todos los prompts
    xai.ts               # Cliente xAI
    demo.ts              # Mock del modo demo
    types.ts
    parse.ts
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Sirve el build |
| `npm run lint` | ESLint |

## Fuera de este MVP

Login, historial, base de datos, app nativa, pagos, múltiples tickets a la vez.

## Licencia

Uso libre para el MVP. Ajusta a tu gusto.
