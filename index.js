/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const kyc = require('./lib/kyc');

module.exports.kyc = kyc;
module.exports.contracts = [kyc];
