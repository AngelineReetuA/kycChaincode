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
      {
        KRA: "KRA1",
        ID: "customer12345",
        Name: "Alice",
        MailID: "alice@mail.in",
        Phone: "9876543219",
        PANNo: "23gh56ju",
        PANHash: "dummyhash123",
      },
      {
        KRA: "KRA5",
        ID: "customer56789",
        Name: "Bob",
        MailID: "bob@mail.in",
        Phone: "9086543234",
        PANNo: "45igf933",
        PANHash: "dummyhash456",
      },
      {
        KRA: "KRA3",
        ID: "customer98123",
        Name: "Caroline",
        MailID: "caroline@mail.in",
        Phone: "6733409864",
        PANNo: "97fbfu42",
        PANHash: "dummyhash789",
      },
    ];

    for (const d of data) {
      await ctx.stub.putState(
        d.ID,
        Buffer.from(stringify(sortKeysRecursive(d)))
      );
    }
  }

  async AddNewCustomer(ctx, kra, id, name, mail, phone, panNo, panHash) {
    const exists = await this.DataExists(ctx, id);
    if (exists) {
      throw new Error(`The user ${id} already exists`);
    }

    const data = {
      KRA: kra,
      ID: id,
      Name: name,
      MailID: mail,
      Phone: phone,
      PANNo: panNo,
      PANHash: panHash,
    };

    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(data)))
    );
    return JSON.stringify(data, " Inserted Successfully");
  }

  async RetrieveDetails(ctx, id) {
    const dataJSON = await ctx.stub.getState(id);
    if (!dataJSON || dataJSON.length === 0) {
      throw new Error(`The user ${id} does not exist`);
    }
    return dataJSON.toString();
  }

  async UpdateDetails(ctx, kra, id, name, mail, phone, panNo, panHash) {
    const exists = await this.DataExists(ctx, id);
    if (!exists) {
      throw new Error(`The user ${id} does not exist`);
    }

    const data = {
      KRA: kra,
      ID: id,
      Name: name,
      MailID: mail,
      Phone: phone,
      PANNo: panNo,
      PANHash: panHash,
    };

    try {
      await ctx.stub.putState(
        id,
        Buffer.from(stringify(sortKeysRecursive(data)))
      );
      return "Updated successfully";
    } catch (error) {
      console.error("Error updating state:", error.message);
    }
  }

  async DeleteData(ctx, id) {
    const exists = await this.DataExists(ctx, id);
    if (!exists) {
      throw new Error(`The user ${id} does not exist`);
    }
    try {
      await ctx.stub.deleteState(id);
      return "Deleted successfully";
    } catch (error) {
      console.error("Error deleting state:", error.message);
    }
  }

  async DataExists(ctx, id) {
    const dataJSON = await ctx.stub.getState(id);
    return dataJSON && dataJSON.length > 0;
  }

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
