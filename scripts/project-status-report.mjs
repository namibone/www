import { createWriteStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { finished } from 'node:stream/promises';
import PDFDocument from 'pdfkit';
import postcss from 'postcss';
import {
  blockers, createDevelopmentReport, deadlineLabel, decisions, displayDate, goals,
  ownerLabel, progressSummary, publicStatusUrl, reportBase, sources, stageProgress,
  stages, states, verifiedOn,
} from '../assets/project-status-data.js';

async function writePdf(path) {
  const tokens = new Map();
  postcss.parse(await readFile('assets/tokens.css', 'utf8')).walkDecls(/^--color-/, entry => tokens.set(entry.prop, entry.value));
  const color = name => tokens.get(`--color-${name}`);
  const margin = 46;
  const document = new PDFDocument({
    size: 'A4', autoFirstPage: false, bufferPages: true,
    margins: { top: 75, right: margin, bottom: 61, left: margin },
    info: { Title: 'NamibOne development report', Subject: `Project status verified ${displayDate(verifiedOn)}`, Author: 'NamibOne' },
  });
  const output = createWriteStream(path);
  const written = finished(output);
  document.pipe(output);

  document.on('pageAdded', () => {
    document.rect(0, 0, document.page.width, 54).fill(color('teal-ink'));
    document.fillColor(color('white')).font('Helvetica-Bold').fontSize(13).text('NamibOne', margin, 21, { lineBreak: false });
    document.x = margin;
    document.y = document.page.margins.top;
  });
  document.addPage();

  const width = () => document.page.width - margin * 2;
  const room = height => {
    if (document.y + height > document.page.height - document.page.margins.bottom) document.addPage();
  };
  const paragraph = (value, options = {}) => {
    document.fillColor(options.color ?? color('ink')).font(options.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(options.size ?? 10.5);
    document.text(value, margin, document.y, { width: width(), lineGap: 2, link: options.link });
  };
  const heading = (value, minRoom = 64) => {
    room(minRoom);
    paragraph(value, { bold: true, color: color('teal-ink'), size: 16 });
    document.moveDown(.32);
  };
  const list = values => {
    for (const value of values) {
      room(38);
      paragraph(`- ${value}`);
      document.moveDown(.3);
    }
  };
  const evidence = (label, url) => paragraph(label, { color: color('blue'), link: url, size: 9.5 });

  paragraph('Development report', { bold: true, color: color('teal-ink'), size: 30 });
  paragraph(`Delivery snapshot verified ${displayDate(verifiedOn)}`, { color: color('muted'), size: 12 });
  document.moveDown(.8);
  paragraph(progressSummary(), { bold: true, size: 12 });
  document.moveDown(.65);
  evidence('Open the NamibOne project status page', publicStatusUrl);
  document.moveDown(1.1);

  heading('Project goals');
  list(goals.map(([label, detail]) => `${label}. ${detail}`));
  document.moveDown(.65);
  heading('Current blockers');
  list(blockers.map(item => `${item.title}. ${item.detail} ${item.requirement}`));
  document.moveDown(.65);
  heading('Decisions needed');
  list(decisions);
  document.moveDown(.85);

  for (const stage of stages) {
    const progress = stageProgress(stage);
    heading(stage.name, 205);
    paragraph(`${states[progress.state]} | ${progress.completed} of ${progress.items.length} complete | ${stage.goal}`, { color: color('muted') });
    document.moveDown(.65);
    for (const item of progress.items) {
      const metadata = [`Owner ${ownerLabel(item)}`, `Deadline ${deadlineLabel(item)}`];
      if (item.completedOn) metadata.push(`Completed ${displayDate(item.completedOn)}`);
      if (item.suggestedOwner) metadata.push(`Suggested role ${item.suggestedOwner}`);
      const metaLine = metadata.join(' | ');
      const detail = `${item.milestone ? 'Milestone | ' : ''}${states[item.state]}. ${item.detail}`;
      const requirement = `Requirement. ${item.requirement}`;
      const textOptions = { width: width(), lineGap: 2 };
      const titleHeight = document.font('Helvetica-Bold').fontSize(12).heightOfString(item.title, textOptions);
      const detailHeight = document.font('Helvetica').fontSize(10.5).heightOfString(`${detail}\n${requirement}`, textOptions);
      const metaHeight = document.fontSize(9.5).heightOfString(metaLine, textOptions);
      room(titleHeight + detailHeight + metaHeight + (item.source ? 30 : 17));
      paragraph(item.title, { bold: true, size: 12 });
      paragraph(detail);
      paragraph(metaLine, { color: color('muted'), size: 9.5 });
      paragraph(requirement);
      if (item.source) evidence(item.source.label, item.source.url);
      document.moveDown(.55);
      document.moveTo(margin, document.y).lineTo(margin + width(), document.y).strokeColor(color('line')).stroke();
      document.moveDown(.55);
    }
    document.moveDown(.55);
  }

  heading('Verification sources');
  for (const [label, url] of sources) evidence(label, url);

  const { start, count } = document.bufferedPageRange();
  for (let index = 0; index < count; index += 1) {
    document.switchToPage(start + index);
    const y = document.page.height - 37;
    document.font('Helvetica').fontSize(9).fillColor(color('muted'));
    document.text(`NamibOne project status | ${displayDate(verifiedOn)}`, margin, y, { lineBreak: false });
    const pageNumber = `Page ${index + 1} of ${count}`;
    document.text(pageNumber, margin + width() - document.widthOfString(pageNumber), y, { lineBreak: false });
  }
  document.end();
  await written;
}

export async function writeDevelopmentReports(output) {
  const file = resolve(output, reportBase.slice(1));
  await writeFile(`${file}.md`, createDevelopmentReport());
  await writePdf(`${file}.pdf`);
}
