import { readFileSync, writeFileSync } from "node:fs";
import { csvFormat, csvParse } from "d3-dsv";
import { ascending } from "d3-array";

const main = async () => {
  const slugs = readFileSync("./action-slugs.txt").toString().trim().split("\n").map(line => {
    const [_, slug] = line.split(" ");
    return { slug }
  });

  const data = await Promise.all(slugs.map(async ({ slug }) => {
    const response = await fetch(`https://kubra.io/${slug}/public/summary-1/data.json`);
    const { summaryFileData: datum } = await response.json();
    const { totals: [v], date_generated } = datum;
    return {
      total_affected: v.total_cust_a.val,
      total_percent_affected: v.total_percent_cust_a.val,
      total_percent_active: v.total_percent_cust_active.val,
      total_served: v.total_cust_s,
      total_outages: v.total_outages,
      date_generated
    };
  }));

  writeFileSync(
    "./data-api.csv",
    csvFormat(data.sort((a, b) => ascending(new Date(a.date_generated), new Date(b.date_generated))))
  );
}

main();