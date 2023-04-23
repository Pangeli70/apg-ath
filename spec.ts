/** -----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.8.0 [APG 2022/07/02]
 * ------------------------------------------------------------------------
*/

import { ApgLogsLogger } from "../Logs/mod.ts";
import { ApgAuthUsersCollectionSpec } from "./test/ApgAuthUsersCollectionSpec.ts";

export async function ApgAuthSpecSuite(arun: boolean, alogger: ApgLogsLogger) {
  if (!arun) return;
  const spec = new ApgAuthUsersCollectionSpec("ApgAuthUsersCollection", alogger);
  await spec.runTests(true);
}