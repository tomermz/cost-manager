// Function to log messages both to the console and on the page
function log(msg) {
    console.log(msg);
    const p = document.createElement("p");
    p.textContent = msg;
    document.body.appendChild(p);
}

// Function to run the test
async function test() {
    // Assuming idb.js exports an object named 'idb'
    const db = await idb.openCostsDB("costsdb", 1);

    const result1 = await db.addCost({ sum: 200, currency: "USD", category: "FOOD", description: "pizza" });
    const result2 = await db.addCost({ sum: 400, currency: "USD", category: "CAR", description: "fuel" });

    if(db) log("Database creation succeeded");
    if(result1) log("Adding first cost item succeeded");
    if(result2) log("Adding second cost item succeeded");
}

// Run the test
test();
