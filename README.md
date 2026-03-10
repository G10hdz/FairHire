# 💜 FairHire by Positronica Labs

![Deployed on Netlify](https://img.shields.io/badge/Deployed-Netlify-00C7B7?style=for-the-badge&logo=netlify)
![Bootstrapped with Lovable](https://img.shields.io/badge/Bootstrapped_with-Lovable-FF4F00?style=for-the-badge)
![Built with React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react)
![Powered by Claude](https://img.shields.io/badge/AI-Claude_3.5_Sonnet-D97757?style=for-the-badge&logo=anthropic)

🌎 **[ 🇺🇸 Read in English ](#english-version) | [ 🇲🇽 Leer en Español ](#versión-en-español)**

---

<a id="versión-en-español"></a>
## 🇲🇽 Versión en Español

**FairHire** es un analizador de *fit* laboral y brecha salarial de género impulsado por Inteligencia Artificial, diseñado específicamente para empoderar a las mujeres en México durante su búsqueda de empleo. 

Construido como el primer producto en producción para **Positronica Labs** durante el hackathon **SheBuilds on Lovable x 8M**.

🔗 **[Demo en Vivo](https://fairfit-ai.netlify.app)**

### 🎯 ¿Qué hace?
Las usuarias simplemente pegan la descripción de una vacante y el texto de su CV para obtener un análisis instantáneo y accionable:
* **Fit Score:** Una calificación visual (sobre 100) que evalúa el alineamiento con el rol.
* **Brecha de Habilidades:** Identificación clara de las *skills* faltantes para el puesto.
* **Contexto de Brecha Salarial:** Datos reales sobre la disparidad salarial de género para ese rol específico en México.
* **Estrategia de Negociación:** Tips personalizados para negociar el salario, basados en la experiencia de la candidata.
* **Carta de Presentación:** Un borrador generado por IA, altamente personalizado para la vacante y el perfil.

### 🛠️ Stack Tecnológico & Arquitectura
* **AI Code Generation:** Lovable (UI & Frontend Bootstrap).
* **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Vite.
* **Backend:** Netlify Serverless Functions (`netlify/functions/analyze.ts`).
* **Modelo de IA:** Anthropic `claude-sonnet-4-20250514` (Claude 3.5 Sonnet).
* **Despliegue:** Netlify (Auto-deploy desde la rama `main`).
* **Diseño:** Deep Purple (`#1a0533`), Electric Violet (`#7c3aed`), Rose Gold (`#e8b4b8`).

#### ⚡ El Reto Técnico: Superando el colapso de servidores
Durante el evento global de SheBuilds, los servidores de la plataforma principal colapsaron debido a la masiva demanda simultánea. Además, las políticas estrictas de CORS bloqueaban las llamadas directas desde el navegador a la API de Anthropic.

**La Solución:** Implementamos un pivote de arquitectura en tiempo real. Construimos un backend proxy utilizando **Netlify Serverless Functions**. El frontend ahora se comunica de forma segura con la función de Netlify, la cual custodia la `ANTHROPIC_API_KEY` en variables de entorno, limpia la respuesta JSON de Claude (eliminando el formato markdown residual) y devuelve los datos estructurados a la interfaz.

### 🚀 Desarrollo Local
1. `git clone https://github.com/G10hdz/fairfit-ai.git`
2. `cd fairfit-ai`
3. `npm install`
4. Crea un archivo `.env` en la raíz y agrega: `ANTHROPIC_API_KEY=tu_api_key_aqui`
5. `npx netlify dev --target-port 8080`

### 🛣️ Roadmap (v2)
- [ ] **Soporte Bilingüe:** Toggle para cambiar la interfaz y los prompts entre Español e Inglés.
- [ ] **Mejoras UI:** Animaciones más fluidas para el *Fit Score* circular.
- [ ] **Bring Your Own Key (BYOK):** Permitir a las usuarias ingresar su propia API Key de Anthropic.

---

<a id="english-version"></a>
## 🇺🇸 English Version

**FairHire** is an AI-powered job fit and gender pay gap analyzer designed specifically to empower women in Mexico during their job search. 

Built as the first production product for **Positronica Labs** during the **SheBuilds on Lovable x 8M** hackathon.

🔗 **[Live Demo](https://fairfit-ai.netlify.app)**

### 🎯 What does it do?
Users simply paste a job description and the text of their CV to receive an instant, actionable analysis:
* **Fit Score:** A visual rating (out of 100) that evaluates alignment with the role.
* **Skill Gap:** Clear identification of the missing skills required for the position.
* **Gender Pay Gap Context:** Real data on gender pay disparity for that specific role in Mexico.
* **Negotiation Strategy:** Personalized tips for negotiating salary based on the candidate’s experience.
* **Cover Letter:** An AI-generated draft, highly personalized for the job opening and candidate profile.

### 🛠️ Tech Stack & Architecture
* **AI Code Generation:** Lovable (UI & Frontend Bootstrap).
* **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Vite.
* **Backend:** Netlify Serverless Functions (`netlify/functions/analyze.ts`).
* **AI Model:** Anthropic `claude-sonnet-4-20250514` (Claude 3.5 Sonnet).
* **Deployment:** Netlify (Auto-deploy from the `main` branch).
* **Design:** Deep Purple (`#1a0533`), Electric Violet (`#7c3aed`), Rose Gold (`#e8b4b8`).

#### ⚡ The Technical Challenge: Overcoming server collapse
During the global SheBuilds event, the main platform’s servers collapsed due to massive simultaneous demand. Additionally, strict CORS policies blocked direct browser calls to the Anthropic API.

**The Solution:** We implemented a real-time architecture pivot. We built a backend proxy using **Netlify Serverless Functions**. The frontend now securely communicates with the Netlify function, which protects the `ANTHROPIC_API_KEY` in environment variables, cleans Claude’s JSON response (removing residual markdown formatting), and returns structured data to the interface.

### 🚀 Local Development
1. `git clone https://github.com/G10hdz/fairfit-ai.git`
2. `cd fairfit-ai`
3. `npm install`
4. Create a `.env` file in the root and add: `ANTHROPIC_API_KEY=your_api_key_here`
5. `npx netlify dev --target-port 8080`

### 🛣️ Roadmap (v2)
- [ ] **Bilingual Support:** Toggle to switch the interface and prompts between Spanish and English.
- [ ] **UI Improvements:** Smoother animations for the circular Fit Score.
- [ ] **Bring Your Own Key (BYOK):** Allow users to enter their own Anthropic API Key.

---
*Made with 💜 to help close the gender gap in tech.*