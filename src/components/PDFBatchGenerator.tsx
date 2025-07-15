// import React, { useEffect, useRef } from "react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import PieChartCard from "./PieChartCard";

// interface BatchGeneratorProps {
//     fileName: string;
//     data: { Judicial: any[]; Administrativo: any[] };
//     onFinish: () => void;
// }

// const BatchGenerator: React.FC<BatchGeneratorProps> = ({ fileName, data, onFinish }) => {
//     const containerRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         setTimeout(() => generateBatchPDF(), 1000);
//     }, []);

//     const gerarDadosFormatados = (row: any) => {
//         const dados: Record<string, any> = {
//             Espécie: row?.Espécie || "Sem Espécie",
//             Objeto: row?.Objeto || "Sem Objeto",
//             Demanda: row?.Demanda || "Sem Demanda",
//             "Valor da Causa": row?.["Valor da Causa"] || "Sem Valor",
//             Distribuição: row?.Distribuição || "Sem Data",
//             Juízo: row?.Juízo || "Sem Juízo",
//             Liminar: row?.Liminar || "Sem Liminar",
//             Sentença: row?.Sentença || "Sem Sentença",
//             Recursos: row?.Recursos || "Sem Recursos",
//             "Estágio Atual": row?.["Estágio Atual"] || "Sem Estágio",
//             Prognóstico: row?.Prognóstico || "Sem Prognóstico",
//             Relatório: row?.Relatório || "Sem Relatório",
//         };

//         return dados;
//     };

//     const generateBatchPDF = async () => {
//         const pdf = new jsPDF("p", "mm", "a4");
//         const pageWidth = pdf.internal.pageSize.getWidth();
//         const margin = 10;
//         const usableWidth = pageWidth - margin * 2;

//         const tabs = ["Judicial", "Administrativo"] as const;

//         let firstPage = true;

//         for (const tabName of tabs) {
//             const tabData = data[tabName];
//             const processos = Array.from(new Set(tabData.map((d) => d["Processo"])));

//             for (const processo of processos) {
//                 const filtered = tabData.filter((d) => d["Processo"] === processo);
//                 const row = filtered[0] || {};
//                 const dados = gerarDadosFormatados(row);
//                 const tributos = filtered.reduce((acc, r) => acc + (Number(r.Tributos) || 0), 0);
//                 const multa = filtered.reduce((acc, r) => acc + (Number(r.Multa) || 0), 0);
//                 const juros = filtered.reduce((acc, r) => acc + (Number(r.Juros) || 0), 0);
//                 const valorCausa = Number(row?.["Valor da Causa"] || 0);
//                 const mostrarSomenteValorCausa = tributos === 0 && multa === 0 && juros === 0;

//                 const div = document.createElement("div");
//                 div.style.width = "800px";
//                 div.style.padding = "40px";
//                 div.style.background = "#fff";
//                 div.style.fontFamily = "Arial, sans-serif";

//                 div.innerHTML = `
//           <div id="info-section">
//             <img src="/logo.png" style="width:80px" />
//             <h1 style="text-align:center;font-size:22px;color:#213547;font-weight:bold;">${fileName}</h1>
//             <div style="text-align:right;font-size:12px;color:#213547">
//               <div><strong>Relatório</strong></div>
//               <div>${tabName}</div>
//               <div>Processo</div>
//               <div style="font-size:11px">${processo}</div>
//             </div>
//             <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;font-size:12px;margin-bottom:40px;">
//               ${Object.entries(dados).map(([chave, valor]) => {
//                     let displayValue = "Sem " + chave;
//                     if (chave === "Valor da Causa") {
//                         const numero = Number(valor);
//                         displayValue = !isNaN(numero)
//                             ? numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
//                             : `Sem ${chave}`;
//                     } else if (chave === "Distribuição") {
//                         let data: Date | null = null;
//                         if (!isNaN(Number(valor))) {
//                             const serial = Number(valor);
//                             const utc_days = Math.floor(serial - 25569);
//                             const utc_value = utc_days * 86400;
//                             data = new Date(utc_value * 1000);
//                             data.setHours(data.getHours() + 3);
//                         } else if (typeof valor === "string") {
//                             const partes = valor.split("/");
//                             if (partes.length === 3) {
//                                 const [dia, mes, ano] = partes.map(Number);
//                                 if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
//                                     data = new Date(ano, mes - 1, dia);
//                                 }
//                             }
//                         }
//                         displayValue = data ? data.toLocaleDateString("pt-BR") : `Sem ${chave}`;
//                     } else {
//                         displayValue = valor && String(valor).trim() !== "" ? String(valor) : `Sem ${chave}`;
//                     }
//                     return `<div style="border:1px solid #ddd;border-radius:6px;padding:10px;background:#f9f9f9">
//                   <strong>${chave}</strong><br/>${displayValue}</div>`;
//                 }).join("")}
//             </div>
//           </div>
//         `;

//                 const graphContainer = document.createElement("div");
//                 graphContainer.id = "graph-section";
//                 graphContainer.style.width = "350px";
//                 graphContainer.style.height = "350px";
//                 graphContainer.style.margin = "20px auto";

//                 const Chart = (
//                     <PieChartCard
//                         tributos={mostrarSomenteValorCausa ? 0 : tributos}
//                         multa={mostrarSomenteValorCausa ? 0 : multa}
//                         juros={mostrarSomenteValorCausa ? 0 : juros}
//                         valorCausa={mostrarSomenteValorCausa ? valorCausa : 0}
//                     />
//                 );

//                 containerRef.current?.appendChild(div);
//                 const canvas1 = await html2canvas(div, { scale: 2, useCORS: true });
//                 const imgData1 = canvas1.toDataURL("image/png");
//                 const imgHeight1 = (canvas1.height * usableWidth) / canvas1.width;

//                 if (!firstPage) pdf.addPage();
//                 firstPage = false;

//                 pdf.addImage(imgData1, "PNG", margin, margin, usableWidth, imgHeight1);

//                 // Add gráfico na próxima página
//                 const graphWrapper = document.createElement("div");
//                 graphWrapper.style.width = "400px";
//                 graphWrapper.style.height = "280px";
//                 containerRef.current?.appendChild(graphWrapper);

//                 const renderDiv = document.createElement("div");
//                 renderDiv.style.position = "absolute";
//                 renderDiv.style.left = "-9999px";
//                 renderDiv.appendChild(graphWrapper);
//                 document.body.appendChild(renderDiv);

//                 const graphElement = document.createElement("div");
//                 graphWrapper.appendChild(graphElement);

//                 // Montar gráfico e capturar
//                 const wrapper = document.createElement("div");
//                 wrapper.style.width = "400px";
//                 wrapper.style.height = "280px";
//                 document.body.appendChild(wrapper);

//                 const temp = document.createElement("div");
//                 wrapper.appendChild(temp);

//                 const root = document.createElement("div");
//                 temp.appendChild(root);

//                 const container = document.createElement("div");
//                 containerRef.current?.appendChild(container);

//                 const chartCanvas = await html2canvas(graphWrapper, { scale: 2, useCORS: true });
//                 const chartImg = chartCanvas.toDataURL("image/png");
//                 const chartHeight = (chartCanvas.height * usableWidth) / chartCanvas.width;

//                 pdf.addPage();
//                 pdf.addImage(chartImg, "PNG", margin, margin, usableWidth, chartHeight);
//             }
//         }

//         pdf.save(`relatorio_${fileName}_completo.pdf`);
//         onFinish();
//     };

//     return <div ref={containerRef} style={{ position: "absolute", left: "-9999px", top: 0 }} />;
// };

// export default BatchGenerator;
