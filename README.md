# 🎓 11+ Prep - Interactive Learning Platform

A comprehensive, region-specific exam preparation platform designed to help students master the 11+ entrance exams. This application provides a structured, interactive environment for practicing core subjects and region-specific patterns.

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
- **AI-Powered Content:** Integrated with the Anthropic SDK for generating high-quality practice questions.

## 🛠️ Technical Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **Key Libraries:**
  - `react-router-dom` for seamless page navigation.
  - `jspdf` & `html2canvas` for document generation.
  - `@anthropic-ai/sdk` for AI-driven content generation.

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

### Utility Commands
To validate the regional data integrity:
```bash
npm run validate-regions
```

## 📂 Project Structure
- `src/data/questions`: JSON-based question banks partitioned by region and subject.
- `src/hooks`: Custom hooks for timer management, quiz logic, and score analysis.
- `src/utils`: Core logic for PDF generation and regional validation.
- `src/components`: Modular UI components split by functionality (Quiz, Home, Region, Shared).

## Staged Learning Plan

See [docs/staged-learning-plan.md](docs/staged-learning-plan.md) for a parent-friendly progression from diagnostic baseline through regional alignment and timed exam conditioning. This gives the existing quiz engine a clearer learning path without changing core behaviour.

---

## More free learning tools

- [StarLearn](https://sahirvhora.github.io/starlearn/) - Free UK primary learning platform - Years 4-6, 494 topics
- [Year 4 Prep](https://sahirvhora.github.io/year4-prep/) - Free Year 4 SATs practice papers - 36 PDFs, updated weekly
- [Worksheet Generator](https://sahirvhora.github.io/worksheet-generator/) - Printable SATs-style worksheets - KS1/KS2 Maths, Reading, SPaG
- [PassMate UK](https://sahirvhora.github.io/passmate-uk/) - Free UK car theory test practice - 304 questions, works offline
- [Nobel Explorer](https://sahirvhora.github.io/nobel-explorer/) - Explore 1,026 Nobel laureates - search, timeline, map, quiz
