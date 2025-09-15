import idb from "public/idb.js";

async function test() {

    const db = await idb.openCostsDB("costsdb",1);

    const result1 =
        await db.addCost({ sum: 200, currency: "USD", category: "FOOD", description: "pizza" });

    const result2 =
        await db.addCost({ sum: 400, currency: "USD", category: "CAR", description: "fuel" });


    if(db) {

        console.log("creating db succeeded");

    }

    if(result1) {

        console.log("adding 1st cost item succeeded");

    }

    if(result2) {

        console.log("adding 2nd cost item succeeded");

    }

}

test()
