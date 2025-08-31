// src/components/PieChartView.jsx
import React, { useState } from "react";
import { Paper, Stack, TextField, MenuItem, Button, Typography } from "@mui/material";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const currencies = ["USD","ILS","GBP","EURO"];
const COLORS = ["#0088FE","#00C49F","#FFBB28","#FF8042","#A020F0","#6A5ACD"];

export default function PieChartView({ db }) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()+1);
    const [currency, setCurrency] = useState("USD");
    const [data, setData] = useState([]);
    const [totalInfo, setTotalInfo] = useState(null);

    const load = async () => {
        const report = await db.getReport(Number(year), Number(month), currency);
        if (!report || !report.costs || report.costs.length === 0) {
            setData([]);
            setTotalInfo(null);
            return;
        }
        const grouped = {};
        report.costs.forEach(c => {
            grouped[c.category] = (grouped[c.category] || 0) + (c.converted || 0);
        });
        const chartData = Object.entries(grouped).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
        setData(chartData);
        setTotalInfo(report.total);
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <TextField type="number" label="Year" value={year} onChange={e => setYear(e.target.value)} />
                    <TextField type="number" label="Month" value={month} onChange={e => setMonth(e.target.value)} />
                    <TextField select label="Currency" value={currency} onChange={e => setCurrency(e.target.value)}>
                        {currencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                    <Button variant="contained" onClick={load}>Load</Button>
                </Stack>
                <Typography> Total: {totalInfo ? `${totalInfo.total.toFixed(2)} ${totalInfo.currency}` : "-"}</Typography>
                {data.length ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie dataKey="value" data={data} nameKey="name" outerRadius={100} label>
                                {data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : <Typography>No data</Typography>}
            </Stack>
        </Paper>
    );
}
