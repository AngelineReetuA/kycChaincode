/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");

class kyc extends Contract {
  async InitLedger(ctx) {
    const data = [
    ];

    for (const d of data) {
      await ctx.stub.putState(
        d.ID,
        Buffer.from(stringify(sortKeysRecursive(d)))
      );
    }
  }

  async txAdd(ctx, ID, kra, txtype, data, DBState) {
    const exists = await this.DataExists(ctx, panNo);
    if (exists) {
      throw new Error(`The user ${panNo} already exists`);
    }

    const data = {
      id:ID,
      KRA: kra,
      TxType:txtype,
      Data: data,
      DBState: DBState,
    };

    await ctx.stub.putState(
      ID,
      Buffer.from(stringify(sortKeysRecursive(data)))
    );
    return JSON.stringify(panNo) + " inserted successfully";
  }
  
  async txFetch(ctx, ID) {
    const dataJSON = await ctx.stub.getState(ID);
    if (!dataJSON || dataJSON.length === 0) {
      throw new Error(`The transaction ${ID} does not exist`);
    }
    return dataJSON.toString();
  }

  async txDelete(ctx, panNo) {
    const exists = await this.DataExists(ctx, panNo);
    if (!exists) {
      throw new Error(`The user ${panNo} does not exist`);
    }
    try {
      await ctx.stub.deleteState(panNo);
      return "Deleted successfully";
    } catch (error) {
      console.error("Error deleting state:", error.message);
    }
  }

  // CHECK STATUS
  async txExists(ctx, ID) {
    const dataJSON = await ctx.stub.getState(ID);
    if ( dataJSON && dataJSON.length > 0 ){
      return true
    }
    else {
      return false
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
