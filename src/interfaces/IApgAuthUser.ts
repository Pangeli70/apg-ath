/** -----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.2.0 [APG 2018/06/02]
 * @version 0.5.0 [APG 2018/11/25]
 * @version 0.7.1 [APG 2019/09/14]
 * @version 0.8.0 [APG 2022/02/261] Porting to Deno
 * -----------------------------------------------------------------------
 */

import { IApgApiPermission } from "../../../Api/mod.ts";



/** User for utentication with roles for authorization
 */
export interface IApgAuthUser {

  /** ObjectID Identifier created by Mongo DB */
  _id: any;

  /** The email address is used to identify the usera */
  email: string;

  /** Encripted password */
  password: string;

  /** Creation date-time in milliseconds standard numeric JS format */
  creation: number;

  /** Token for the email address verification */
  verificationToken: string;

  /** Verification date in milliseconds standard numeric JS format */
  verification: number;

  /** Password expiration date in milliseconds standard numeric JS format */
  passwordExpiration: number;

  /** Authorizations list family/route-role  */
  permissions: IApgApiPermission[];

  /** Deletion date-time in milliseconds standard numeric JS format */
  deletion?: number;

}
