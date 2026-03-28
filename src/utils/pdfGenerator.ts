import { jsPDF } from 'jspdf';
import type { Question } from '../data/metadata';
import type { QuizConfig } from '../hooks/useQuiz';
import { DIFFICULTY_LABELS } from '../data/metadata';
import { getRegionById } from '../data/regions';

interface PdfConfig {
  questions: Question[];
  quizConfig: QuizConfig;
  includeAnswers?: boolean;
}

export async function generatePaper({ questions, quizConfig, includeAnswers = false }: PdfConfig): Promise<void> {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const subjectLabel = quizConfig.subject === 'mixed'
    ? 'Mixed Paper'
    : quizConfig.subject.charAt(0).toUpperCase() + quizConfig.subject.slice(1);
  const diffLabel = DIFFICULTY_LABELS[typeof quizConfig.difficulty === 'number' ? quizConfig.difficulty : 2];
  const region = quizConfig.regionId ? getRegionById(quizConfig.regionId) : undefined;
  const regionLabel = region ? region.name : 'London';
  const examBoardLabel = region ? region.examBoards.join(' / ') : 'GL Assessment';

  // ── Helper fns ────────────────────────────────────────────
  function checkNewPage(needed = 20) {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function addWrappedText(text: string, fontSize: number, indent = 0) {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(text, contentW - indent);
    checkNewPage(lines.length * (fontSize * 0.4 + 1.5) + 5);
    for (const line of lines) {
      doc.text(line, margin + indent, y);
      y += fontSize * 0.4 + 1.5;
    }
    y += 2;
  }

  function drawRule(color: [number,number,number] = [200,200,200]) {
    doc.setDrawColor(...color);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  }

  // ── Cover Page ────────────────────────────────────────────
  // Header bar
  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageW, 35, 'F');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('11+ Practice Paper', margin, 15);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`11PlusPrep.co.uk — ${regionLabel} 11+ Practice — ${examBoardLabel}`, margin, 25);

  y = 45;
  doc.setTextColor(0, 0, 0);

  // Info grid
  const fields = [
    ['Region', regionLabel],
    ['Exam Board', examBoardLabel],
    ['Subject', subjectLabel],
    ['Difficulty', diffLabel],
    ['Questions', String(questions.length)],
    ['Time Allowed', `${Math.round(questions.length * 1.5)} minutes (approx.)`],
  ];
  for (const [label, value] of fields) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 40, y);
    y += 7;
  }

  y += 5;
  // Name / date fields
  doc.setFontSize(11);
  doc.text('Name: ___________________________________', margin, y); y += 8;
  doc.text('Date: ___________________  School: ___________________________', margin, y); y += 12;

  drawRule([30, 58, 95]);

  // Instructions
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Instructions:', margin, y); y += 6;
  doc.setFont('helvetica', 'normal');
  const instructions = [
    '• Circle or underline your chosen answer for each question.',
    '• Work through the paper quickly — do not spend too long on one question.',
    '• If unsure, make your best guess and move on.',
    '• Check your work carefully if you finish early.',
  ];
  for (const inst of instructions) {
    addWrappedText(inst, 10);
  }
  y += 4;
  drawRule();

  // ── Questions ─────────────────────────────────────────────
  let lastContext = '';
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    checkNewPage(40);

    // Print context/passage once per group
    if (q.context && q.context !== lastContext) {
      y += 3;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bolditalic');
      doc.setTextColor(60, 60, 60);
      doc.text('Read the following passage, then answer the questions below:', margin, y);
      y += 5;
      doc.setFillColor(245, 245, 250);
      const passageLines = doc.splitTextToSize(q.context, contentW - 8);
      const boxH = passageLines.length * 4.5 + 8;
      checkNewPage(boxH + 10);
      doc.rect(margin, y, contentW, boxH, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      let py = y + 5;
      for (const line of passageLines) {
        doc.text(line, margin + 4, py);
        py += 4.5;
      }
      y += boxH + 5;
      lastContext = q.context;
    }

    // Question number + text
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text(`Q${i + 1}.`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const qLines = doc.splitTextToSize(q.question, contentW - 12);
    checkNewPage(qLines.length * 5 + 20);
    for (const line of qLines) {
      doc.text(line, margin + 10, y);
      y += 5;
    }
    y += 2;

    // Options — 2-per-row layout
    if (q.options && q.options.length > 0) {
      const colW = contentW / 2;
      for (let oi = 0; oi < q.options.length; oi++) {
        const col = oi % 2;
        const row = Math.floor(oi / 2);
        if (col === 0 && row > 0) y += 0;
        const x = margin + 10 + col * colW;
        const oy = col === 0 ? y : y;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`[ ]  ${q.options[oi]}`, x, oy);
        if (col === 1 || oi === q.options.length - 1) y += 6;
      }
    }
    y += 6;

    if (i < questions.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y - 2, pageW - margin, y - 2);
    }
  }

  // ── Answer Sheet (Page 2) ──────────────────────────────────
  doc.addPage();
  y = margin;

  doc.setFillColor(30, 58, 95);
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Answer Sheet', margin, 14);
  y = 30;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Circle the letter of your chosen answer for each question.', margin, y); y += 8;

  const colSize = contentW / 5;
  const letterOptions = ['A', 'B', 'C', 'D', 'E'];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const row = Math.floor(i / 5);
    const col = i % 5;
    const cx = margin + col * colSize;
    const cy = y + row * 14;

    if (cy + 14 > pageH - margin) {
      doc.addPage();
      y = margin + 10;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Q${i + 1}`, cx, y + row * 14);

    const opts = q.options ? Math.min(q.options.length, 5) : 4;
    for (let li = 0; li < opts; li++) {
      doc.setFont('helvetica', 'normal');
      const letter = letterOptions[li];
      const lx = cx + 8 + li * 8;
      doc.circle(lx, y + row * 14 - 1.5, 2.5, 'S');
      doc.text(letter, lx - 1.2, y + row * 14 - 0.2);
    }
  }

  // ── Answers Page (optional) ──────────────────────────────
  if (includeAnswers) {
    y = (Math.ceil(questions.length / 5)) * 14 + margin + 30;
    checkNewPage(30);
    y += 10;
    drawRule([30, 58, 95]);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Answers & Explanations', margin, y); y += 8;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      checkNewPage(25);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 95);
      doc.text(`Q${i + 1}. Answer: ${q.answer}`, margin, y); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      addWrappedText(q.explanation, 9);
    }
  }

  // Footer on each page
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `11PlusPrep.co.uk | Page ${p} of ${totalPages} | Not affiliated with GL Assessment or any grammar school`,
      pageW / 2,
      pageH - 8,
      { align: 'center' }
    );
  }

  const regionSlug = regionLabel.toLowerCase().replace(/\s+/g, '-');
  doc.save(`11plus-${regionSlug}-${subjectLabel.toLowerCase().replace(/\s+/g, '-')}-paper.pdf`);
}
