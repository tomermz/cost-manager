// src/components/Settings.jsx
import React, { useEffect, useState } from "react";
import { Paper, Stack, TextField, Button, Typography } from "@mui/material";
import { openCostsDB, setRatesUrl as setRatesUrlExport, getRatesUrl } from "../lib/idb";

export default function Settings() {
    const [url, setUrlLocal] = useState("");

    useEffect(() => {
        let mounted = true;
        (async () => {
            const db = await openCostsDB();
            const saved = await db.getSetting("ratesUrl");
            if (!mounted) return;
            setUrlLocal(saved || getRatesUrl() || "/rates.json");
        })();
        return () => { mounted = false; };
    }, []);

    const save = async () => {
        const db = await openCostsDB();
        await db.setSetting("ratesUrl", url);
        setRatesUrlExport(url);
        alert("Saved rates URL");
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Typography variant="h6">Settings</Typography>
                <TextField label="Rates JSON URL" value={url} onChange={e => setUrlLocal(e.target.value)} fullWidth />
                <Button variant="contained" onClick={save}>Save</Button>
            </Stack>
        </Paper>
    );
}
