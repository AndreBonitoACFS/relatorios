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

        const pdf = new jsPDF("p", "mm", "a4");
        const margin = 10;
        const usableWidth = pdf.internal.pageSize.getWidth() - margin * 2;

        const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * usableWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", margin, margin, usableWidth, imgHeight);
        pdf.save(`relatorio_${tabName}_${selectedProcesso}.pdf`);
        onFinish();
    };

    const destaqueCampos = ["Espécie", "Valor da Causa", "Distribuição", "Prognóstico"];

    const formatValue = (chave: string, valor: any): string => {
        if (chave === "Valor da Causa") {
            const numero = Number(valor);
            return !isNaN(numero)
                ? numero.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                })
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
                    width: "900px",
                    padding: "20px",
                    background: "#ffffff",
                    fontFamily: "Arial, sans-serif",
                }}
            >
                {/* Cabeçalho */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <img src="/logo.png" alt="Logo" style={{ width: 80 }} />
                    <div style={{ flexGrow: 1, textAlign: "center" }}>
                        <h1 style={{ fontSize: "20px", margin: 0, fontWeight: "bold" }}>
                            {fileName.replace(/ - Relatório$/i, "")}
                        </h1>
                        <p style={{ margin: 0, fontWeight: "bold" }}>
                            {tabName} — Processo: {selectedProcesso}
                        </p>
                    </div>
                </div>

                {/* Corpo: gráfico + info */}
                <div style={{ display: "flex", gap: "32px" }}>
                    {/* Gráfico */}
                    <div style={{ width: "360px", height: "360px", flexShrink: 0 }}>
                        <PieChartCard
                            tributos={mostrarSomenteValorCausa ? 0 : tributos}
                            multa={mostrarSomenteValorCausa ? 0 : multa}
                            juros={mostrarSomenteValorCausa ? 0 : juros}
                            valorCausa={mostrarSomenteValorCausa ? valorCausa : 0}
                        />
                    </div>

                    {/* Informações */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                        {/* Supercaixa compacta */}
                        <div
                            style={{
                                background: "#f3f4f6",
                                borderRadius: "10px",
                                padding: "4px 8px",
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                gap: "6px",
                                flexWrap: "wrap",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                        >
                            {destaqueCampos.map((chave) => (
                                <div key={chave} style={{ minWidth: "100px", flex: "1 0 auto" }}>
                                    <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: 600 }}>
                                        {chave}
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#111827" }}>
                                        {formatValue(chave, dados[chave])}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Demais cards (exceto os 2 últimos) */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "6px",
                            }}
                        >
                            {restantesOrdenados.slice(0, -2).map(([chave, valor]) => (
                                <div
                                    key={chave}
                                    style={{
                                        background: "#ffffff",
                                        borderRadius: "8px",
                                        padding: "12px",
                                        border: "1px solid #e5e7eb",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    }}
                                >
                                    <strong style={{ fontSize: "12px", color: "#374151" }}>{chave}</strong>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#111827",
                                            marginTop: "4px",
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

                {/* Últimos dois cards abaixo do gráfico */}
                {restantesOrdenados.length >= 2 && (
                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "24px",
                            justifyContent: "center",
                        }}
                    >
                        {restantesOrdenados.slice(-2).map(([chave, valor]) => (
                            <div
                                key={chave}
                                style={{
                                    background: "#ffffff",
                                    borderRadius: "8px",
                                    padding: "12px",
                                    border: "1px solid #e5e7eb",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    maxWidth: "400px",
                                    width: "100%",
                                }}
                            >
                                <strong style={{ fontSize: "12px", color: "#374151" }}>{chave}</strong>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#111827",
                                        marginTop: "4px",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {formatValue(chave, valor)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFExporter;
