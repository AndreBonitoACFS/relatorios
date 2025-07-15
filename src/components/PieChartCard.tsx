import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface PieChartCardProps {
    tributos: number;
    juros: number;
    multa: number;
    valorCausa?: number;
}

const COLORS = ["#4F46E5", "#06B6D4", "#F59E0B"];

const PieChartCard: React.FC<PieChartCardProps> = ({ tributos, juros, multa, valorCausa }) => {
    const data =
        valorCausa && tributos === 0 && multa === 0 && juros === 0
            ? [{ name: "Valor da Causa", value: valorCausa }]
            : [
                { name: "Tributos", value: tributos },
                { name: "Juros", value: juros },
                { name: "Multa", value: multa },
            ];

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {valorCausa && tributos === 0 && multa === 0 && juros === 0
                    ? "Valor da Causa"
                    : "Distribuição de Valores"}
            </h2>

            <ResponsiveContainer width={400} height={280}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        outerRadius={90}
                        innerRadius={40}
                        paddingAngle={2}
                        label={({ value }) =>
                            typeof value === "number"
                                ? `R$ ${value.toLocaleString("pt-BR")}`
                                : ""
                        }
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) =>
                            `R$ ${Number(value).toLocaleString("pt-BR")}`
                        }
                    />
                    <Legend
                        layout="horizontal"
                        align="center"
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value: string) => (
                            <span className="text-gray-700 text-sm">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartCard;
