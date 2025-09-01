// src/lib/idb.js - module wrapper for React app
let _dbNative = null;
let _ratesUrl = "/rates.json";
let _ratesCache = null;

export function setRatesUrl(url) { _ratesUrl = url; _ratesCache = null; }
export function getRatesUrl() { return _ratesUrl; }

async function _fetchRates() {
    if (_ratesCache) return _ratesCache;
    try {
        const res = await fetch(_ratesUrl, { cache: "no-cache" });
        if (!res.ok) return { USD: 1 };
        const json = await res.json();
        _ratesCache = json.rates ? json.rates : json;
        return _ratesCache;
    } catch (e) {
        console.error("Failed to fetch rates:", e);
        return { USD: 1 };
    }
}

function _convert(sum, from, to, rates) {
    if (from === to) return sum;
    const rFrom = rates[from];
    const rTo = rates[to];
    if (typeof rFrom !== "number" || typeof rTo !== "number") return sum;
    const inUSD = sum / rFrom;
    return inUSD * rTo;
}

function openNative(name = "CostManagerDB", version = 1) {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(String(name), Number(version));
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("costs")) {
                const s = db.createObjectStore("costs", { keyPath: "id", autoIncrement: true });
                s.createIndex("byDate", "dateISO");
            }
            if (!db.objectStoreNames.contains("settings")) {
                db.createObjectStore("settings", { keyPath: "key" });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function openCostsDB(name = "CostManagerDB", version = 1) {
    if (_dbNative) return _dbNative;
    const native = await openNative(name, version);

    _dbNative = {
        async addCost(cost) {
            const input = {
                sum: Number(cost.sum),
                currency: (cost.currency || cost.curency || "USD").toUpperCase(),
                category: (cost.category || "GENERAL").toUpperCase(),
                description: cost.description || "",
                dateISO: cost.date ? new Date(cost.date).toISOString() : new Date().toISOString(),
            };
            const d = new Date(input.dateISO);
            const toSave = {
                ...input,
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
            };

            return new Promise((res, rej) => {
                const tx = native.transaction("costs", "readwrite");
                const store = tx.objectStore("costs");
                store.add(toSave);
                tx.oncomplete = () => res(toSave);
                tx.onerror = (e) => rej(e);
            });
        },

        async getReport(year, month, currency) {
            const rates = await _fetchRates();
            return new Promise((resolve, reject) => {
                const tx = native.transaction("costs", "readonly");
                const store = tx.objectStore("costs");
                const r = store.getAll();
                r.onsuccess = () => {
                    const all = r.result || [];
                    const filtered = all.filter(c => Number(c.year) === Number(year) && Number(c.month) === Number(month));
                    let total = 0;
                    const costs = filtered.map(c => {
                        const converted = Number((_convert(Number(c.sum), c.currency, currency, rates)).toFixed(2));
                        total += converted;
                        return {
                            sum: Number(c.sum),
                            currency: c.currency,
                            converted,
                            category: c.category,
                            description: c.description,
                            Date: { day: c.day },
                            id: c.id
                        };
                    });
                    resolve({ year: Number(year), month: Number(month), costs, total: { currency, total: Number(total.toFixed(2)) } });
                };
                r.onerror = reject;
            });
        },

        async getYearlyReport(year, currency) {
            const rates = await _fetchRates();
            return new Promise((resolve, reject) => {
                const tx = native.transaction("costs", "readonly");
                const store = tx.objectStore("costs");
                const r = store.getAll();
                r.onsuccess = () => {
                    const all = r.result || [];
                    const filtered = all.filter(c => Number(c.year) === Number(year));
                    const monthlyTotals = Array(12).fill(0);
                    filtered.forEach(c => {
                        const converted = (_convert(Number(c.sum), c.currency, currency, rates));
                        monthlyTotals[c.month - 1] += converted;
                    });
                    // round to 2 decimals
                    for (let i = 0; i < monthlyTotals.length; i++) monthlyTotals[i] = Number(monthlyTotals[i].toFixed(2));
                    resolve({ year: Number(year), currency: String(currency), monthlyTotals });
                };
                r.onerror = reject;
            });
        },

        setSetting(key, value) {
            return new Promise((res, rej) => {
                const tx = native.transaction("settings", "readwrite");
                tx.objectStore("settings").put({ key, value });
                tx.oncomplete = () => res();
                tx.onerror = (e) => rej(e);
            });
        },

        getSetting(key) {
            return new Promise((res, rej) => {
                const tx = native.transaction("settings", "readonly");
                const r = tx.objectStore("settings").get(key);
                r.onsuccess = () => res(r.result?.value);
                r.onerror = (e) => rej(e);
            });
        },

        getAllRaw() {
            return new Promise((res, rej) => {
                const tx = native.transaction("costs", "readonly");
                const r = tx.objectStore("costs").getAll();
                r.onsuccess = () => res(r.result || []);
                r.onerror = (e) => rej(e);
            });
        }
    };

    return _dbNative;
}
