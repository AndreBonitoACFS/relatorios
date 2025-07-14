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
}

const COLORS = ["#4F46E5", "#06B6D4", "#F59E0B"];

const PieChartCard: React.FC<PieChartCardProps> = ({ tributos, juros, multa }) => {
    const data = [
        { name: "Tributos", value: tributos },
        { name: "Juros", value: juros },
        { name: "Multa", value: multa },
    ];

    return (
        <div>
            <ResponsiveContainer width={280} height={280}>
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
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
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
