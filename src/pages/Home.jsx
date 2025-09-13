// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
    Stack,
} from "@mui/material";

const currencies = ["USD", "ILS", "GBP", "EURO"];
const categories = ["FOOD", "TRANSPORT", "HOUSING", "ENTERTAINMENT", "OTHER"];

export default function Home({ db, defaultCurrency }) {
    const [form, setForm] = useState({
        price: "",
        currency: defaultCurrency || "USD",
        category: "FOOD",
        description: "",
        date: "",
    });
    const [costs, setCosts] = useState([]);

    const loadCurrentMonth = async () => {
        const now = new Date();
        const report = await db.getReport(
            now.getFullYear(),
            now.getMonth() + 1,
            form.currency
        );
        setCosts(report.costs || []);
    };

    useEffect(() => {
        loadCurrentMonth();
    }, [db]);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        const price = Number(form.price);
        if (!price || !isFinite(price) || price <= 0) {
            alert("Price must be positive");
            return;
        }
        await db.addCost({
            sum: price,
            currency: form.currency,
            category: form.category,
            description: form.description,
            date: form.date || undefined,
        });
        setForm({
            price: "",
            currency: form.currency,
            category: "FOOD",
            description: "",
            date: "",
        });
        await loadCurrentMonth();
        alert("Added");
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Add Expense
            </Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
                <form onSubmit={onSubmit}>
                    <Stack spacing={2}>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4,1fr)",
                                gap: 2,
                            }}
                        >
                            <TextField
                                label="Price"
                                name="price"
                                type="number"
                                value={form.price}
                                onChange={onChange}
                                inputProps={{ min: 0.01, step: 0.01 }}
                                required
                            />
                            <TextField
                                select
                                label="Currency"
                                name="currency"
                                value={form.currency}
                                onChange={onChange}
                            >
                                {currencies.map((c) => (
                                    <MenuItem key={c} value={c}>
                                        {c}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Category"
                                name="category"
                                value={form.category}
                                onChange={onChange}
                            >
                                {categories.map((c) => (
                                    <MenuItem key={c} value={c}>
                                        {c}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Date"
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Box>
                        <TextField
                            label="Description"
                            name="description"
                            value={form.description}
                            onChange={onChange}
                        />
                        <Button type="submit" variant="contained">
                            Add
                        </Button>
                    </Stack>
                </form>
            </Paper>

            <Typography variant="h6">This month expenses</Typography>
            <List>
                {costs.length === 0 && (
                    <Typography>No expenses for this month</Typography>
                )}
                {costs.map((c) => (
                    <React.Fragment key={c.id}>
                        <ListItem>
                            <ListItemText
                                primary={`${c.category} — ${c.sum.toFixed(2)} ${c.currency}`}
                                secondary={`${c.description} (${c.dateISO ? c.dateISO.split("T")[0] : ""})`}
                            />
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>
        </div>
    );
}