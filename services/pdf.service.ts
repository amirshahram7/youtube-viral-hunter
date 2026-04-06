import { jsPDF } from 'jspdf';

export interface AgentOutput {
  agent: string;
  role: string;
  content: string;
  provider: string;
}

export interface PDFTaskData {
  query: string;
  timestamp: string;
  config?: {
    scale: string;
    agents: number;
    rounds: number;
    mode: string;
  };
  rounds: Array<{
    round: number;
    title: string;
    outputs: AgentOutput[];
    provider: string;
  }>;
  finalDecision: string;
}

export class PDFService {
  /**
   * Generates a high-end, branded strategic document.
   */
  static generateReport(data: PDFTaskData) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = 20;

    const addFooter = (doc: any, pageNum: number) => {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`PAGE ${pageNum} | OFFICIAL ARCANUM STRATEGIC RECORD`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    // ... (1. Header logic remains similar)
    // 1. HEADER: BRANDING & LOGO
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    try {
      doc.addImage('/logo-arcanum.png', 'PNG', margin, 10, 35, 35);
    } catch (e) {
      doc.setTextColor(191, 64, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('ARCANUM', margin, 25);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AI', margin + 45, 32);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('SOVEREIGN INTELLIGENCE PROTOCOL', margin + 45, 40);

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text('GATEWAY: www.arcanum-ai.io', pageWidth - margin - 50, 25);
    doc.text(`TIMESTAMP: ${new Date().toLocaleString()}`, pageWidth - margin - 60, 32);

    if (data.config) {
      doc.setTextColor(100, 100, 100);
      doc.text(`SCALE: ${data.config.scale} | MODE: ${data.config.mode.toUpperCase()}`, margin, 44);
    }
    
    yPos = 70;

    // 2. MISSION TITLE
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STRATEGIC OBJECTIVE', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    const queryLines = doc.splitTextToSize(data.query, contentWidth);
    doc.text(queryLines, margin, yPos);
    yPos += (queryLines.length * 6) + 20;

    // 3. ANALYTICAL DEBATE ROUNDS
    data.rounds.forEach((round, index) => {
      if (yPos > 230) {
        addFooter(doc, doc.internal.pages.length - 1);
        doc.addPage();
        yPos = 30;
      }

      doc.setTextColor(191, 64, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`DEBATE PHASE ${round.round}: ${round.title.toUpperCase()}`, margin, yPos);
      yPos += 8;

      round.outputs.forEach(out => {
        const outLines = doc.splitTextToSize(out.content, contentWidth - 10);
        const boxHeight = (outLines.length * 5) + 15;

        if (yPos + boxHeight > 270) {
          addFooter(doc, doc.internal.pages.length - 1);
          doc.addPage();
          yPos = 30;
        }

        doc.setFillColor(254, 254, 255);
        doc.rect(margin, yPos, contentWidth, boxHeight, 'F');
        doc.setDrawColor(230, 230, 230);
        doc.rect(margin, yPos, contentWidth, boxHeight, 'S');

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`${out.agent} (${out.role})`, margin + 5, yPos + 7);

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(outLines, margin + 5, yPos + 15);

        yPos += boxHeight + 5;
      });

      yPos += 10;
    });

    // 4. FINAL VERDICT (Premium Final Box)
    if (yPos > 220) {
      addFooter(doc, doc.internal.pages.length - 1);
      doc.addPage();
      yPos = 30;
    }

    doc.setFillColor(31, 41, 55); // Dark Slate
    doc.rect(margin - 2, yPos - 5, contentWidth + 4, 70, 'F');
    doc.setDrawColor(191, 64, 255);
    doc.setLineWidth(1);
    doc.rect(margin - 2, yPos - 5, contentWidth + 4, 70, 'S');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('EXTRACTED STRATEGIC VERDICT', margin + 5, yPos + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 220, 220);
    const verdictLines = doc.splitTextToSize(data.finalDecision, contentWidth - 10);
    doc.text(verdictLines, margin + 5, yPos + 22);

    addFooter(doc, doc.internal.pages.length - 1);

    // Save the PDF
    doc.save(`Arcanum_Strategic_Report_${new Date().getTime()}.pdf`);
  }
}
