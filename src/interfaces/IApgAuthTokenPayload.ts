/** -----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.7.1 [APG 2019/08/25]
 * @version 0.8.0 [APG 2022/02/261] Porting to Deno
 * -----------------------------------------------------------------------
 */

/** Apg Auh JWT token Payload */
export interface IApgAuthTokenPayload {
  /** User email used as user ID */
  email: string;
  /** Token expiration set by the JWT.sign */
  exp?: number;
  // TODO What the hell is this?
  iat?: number;
}
