// public/idb.js - Vanilla IDB facade for grader (window.idb)
// Exposes: openCostsDB(name, version) -> { addCost, getReport, getAllRaw }
// Provides setRatesUrl(url) to change rates source.
(function () {
    const STORE = "costs";
    let _db = null;
    let _ratesUrl = "/rates.json";
    let _rates = null;

    function _normalize(cost) {
        const currency = cost.currency || cost.curency || "USD";
        return {
            sum: Number(cost.sum),
            currency: String(currency).toUpperCase(),
            category: String(cost.category || "GENERAL").toUpperCase(),
            description: String(cost.description || ""),
            date: cost.date || null
        };
    }

    async function _fetchRates() {
        if (!_ratesUrl) return { USD: 1 };
        try {
            const res = await fetch(_ratesUrl, { cache: "no-cache" });
            if (!res.ok) return { USD: 1 };
            const json = await res.json();
            _rates = json.rates ? json.rates : json;
            return _rates;
        } catch (e) {
            console.error("Failed to fetch rates", e);
            return { USD: 1 };
        }
    }

    function _convert(sum, from, to) {
        if (from === to) return sum;
        const rates = _rates || {};
        const rFrom = rates[from];
        const rTo = rates[to];
        if (typeof rFrom !== "number" || typeof rTo !== "number") {
            return sum;
        }
        // rates are flat numbers (e.g. USD:1, ILS:3.4) meaning 1 unit of currency * rate => USD
        const inUSD = sum / rFrom;
        return inUSD * rTo;
    }

    function openCostsDB(name, version) {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(String(name), Number(version));
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
                    store.createIndex("byDate", "dateISO");
                }
            };
            req.onsuccess = (e) => {
                _db = e.target.result;
                resolve({
                    addCost(cost) {
                        return new Promise((res, rej) => {
                            const input = _normalize(cost);
                            if (!input.sum || !isFinite(input.sum) || input.sum <= 0) {
                                rej(new Error("sum must be a positive number"));
                                return;
                            }
                            if (!input.currency) { rej(new Error("currency required")); return; }
                            if (!input.category) { rej(new Error("category required")); return; }

                            const tx = _db.transaction(STORE, "readwrite");
                            const store = tx.objectStore(STORE);
                            const toSave = {
                                sum: input.sum,
                                currency: input.currency,
                                category: input.category,
                                description: input.description,
                                dateISO: input.date ? new Date(input.date).toISOString() : new Date().toISOString()
                            };
                            store.add(toSave);
                            tx.oncomplete = () => res({
                                sum: toSave.sum,
                                currency: toSave.currency,
                                category: toSave.category,
                                description: toSave.description,
                                dateISO: toSave.dateISO
                            });
                            tx.onerror = (err) => rej(err);
                        });
                    },

                    async getReport(year, month, currency) {
                        await _fetchRates();
                        return new Promise((res, rej) => {
                            const tx = _db.transaction(STORE, "readonly");
                            const store = tx.objectStore(STORE);
                            const getAll = store.getAll();
                            getAll.onsuccess = () => {
                                const items = (getAll.result || []).filter((c) => {
                                    const d = new Date(c.dateISO);
                                    return d.getFullYear() === Number(year) && (d.getMonth() + 1) === Number(month);
                                });

                                let total = 0;
                                const costs = items.map((c) => {
                                    const d = new Date(c.dateISO);
                                    const converted = _convert(Number(c.sum), c.currency, currency);
                                    total += converted;
                                    return {
                                        sum: Number(c.sum),
                                        currency: c.currency,
                                        converted: Number(converted.toFixed(2)),
                                        category: c.category,
                                        description: c.description,
                                        Date: { day: d.getDate() }
                                    };
                                });

                                res({
                                    year: Number(year),
                                    month: Number(month),
                                    costs,
                                    total: { currency: String(currency), total: Number(total.toFixed(2)) }
                                });
                            };
                            getAll.onerror = (err) => rej(err);
                        });
                    },

                    // helper for tests/debug
                    getAllRaw() {
                        return new Promise((res, rej) => {
                            const tx = _db.transaction(STORE, "readonly");
                            const store = tx.objectStore(STORE);
                            const r = store.getAll();
                            r.onsuccess = () => res(r.result || []);
                            r.onerror = (e) => rej(e);
                        });
                    }
                });
            };
            req.onerror = (e) => reject(e);
        });
    }

    window.idb = {
        openCostsDB,
        setRatesUrl(url) { _ratesUrl = url; }
    };
})();
