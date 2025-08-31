// src/components/AddCostForm.jsx
import React, { useState } from "react";
import { Paper, Stack, TextField, MenuItem, Button } from "@mui/material";

const currencies = ["USD","ILS","GBP","EURO"];
const categories = ["FOOD","TRANSPORT","HOUSING","ENTERTAINMENT","OTHER"];

export default function AddCostForm({ db, onAdded }) {
    const [form, setForm] = useState({ sum: "", currency: "USD", category: "FOOD", description: "", date: "" });

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        const sum = Number(form.sum);
        if (!sum || !isFinite(sum) || sum <= 0) { alert("Sum must be positive"); return; }
        try {
            await db.addCost({ sum, currency: form.currency, category: form.category, description: form.description, date: form.date || undefined });
            alert("Added");
            setForm({ sum: "", currency: "USD", category: "FOOD", description: "", date: "" });
            if (typeof onAdded === "function") onAdded();
        } catch (err) {
            alert(err.message || "Failed");
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <form onSubmit={onSubmit}>
                <Stack spacing={2}>
                    <TextField label="Sum" name="sum" type="number" value={form.sum} onChange={onChange} inputProps={{ min: 0.01, step: 0.01 }} required />
                    <TextField select label="Currency" name="currency" value={form.currency} onChange={onChange}>
                        {currencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                    <TextField select label="Category" name="category" value={form.category} onChange={onChange}>
                        {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                    <TextField label="Description" name="description" value={form.description} onChange={onChange} />
                    <TextField label="Date (optional)" name="date" type="date" value={form.date} onChange={onChange} InputLabelProps={{ shrink: true }} />
                    <Button type="submit" variant="contained">Add Cost</Button>
                </Stack>
            </form>
        </Paper>
    );
}
