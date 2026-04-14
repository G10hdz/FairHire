# 💜 FairHire by Positronica Labs

![Deployed on Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify)
![Mirror on Vercel](https://img.shields.io/badge/Mirror-Vercel-000000?style=for-the-badge&logo=vercel)
![Built with React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react)
![Powered by Claude](https://img.shields.io/badge/AI-Claude_Sonnet_4-D97757?style=for-the-badge&logo=anthropic)
![Positronica Design System](https://img.shields.io/badge/Design-Positronica_C4B5E3?style=for-the-badge)

🌎 **[ 🇺🇸 Read in English ](#english-version) | [ 🇲🇽 Leer en Español ](#versión-en-español)**

🔗 **[Positronica Labs](https://positronicalabs.netlify.app/)** — AI for a fairer future.

---

<a id="versión-en-español"></a>
## 🇲🇽 Versión en Español

**FairHire** es un analizador de *fit* laboral y brecha salarial de género impulsado por Inteligencia Artificial, diseñado específicamente para empoderar a las mujeres en México durante su búsqueda de empleo.

Primer producto en producción de **Positronica Labs**. Rediseñado con el sistema de diseño **"The Clinical Sublime"** de Positronica Labs — estética luminosa, clínica y sin peso visual.

🔗 **[Demo en Vivo](https://fairfit-ai.netlify.app)**

### 🎯 ¿Qué hace?
Las usuarias simplemente pegan la descripción de una vacante y el texto de su CV para obtener un análisis instantáneo y accionable:
* **Onboarding guiado:** Modal paso a paso para nuevas usuarias — explica qué esperar antes de analizar.
* **Fit Score:** Una calificación visual (sobre 100) que evalúa el alineamiento con el rol.
* **Brecha de Habilidades:** Identificación clara de las *skills* faltantes para el puesto.
* **Contexto de Brecha Salarial:** Datos reales sobre la disparidad salarial de género para ese rol específico en México.
* **Estrategia de Negociación:** Tips personalizados para negociar el salario, basados en la experiencia de la candidata.
* **Carta de Presentación:** Un borrador generado por IA, altamente personalizado para la vacante y el perfil.
* **¿Cómo funciona?:** Sección colapsable en la interfaz que explica el proceso en 3 pasos — sin salir de la página.

### 🛠️ Stack Tecnológico & Arquitectura
* **AI Code Generation:** Lovable (UI & Frontend Bootstrap).
* **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Vite, i18next (ES/EN).
* **Backend:** Netlify Serverless Functions (`netlify/functions/`) — fuente de verdad. Mirror en Vercel (`api/`).
* **Modelo de IA:** Anthropic `claude-sonnet-4-20250514` (Claude Sonnet 4).
* **Despliegue primario:** Netlify (auto-deploy desde `main`) → https://fairfit-ai.netlify.app
* **Despliegue espejo:** Vercel (rama `main`) → https://fairhire-sigma.vercel.app
* **CI/CD:** GitHub Actions — code review automático y asistente de PR en cada pull request.
* **Diseño:** Positronica Labs "The Clinical Sublime" — Lavender `#C4B5E3`, Pink `#E8A0BF`, Green `#98FF98`. Glassmorphism, dot grid background, Orbitron + Space Grotesk + Inter fonts. "No-line" borders, luminous depth via tonal stacking.

#### ⚡ El Reto Técnico: Superando el colapso de servidores
Durante el evento global de SheBuilds, los servidores de la plataforma principal colapsaron debido a la masiva demanda simultánea. Además, las políticas estrictas de CORS bloqueaban las llamadas directas desde el navegador a la API de Anthropic.

**La Solución:** Implementamos un pivote de arquitectura en tiempo real. Construimos un backend proxy utilizando **Netlify Serverless Functions**. El frontend ahora se comunica de forma segura con la función de Netlify, la cual custodia la `ANTHROPIC_API_KEY` en variables de entorno, limpia la respuesta JSON de Claude (eliminando el formato markdown residual) y devuelve los datos estructurados a la interfaz.

### 📊 Datos Salariales INEGI-ENOE

FairHire integra datos oficiales de la **Encuesta Nacional de Ocupación y Empleo (ENOE)** del INEGI para proporcionar contexto salarial con perspectiva de género.

#### ¿Qué datos proporcionamos?
- **Brecha salarial nacional** por género (promedio trimestral)
- **Brecha por división ocupacional** SINCO (9 categorías principales)
- **Datos específicos de CDMX** con ajuste por entidad federativa
- **Muestra representativa** a nivel nacional con factor de expansión trimestral

#### Actualización de datos
Los datos ENOE son trimestrales. Para actualizar los benchmarks salariales:

```bash
# Actualizar automáticamente (descarga el trimestre más reciente)
./scripts/update-inegi-data.sh

# Actualizar con un trimestre específico
./scripts/update-inegi-data.sh --trimestre 2024-T4
```

El script:
1. Descarga el ZIP de ENOE desde el INEGI
2. Extrae los archivos SDEMT*.csv y COE1T*.csv
3. Ejecuta `process_enoe.py` para calcular brechas
4. Genera `netlify/functions/data/salary_benchmarks.json`
5. Crea un commit automático con los nuevos datos

**Requisitos:** Python 3.8+ con pandas (`pip install pandas`)

#### API de Benchmarks
Endpoint: `GET /.netlify/functions/inegi-benchmark`

```typescript
// Ejemplo: obtener datos nacionales
fetch('/.netlify/functions/inegi-benchmark')

// Ejemplo: obtener datos por ocupación (SINCO 2111 = Ingenieros en sistemas)
fetch('/.netlify/functions/inegi-benchmark?ocupacion=2111&entidad=09')
```

Response:
```typescript
{
  ocupacion?: string;
  salario_promedio_hombre: number;
  salario_promedio_mujer: number;
  brecha_porcentaje: number;
  fuente: string;
  trimestre: string;
  es_nacional: boolean;
  es_cdmx: boolean;
  muestra_suficiente: boolean;
}
```

**Caché HTTP:** 7 días (`Cache-Control: public, max-age=604800`)

#### Variables de entorno
| Variable | Descripción | Default |
|----------|-------------|---------|
| `INEGI_DATA_PATH` | Ruta al JSON de benchmarks | `./netlify/functions/data/salary_benchmarks.json` |
| `ENABLE_INEGI_CACHE` | Habilitar caché HTTP | `true` |

### 🚀 Desarrollo Local
1. `git clone https://github.com/G10hdz/fairfit-ai.git`
2. `cd fairfit-ai`
3. `npm install`
4. Crea un archivo `.env` en la raíz y agrega: `ANTHROPIC_API_KEY=tu_api_key_aqui`
5. Con Netlify: `npx netlify dev --target-port 8080`  
   Con Vercel: `vercel dev`

### 🛣️ Roadmap
- [x] **Soporte Bilingüe:** Toggle ES/EN — interfaz y prompts completamente traducidos.
- [x] **Datos INEGI-ENOE:** Benchmarks salariales con perspectiva de género por ocupación y entidad.
- [x] **Onboarding:** Modal guiado para nuevas usuarias.
- [x] **Deploy dual:** Netlify (primario) + Vercel (espejo).
- [x] **Rediseño Positronica:** Glassmorphism, dot grid, Orbitron + Space Grotesk, "no-line" borders.
- [x] **Bring Your Own Key (BYOK):** Toggle en el nav para usar tu propia API key de Anthropic.

---

<a id="english-version"></a>
## 🇺🇸 English Version

**FairHire** is an AI-powered job fit and gender pay gap analyzer designed specifically to empower women in Mexico during their job search. 

Built as the first production product for **Positronica Labs**. Redesigned with the **"The Clinical Sublime"** design system from Positronica Labs — a luminous, clinical, weightless aesthetic.

🔗 **[Positronica Labs](https://positronicalabs.netlify.app/)**

### 🎯 What does it do?
Users simply paste a job description and the text of their CV to receive an instant, actionable analysis:
* **Guided Onboarding:** Step-by-step modal for first-time users — sets expectations before the analysis runs.
* **Fit Score:** A visual rating (out of 100) that evaluates alignment with the role.
* **Skill Gap:** Clear identification of the missing skills required for the position.
* **Gender Pay Gap Context:** Real data on gender pay disparity for that specific role in Mexico.
* **Negotiation Strategy:** Personalized tips for negotiating salary based on the candidate’s experience.
* **Cover Letter:** An AI-generated draft, highly personalized for the job opening and candidate profile.
* **How It Works:** Collapsible 3-step explainer embedded in the UI — no need to leave the page.

### 🛠️ Tech Stack & Architecture
* **AI Code Generation:** Lovable (UI & Frontend Bootstrap).
* **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Vite, i18next (ES/EN).
* **Backend:** Netlify Serverless Functions (`netlify/functions/`) — source of truth. Mirrored on Vercel (`api/`).
* **AI Model:** Anthropic `claude-sonnet-4-20250514` (Claude Sonnet 4).
* **Primary Deployment:** Netlify (auto-deploy from `main`) → https://fairfit-ai.netlify.app
* **Mirror Deployment:** Vercel (`main` branch) → https://fairhire-sigma.vercel.app
* **CI/CD:** GitHub Actions — automated code review and PR assistant on every pull request.
* **Design:** Positronica Labs "The Clinical Sublime" — Lavender `#C4B5E3`, Pink `#E8A0BF`, Green `#98FF98`. Glassmorphism cards, dot grid background, Orbitron + Space Grotesk + Inter fonts. No-line borders, luminous depth via tonal stacking.

#### ⚡ The Technical Challenge: Overcoming server collapse
During the global SheBuilds event, the main platform's servers collapsed due to massive simultaneous demand. Additionally, strict CORS policies blocked direct browser calls to the Anthropic API.

**The Solution:** We implemented a real-time architecture pivot. We built a backend proxy using **Netlify Serverless Functions**. The frontend now securely communicates with the Netlify function, which protects the `ANTHROPIC_API_KEY` in environment variables, cleans Claude's JSON response (removing residual markdown formatting), and returns structured data to the interface.

### 📊 INEGI-ENOE Salary Data

FairHire integrates official data from the **National Survey of Occupation and Employment (ENOE)** by INEGI to provide salary context with a gender perspective.

#### What data do we provide?
- **National gender pay gap** (quarterly average)
- **Pay gap by SINCO occupational division** (9 main categories)
- **CDMX-specific data** with state-level adjustment
- **Nationally representative sample** with quarterly expansion factor

#### Updating data
ENOE data is quarterly. To update salary benchmarks:

```bash
# Auto-update (downloads latest quarter)
./scripts/update-inegi-data.sh

# Update with specific quarter
./scripts/update-inegi-data.sh --trimestre 2024-T4
```

The script:
1. Downloads ENOE ZIP from INEGI
2. Extracts SDEMT*.csv and COE1T*.csv files
3. Runs `process_enoe.py` to calculate gaps
4. Generates `netlify/functions/data/salary_benchmarks.json`
5. Creates automatic commit with new data

**Requirements:** Python 3.8+ with pandas (`pip install pandas`)

#### Benchmarks API
Endpoint: `GET /.netlify/functions/inegi-benchmark`

```typescript
// Example: get national data
fetch('/.netlify/functions/inegi-benchmark')

// Example: get data by occupation (SINCO 2111 = Systems Engineers)
fetch('/.netlify/functions/inegi-benchmark?ocupacion=2111&entidad=09')
```

Response:
```typescript
{
  ocupacion?: string;
  salario_promedio_hombre: number;
  salario_promedio_mujer: number;
  brecha_porcentaje: number;
  fuente: string;
  trimestre: string;
  es_nacional: boolean;
  es_cdmx: boolean;
  muestra_suficiente: boolean;
}
```

**HTTP Cache:** 7 days (`Cache-Control: public, max-age=604800`)

#### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `INEGI_DATA_PATH` | Path to benchmarks JSON | `./netlify/functions/data/salary_benchmarks.json` |
| `ENABLE_INEGI_CACHE` | Enable HTTP cache | `true` |

### 🚀 Local Development
1. `git clone https://github.com/G10hdz/fairfit-ai.git`
2. `cd fairfit-ai`
3. `npm install`
4. Create a `.env` file in the root and add: `ANTHROPIC_API_KEY=your_api_key_here`
5. With Netlify: `npx netlify dev --target-port 8080`  
   With Vercel: `vercel dev`

### 🛣️ Roadmap
- [x] **Bilingual Support:** ES/EN toggle — fully translated interface and prompts.
- [x] **INEGI-ENOE Data:** Gender-aware salary benchmarks by occupation and state.
- [x] **Onboarding:** Guided modal for first-time users.
- [x] **Dual Deploy:** Netlify (primary) + Vercel (mirror).
- [x] **Positronica Redesign:** Glassmorphism, dot grid, Orbitron + Space Grotesk, "no-line" borders.
- [x] **Bring Your Own Key (BYOK):** Nav toggle to use your own Anthropic API key.

---
*Made with 💜 to help close the gender gap in tech.*
