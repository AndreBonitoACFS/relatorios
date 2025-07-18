import React from "react";
import PieChartCard from "./PieChartCard";

interface DashboardProps {
    data: any[];
    tabName: string;
    fileName: string;
    selectedProcesso: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, selectedProcesso, tabName }) => {
    const filtered = data.filter((row: any) => row["Processo"] === selectedProcesso);
    const row = filtered[0] || {};

    const sum = (col: string) =>
        filtered.reduce((acc, row: any) => acc + (Number(row[col]) || 0), 0);

    const excelDateToJS = (serial: number): Date => {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date = new Date(utc_value * 1000);
        date.setHours(date.getHours() + 3);
        return date;
    };

    const valorCausa = Number(row?.["Valor da Causa"] || 0);
    const mostrarSomenteValorCausa =
        sum("Tributos") === 0 && sum("Multa") === 0 && sum("Juros") === 0;

    const formatValue = (key: string, value: any): string => {
        if (key === "Valor da Causa") {
            const num = Number(value);
            return isNaN(num)
                ? `Sem ${key}`
                : num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        } else if (key === "Distribuição") {
            let data: Date | null = null;
            if (!isNaN(Number(value))) {
                data = excelDateToJS(Number(value));
            } else if (typeof value === "string") {
                const partes = value.split("/");
                if (partes.length === 3) {
                    const [dia, mes, ano] = partes.map(Number);
                    data = new Date(ano, mes - 1, dia);
                }
            }
            return data ? data.toLocaleDateString("pt-BR") : `Sem ${key}`;
        } else {
            return value && String(value).trim() !== "" ? String(value) : `Sem ${key}`;
        }
    };

    const blocoChave =
        tabName === "Administrativo"
            ? ["Espécie", "Valor da Causa", "Prognóstico"]
            : ["Espécie", "Valor da Causa", "Distribuição", "Prognóstico"];
    const dadosChave = blocoChave.map((campo) => ({
        key: campo,
        value: formatValue(campo, row?.[campo]),
    }));

    const demaisDados = Object.entries(row)
        .filter(([key]) => !["Tributos", "Multa", "Juros", "Processo", ...blocoChave].includes(key))
        .sort((a, b) => String(a[1] || "").length - String(b[1] || "").length);

    const allSmallTexts = demaisDados.every(([, value]) => String(value || "").length <= 300);

    return (
        <div id="dashboard-main" style={{ display: "flex", flexDirection: "row", gap: "48px" }}>
            <div id="grafico-wrapper">
                <PieChartCard
                    tributos={mostrarSomenteValorCausa ? 0 : sum("Tributos")}
                    multa={mostrarSomenteValorCausa ? 0 : sum("Multa")}
                    juros={mostrarSomenteValorCausa ? 0 : sum("Juros")}
                    valorCausa={mostrarSomenteValorCausa ? valorCausa : 0}
                />
            </div>

            <div id="info-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Bloco principal */}
                <div
                    className="info-card"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "16px",
                        width: "fit-content",
                        margin: "0 auto",
                        border: "1px solid #e5e7eb",
                        borderRadius: "18px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                >
                    {dadosChave.map(({ key, value }) => (
                        <div
                            key={key}
                        // style={{
                        //     background: "#ffffff",
                        //     border: "1px solid #e5e7eb",
                        //     borderRadius: "8px",
                        //     padding: "12px",
                        //     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // sombra mais intensa
                        // }}
                        >
                            <strong className="info-label">{key}</strong>
                            <p className="info-value">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Cards adicionais */}
                <div
                    className="info-card-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: allSmallTexts
                            ? "repeat(auto-fit, minmax(250px, 1fr))"
                            : "repeat(auto-fit, minmax(400px, 1fr))",
                        gap: "32px", // também aumentei aqui
                        justifyContent: allSmallTexts ? "center" : "start",
                        width: "fit-content",
                        margin: "0 auto",
                    }}
                >
                    {demaisDados.map(([key, value]) => (
                        <div
                            key={key as string}
                            style={{
                                background: "#ffffff",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "12px",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // sombra maior aqui também
                            }}
                        >
                            <strong className="info-label">{key}</strong>
                            <p className="info-value">{formatValue(key, value)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
