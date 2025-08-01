import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

export class ExportService {
  // Main export function
  static async exportDocument(format, content, title = 'Business Plan') {
    switch (format) {
      case 'docx':
        return await this.generateWordDoc(content, title);
      case 'xlsx':
        return await this.generateExcelSheet(content, title);
      case 'pdf':
        return await this.generatePDF(content, title);
      case 'pptx':
        return await this.generatePowerPoint(content, title);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Generate Word document
  static async generateWordDoc(content, title) {
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              spacing: { after: 300 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Создано: ${new Date().toLocaleDateString('ru-RU')}`,
                  italics: true,
                  size: 20
                })
              ],
              spacing: { after: 400 }
            }),
            ...this.parseContentToDocx(content)
          ]
        }]
      });

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error('Word export error:', error);
      // Fallback to simple HTML export
      return this.generateHTMLDoc(content, title);
    }
  }

  // Parse content to DOCX paragraphs
  static parseContentToDocx(content) {
    const lines = content.split('\n');
    const paragraphs = [];

    lines.forEach(line => {
      if (line.trim() === '') {
        paragraphs.push(new Paragraph({ text: '' }));
      } else if (line.startsWith('# ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }));
      } else if (line.startsWith('## ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 }
        }));
      } else if (line.startsWith('### ')) {
        paragraphs.push(new Paragraph({
          text: line.substring(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        }));
      } else {
        paragraphs.push(new Paragraph({
          text: line.replace(/\*\*(.*?)\*\*/g, '$1'),
          spacing: { after: 100 }
        }));
      }
    });

    return paragraphs;
  }

  // Generate HTML document as fallback
  static generateHTMLDoc(content, title) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 2cm; line-height: 1.6; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; }
          h3 { color: #1e3a8a; margin-top: 25px; }
          .header { text-align: center; margin-bottom: 40px; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
          strong { font-weight: bold; }
          ul, ol { margin: 10px 0; padding-left: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <p>Создано: ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>
        <div class="content">
          ${this.markdownToHTML(content)}
        </div>
        <div class="footer">
          <p>Сгенерировано AI Business Planner</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  // Convert markdown to HTML
  static markdownToHTML(content) {
    return content
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  // Generate Excel spreadsheet
  static async generateExcelSheet(content, title) {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Main sheet with content
      const mainData = this.parseContentToExcel(content);
      const mainSheet = XLSX.utils.aoa_to_sheet(mainData);
      XLSX.utils.book_append_sheet(workbook, mainSheet, 'Бизнес-план');

      // Financial projections sheet
      const finData = this.generateFinancialData();
      const finSheet = XLSX.utils.aoa_to_sheet(finData);
      XLSX.utils.book_append_sheet(workbook, finSheet, 'Финансы');

      // Metrics sheet
      const metricsData = this.generateMetricsData();
      const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
      XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Метрики');

      // Write to buffer and create blob
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Ошибка создания Excel файла');
    }
  }

  // Parse content for Excel
  static parseContentToExcel(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const data = [
      ['Раздел', 'Содержание'],
      ['Название', 'AI Business Plan'],
      ['Дата создания', new Date().toLocaleDateString('ru-RU')],
      ['']
    ];

    let currentSection = '';
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        currentSection = line.substring(2);
        data.push([currentSection, '']);
      } else if (line.startsWith('## ')) {
        data.push(['  ' + line.substring(3), '']);
      } else if (line.trim()) {
        data.push(['', line.replace(/\*\*(.*?)\*\*/g, '$1')]);
      }
    });

    return data;
  }

  // Generate financial data for Excel
  static generateFinancialData() {
    const years = ['Год 1', 'Год 2', 'Год 3'];
    const revenue = [750000, 1800000, 3200000];
    const costs = [615000, 1350000, 2176000];
    const profit = revenue.map((r, i) => r - costs[i]);
    const margin = profit.map((p, i) => ((p / revenue[i]) * 100).toFixed(1) + '%');

    return [
      ['Финансовые показатели', '', '', ''],
      ['Метрика', ...years],
      ['Выручка ($)', ...revenue],
      ['Затраты ($)', ...costs],
      ['Прибыль ($)', ...profit],
      ['Маржа (%)', ...margin],
      [''],
      ['Ключевые метрики', 'Значение'],
      ['CAC ($)', Math.floor(Math.random() * 100 + 150)],
      ['LTV ($)', Math.floor(Math.random() * 800 + 1200)],
      ['Churn Rate (%)', (Math.random() * 3 + 2).toFixed(1)],
      ['Monthly Growth (%)', (Math.random() * 10 + 15).toFixed(1)]
    ];
  }

  // Generate metrics data
  static generateMetricsData() {
    return [
      ['KPI Dashboard', ''],
      [''],
      ['Метрика', 'Текущее значение', 'Цель', 'Статус'],
      ['MRR ($)', Math.floor(Math.random() * 50000 + 30000), Math.floor(Math.random() * 30000 + 60000), 'В процессе'],
      ['Клиенты', Math.floor(Math.random() * 200 + 150), Math.floor(Math.random() * 200 + 400), 'На плане'],
      ['Conversion Rate (%)', (Math.random() * 5 + 12).toFixed(1), (Math.random() * 5 + 18).toFixed(1), 'Ниже плана'],
      ['NPS', Math.floor(Math.random() * 20 + 60), Math.floor(Math.random() * 15 + 75), 'Выше плана'],
      [''],
      ['Создано:', new Date().toLocaleDateString('ru-RU')]
    ];
  }

  // Generate PDF report
  static async generatePDF(content, title) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;

      // Date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Создано: ${new Date().toLocaleDateString('ru-RU')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += lineHeight * 2;

      // Content
      const lines = content.split('\n');
      pdf.setFontSize(10);

      lines.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        if (line.startsWith('# ')) {
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          yPosition += lineHeight;
          pdf.text(line.substring(2), margin, yPosition);
          yPosition += lineHeight;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
        } else if (line.startsWith('## ')) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          yPosition += lineHeight * 0.5;
          pdf.text(line.substring(3), margin, yPosition);
          yPosition += lineHeight;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
        } else if (line.startsWith('### ')) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(line.substring(4), margin, yPosition);
          yPosition += lineHeight;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
        } else if (line.trim()) {
          const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
          const splitText = pdf.splitTextToSize(cleanLine, pageWidth - margin * 2);
          splitText.forEach(textLine => {
            if (yPosition > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(textLine, margin, yPosition);
            yPosition += lineHeight;
          });
        } else {
          yPosition += lineHeight * 0.5;
        }
      });

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Стр. ${i} из ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        pdf.text('AI Business Planner', margin, pageHeight - 10);
      }

      const blob = pdf.output('blob');
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('Ошибка создания PDF файла');
    }
  }

  // Generate PowerPoint presentation (simplified)
  static async generatePowerPoint(content, title) {
    try {
      // Since we don't have a PowerPoint library, we'll generate an HTML presentation
      const slides = this.parseContentToSlides(content, title);
      const htmlPresentation = this.generateHTMLPresentation(slides, title);
      
      const blob = new Blob([htmlPresentation], { type: 'text/html' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('PowerPoint export error:', error);
      throw new Error('Ошибка создания презентации');
    }
  }

  // Parse content to slides
  static parseContentToSlides(content, title) {
    const lines = content.split('\n');
    const slides = [];
    let currentSlide = null;

    slides.push({
      title: title,
      content: [`Создано: ${new Date().toLocaleDateString('ru-RU')}`, 'AI Business Planner'],
      type: 'title'
    });

    lines.forEach(line => {
      if (line.startsWith('# ')) {
        if (currentSlide) slides.push(currentSlide);
        currentSlide = {
          title: line.substring(2),
          content: [],
          type: 'content'
        };
      } else if (line.startsWith('## ')) {
        if (currentSlide) slides.push(currentSlide);
        currentSlide = {
          title: line.substring(3),
          content: [],
          type: 'content'
        };
      } else if (line.trim() && currentSlide) {
        currentSlide.content.push(line.replace(/\*\*(.*?)\*\*/g, '$1'));
      }
    });

    if (currentSlide) slides.push(currentSlide);
    return slides;
  }

  // Generate HTML presentation
  static generateHTMLPresentation(slides, title) {
    const slideHTML = slides.map((slide, index) => `
      <div class="slide ${slide.type}" data-slide="${index}">
        <h1>${slide.title}</h1>
        <div class="content">
          ${slide.content.map(item => `<p>${item}</p>`).join('')}
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>${title} - Presentation</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .slide {
            width: 100vw;
            height: 100vh;
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 60px;
            box-sizing: border-box;
            text-align: center;
          }
          .slide.active { display: flex; }
          .slide.title h1 { font-size: 48px; margin-bottom: 30px; }
          .slide.content h1 { font-size: 36px; margin-bottom: 40px; color: #fff; }
          .slide p { font-size: 18px; line-height: 1.6; margin: 10px 0; max-width: 800px; }
          .navigation {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
          }
          .nav-btn {
            background: rgba(255,255,255,0.3);
            border: none;
            color: white;
            padding: 10px 15px;
            margin: 0 5px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          .nav-btn:hover { background: rgba(255,255,255,0.5); }
          .slide-counter {
            position: fixed;
            bottom: 20px;
            left: 20px;
            color: rgba(255,255,255,0.8);
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        ${slideHTML}
        <div class="navigation">
          <button class="nav-btn" onclick="previousSlide()">‹</button>
          <button class="nav-btn" onclick="nextSlide()">›</button>
        </div>
        <div class="slide-counter">
          <span id="current">1</span> / <span id="total">${slides.length}</span>
        </div>
        <script>
          let currentSlide = 0;
          const slides = document.querySelectorAll('.slide');
          const totalSlides = slides.length;
          
          function showSlide(n) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (n + totalSlides) % totalSlides;
            slides[currentSlide].classList.add('active');
            document.getElementById('current').textContent = currentSlide + 1;
          }
          
          function nextSlide() { showSlide(currentSlide + 1); }
          function previousSlide() { showSlide(currentSlide - 1); }
          
          // Keyboard navigation
          document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextSlide();
            if (e.key === 'ArrowLeft') previousSlide();
          });
          
          // Initialize
          showSlide(0);
        </script>
      </body>
      </html>
    `;
  }

  // Download helper
  static downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL after download
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}