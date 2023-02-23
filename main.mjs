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

  const data = existsSync("./history.csv") 
    ? [...csvParse(readFileSync("./history.csv").toString()), ...now] 
    : now;

  writeFileSync("./history.csv", csvFormat(data));

  const reduced = data.map(({ timestamp, customers_affected }) => ({
    timestamp: new Date(
        new Date(timestamp)
          .toLocaleString("en-US", { timeZone: "America/Detroit" })
      ).toISOString(),
    customers_affected: +customers_affected,
  }))

  writeFileSync(
    "./history-reduced.csv",
    csvFormat(
      rollups(
        reduced,
        v => sum(v, o => o.customers_affected),
        d => d.timestamp,
      ).map(([timestamp, customers_affected]) => ({ timestamp, customers_affected }))
    )
  )

  console.log(
    slug, 
    sum(now, d => d.customers_affected)
  )
}

main();