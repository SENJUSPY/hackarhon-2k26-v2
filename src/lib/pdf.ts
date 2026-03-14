import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const loadPdf = async (data: ArrayBuffer) => {
  const loadingTask = pdfjsLib.getDocument({ data });
  return loadingTask.promise;
};

export const renderPdfPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, bookId: string, scale = 1.5) => {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas.toDataURL();
};

export const extractPdfText = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
  const page = await pdf.getPage(pageNum);
  const textContent = await page.getTextContent();
  return textContent.items.map((item: any) => item.str).join(' ');
};

export const getPdfTextContent = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();
  return { items: textContent.items, viewport };
};
