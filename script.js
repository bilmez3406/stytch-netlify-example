
const fileInput = document.getElementById('fileInput');
const pdfList = document.getElementById('pdfList');
let pdfFiles = [];

fileInput.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files);
  pdfFiles = files;
  pdfList.innerHTML = '';

  for (const file of files) {
    const reader = new FileReader();
    reader.onload = async function () {
      const arrayBuffer = reader.result;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');
      await page.render({ canvasContext: context, viewport }).promise;

      const container = document.createElement('div');
      container.classList.add('pdf-item');
      container.innerHTML = `
        <strong>${file.name}</strong><br>
        <img src="${canvas.toDataURL()}" style="max-width:100%"><br>
        <button onclick="showPageSelector(${pdfFiles.indexOf(file)})">📄 PDF Sayfa Düzenleme</button>
        <div class="page-selector" id="selector-${pdfFiles.indexOf(file)}"></div>
      `;
      pdfList.appendChild(container);

      const selector = document.getElementById(`selector-${pdfFiles.indexOf(file)}`);
      for (let i = 1; i <= pdf.numPages; i++) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = i;
        checkbox.name = `page-${pdfFiles.indexOf(file)}`;
        selector.appendChild(checkbox);
      }
      selector.style.display = 'none';
    };
    reader.readAsArrayBuffer(file);
  }
});

function showPageSelector(index) {
  const selector = document.getElementById(`selector-${index}`);
  selector.style.display = selector.style.display === 'none' ? 'flex' : 'none';
}

async function mergeSelectedPages() {
  const { PDFDocument } = PDFLib;
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < pdfFiles.length; i++) {
    const checkboxes = document.querySelectorAll(`input[name=page-${i}]:checked`);
    const selectedPages = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const arrayBuffer = await pdfFiles[i].arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, selectedPages.map(p => p - 1));
    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'birlesmis.pdf';
  a.click();
}
