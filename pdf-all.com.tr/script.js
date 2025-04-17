let selectedFiles = [];

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById('pdfFiles');
  const fileListDisplay = document.getElementById('fileList');

  input.addEventListener('change', () => {
    selectedFiles = Array.from(input.files);
    fileListDisplay.innerHTML = '';
    selectedFiles.forEach((file, index) => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" checked id="file_${index}"> ${file.name}`;
      fileListDisplay.appendChild(label);
      fileListDisplay.appendChild(document.createElement('br'));
    });
  });
});

async function mergePDFs() {
  const mergedPdf = await PDFLib.PDFDocument.create();
  for (let i = 0; i < selectedFiles.length; i++) {
    if (!document.getElementById(`file_${i}`).checked) continue;

    const file = selectedFiles[i];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'birlesmis.pdf';
  link.click();
  URL.revokeObjectURL(url);
}
