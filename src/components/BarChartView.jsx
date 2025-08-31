// src/components/BarChartView.jsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChartView({ db }) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState("USD");
    const [report, setReport] = useState(null);

    useEffect(() => {
        if (!db) return;
        let mounted = true;
        (async () => {
            const r = await db.getYearlyReport(year, currency);
            if (!mounted) return;
            setReport(r);
        })();
        return () => { mounted = false; };
    }, [db, year, currency]);

    if (!report) return <p>Loading yearly report...</p>;
    if (report.monthlyTotals.every(v => v === 0)) return <p>No data to display for {year}</p>;

    const labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const data = {
        labels,
        datasets: [{
            label: `Expenses (${report.currency})`,
            data: report.monthlyTotals,
            backgroundColor: "rgba(75,192,192,0.6)"
        }]
    };

    return (
        <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
            <h2>Yearly Expenses - {year}</h2>
            <Bar data={data} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>
    );
}
