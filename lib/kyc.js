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
    const data = [];

    for (const d of data) {
      await ctx.stub.putState(
        d.PAN,
        Buffer.from(stringify(sortKeysRecursive(d)))
      );
    }
  }

  // ADD
  async AddNewCustomer(
    ctx,
    kra,
    name,
    gender,
    fname,
    dob,
    nationality,
    aadhar,
    address,
    mail,
    phone,
    occ,
    panNo,
    panHash
  ) {
    const exists = await this.DataExists(ctx, panNo);
    if (exists) {
      throw new Error(`The user ${panNo} already exists`);
    }

    const data = {
      KRA: kra,
      Name: name,
      Gender: gender,
      FName: fname,
      DOB: dob,
      Nationality: nationality,
      AadharNo: aadhar,
      Address: address,
      MailID: mail,
      Phone: phone,
      Occupation: occ,
      PAN: panNo,
      PANHash: panHash,
    };

    await ctx.stub.putState(
      panNo,
      Buffer.from(stringify(sortKeysRecursive(data)))
    );
    return JSON.stringify(panNo) + " inserted successfully";
  }

  // RETRIEVE FOR PULLING DATA FOR UPDATE
  async RetrieveDetails(ctx, PAN) {
    const dataJSON = await ctx.stub.getState(PAN);
    if (!dataJSON || dataJSON.length === 0) {
      throw new Error(`The user ${id} does not exist`);
    }
    return dataJSON.toString();
  }

  async UpdateDetails(
    ctx,
    kra,
    name,
    gender,
    fname,
    dob,
    nationality,
    aadhar,
    address,
    mail,
    phone,
    occ,
    panNo,
    panHash
  ) {
    const exists = await this.DataExists(ctx, panNo);
    if (!exists) {
      throw new Error(`The user ${panNo} does not exist`);
    }

    // fetching actual KRA Owner
    const dataBuffer = await ctx.stub.getState(panNo);
    const dataJSON = JSON.parse(dataBuffer.toString());
    const kraOG = await dataJSON.KRA;
    const panNO = await dataJSON.PAN;

    if (kraOG && panNO) {
      const data = {
        KRA: kraOG,
        Name: name,
        Gender: gender,
        FName: fname,
        DOB: dob,
        Nationality: nationality,
        AadharNo: aadhar,
        Address: address,
        MailID: mail,
        Phone: phone,
        Occupation: occ,
        PAN: panNO,
        PANHash: panHash,
      };

      try {
        await ctx.stub.putState(
          panNO,
          Buffer.from(stringify(sortKeysRecursive(data)))
        );
        return data;
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
    if (dataJSON && dataJSON.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  // TO CHECK
  async GetAllUsers(ctx) {
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
