import { writeFileSync, readFileSync, existsSync } from "fs";
import { csvFormat, csvParse } from "d3-dsv";
import { sum, rollups } from "d3-array";

const main = async () => {
  const req = await fetch("https://kubra.io/stormcenter/api/v1/stormcenters/4fbb3ad3-e01d-4d71-9575-d453769c1171/views/8ed2824a-bd92-474e-a7c4-848b812b7f9b/currentState?preview=false");
  const res = await req.json();

  const slug = res.data.interval_generation_data;

  const request = await fetch(`https://kubra.io/${slug}/public/thematic-2/thematic_areas.json`);
  const response = await request.json();

  const timestamp = new Date().toISOString();

  const now = response.file_data.map(d => ({
    timestamp,
    zipcode: d.title,
    number_outages: d.desc.n_out,
    customers_served: d.desc.cust_s,
    customers_affected: d.desc.cust_a.val,
    percent_affected: d.desc.percent_cust_a.val
  }));

  writeFileSync("./data.csv", csvFormat(now));

  // const data = existsSync("./history.csv")
  //   ? [...csvParse(readFileSync("./history.csv").toString()), ...now]
  //   : now;

  // writeFileSync("./history.csv", csvFormat(data));

  // const reduced = data.map(({ timestamp, customers_affected }) => ({
  //   timestamp: new Date(
  //       new Date(timestamp)
  //         .toLocaleString("en-US", { timeZone: "America/Detroit" })
  //     ).toISOString().substring(0, 19),
  //   customers_affected: +customers_affected,
  // }))

  // writeFileSync(
  //   "./history-reduced.csv",
  //   csvFormat(
  //     rollups(
  //       reduced,
  //       v => sum(v, o => o.customers_affected),
  //       d => d.timestamp,
  //     ).map(([timestamp, customers_affected]) => ({ timestamp, customers_affected }))
  //   )
  // )

  const home = await (await fetch("https://outage.dteenergy.com/situations.json")).json();
  writeFileSync("./data-home.json", JSON.stringify(home, null, 2));
  // const home_history = csvParse(readFileSync("./data-home.csv").toString());
  // writeFileSync(
  //   "./data-home.csv",
  //   csvFormat(
  //     [...home_history,
  //       {
  //         date_generated: home.lastUpdated,
  //         number_crews: home.currentSituations[0].displayValue,
  //         number_customers_affected: home.currentSituations[1].displayValue,
  //         percent_with_power: home.currentSituations[2].displayValue,
  //       }
  //     ]
  //   )
  // );

  const api = await (await fetch(`https://kubra.io/${slug}/public/summary-1/data.json`)).json();
  writeFileSync("./data-api.json", JSON.stringify(api, null, 2));
  // const api_history = csvParse(readFileSync("./data-api.csv").toString());
  // writeFileSync(
  //   "./data-api.csv", 
  //   csvFormat(
  //     [...api_history,
  //       {
  //         total_affected: api.summaryFileData.totals[0].total_cust_a.val,
  //         total_percent_affected: api.summaryFileData.totals[0].total_percent_cust_a.val,
  //         total_percent_active: api.summaryFileData.totals[0].total_percent_cust_active.val,
  //         total_served: api.summaryFileData.totals[0].total_cust_s,
  //         total_outages: api.summaryFileData.totals[0].total_outages,
  //         date_generated: api.summaryFileData.date_generated,
  //       }
  //     ]
  //   )
  // );

  console.log(
    slug, 
    sum(now, d => d.customers_affected)
  )
}

main();