// src/pages/Reports.jsx
import React, { useState } from "react";
import { Typography, TextField, MenuItem, Button, Paper, Stack } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE","#00C49F","#FFBB28","#FF8042","#A020F0","#6A5ACD"];
const currencies = ["USD","ILS","GBP","EURO"];

export default function Reports({ db, defaultCurrency }) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()+1);
    const [currency, setCurrency] = useState(defaultCurrency || "USD");
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
        <Paper sx={{ p:2 }}>
            <Typography variant="h5">Monthly Pie Report</Typography>
            <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                <TextField type="number" label="Year" value={year} onChange={e=>setYear(Number(e.target.value))} />
                <TextField type="number" label="Month" value={month} onChange={e=>setMonth(Number(e.target.value))} inputProps={{min: 1, max:12}} />
                <TextField select label="Currency" value={currency} onChange={e=>setCurrency(e.target.value)}>
                    {currencies.map(c=> <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
                <Button variant="contained" onClick={load}>Load</Button>
            </Stack>

            <Typography> Total: {totalInfo ? `${totalInfo.total.toFixed(2)} ${totalInfo.currency}` : "-"}</Typography>
            {data.length ? (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
                            {data.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : <Typography>No data</Typography>}
        </Paper>
    );
}
