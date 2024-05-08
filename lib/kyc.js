/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");
const sql2 = require("mysql2");
const con = sql2.createConnection({
  host: "172.17.0.1", // vm's  ip  172.17.0.1
  user: "kycuser",
  password: "Fl6004c@12345",
  database: "kycDB",
  port: 3306,
});

class kyc extends Contract {
  // Initializes the ledger
  async InitLedger(ctx) {
    const transaction = [];
    for (const tran of transaction) {
      await ctx.stub.putState(
        tran.id,
        Buffer.from(stringify(sortKeysRecursive(transaction)))
      );
    }
  }

  async testingDB(ctx) {
    try {
      // create the connection to database
      const connection = await sql2.createConnection({
        host: "172.17.0.1", // vm's  ip  172.17.0.1
        user: "kycuser",
        password: "Fl6004c@12345",
        database: "kycDB",
        port: 3306,
      });
      // execute will internally call prepare and query
      connection.query("INSERT INTO cusData (pan ,cname, cmail, cphone, hash, kraOwner) VALUES ('test456','test','test','test','test','test')"
      , (err, results) => {
        if (err) {
          console.error(err);
          return;
        }
      
        console.log(results);
      });
    } catch (err) {
      console.log(err);
    }
  }

  // Adds a transaction to the blockchain and data to SQL
  async txAdd(ctx, ID, kra, txtype, data, DBState) {
    const sqlData = {
      PAN: data.PAN,
      Name: data.Name,
      Mail: data.Mail,
      PhoneNumber: data.PhoneNumber,
      Hash: data.Hash,
      KRA: data.KRA,
    };
    const transaction = {
      id: ID,
      KRA: kra,
      TxType: txtype,
      Data: JSON.stringify(data),
      DBState: DBState,
    };

    if (txtype === "add") {
      var sql = `INSERT INTO cusData (pan ,cname, cmail, cphone, hash, kraOwner) VALUES ('${sqlData.PAN}', '${sqlData.Name}', '${sqlData.Mail}', '${sqlData.PhoneNumber}', '${sqlData.Hash}', '${sqlData.KRA}')`;
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Row inserted", result);
      });
    }
    if (txtype === "update") {
      var sql = `UPDATE cusData SET cname = '${sqlData.Name}', cmail = '${sqlData.Mail}', cphone = '${sqlData.PhoneNumber}', hash = '${sqlData.Hash}' WHERE pan = '${sqlData.PAN}'`;
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Row updated", result);
      });
    }

    await ctx.stub.putState(
      transaction.id,
      Buffer.from(stringify(sortKeysRecursive(transaction)))
    );
    return JSON.stringify(transaction) + " inserted successfully";
  }

  // Fetches a transaction with its ID
  async txFetch(ctx, ID) {
    const sqlDataJSON = await ctx.stub.getState(ID);
    if (!sqlDataJSON || sqlDataJSON.length === 0) {
      throw new Error(`The transaction ${ID} does not exist`);
    }
    return sqlDataJSON.toString();
  }

  // Checks if a transaction exists
  async txExists(ctx, ID) {
    const sqlDataJSON = await ctx.stub.getState(ID);
    if (sqlDataJSON && sqlDataJSON.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  // Gets all transaction data in the ledger
  async GetAllTx(ctx) {
    const allResults = [];

    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
}

module.exports = kyc;
