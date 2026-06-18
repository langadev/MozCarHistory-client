import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Platform accent green: hsl(152 60% 38%) → RGB(39, 155, 101)
const GREEN      = [39, 155, 101] as const;
const GREEN_DARK = [25,  99,  64] as const;
const GREEN_PALE = [232, 248, 240] as const;
const SLATE_900  = [15,  23,  42]  as const;
const SLATE_600  = [71,  85, 105]  as const;
const SLATE_200  = [226, 232, 240] as const;
const WHITE      = [255, 255, 255] as const;

interface CarInfo {
  plateNumber?: string;
  brand?: string;
  model?: string;
  year?: number | null;
  vin?: string | null;
  color?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  engineSize?: string | null;
}

interface Record {
  date: string;
  mileage: number;
  serviceType?: string | null;
  description: string;
  parts?: string | null;
  nextServiceMileage?: number | null;
  workshop?: { name?: string | null } | null;
  mechanic?: { name?: string | null; specialty?: string | null } | null;
}

export function exportHistoryPdf(car: CarInfo, records: Record[]) {
  const doc   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW    = doc.internal.pageSize.getWidth();
  const PH    = doc.internal.pageSize.getHeight();
  const M     = 14;
  let y       = 0;

  // ── Header bar ────────────────────────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, PW, 24, "F");

  // Subtle gradient strip at the bottom of the header
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 20, PW, 4, "F");

  // Logo text
  doc.setTextColor(...WHITE);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Moz Car History", M, 11);

  // Tagline
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.text("Histórico de Manutenção Verificado", M, 17.5);

  // Date aligned right
  const dateStr = new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
  doc.setFontSize(7);
  doc.text(`Emitido em: ${dateStr}`, PW - M, 17.5, { align: "right" });

  y = 32;

  // ── Vehicle card ──────────────────────────────────────────────────────────
  // Light green background pill
  doc.setFillColor(...GREEN_PALE);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.4);
  doc.roundedRect(M, y - 4, PW - M * 2, 36, 3, 3, "FD");

  // Brand + Model (size 17 bold) — measure width BEFORE changing font
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_900);
  const titleText = `${car.brand ?? ""} ${car.model ?? ""}`.trim();
  const titleWidth = doc.getTextWidth(titleText); // measured at 17pt bold ✓
  doc.text(titleText, M + 4, y + 5);

  // Year — right next to title, smaller, muted
  if (car.year) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_600);
    doc.text(`(${car.year})`, M + 4 + titleWidth + 2, y + 5);
  }

  // Plate badge
  doc.setFillColor(...GREEN);
  doc.setDrawColor(...GREEN);
  const plateText = car.plateNumber ?? "—";
  doc.roundedRect(M + 4, y + 8, doc.getTextWidth(plateText) + 6, 7, 1.5, 1.5, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...WHITE);
  doc.text(plateText, M + 7, y + 13.5);

  // VIN
  if (car.vin) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_600);
    doc.text(`VIN: ${car.vin}`, M + 4 + doc.getTextWidth(plateText) + 10, y + 13.5);
  }

  // Attributes row
  const attrs: string[] = [];
  if (car.color)       attrs.push(`● ${car.color}`);
  if (car.fuelType)    attrs.push(car.fuelType);
  if (car.transmission) attrs.push(car.transmission);
  if (car.bodyType)    attrs.push(car.bodyType);
  if (car.engineSize)  attrs.push(`Motor: ${car.engineSize}`);

  if (attrs.length > 0) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_600);
    doc.text(attrs.join("   ·   "), M + 4, y + 22);
  }

  y += 38;

  // ── Summary strip ─────────────────────────────────────────────────────────
  const maxMileage   = records.length > 0 ? Math.max(...records.map(r => r.mileage)) : null;
  const nextService  = records.find(r => r.nextServiceMileage)?.nextServiceMileage ?? null;

  const pills: { label: string; value: string; highlight?: boolean }[] = [
    { label: "Registos",   value: `${records.length}` },
    ...(maxMileage !== null ? [{ label: "Última km", value: `${maxMileage.toLocaleString("pt-PT")} km` }] : []),
    ...(nextService ? [{ label: "Próximo serviço", value: `${nextService.toLocaleString("pt-PT")} km`, highlight: true }] : []),
  ];

  const pillH = 11;
  let pillX   = M;
  for (const pill of pills) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const valW  = doc.getTextWidth(pill.value);
    doc.setFont("helvetica", "normal");
    const lblW  = doc.getTextWidth(pill.label + ": ");
    const total = lblW + valW + 8;

    doc.setFillColor(...(pill.highlight ? [255, 247, 230] : SLATE_200));
    doc.setDrawColor(...(pill.highlight ? [251, 191, 36] : SLATE_200));
    doc.setLineWidth(0.3);
    doc.roundedRect(pillX, y, total, pillH, 2, 2, "FD");

    doc.setFontSize(7);
    doc.setTextColor(...SLATE_600);
    doc.text(`${pill.label}: `, pillX + 4, y + 7);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(pill.highlight ? [146, 64, 14] : SLATE_900));
    doc.text(pill.value, pillX + 4 + lblW, y + 7);

    pillX += total + 4;
  }

  y += 18;

  // ── Section title ─────────────────────────────────────────────────────────
  // Green left-border accent
  doc.setFillColor(...GREEN);
  doc.rect(M, y, 3, 6, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...SLATE_900);
  doc.text("Registos de Manutenção", M + 6, y + 5);
  y += 10;

  // ── Records table ─────────────────────────────────────────────────────────
  if (records.length === 0) {
    doc.setFillColor(...GREEN_PALE);
    doc.roundedRect(M, y, PW - M * 2, 14, 2, 2, "F");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_600);
    doc.text("Esta viatura ainda não tem serviços registados.", PW / 2, y + 9, { align: "center" });
  } else {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["Data", "Km", "Tipo de Serviço", "Descrição / Peças", "Oficina / Mecânico"]],
      body: records.map(r => [
        new Date(r.date).toLocaleDateString("pt-PT"),
        r.mileage.toLocaleString("pt-PT") + " km",
        r.serviceType ?? "—",
        [r.description, r.parts ? `Peças: ${r.parts}` : ""].filter(Boolean).join("\n"),
        [r.workshop?.name ?? "—", r.mechanic?.name ? `Mec.: ${r.mechanic.name}` : ""].filter(Boolean).join("\n"),
      ]),
      headStyles: {
        fillColor: GREEN,
        textColor: WHITE,
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: SLATE_900,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
      },
      alternateRowStyles: { fillColor: [248, 253, 250] },
      tableLineColor: SLATE_200,
      tableLineWidth: 0.2,
      columnStyles: {
        0: { cellWidth: 22, halign: "center" },
        1: { cellWidth: 26, halign: "right" },
        2: { cellWidth: 34 },
        3: { cellWidth: "auto" },
        4: { cellWidth: 38 },
      },
      didDrawPage: (data) => {
        // Re-draw header on continuation pages
        if (data.pageNumber > 1) {
          doc.setFillColor(...GREEN);
          doc.rect(0, 0, PW, 10, "F");
          doc.setTextColor(...WHITE);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text("Moz Car History", M, 7);
          doc.setFont("helvetica", "normal");
          doc.text(`Histórico — ${car.plateNumber}`, PW - M, 7, { align: "right" });
        }
        // Footer
        const total = (doc.internal as any).getNumberOfPages();
        doc.setFontSize(7);
        doc.setTextColor(...SLATE_600);
        doc.text(
          `Moz Car History  ·  ${car.plateNumber}  ·  Página ${data.pageNumber} de ${total}`,
          PW / 2, PH - 7, { align: "center" },
        );
        // Footer line
        doc.setDrawColor(...GREEN);
        doc.setLineWidth(0.5);
        doc.line(M, PH - 10, PW - M, PH - 10);
      },
    });
  }

  const filename = `historico_${(car.plateNumber ?? "viatura").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
