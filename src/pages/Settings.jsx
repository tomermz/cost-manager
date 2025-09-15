// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { Paper, Stack, TextField, Button, Typography } from "@mui/material";
import { openCostsDB, setRatesUrl, getRatesUrl } from "../lib/idb";

const DEFAULT_URL = "/rates.json";
const REQUIRED_CURRENCIES = ["USD", "ILS", "GBP", "EURO"];

export default function Settings({ db }) {
    const [ratesUrl, setLocalRatesUrl] = useState(getRatesUrl() || DEFAULT_URL);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        (async () => {
            if (!db) return;
            const savedRates = await db.getSetting("ratesUrl");
            setLocalRatesUrl(savedRates || getRatesUrl() || DEFAULT_URL);
        })();
    }, [db]);

    async function validateRatesJson(url) {
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        const json = await res.json();
        const rates = json.rates ? json.rates : json;
        for (const c of REQUIRED_CURRENCIES) {
            if (typeof rates[c] !== "number") {
                throw new Error(`Missing required currency: ${c}`);
            }
        }
        return rates;
    }

    const save = async () => {
        setLoading(true);
        setMessage("");
        try {
            await validateRatesJson(ratesUrl.trim());
            await db.setSetting("ratesUrl", ratesUrl.trim());
            setRatesUrl(ratesUrl.trim());
            alert("Rates URL saved and validated.");
            setMessage("Rates URL saved and validated.");
        } catch (err) {
            console.error(err);
            alert(`Invalid Rates JSON: ${err.message}`);
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const reset = async () => {
        setLoading(true);
        try {
            await db.setSetting("ratesUrl", DEFAULT_URL);
            setRatesUrl(DEFAULT_URL);
            setLocalRatesUrl(DEFAULT_URL);
            alert("Reset to default /rates.json");
            setMessage("Reset to default /rates.json");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 2, margin: "0 auto" }}>
            <Typography variant="h5">Settings</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                    label="Rates JSON URL"
                    value={ratesUrl}
                    onChange={(e) => setLocalRatesUrl(e.target.value)}
                    fullWidth
                />
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={save} disabled={loading}>
                        Save
                    </Button>
                    <Button variant="outlined" onClick={reset} disabled={loading}>
                        Reset to Default
                    </Button>
                </Stack>
                {message && (
                    <Typography variant="body2" color="text.secondary">
                        {message}
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
}
