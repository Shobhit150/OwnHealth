"use client";

import { useState } from "react";

export default function Home() {
  const [pdfText, setPdfText] = useState("");

  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);

    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map((item) => item.str);
      fullText += strings.join(" ") + "\n";
    }

    setPdfText(fullText);
  };

  return (
    <div className="p-6">
      <input type="file" accept="application/pdf" onChange={handlePDF} />
      <pre className="mt-4 text-sm">{pdfText}</pre>
    </div>
  );
}