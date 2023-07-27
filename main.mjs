import { writeFileSync } from "fs";
import { csvFormat } from "d3-dsv";
import { sum } from "d3-array";

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

  const home = await (await fetch("https://outage.dteenergy.com/situations.json")).json();
  writeFileSync("./data-home.json", JSON.stringify(home, null, 2));

  const api = await (await fetch(`https://kubra.io/${slug}/public/summary-1/data.json`)).json();
  writeFileSync("./data-api.json", JSON.stringify(api, null, 2));

  console.log(
    slug, 
    sum(now, d => d.customers_affected)
  )
}

main();