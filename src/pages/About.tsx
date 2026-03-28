import { useState } from 'react';
import { REGIONS } from '../data/regions';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left flex items-center justify-between gap-4 font-bold text-primary dark:text-blue-300 text-lg"
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="text-secondary text-xl">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-4 text-gray-600 dark:text-slate-300 space-y-3 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}

export function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-primary dark:text-blue-300 mb-3">About the 11+</h1>
        <p className="text-gray-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
          Everything you need to know about preparing your child for UK grammar school entry.
        </p>
      </div>

      <AccordionItem title="📚 What is the 11+ exam?" defaultOpen>
        <p>
          The 11+ is an entrance exam taken by children in Year 6 (aged 10–11) to gain entry into
          selective grammar schools across the UK. Different regions use different exam boards —
          the most common are <strong>GL Assessment</strong>, <strong>CEM</strong>, <strong>AQE</strong> (Northern Ireland),
          and <strong>CSSE</strong> (Essex).
        </p>
        <p>Subjects tested vary by region, but commonly include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Maths</strong> — arithmetic, algebra, geometry, data handling</li>
          <li><strong>English</strong> — comprehension, grammar, vocabulary, spelling</li>
          <li><strong>Verbal Reasoning</strong> — word patterns, codes, sequences, analogies</li>
          <li><strong>Non-Verbal Reasoning</strong> — shape patterns, matrices, spatial reasoning</li>
        </ul>
        <p>
          Papers are typically 45–50 minutes each, often in multiple-choice format.
          Some regions (e.g. Warwickshire, Essex) also include a written English component.
          Always check your target school's admissions page for exact requirements.
        </p>
      </AccordionItem>

      <AccordionItem title="📅 Preparation Timeline">
        <div className="space-y-4">
          {[
            { period: 'Year 4 (age 8–9)', text: 'Begin familiarisation with exam format. Focus on keeping up with school maths and reading widely.' },
            { period: 'Year 5 (age 9–10)', text: 'Start structured practice. Work through all four subjects. Take timed practice papers. Identify weak areas.' },
            { period: 'Year 6 September', text: '11+ exams take place — usually in early September of Year 6. Some schools test in late September.' },
            { period: 'October–November', text: 'Results announced. Offers for grammar school places confirmed in early March via local authority.' },
            { period: 'March Year 6', text: 'Secondary school offers received. Grammar school places confirmed on National Offer Day (1 March).' },
          ].map(({ period, text }) => (
            <div key={period} className="flex gap-4">
              <div className="font-bold text-primary dark:text-blue-400 min-w-[130px]">{period}</div>
              <div>{text}</div>
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem title="🗺️ UK Grammar School Regions">
        <p>This site covers 12 regions across the UK. Select your region in the quiz setup to see schools and exam board details tailored to your area.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          {REGIONS.map((region) => (
            <div key={region.id} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-xl">{region.flag}</span>
              <div>
                <p className="text-sm font-semibold text-primary dark:text-blue-300">{region.name}</p>
                <p className="text-xs text-gray-400">{region.examBoards.join(' / ')} · {region.subjects.length} subjects</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400">
          * Entry requirements vary by school and region. Always check the individual school's admissions page for current requirements.
        </p>
      </AccordionItem>

      <AccordionItem title="💡 How to use this site">
        <p><strong>Free Mode</strong> uses our bank of 370+ hand-crafted questions aligned with the GL Assessment style:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Select a subject and difficulty</li>
          <li>Complete the quiz (with or without a timer)</li>
          <li>Review all answers and explanations immediately</li>
          <li>Download a printable PDF paper for pen-and-paper practice</li>
          <li>Track weak areas across sessions</li>
        </ul>
        <p><strong>AI Mode</strong> uses Claude (Anthropic) to generate fresh questions every time:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Add your Anthropic API key in ⚙️ Settings</li>
          <li>Each quiz generates unique, never-repeated questions</li>
          <li>Questions adapt to your chosen difficulty level</li>
        </ul>
      </AccordionItem>

      <AccordionItem title="📄 Free external resources">
        <ul className="space-y-2">
          {[
            { name: 'GL Assessment — Free Familiarisation Papers', href: 'https://www.gl-assessment.co.uk/support/familiarisation-materials/' },
            { name: 'Bond 11+ — Free Sample Papers', href: 'https://www.bond11plus.co.uk/free-papers' },
            { name: 'SATs Papers (Maths & English)', href: 'https://www.satspapers.co.uk' },
            { name: 'BBC Bitesize KS2', href: 'https://www.bbc.co.uk/bitesize/levels/zbr9wmk' },
          ].map(({ name, href }) => (
            <li key={name}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary dark:text-blue-400 hover:underline font-medium"
              >
                {name} ↗
              </a>
            </li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem title="⚖️ Disclaimer">
        <p>
          This is an independent preparation tool created to help children practise for the 11+ exam.
          It is <strong>not affiliated with</strong> GL Assessment, any grammar school, any local authority,
          or any official examination board.
        </p>
        <p>
          All question content is original and created for practice purposes only. While we aim for
          accuracy and alignment with the GL Assessment style, we make no guarantee that content exactly
          matches actual exam questions.
        </p>
        <p>
          Always consult your target school's official admissions guidance for current entry requirements.
        </p>
      </AccordionItem>
    </div>
  );
}
