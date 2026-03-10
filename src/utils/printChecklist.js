import { PUNCH_LIST_SECTIONS, PUNCH_LIST_INTRO, PUNCH_LIST_NOTES } from '../data/punchListData';

const STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 10pt; color: #1e2e22; padding: 24px 32px; }
  .brand { font-size: 8pt; color: #668c66; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
  h1 { font-size: 20pt; color: #335a3a; margin-bottom: 2px; }
  .subtitle { font-size: 10pt; color: #668c66; margin-bottom: 4px; }
  .print-date { font-size: 8pt; color: #8faf9a; margin-bottom: 20px; border-bottom: 1px solid #d8d2c8; padding-bottom: 12px; }
  .progress { font-size: 9pt; color: #335a3a; font-style: italic; margin-bottom: 14px; }
  .item { display: flex; align-items: flex-start; gap: 7px; margin: 4px 0; line-height: 1.45; }
  .cb { width: 11px; height: 11px; border: 1.5px solid #335a3a; border-radius: 2px; flex-shrink: 0; margin-top: 1px; }
  .cb.done { background: #335a3a; position: relative; }
  .cb.done::after { content: ''; position: absolute; left: 2px; top: -1px; width: 5px; height: 8px; border: 1.5px solid white; border-left: none; border-top: none; transform: rotate(45deg); }
  .item-text { flex: 1; }
  .item-text.done { text-decoration: line-through; color: #8faf9a; }
  /* Generic checklist */
  .list-section { margin-bottom: 6px; }
  /* Punch list */
  .section { margin-bottom: 14px; page-break-inside: avoid; }
  .section-title { font-size: 12pt; font-weight: bold; color: #335a3a; border-bottom: 1.5px solid #335a3a; padding-bottom: 3px; margin-bottom: 6px; }
  .subsection-title { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.07em; color: #8faf9a; font-family: Arial, sans-serif; margin: 10px 0 3px; }
  .custom-label { font-size: 8pt; color: #668c66; font-style: italic; margin-left: 18px; }
  /* Intro */
  .intro-box { background: #f4f2ed; border: 1px solid #d8d2c8; border-radius: 4px; padding: 10px 14px; margin-bottom: 16px; font-size: 9pt; color: #3f5d4a; line-height: 1.5; }
  .intro-box h3 { font-size: 9pt; color: #335a3a; margin: 8px 0 3px; }
  .intro-box ul { padding-left: 16px; }
  .intro-box ul li { margin: 1px 0; }
  /* Notes */
  .notes-box { border: 1px solid #f59e0b; border-radius: 4px; padding: 10px 14px; margin-top: 16px; font-size: 9pt; }
  .notes-box h3 { color: #b45309; font-size: 10pt; margin-bottom: 6px; }
  .notes-box .reminders h4 { color: #1e2e22; font-size: 9pt; margin-bottom: 3px; }
  .notes-box ul { padding-left: 16px; }
  .notes-box ul li { margin: 2px 0; color: #1e2e22; }
  .notes-box .red-flags h4 { color: #dc2626; font-size: 9pt; margin: 8px 0 3px; }
  .notes-box .red-flags li { color: #dc2626; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 12px 20px; }
    .section { page-break-inside: avoid; }
    .no-break { page-break-inside: avoid; }
  }
`;

function checkboxHtml(checked) {
  return `<div class="cb${checked ? ' done' : ''}"></div>`;
}

function itemHtml(text, checked) {
  return `<div class="item">${checkboxHtml(checked)}<span class="item-text${checked ? ' done' : ''}">${escHtml(text)}</span></div>`;
}

function escHtml(str) {
  return (str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function openPrint(title, bodyHtml) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escHtml(title)}</title><style>${STYLES}</style></head><body>${bodyHtml}</body></html>`;
  const win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups to print.'); return; }
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

export function printGenericChecklist({ label, emoji, desc, items }) {
  const done = items.filter((i) => i.done).length;
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const rows = items.map((i) => itemHtml(i.text || '(blank item)', i.done)).join('');

  const body = `
    <div class="brand">Life Built in Kentucky</div>
    <h1>${escHtml(emoji)} ${escHtml(label)}</h1>
    <div class="subtitle">${escHtml(desc)}</div>
    <div class="print-date">Printed ${date}</div>
    <div class="progress">${done} of ${items.length} items completed</div>
    <div class="list-section">${rows}</div>
  `;
  openPrint(`${label} — Life Built`, body);
}

export function printPunchList({ checkedIds, customItems }) {
  const checkedSet = new Set(checkedIds ?? []);
  const custom = customItems ?? {};
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const totalStatic = PUNCH_LIST_SECTIONS.reduce((s, sec) => s + sec.subsections.reduce((ss, sub) => ss + sub.items.length, 0), 0);
  const totalCustom = Object.values(custom).reduce((s, arr) => s + arr.length, 0);
  const total = totalStatic + totalCustom;
  const done = checkedSet.size;

  const introHtml = `
    <div class="intro-box">
      <p>${escHtml(PUNCH_LIST_INTRO.description)}</p>
      <h3>What to Bring</h3>
      <ul>${PUNCH_LIST_INTRO.whatToBring.map((t) => `<li>${escHtml(t)}</li>`).join('')}</ul>
      <h3>How to Mark Issues</h3>
      <ul>${PUNCH_LIST_INTRO.howToMark.map((t) => `<li>${escHtml(t)}</li>`).join('')}</ul>
      <h3>After the Walkthrough</h3>
      <ul>${PUNCH_LIST_INTRO.afterWalkthrough.map((t) => `<li>${escHtml(t)}</li>`).join('')}</ul>
    </div>
  `;

  const sectionsHtml = PUNCH_LIST_SECTIONS.map((section) => {
    const subsHtml = section.subsections.map((sub) => {
      const itemsHtml = sub.items.map((item) => itemHtml(item.text, checkedSet.has(item.id))).join('');
      return `<div class="no-break"><div class="subsection-title">${escHtml(sub.title)}</div>${itemsHtml}</div>`;
    }).join('');

    const sectionCustom = custom[section.id] ?? [];
    const customHtml = sectionCustom.length > 0
      ? `<div class="no-break"><div class="subsection-title">Additional Items</div>${sectionCustom.map((i) => itemHtml(i.text || '(blank)', checkedSet.has(i.id))).join('')}</div>`
      : '';

    return `<div class="section"><div class="section-title">${escHtml(section.title)}</div>${subsHtml}${customHtml}</div>`;
  }).join('');

  const notesHtml = `
    <div class="notes-box">
      <h3>Notes for Homeowners</h3>
      <div class="reminders">
        <h4>Important Reminders</h4>
        <ul>${PUNCH_LIST_NOTES.reminders.map((r) => `<li>${escHtml(r)}</li>`).join('')}</ul>
      </div>
      <div class="red-flags">
        <h4>Red Flags That Need Immediate Attention</h4>
        <ul>${PUNCH_LIST_NOTES.redFlags.map((r) => `<li>${escHtml(r)}</li>`).join('')}</ul>
      </div>
    </div>
  `;

  const body = `
    <div class="brand">Life Built in Kentucky</div>
    <h1>🏷️ Punch List Inspection</h1>
    <div class="subtitle">Before Closing — Blue Tape Walkthrough</div>
    <div class="print-date">Printed ${date}</div>
    <div class="progress">${done} of ${total} items checked</div>
    ${introHtml}
    ${sectionsHtml}
    ${notesHtml}
  `;
  openPrint('Punch List Inspection — Life Built', body);
}
