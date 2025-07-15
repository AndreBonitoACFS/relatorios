import React, { useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PieChartCard from "./PieChartCard";

interface ExportPDFProps {
    fileName: string;
    tabName: string;
    selectedProcesso: string;
    dados: any;
    tributos: number;
    multa: number;
    juros: number;
    onFinish: () => void;
}

const PDFExporter: React.FC<ExportPDFProps> = ({
    fileName,
    tabName,
    selectedProcesso,
    dados,
    tributos,
    multa,
    juros,
    onFinish,
}) => {
    const pdfRef = useRef<HTMLDivElement | null>(null);

    const generatedRef = useRef(false);

    useEffect(() => {
        if (pdfRef.current && !generatedRef.current) {
            generatedRef.current = true;
            setTimeout(generatePDF, 2500);
        }
    }, []);

    const mostrarSomenteValorCausa = tributos === 0 && multa === 0 && juros === 0;
    const valorCausa = Number(dados["Valor da Causa"] || 0);

    const generatePDF = async () => {
        if (!pdfRef.current) return;

        const canvas = await html2canvas(pdfRef.current, {
            scale: 2,
            useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const ratio = canvas.height / canvas.width;
        const imgHeight = pageWidth * ratio;

        pdf.setFontSize(20);
        pdf.setTextColor(33, 53, 71);
        pdf.text(`${fileName} - Relatório`, 20, 20);

        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
        pdf.save(`relatorio_${tabName}_${selectedProcesso}.pdf`);
        onFinish();
    };

    return (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <div
                ref={pdfRef}
                style={{
                    width: "800px",
                    padding: "40px",
                    background: "#fff",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                {/* Logo à esquerda */}
                <img src="/logo.png" alt="Logo" style={{ width: 80 }} />

                {/* Nome da empresa centralizado */}
                <h1 style={{
                    flex: 1,
                    textAlign: "center",
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "#213547"
                }}>
                    {fileName}
                </h1>

                {/* Informações à direita */}
                <div style={{ textAlign: "right", fontSize: "12px", color: "#213547" }}>
                    <div><strong>Relatório</strong></div>
                    <div>{tabName}</div>
                    <div>Processo</div>
                    <div style={{ fontSize: "11px" }}>{selectedProcesso}</div>
                </div>

                {/* Tabela de Informações */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "16px",
                        fontSize: "12px",
                        marginBottom: "40px",
                    }}
                >
                    {Object.entries(dados).map(([chave, valor]) => {
                        let displayValue = `Sem ${chave}`;

                        if (chave === "Valor da Causa") {
                            const numero = Number(valor);
                            displayValue = !isNaN(numero)
                                ? numero.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                })
                                : `Sem ${chave}`;

                        } else if (chave === "Distribuição") {
                            let data: Date | null = null;

                            if (!isNaN(Number(valor))) {
                                // número serial do Excel
                                const serial = Number(valor);
                                const utc_days = Math.floor(serial - 25569);
                                const utc_value = utc_days * 86400;
                                data = new Date(utc_value * 1000);
                                data.setHours(data.getHours() + 3);
                            } else if (typeof valor === "string") {
                                const partes = valor.split("/");
                                if (partes.length === 3) {
                                    const [dia, mes, ano] = partes.map(Number);
                                    if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
                                        data = new Date(ano, mes - 1, dia);
                                    }
                                }
                            }

                            displayValue = data
                                ? data.toLocaleDateString("pt-BR")
                                : `Sem ${chave}`;
                        } else {
                            displayValue =
                                valor && String(valor).trim() !== ""
                                    ? String(valor)
                                    : `Sem ${chave}`;
                        }

                        return (
                            <div
                                key={chave}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: 6,
                                    padding: "10px",
                                    background: "#f9f9f9",
                                }}
                            >
                                <strong>{chave}</strong>
                                <br />
                                {displayValue}
                            </div>
                        );
                    })}
                </div>

                {/* Gráfico */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <div style={{ width: "350px", height: "350px" }}>
                        <PieChartCard
                            tributos={mostrarSomenteValorCausa ? 0 : tributos}
                            multa={mostrarSomenteValorCausa ? 0 : multa}
                            juros={mostrarSomenteValorCausa ? 0 : juros}
                            valorCausa={mostrarSomenteValorCausa ? valorCausa : 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFExporter;
