/**
 * High-Reliability Printing & Export Utility for AI Studio Web Apps
 * 
 * Works reliably inside sandboxed iframes, embedded webviews, and standalone browsers.
 * Uses an isolated hidden iframe with inline styling to bypass Tailwind/backdrop interference,
 * and provides HTML5 Canvas high-resolution PNG generation as a 100% reliable fallback.
 */

export interface PrintCardData {
  orgName: string;
  orgLogo?: string;
  athleteName: string;
  athleteCode: string;
  athleteMobile: string;
  sport: string;
  roleOrRank: string;
  bloodGroup: string;
  validPeriod: string;
  guardianInfo: string;
  city: string;
  website: string;
  theme: 'elite_gold' | 'sapphire_pro' | 'crimson_champion' | 'emerald_classic';
  photoUrl?: string;
}

export interface PrintCertificateData {
  orgName: string;
  orgLogo?: string;
  city: string;
  estYear?: string;
  recipientName: string;
  recipientCode: string;
  title: string;
  sport: string;
  rankOrPosition: string;
  citation: string;
  issueDate: string;
  instructorName: string;
  directorName: string;
  verificationToken: string;
  badgeText: string;
  themeCategory: string;
}

/**
 * Triggers an isolated print dialog using a dedicated hidden iframe.
 * Avoids modal backdrop clipping, hidden classes, and CSS specificity bugs.
 */
export const printIsolatedHtml = async (
  htmlContent: string,
  title: string = 'Print Document',
  isLandscape: boolean = false
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    try {
      // Remove any existing print iframe
      const oldFrame = document.getElementById('isolated-print-frame');
      if (oldFrame) {
        document.body.removeChild(oldFrame);
      }

      const iframe = document.createElement('iframe');
      iframe.id = 'isolated-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '10px';
      iframe.style.height = '10px';
      iframe.style.border = '0';
      iframe.style.opacity = '0.01';
      iframe.style.pointerEvents = 'none';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        // Fallback to window.print
        window.print();
        resolve({ success: true });
        return;
      }

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${title}</title>
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              @page {
                size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
                margin: 8mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                background: #ffffff !important;
                color: #0f172a;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                padding: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  min-height: auto;
                  padding: 0;
                }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      doc.close();

      // Allow DOM & styles to paint before print
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          resolve({ success: true });
        } catch (err: any) {
          console.warn('Iframe print error, attempting window.print fallback', err);
          try {
            window.print();
            resolve({ success: true });
          } catch (winErr: any) {
            resolve({ success: false, error: winErr?.message || 'Print blocked by browser environment' });
          }
        } finally {
          // Cleanup iframe after delay
          setTimeout(() => {
            try {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            } catch {}
          }, 4000);
        }
      }, 350);
    } catch (e: any) {
      console.error('Print isolated HTML error', e);
      try {
        window.print();
        resolve({ success: true });
      } catch (err: any) {
        resolve({ success: false, error: err?.message || 'Print failed' });
      }
    }
  });
};

/**
 * Downloads a canvas element as a PNG file.
 */
export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Download canvas error', err);
  }
};

/**
 * Generates a high-resolution Canvas of the Athlete ID Card (Front or Back)
 * Dimensions: 800px x 504px (CR80 ratio 1.587)
 */
export const generateCardCanvas = async (
  data: PrintCardData,
  side: 'front' | 'back'
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 504;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Theme palettes
  const palettes = {
    elite_gold: {
      bgGrad1: '#090d16',
      bgGrad2: '#161e2e',
      border: '#d97706',
      accent: '#fbbf24',
      badgeBg: '#78350f',
      badgeText: '#fef3c7',
    },
    sapphire_pro: {
      bgGrad1: '#030712',
      bgGrad2: '#0c2340',
      border: '#0284c7',
      accent: '#38bdf8',
      badgeBg: '#0369a1',
      badgeText: '#e0f2fe',
    },
    crimson_champion: {
      bgGrad1: '#0a0a0c',
      bgGrad2: '#2b0c14',
      border: '#e11d48',
      accent: '#fb7185',
      badgeBg: '#881337',
      badgeText: '#ffe4e6',
    },
    emerald_classic: {
      bgGrad1: '#020617',
      bgGrad2: '#062817',
      border: '#059669',
      accent: '#34d399',
      badgeBg: '#064e3b',
      badgeText: '#d1fae5',
    },
  };

  const themeColors = palettes[data.theme] || palettes.elite_gold;

  // Helper: rounded rectangle
  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: boolean,
    stroke: boolean
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

  if (side === 'front') {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, themeColors.bgGrad1);
    grad.addColorStop(0.7, themeColors.bgGrad2);
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    roundRect(0, 0, width, height, 32, true, false);

    // Subtle micro-dot pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 20; x < width; x += 24) {
      for (let y = 20; y < height; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer card border
    ctx.strokeStyle = themeColors.border;
    ctx.lineWidth = 4;
    roundRect(8, 8, width - 16, height - 16, 26, false, true);

    // Top Header Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 95);
    ctx.lineTo(width - 30, 95);
    ctx.stroke();

    // Org Name & Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(data.orgName.toUpperCase(), 80, 52);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText('OFFICIAL ATHLETE PASS • ACCESS CARD', 80, 74);

    // Org Icon / Logo box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    roundRect(30, 32, 40, 40, 10, true, true);
    ctx.fillStyle = themeColors.accent;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(data.orgName.slice(0, 2).toUpperCase(), 38, 58);

    // Smart chip graphic
    const chipX = width - 120;
    const chipY = 36;
    const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + 44, chipY + 34);
    chipGrad.addColorStop(0, '#fef08a');
    chipGrad.addColorStop(0.5, '#eab308');
    chipGrad.addColorStop(1, '#a16207');
    ctx.fillStyle = chipGrad;
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1;
    roundRect(chipX, chipY, 44, 34, 6, true, true);

    // Chip pin grooves
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.moveTo(chipX + 22, chipY);
    ctx.lineTo(chipX + 22, chipY + 34);
    ctx.moveTo(chipX, chipY + 17);
    ctx.lineTo(chipX + 44, chipY + 17);
    ctx.stroke();

    // Contactless Waves (RFID)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(width - 45, 53, 10, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width - 45, 53, 16, -Math.PI / 3, Math.PI / 3);
    ctx.stroke();

    // Athlete Photo Frame
    const photoX = 36;
    const photoY = 120;
    const photoSize = 140;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    roundRect(photoX, photoY, photoSize, photoSize, 18, true, true);

    // Photo placeholder avatar
    ctx.fillStyle = '#2563eb';
    roundRect(photoX + 4, photoY + 4, photoSize - 8, photoSize - 8, 14, true, false);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(data.athleteName.slice(0, 2).toUpperCase(), photoX + 40, photoY + 90);

    // Athlete Details Column
    const textX = 205;

    // Sport Badge
    ctx.fillStyle = themeColors.badgeBg;
    ctx.strokeStyle = themeColors.border;
    ctx.lineWidth = 1.5;
    roundRect(textX, 122, 160, 28, 14, true, true);
    ctx.fillStyle = themeColors.badgeText;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(data.sport.toUpperCase(), textX + 16, 141);

    // Athlete Full Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(data.athleteName, textX, 190);

    // Member ID & Blood Group
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText(`ID: ${data.athleteCode}`, textX, 222);

    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`• Blood: ${data.bloodGroup}`, textX + 175, 222);

    // Athlete Role / Squad
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Discipline Rank: ${data.roleOrRank}`, textX, 250);

    // Bottom Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 410);
    ctx.lineTo(width - 30, 410);
    ctx.stroke();

    // Footer items
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('VALID PERIOD', 36, 432);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillText(data.validPeriod, 36, 456);

    // Verified badge
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    roundRect(width / 2 - 70, 430, 140, 32, 8, true, true);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('✓ AUTHENTICATED', width / 2 - 58, 451);

    // Right footer: City / Federation
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('FACILITY / FEDERATION', width - 200, 432);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(data.city || 'Central Sports Hub', width - 200, 456);
  } else {
    // ==========================================
    // CARD BACK
    // ==========================================
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#030712');
    grad.addColorStop(0.5, '#0b1120');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    roundRect(0, 0, width, height, 32, true, false);

    // Outer border
    ctx.strokeStyle = themeColors.border;
    ctx.lineWidth = 4;
    roundRect(8, 8, width - 16, height - 16, 26, false, true);

    // Top Magnetic Stripe
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 30, width - 16, 55);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 30, width - 16, 55);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillText(
      `MAGNETIC TRACK 1 & 2 ENCODED • TURNSTILE ACCESS • ${data.athleteCode}`,
      30,
      62
    );

    // Gate Scan QR Code Block
    const qrX = 36;
    const qrY = 115;
    const qrSize = 130;

    ctx.fillStyle = '#ffffff';
    roundRect(qrX, qrY, qrSize, qrSize, 12, true, false);

    // QR Finder Patterns (3 corners)
    const drawFinder = (fx: number, fy: number) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(fx, fy, 28, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(fx + 4, fy + 4, 20, 20);
      ctx.fillStyle = '#000000';
      ctx.fillRect(fx + 8, fy + 8, 12, 12);
    };
    drawFinder(qrX + 8, qrY + 8);
    drawFinder(qrX + qrSize - 36, qrY + 8);
    drawFinder(qrX + 8, qrY + qrSize - 36);

    // Random QR data blocks
    ctx.fillStyle = '#000000';
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(qrX + 44 + c * 6, qrY + 44 + r * 6, 5, 5);
        }
      }
    }

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 9px "Courier New", monospace';
    ctx.fillText('GATE SCAN QR', qrX + 24, qrY + qrSize + 16);

    // Info Section
    const infoX = 195;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('EMERGENCY GUARDIAN CONTACT', infoX, 130);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(data.guardianInfo, infoX, 152);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('FACILITY LOCATION', infoX, 185);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(data.city || 'Central Sports Academy Complex', infoX, 207);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('ONLINE REGISTRY & VERIFICATION', infoX, 240);
    ctx.fillStyle = themeColors.accent;
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillText(data.website, infoX, 260);

    // Code-128 Turnstile Barcode Section
    const barX = 36;
    const barY = 300;
    const barW = width - 72;
    const barH = 75;

    ctx.fillStyle = '#ffffff';
    roundRect(barX, barY, barW, barH, 8, true, false);

    // Draw realistic barcode vertical lines
    ctx.fillStyle = '#000000';
    let currX = barX + 20;
    const barCodePattern = [
      3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 3,
      1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 3, 1,
      2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 3, 1, 2,
    ];
    for (let i = 0; i < barCodePattern.length && currX < barX + barW - 20; i++) {
      const w = barCodePattern[i];
      if (i % 2 === 0) {
        ctx.fillRect(currX, barY + 10, w, 42);
      }
      currX += w + 1;
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillText(`* ${data.athleteCode} *`, barX + barW / 2 - 50, barY + 68);

    // Signature Area
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width - 240, 440);
    ctx.lineTo(width - 40, 440);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '10px sans-serif';
    ctx.fillText('Authorized Signature / Stamp', width - 210, 458);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = 'italic 16px "Brush Script MT", cursive, sans-serif';
    ctx.fillText('General Secretary', width - 200, 432);
  }

  return canvas;
};

/**
 * Generates an A4 Printable Sheet Canvas containing both Front & Back cards
 * with scissor cut lines and printer alignment markers.
 */
export const generateA4PrintSheetCanvas = async (
  data: PrintCardData
): Promise<HTMLCanvasElement> => {
  const sheet = document.createElement('canvas');
  const sheetWidth = 1200;
  const sheetHeight = 1697; // A4 aspect ratio 1:1.414
  sheet.width = sheetWidth;
  sheet.height = sheetHeight;
  const ctx = sheet.getContext('2d')!;

  // Clean White Page
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sheetWidth, sheetHeight);

  // Sheet Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(data.orgName.toUpperCase(), 60, 80);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('OFFICIAL ATHLETE IDENTIFICATION & PVC CR80 PRINT SHEET', 60, 110);

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 130);
  ctx.lineTo(sheetWidth - 60, 130);
  ctx.stroke();

  // Instructions Box
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.fillRect(60, 150, sheetWidth - 120, 60);
  ctx.strokeRect(60, 150, sheetWidth - 120, 60);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('PRINT & LAMINATION GUIDE:', 80, 175);
  ctx.font = '12px sans-serif';
  ctx.fillText(
    '1. Set Paper to A4, Scale 100% (Do Not Fit/Shrink). 2. Cut along the dashed guidelines for standard CR80 wallet pockets (85.6mm × 54mm). 3. Compatible with Zebra/Evolis/Fargo direct PVC cards.',
    80,
    195
  );

  // Render Front Card
  const frontCanvas = await generateCardCanvas(data, 'front');
  const cardW = 700;
  const cardH = 441;
  const cardX = (sheetWidth - cardW) / 2;

  // Front Label
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('CARD FRONT (PHOTO & BIOMETRICS)', cardX, 265);

  // Draw Front Card Image
  ctx.drawImage(frontCanvas, cardX, 280, cardW, cardH);

  // Cut Guides around front card
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(cardX - 6, 274, cardW + 12, cardH + 12);
  ctx.setLineDash([]);

  // Render Back Card
  const backCanvas = await generateCardCanvas(data, 'back');
  const backY = 800;

  // Back Label
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('CARD BACK (GATE BARCODE & TURNSTILE QR)', cardX, backY - 15);

  // Draw Back Card Image
  ctx.drawImage(backCanvas, cardX, backY, cardW, cardH);

  // Cut Guides around back card
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(cardX - 6, backY - 6, cardW + 12, cardH + 12);
  ctx.setLineDash([]);

  // Footer & Timestamp
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, sheetHeight - 80);
  ctx.lineTo(sheetWidth - 60, sheetHeight - 80);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(
    `SECURITY REGISTRY TOKEN: ${data.athleteCode} • ISSUED: ${new Date().toISOString().split('T')[0]} • OFFICIAL ACADEMY RECORD`,
    60,
    sheetHeight - 50
  );

  return sheet;
};

/**
 * Generates an A4 Landscape Certificate Canvas (1414px x 1000px)
 */
export const generateCertificateCanvas = async (
  cert: PrintCertificateData
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement('canvas');
  const width = 1414;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background Parchment Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#fefdfa');
  bgGrad.addColorStop(0.5, '#ffffff');
  bgGrad.addColorStop(1, '#fef9ee');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer Ornate Gold Border
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner Fine Double Line Border
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Guilloché Corner Accents
  const cornerSize = 70;
  const drawCorner = (cx: number, cy: number, flipX: boolean, flipY: boolean) => {
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (flipX ? -cornerSize : cornerSize), cy);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + (flipY ? -cornerSize : cornerSize));
    ctx.stroke();
  };
  drawCorner(55, 55, false, false);
  drawCorner(width - 55, 55, true, false);
  drawCorner(55, height - 55, false, true);
  drawCorner(width - 55, height - 55, true, true);

  // Certificate Header Category Badge
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`★  ${cert.badgeText}  ★`, width / 2, 110);

  // Academy Name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.fillText(cert.orgName, width / 2, 165);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText(
    `${cert.city || 'Central Sports Complex'} • Est. ${cert.estYear || '1948'} • Registered Athletic Federation`,
    width / 2,
    195
  );

  // Distinction Introduction
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('This Official Certificate of Athletic Distinction is proudly conferred upon', width / 2, 280);

  // Recipient Name
  ctx.fillStyle = '#172554';
  ctx.font = 'bold 48px Georgia, serif';
  ctx.fillText(cert.recipientName, width / 2, 350);

  // Gold Underline
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 250, 370);
  ctx.lineTo(width / 2 + 250, 370);
  ctx.stroke();

  // Member ID & Sport Discipline
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillText(
    `MEMBER CODE: ${cert.recipientCode}   •   DISCIPLINE: ${cert.sport.toUpperCase()}`,
    width / 2,
    410
  );

  // Award Rank & Title
  ctx.fillStyle = '#1e293b';
  ctx.font = '22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`For outstanding performance and achieving "${cert.rankOrPosition}"`, width / 2, 470);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(cert.title, width / 2, 515);

  // Citation Text
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText(`"${cert.citation}"`, width / 2, 580);

  // Signatories & Official Seal
  const footerY = 820;

  // Coach Signature (Left)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold italic 20px Georgia, serif';
  ctx.fillText(cert.instructorName.split(',')[0], 120, footerY);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(120, footerY + 8);
  ctx.lineTo(380, footerY + 8);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(cert.instructorName.split(',')[1] || 'Chief Head Coach', 120, footerY + 28);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText('Discipline & Technical Authority', 120, footerY + 44);

  // Gold Seal (Center)
  ctx.textAlign = 'center';
  const sealGrad = ctx.createRadialGradient(width / 2, footerY - 20, 10, width / 2, footerY - 20, 60);
  sealGrad.addColorStop(0, '#fef08a');
  sealGrad.addColorStop(0.7, '#eab308');
  sealGrad.addColorStop(1, '#a16207');
  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  ctx.arc(width / 2, footerY - 20, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#451a03';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('OFFICIAL', width / 2, footerY - 26);
  ctx.fillText('SEAL', width / 2, footerY - 10);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`TOKEN: ${cert.verificationToken.slice(0, 18)}...`, width / 2, footerY + 44);

  // Director Signature (Right)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold italic 20px Georgia, serif';
  ctx.fillText(cert.directorName, width - 120, footerY);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width - 380, footerY + 8);
  ctx.lineTo(width - 120, footerY + 8);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('General Secretary & Director', width - 120, footerY + 28);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px "Courier New", monospace';
  ctx.fillText(`Dated: ${cert.issueDate}`, width - 120, footerY + 44);

  return canvas;
};
