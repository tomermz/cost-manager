// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { Paper, Stack, TextField, Button, Typography } from "@mui/material";
import { setRatesUrl, getRatesUrl } from "../lib/idb";

export default function Settings({ db, setDefaultCurrency }) {
    const [ratesUrl, setLocalRatesUrl] = useState(getRatesUrl() || "/rates.json");
    const [currency, setCurrency] = useState("USD");

    useEffect(() => {
        (async () => {
            if (!db) return;
            const savedRates = await db.getSetting("ratesUrl");
            const savedCurrency = await db.getSetting("currency");
            setLocalRatesUrl(savedRates || getRatesUrl() || "/rates.json");
            if (savedCurrency) setCurrency(savedCurrency);
        })();
    }, [db]);

    const save = async () => {
        await db.setSetting("ratesUrl", ratesUrl);
        setRatesUrl(ratesUrl);
        if (typeof setDefaultCurrency === "function") setDefaultCurrency(currency);
        await db.setSetting("currency", currency);
        alert("Saved settings");
    };

    return (
        <Paper sx={{ p:2 }}>
            <Typography variant="h5">Settings</Typography>
            <Stack spacing={2} sx={{ mt:2 }}>
                <TextField label="Rates JSON URL" value={ratesUrl} onChange={e=>setLocalRatesUrl(e.target.value)} fullWidth />
                <TextField label="Default Currency" value={currency} onChange={e=>setCurrency(e.target.value)} />
                <Button variant="contained" onClick={save}>Save</Button>
            </Stack>
        </Paper>
    );
}
