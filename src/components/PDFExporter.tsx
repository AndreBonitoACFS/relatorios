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
            setTimeout(generatePDF, 2000);
        }
    }, []);

    const mostrarSomenteValorCausa = tributos === 0 && multa === 0 && juros === 0;
    const valorCausa = Number(dados["Valor da Causa"] || 0);

    const generatePDF = async () => {
        if (!pdfRef.current) return;

        const pdf = new jsPDF("l", "mm", "a3");
        const margin = 10;
        const usableWidth = pdf.internal.pageSize.getWidth() - margin * 2;

        // Canvas de alta resolução
        const canvas = await html2canvas(pdfRef.current, {
            scale: 5,
            useCORS: true,
            backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * usableWidth) / canvas.width;

        // Cabeçalho
        const logoImg = new Image();
        logoImg.src = "/logo.png";
        await new Promise((resolve) => (logoImg.onload = resolve));
        const logoWidth = 30;
        const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
        pdf.addImage(logoImg, "PNG", margin, margin, logoWidth, logoHeight);

        pdf.setFontSize(12);
        pdf.text(`Relatório: ${fileName} - ${tabName}`, margin + logoWidth + 5, margin + 5);

        // Imagem principal
        const position = margin + logoHeight + 5;
        pdf.addImage(imgData, "PNG", margin, position, usableWidth, imgHeight);

        // Rodapé
        pdf.setFontSize(10);
        pdf.text(
            `Processo: ${selectedProcesso} - Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
            margin,
            pdf.internal.pageSize.getHeight() - 10
        );

        pdf.save(`relatorio_${tabName}_${selectedProcesso}.pdf`);
        onFinish();
    };

    const destaqueCampos =
        tabName === "Administrativo"
            ? ["Espécie", "Valor da Causa", "Prognóstico"]
            : ["Espécie", "Valor da Causa", "Distribuição", "Prognóstico"];

    const formatValue = (chave: string, valor: any): string => {
        if (chave === "Valor da Causa") {
            const numero = Number(valor);
            return !isNaN(numero)
                ? numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : `Sem ${chave}`;
        }

        if (chave === "Distribuição") {
            let data: Date | null = null;
            if (!isNaN(Number(valor))) {
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
            return data ? data.toLocaleDateString("pt-BR") : `Sem ${chave}`;
        }

        return valor && String(valor).trim() !== "" ? String(valor) : `Sem ${chave}`;
    };

    const restantesOrdenados = Object.entries(dados)
        .filter(([chave]) => !destaqueCampos.includes(chave))
        .sort((a, b) => String(a[1]).length - String(b[1]).length);

    return (
        <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
            <div
                ref={pdfRef}
                style={{
                    width: "1600px", // A3 em paisagem
                    padding: "20px",
                    background: "#ffffff",
                    fontFamily: "'Helvetica', sans-serif",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                }}
            >
                {/* Cabeçalho visual */}
                <div
                    style={{
                        background: "linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)",
                        padding: "15px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center", // centraliza o texto
                        marginBottom: "20px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <img src="/logo.png" alt="Logo" style={{ width: 50, marginRight: "10px" }} />
                    <div style={{ textAlign: "center", color: "#ffffff" }}>
                        <h1 style={{ fontSize: "18px", margin: 0, fontWeight: "bold" }}>
                            {fileName.replace(/ - Relatório$/i, "")}
                        </h1>
                        <p style={{ margin: "5px 0 0", fontSize: "12px", fontWeight: 500 }}>
                            {tabName} — Processo: {selectedProcesso}
                        </p>
                    </div>
                </div>

                {/* Conteúdo: gráfico + dados */}
                <div style={{ display: "flex", gap: "20px" }}>
                    <div
                        style={{
                            width: "280px",
                            height: "280px",
                            flexShrink: 0,
                            padding: "10px",
                            background: "#ffffff",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: "26px",
                        }}
                    >
                        <PieChartCard
                            tributos={mostrarSomenteValorCausa ? 0 : tributos}
                            multa={mostrarSomenteValorCausa ? 0 : multa}
                            juros={mostrarSomenteValorCausa ? 0 : juros}
                            valorCausa={mostrarSomenteValorCausa ? valorCausa : 0}
                        />
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
                        {/* Destaques */}
                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: "8px",
                                padding: "12px",
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "8px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            {destaqueCampos.map((chave) => (
                                <div key={chave} style={{ minWidth: "80px" }}>
                                    <div
                                        style={{
                                            fontSize: "10px",
                                            color: "#6b7280",
                                            fontWeight: 600,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {chave}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#1f2937", fontWeight: 500 }}>
                                        {formatValue(chave, dados[chave])}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Outros campos */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: "10px",
                            }}
                        >
                            {restantesOrdenados.map(([chave, valor]) => (
                                <div
                                    key={chave}
                                    style={{
                                        background: "#fff",
                                        borderRadius: "8px",
                                        padding: "12px",
                                        border: "1px solid #e5e7eb",
                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                                    }}
                                >
                                    <strong
                                        style={{ fontSize: "11px", color: "#1f2937", textTransform: "uppercase" }}
                                    >
                                        {chave}
                                    </strong>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "#374151",
                                            marginTop: "6px",
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {formatValue(chave, valor)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFExporter;
