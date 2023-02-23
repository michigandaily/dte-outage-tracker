import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { basename } from "path";
import { csvParse, csvFormat } from "d3-dsv";

const main = () => {
  const files = readdirSync('./tmp/').sort();
  const history = [];

  files.forEach((file) => {
    const f = JSON.parse(readFileSync(`./tmp/${file}`).toString());
    f.forEach((entry) => {
      history.push({
        timestamp: basename(file),
        zipcode: entry.title,
        number_outages: entry.desc.n_out,
        customers_served: entry.desc.cust_s,
        customers_affected: entry.desc.cust_a.val,
        percent_affected: entry.desc.percent_cust_a.val
      })
    })
  })

  const h = csvParse(readFileSync("./history.csv").toString());
  writeFileSync("./tmp.csv", csvFormat([...history, ...h]));
}

main();
