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
var con = sql2.createConnection({
  host: "localhost",
  user: "root",
  password: "Fl6004c@suqeele",
  database: "kycDB",
});
class kyc extends Contract {
  async InitLedger(ctx) {
    const data = [];

    for (const d of data) {
      await ctx.stub.putState(
        d.ID,
        Buffer.from(stringify(sortKeysRecursive(d)))
      );
    }
  }

  async txAdd(ctx, ID, kra, txtype, data, DBState, sqlData) {
    const data = {
      id: ID,
      KRA: kra,
      TxType: txtype,
      Data: data,
      DBState: DBState,
    };

    if (txtype === "add"){
      con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = `INSERT INTO cusData (pan ,cname, cmail, cphone, hash, kraOwner) VALUES ('${sqlData.PAN}', '${sqlData.Name}', '${sqlData.Mail}', '${sqlData.PhoneNumber}', '${sqlData.Hash}', '${sqlData.KRA}')`;
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("Row inserted", result);
        });
      });
    }
    if (txtype === "update"){
      con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = `UPDATE cusData SET cname = '${sqlData.Name}', cmail = '${sqlData.Mail}', cphone = '${sqlData.PhoneNumber}', hash = '${sqlData.Hash}' WHERE pan = '${sqlData.PAN}'`;
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("Row updated", result);
        });
      });
    }

    await ctx.stub.putState(
      ID,
      Buffer.from(stringify(sortKeysRecursive(data)))
    );
    return true;
  }

  async txFetch(ctx, ID) {
    const dataJSON = await ctx.stub.getState(ID);
    if (!dataJSON || dataJSON.length === 0) {
      throw new Error(`The transaction ${ID} does not exist`);
    }
    return dataJSON.toString();
  }

  // CHECK STATUS
  async txExists(ctx, ID) {
    const dataJSON = await ctx.stub.getState(ID);
    if (dataJSON && dataJSON.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  // TO CHECK
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
