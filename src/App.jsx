// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Container, Typography } from "@mui/material";
import { openCostsDB } from "./lib/idb";

import Home from "./pages/Home";
import Reports from "./pages/Reports";
import BarChartPage from "./pages/BarChartView";
import Settings from "./pages/Settings";

export default function App() {
    const [db, setDb] = useState(null);
    const [defaultCurrency, setDefaultCurrency] = useState("USD");

    useEffect(() => {
        (async () => {
            const dbApi = await openCostsDB();
            setDb(dbApi);
            const savedCurrency = await dbApi.getSetting("currency");
            if (savedCurrency) setDefaultCurrency(savedCurrency);
        })();
    }, []);

    if (!db) return <div style={{ padding: 20 }}>Loading database...</div>;

    return (
        <Router>
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" component={Link} to="/">Home</Button>
                    <Button color="inherit" component={Link} to="/reports">Pie Report</Button>
                    <Button color="inherit" component={Link} to="/barchart">Bar Chart</Button>
                    <Button color="inherit" component={Link} to="/settings">Settings</Button>
                    <Typography sx={{ ml: 2 }}>{/* spacer */}</Typography>
                </Toolbar>
            </AppBar>
            <Container sx={{ mt: 3 }}>
                <Routes>
                    <Route path="/" element={<Home db={db} defaultCurrency={defaultCurrency} />} />
                    <Route path="/reports" element={<Reports db={db} defaultCurrency={defaultCurrency} />} />
                    <Route path="/barchart" element={<BarChartPage db={db} defaultCurrency={defaultCurrency} />} />
                    <Route path="/settings" element={<Settings db={db} setDefaultCurrency={setDefaultCurrency} />} />
                </Routes>
            </Container>
        </Router>
    );
}
