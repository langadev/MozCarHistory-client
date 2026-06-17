import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  workshop?: { name?: string | null; address?: string | null } | null;
  mechanic?: { name?: string | null; specialty?: string | null } | null;
}

export function exportHistoryPdf(car: CarInfo, records: Record[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = margin;

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(30, 64, 175); // accent blue
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Moz Car History", margin, 10);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Histórico de Manutenção Verificado", margin, 16);

  doc.setFontSize(8);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}`, pageWidth - margin, 16, { align: "right" });

  y = 30;

  // ── Vehicle info ─────────────────────────────────────────────────────────
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(`${car.brand ?? ""} ${car.model ?? ""}`, margin, y);
  if (car.year) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`(${car.year})`, margin + doc.getTextWidth(`${car.brand ?? ""} ${car.model ?? ""} `) + 1, y);
  }
  y += 7;

  // Plate + VIN
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(car.plateNumber ?? "—", margin, y);
  if (car.vin) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`VIN: ${car.vin}`, margin + 35, y);
  }
  y += 6;

  // Attributes row
  const attrs: string[] = [];
  if (car.color) attrs.push(car.color);
  if (car.fuelType) attrs.push(car.fuelType);
  if (car.transmission) attrs.push(car.transmission);
  if (car.bodyType) attrs.push(car.bodyType);
  if (car.engineSize) attrs.push(`Motor: ${car.engineSize}`);

  if (attrs.length > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(attrs.join("  ·  "), margin, y);
    y += 5;
  }

  // Summary pills
  const maxMileage = records.length > 0 ? Math.max(...records.map(r => r.mileage)) : null;
  const nextService = records.find(r => r.nextServiceMileage)?.nextServiceMileage ?? null;

  y += 2;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  const summaryParts: string[] = [
    `${records.length} Registo${records.length !== 1 ? "s" : ""}`,
    maxMileage !== null ? `Última km: ${maxMileage.toLocaleString("pt-PT")} km` : "",
    nextService ? `Próximo serviço: ${nextService.toLocaleString("pt-PT")} km` : "",
  ].filter(Boolean);
  doc.text(summaryParts.join("   |   "), margin + 3, y + 7.5);
  y += 18;

  // ── Records table ────────────────────────────────────────────────────────
  if (records.length === 0) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Esta viatura ainda não tem serviços registados.", margin, y);
  } else {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Registos de Manutenção", margin, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Data", "Km", "Tipo de Serviço", "Descrição / Peças", "Oficina / Mecânico"]],
      body: records.map(r => [
        new Date(r.date).toLocaleDateString("pt-PT"),
        r.mileage.toLocaleString("pt-PT") + " km",
        r.serviceType ?? "—",
        [r.description, r.parts ? `Peças: ${r.parts}` : ""].filter(Boolean).join("\n"),
        [r.workshop?.name ?? "—", r.mechanic?.name ? `Mec.: ${r.mechanic.name}` : ""].filter(Boolean).join("\n"),
      ]),
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 3,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 24 },
        2: { cellWidth: 32 },
        3: { cellWidth: "auto" },
        4: { cellWidth: 38 },
      },
      didDrawPage: (data) => {
        // Footer on each page
        const pageCount = (doc.internal as any).getNumberOfPages();
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Moz Car History  ·  Página ${data.pageNumber} de ${pageCount}  ·  ${car.plateNumber}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" },
        );
      },
    });
  }

  // ── Footer (last page, if no table or appended) ──────────────────────────
  const pageCount = (doc.internal as any).getNumberOfPages();
  if (records.length === 0) {
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Moz Car History  ·  ${car.plateNumber}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  const filename = `historico_${(car.plateNumber ?? "viatura").replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}
