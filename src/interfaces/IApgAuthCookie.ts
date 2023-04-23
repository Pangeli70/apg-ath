/** ----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.7.1 [APG 2019/08/27]
 * @version 0.8.0 [APG 2022/02/261] Porting to Deno
 * -----------------------------------------------------------------------
 */
import { eApgUtilsManagedLanguages } from '../../../Utils/mod.ts';


export interface IApgAuthCookie {
  /** Current Version */
  version: string;
  // jwt of the user if logged in
  token?: string;
  // Language set by the user as preference
  language?: eApgUtilsManagedLanguages;
}
