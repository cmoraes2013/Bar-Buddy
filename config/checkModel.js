// CheckModel - after sync, counts records in Brands table, and if 0, loads the table from the CSV file
const fs   = require('fs');
const path = require('path');
const csv  = require('csv-parser');
const db   = require("../models");

module.exports = function() {
  let report = {
    userCt:   0,
    reviewCt: 0,
    brandCt:  0
  }
  db.Users.count().then((u) => {
    report.userCt = u;
  }).then(() => {
    db.Reviews.count().then((r) => {
      report.reviewCt = r;
    }).then(() => {
      db.Brands.count().then((b) => {
        report.brandCt = b;
        if (b == 0) {
          console.log('loading Brands.');  
          let rows = 0;      
          let file = path.join(__dirname,'./state-liquor-authority-sla-brand-label-and-wholesaler-information-for-alcoholic-beverage-products-re-1.csv');
          fs
            .createReadStream(file)
            .pipe(csv())
            .on('data', (line) => {
              rows++;
              db.Brands.create({
                brandSerial :  line['Brand Label Serial Number'],
                bevName     :  line['Brand Label Name'],
                category    :  line['License Class Description'],
                description :  line['Product Description'],
                import      : (line['Domestic (D) or Imported (I)'] == 'I')
              })
            })
            .on('end', () => {
                // end occurs *after* the last record is read
                report.brandCt = --rows;
                console.log(`${rows} records from CSV file added to Brands.`);
            });
        }
        console.log(`Users: ${report.userCt}, Reviews: ${report.reviewCt}, Brands: ${report.brandCt}`)    
      })
    })
  })
}