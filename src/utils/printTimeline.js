function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

export function printTimeline({ milestones }) {
  if (!milestones || milestones.length === 0) return;

  const win = window.open('', '_blank');
  if (!win) return;

  const done = milestones.filter((m) => m.done).length;
  const total = milestones.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const rows = milestones
    .map((m, i) => {
      const dateStr =
        m.start && m.end
          ? `${fmtDate(m.start)} → ${fmtDate(m.end)}`
          : m.start
          ? fmtDate(m.start)
          : m.targetDate
          ? fmtDate(m.targetDate)
          : '—';

      const progress = typeof m.progress === 'number' ? m.progress : m.done ? 100 : 0;

      const photosHtml =
        (m.photos || []).length > 0
          ? `<div class="extras">📷 ${(m.photos || [])
              .map(
                (p) =>
                  `<a href="${escHtml(p.url)}" target="_blank">${escHtml(p.caption || p.url)}</a>`
              )
              .join(' · ')}</div>`
          : '';

      const docsHtml =
        (m.linkedDocs || []).length > 0
          ? `<div class="extras">📎 ${(m.linkedDocs || [])
              .map(
                (d) =>
                  `<a href="${escHtml(d.url)}" target="_blank">${escHtml(d.name || d.url)}</a>`
              )
              .join(' · ')}</div>`
          : '';

      const notesHtml = m.notes
        ? `<div class="notes">${escHtml(m.notes)}</div>`
        : '';

      return `
        <tr class="${m.done ? 'done-row' : ''}">
          <td class="num">${i + 1}</td>
          <td class="check">${m.done ? '✓' : '○'}</td>
          <td class="body">
            <div class="title ${m.done ? 'done' : ''}">${escHtml(m.title)}</div>
            <div class="date">${dateStr}</div>
            ${notesHtml}${photosHtml}${docsHtml}
          </td>
          <td class="prog">
            <div class="bar-wrap"><div class="bar" style="width:${progress}%"></div></div>
            <div class="pct">${progress}%</div>
          </td>
        </tr>`;
    })
    .join('');

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Build Timeline</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e2e22; }
    h1 { font-size: 26px; margin-bottom: 4px; }
    .subtitle { color: #8faf9a; font-size: 13px; margin-bottom: 24px; }
    .summary { display: flex; align-items: center; gap: 16px; background: #f9f8f4; border: 1px solid #d8d2c8; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; }
    .summary-stat { text-align: center; }
    .summary-stat .val { font-size: 22px; font-weight: bold; color: #335a3a; }
    .summary-stat .lbl { font-size: 11px; color: #8faf9a; text-transform: uppercase; letter-spacing: 0.05em; }
    .progress-wrap { flex: 1; }
    .progress-label { font-size: 12px; color: #668c66; margin-bottom: 6px; }
    .progress-track { height: 10px; background: #d8d2c8; border-radius: 999px; overflow: hidden; }
    .progress-fill { height: 100%; background: #335a3a; border-radius: 999px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #8faf9a; padding: 8px 10px; border-bottom: 2px solid #d8d2c8; }
    td { padding: 10px; border-bottom: 1px solid #ece9e2; vertical-align: top; }
    .num { width: 28px; color: #8faf9a; font-size: 12px; text-align: right; padding-right: 6px; }
    .check { width: 20px; font-size: 15px; color: #335a3a; }
    .body { }
    .title { font-size: 14px; font-weight: 600; }
    .title.done { text-decoration: line-through; color: #8faf9a; font-weight: normal; }
    .date { font-size: 12px; color: #668c66; margin-top: 2px; }
    .notes { font-size: 12px; color: #8faf9a; font-style: italic; margin-top: 4px; }
    .extras { font-size: 11px; color: #8faf9a; margin-top: 4px; }
    .extras a { color: #335a3a; }
    .prog { width: 90px; }
    .bar-wrap { height: 6px; background: #d8d2c8; border-radius: 999px; overflow: hidden; margin-bottom: 3px; }
    .bar { height: 100%; background: #335a3a; border-radius: 999px; }
    .pct { font-size: 11px; color: #8faf9a; text-align: right; }
    .done-row td { background: rgba(51,90,58,0.03); }
    @media print {
      body { margin: 20px; }
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body>
  <h1>Build Timeline</h1>
  <p class="subtitle">Printed from Life Built Planning App · ${new Date().toLocaleDateString()}</p>

  <div class="summary">
    <div class="summary-stat">
      <div class="val">${done}/${total}</div>
      <div class="lbl">Complete</div>
    </div>
    <div class="progress-wrap">
      <div class="progress-label">${pct}% of milestones done</div>
      <div class="progress-track">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th colspan="2"></th>
        <th>Milestone</th>
        <th>Progress</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`);

  win.document.close();
  setTimeout(() => win.print(), 400);
}
