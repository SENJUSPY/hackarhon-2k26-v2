import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const pageCache = new Map<string, string>();

export const loadPdf = async (data: ArrayBuffer) => {
  // Pass a copy of the ArrayBuffer to prevent pdf.js from detaching the original
  const loadingTask = pdfjsLib.getDocument({ data: data.slice(0) });
  return await loadingTask.promise;
};

export const renderPdfPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number, pdfId: string, scale: number = 1.5): Promise<string> => {
  const key = `${pdfId}-${pageNumber}-${scale}`;
  if (pageCache.has(key)) return pageCache.get(key)!;

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create canvas context');
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  await page.render({ canvasContext: context, viewport } as any).promise;
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  pageCache.set(key, dataUrl);
  return dataUrl;
};

export const getPdfTextContent = async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number) => {
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const viewport = page.getViewport({ scale: 1 });
  
  return {
    items: textContent.items.map((item: any) => ({
      str: item.str,
      transform: item.transform,
      width: item.width,
      height: item.height,
    })),
    viewport: {
      width: viewport.width,
      height: viewport.height,
    }
  };
};

export const extractPdfText = async (pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number): Promise<string> => {
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  
  let lastY: number | null = null;
  let text = '';
  
  for (const item of textContent.items as any[]) {
    if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
      text += '\n';
    }
    text += item.str;
    lastY = item.transform[5];
  }
  
  return text;
};
