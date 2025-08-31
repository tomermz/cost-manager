// src/pages/BarChartView.jsx
import React, { useEffect, useState } from "react";
import { Typography, TextField, MenuItem, Button, Paper, Stack } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

const currencies = ["USD","ILS","GBP","EURO"];
const monthsLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function BarChartView({ db, defaultCurrency }) {
    const [year, setYear] = useState(new Date().getFullYear());
    const [currency, setCurrency] = useState(defaultCurrency || "USD");
    const [data, setData] = useState([]);

    const load = async () => {
        const r = await db.getYearlyReport(Number(year), currency);
        const values = r.monthlyTotals || Array(12).fill(0);
        // prepare array of 12 items
        const arr = monthsLabels.map((m, idx) => ({ month: m, value: Number((values[idx]||0).toFixed(2)) }));
        setData(arr);
    };

    useEffect(() => { if (db) load(); }, [db, year, currency]);

    return (
        <Paper sx={{ p:2 }}>
            <Typography variant="h5">Yearly Bar Report</Typography>
            <Stack direction="row" spacing={2} sx={{ my:2 }}>
                <TextField type="number" label="Year" value={year} onChange={e=>setYear(Number(e.target.value))} />
                <TextField select label="Currency" value={currency} onChange={e=>setCurrency(e.target.value)}>
                    {currencies.map(c=> <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
                <Button variant="contained" onClick={load}>Load</Button>
            </Stack>

            {data.length === 0 ? <Typography>Loading yearly report...</Typography> :
                <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name={`Total (${currency})`} />
                    </BarChart>
                </ResponsiveContainer>
            }
        </Paper>
    );
}
