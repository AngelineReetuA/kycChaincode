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
  // INITIALIZE THE LEDGER
  async InitLedger(ctx) {
    const data = [
      {
        KRA: "KRA1",
        Name: "Alice",
        MailID: "alice@mail.in",
        Phone: "9876543219",
        PAN: "23gh56ju",
        PANHash: "dummyhash123",
      },
    ];

    for (const d of data) {
      await ctx.stub.putState(
        d.PAN,
        Buffer.from(stringify(sortKeysRecursive(d)))
      );
    }
  }

  // ADD
  async AddNewCustomer(ctx, kra, name, mail, phone, panNo, panHash) {
    const exists = await this.DataExists(ctx, panNo);
    if (exists) {
      throw new Error(`The user ${panNo} already exists`);
    }

    const data = {
      KRA: kra,
      Name: name,
      MailID: mail,
      Phone: phone,
      PAN: panNo,
      PANHash: panHash,
    };

    await ctx.stub.putState(
      panNo,
      Buffer.from(stringify(sortKeysRecursive(data)))
    );
    return JSON.stringify(panNo) + " inserted successfully";
  }
  // UPDATE
  async UpdateDetails(ctx, panNo, name, mail, phone, panHash) {
    const exists = await this.DataExists(ctx, panNo);
    if (!exists) {
      throw new Error(`The user ${panNo} does not exist`);
    }

    // fetching actual KRA Owner
    const dataBuffer = await ctx.stub.getState(panNo);
    const dataJSON = JSON.parse(dataBuffer.toString())
    const kraOG = await dataJSON.KRA;
    const panNO = await dataJSON.PAN;

    if(kraOG && panNO){
      const data = {
        KRA: kraOG,
        Name: name,
        MailID: mail,
        Phone: phone,
        PAN: panNO,
        PANHash: panHash,
      };
  
      try {
        await ctx.stub.putState(
          panNO,
          Buffer.from(stringify(sortKeysRecursive(data)))
        );
        return data
      } catch (error) {
        console.error("Error updating state:", error.message);
      }
    }
  }

  // DELETE
  async DeleteData(ctx, panNo) {
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
  async DataExists(ctx, PAN) {
    const dataJSON = await ctx.stub.getState(PAN);
    if ( dataJSON && dataJSON.length > 0 ){
      return true
    }
    else {
      return false
    }
  }
}

module.exports = kyc;
