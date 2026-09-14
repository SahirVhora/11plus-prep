# Grammar Journey - A calm 11+ companion

A private, low-screen-time companion for a Year 5 journey alongside AE Tuition's FGP36 classroom course. The app organises the year, gives one short mostly-off-screen mission a day, records homework and assessment evidence, and keeps target-school decisions visible without pretending to predict admission.

## Family workflow

- **Today:** one eight-to-ten-minute English, maths, verbal-reasoning or non-verbal-reasoning mission. The activity moves away from the screen after three clear instructions and ends with a simple confidence check.
- **Year Journey:** all 40 FGP36 Sundays, AE checkpoints and the current routes for the Slough Consortium, The Tiffin Girls' School, Kendrick School and the Sutton girls' schools.
- **Parent Desk:** local-only family profile, homework list, assessment history, school shortlist, calendar download and JSON backup/restore.
- **Practice:** the existing regional quiz engine remains available for deliberate longer sessions.

The AE books remain the main programme. This app is intentionally a planning and habit layer, not a replacement tuition course or an endless question feed.

## Privacy and reminder behaviour

- Planning information is held in browser `localStorage`; the app does not collect a learner's name and has no login, child account, analytics pipeline or cloud sync.
- Use **Export backup** before changing device/browser or clearing site data.
- The `.ics` download contains all 40 sessions and works with calendar alerts even when the site is closed.
- Browser notifications require permission and only work while the app is active. The interface states this limitation before permission is requested.
- Postcode checking is preliminary and conservative. Ambiguous Kendrick postcode districts return “confirm the full sector” rather than claiming eligibility.
- Admissions policies can change. Follow the official school links in the Year Journey before applying.

## 🌟 Key Features

### 🗺️ Region-Specific Preparation

The platform recognizes that 11+ exams vary significantly by region. It includes dedicated question banks and validation for:

- **Regional Boards:** Birmingham, Buckinghamshire, Essex, Hertfordshire, Kent, Lancashire, Lincolnshire, Manchester, Northern Ireland, Warwickshire, and Yorkshire.
- **Core Subjects:** English, Maths, Verbal Reasoning, and Non-Verbal Reasoning.
- **Regional Intelligence:** Integrated region info panels and validators to ensure students are studying the correct material for their area.

### ✍️ Interactive Quiz Engine

- **Smart Sampling:** Dynamic question sampling to provide a fresh experience in every session.
- **Performance Tracking:** Real-time progress monitoring with a custom quiz timer.
- **Weak Area Analysis:** Built-in logic to analyze scores and identify specific areas where the student needs more focus.
- **Adaptive Difficulty:** Visual badges to categorize question difficulty levels.

### 📄 Study Tooling

- **PDF Generation:** Ability to generate printable versions of questions and results using `jspdf` and `html2canvas`.
- **AI-Powered Content:** Secure server-side adapters for OpenAI, Claude, DeepSeek, Gemini, OpenRouter Free and Groq.

## 🛠️ Technical Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Key Libraries:**
  - `react-router-dom` for seamless page navigation.
  - `jspdf` & `html2canvas` for document generation.
  - Provider REST APIs behind a Vercel serverless boundary for AI generation.

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Full quality check

```bash
npm run check
```

This runs linting, model/content tests, all regional-data validators, TypeScript compilation and the production build.

### Secure AI service

The GitHub Pages frontend never receives provider credentials. Deploy the repository's `api/` directory on Vercel, add a long private `WORKSHEET_ACCESS_CODE` plus one or more server-only provider environment variables from `.env.example`, then set the GitHub repository variable `VITE_AI_API_URL` to that Vercel origin.

Supported server secrets are `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY` and `GROQ_API_KEY`. Configure only the providers the family intends to use. Never create a `VITE_` version of a secret - Vite variables are public browser code.

The family enters the access code in AI Practice; it is kept only for the browser session and is not a provider credential. The API checks that code, restricts browser origins, caps AI papers at 30 questions, times out stalled providers, validates every returned question and exposes provider availability without exposing credentials. Free Practice stays available without this service. For additional cost protection, set a request-rate rule for `/api/generate-questions` in the hosting dashboard.

### Utility Commands

To validate the regional data integrity:

```bash
npm run validate-regions
```

## 📂 Project Structure

- `api`: provider routing, server-held credentials, CORS controls and generated-question validation.
- `src/api/aiCatalog.ts`: the reviewed provider/model catalogue shown in the interface.
- `src/features/journey`: FGP36 dates, missions, school routes, local-state model and browser exports.
- `src/pages/Home.tsx`: focused child-facing daily mission.
- `src/pages/Journey.tsx`: year map, milestones, target schools and the 40-session calendar.
- `src/pages/ParentDesk.tsx`: parent planning, evidence and backup tools.
- `tests/journey-*.test.mjs`: schedule, postcode, import, content and offline-shell regression tests.
- `src/data/questions`: JSON-based question banks partitioned by region and subject.
- `src/hooks`: Custom hooks for timer management, quiz logic, and score analysis.
- `src/utils`: Core logic for PDF generation and regional validation.
- `src/components`: Modular UI components split by functionality (Quiz, Home, Region, Shared).

## Release validation checklist

1. Run `npm run check` and confirm every phase passes.
2. Open the Today page at desktop and phone widths; confirm no horizontal overflow.
3. Complete a mission with each confidence choice and confirm the completion screen has no additional feed.
4. In Parent Desk, verify blank homework and a score greater than its total are rejected.
5. Save `TW13`, open Year Journey and confirm Kendrick is presented as outside the currently published designated area, with an official-policy caveat.
6. Export a backup, import it in a clean browser profile and verify records and selected schools return.
7. Import malformed or oversized JSON and confirm it is rejected without replacing current data.
8. Import the FGP36 calendar into a test calendar and confirm 40 Sunday events with reminders.
9. Install the production build and verify the cached app shell opens offline. Dynamic data never depends on the network.
10. With a test provider key on the server, confirm provider availability, a valid AI paper, a mixed paper and automatic Free Practice fallback after a simulated `429`.

## Staged Learning Plan

See [docs/staged-learning-plan.md](docs/staged-learning-plan.md) for a parent-friendly progression from diagnostic baseline through regional alignment and timed exam conditioning. This gives the existing quiz engine a clearer learning path without changing core behaviour.

---

## More free learning tools

- [StarLearn](https://sahirvhora.github.io/starlearn/) - Free UK primary learning platform - Years 4-6, 494 topics
- [Year 4 Prep](https://sahirvhora.github.io/year4-prep/) - Free Year 4 SATs practice papers - 36 PDFs, updated weekly
- [Worksheet Generator](https://sahirvhora.github.io/worksheet-generator/) - Printable SATs-style worksheets - KS1/KS2 Maths, Reading, SPaG
- [PassMate UK](https://sahirvhora.github.io/passmate-uk/) - Free UK car theory test practice - 304 questions, works offline
- [Nobel Explorer](https://sahirvhora.github.io/nobel-explorer/) - Explore 1,026 Nobel laureates - search, timeline, map, quiz
