/** -----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.2.0 [APG 2018/06/02]
 * @version 0.5.0 [APG 2018/11/25]
 * @version 0.7.1 [APG 2019/09/22]
 * @version 0.8.0 [APG 2022/02/26] Porting to Deno
 * -----------------------------------------------------------------------
 */
import { BCrypt } from '../../../../deps.ts';
import { eApgApiRoles, IApgApiPermission } from "../../../Api/mod.ts";
import { ApgUtils } from '../../../Utils/mod.ts';
import { IApgAuthUser } from "../interfaces/IApgAuthUser.ts";



/** User for authentication 
 */
export class ApgAuthUser implements IApgAuthUser {

  /** Fake user name for tests */
  static FAKE_USER_NAME = 'fake@apgera.com';
  /** Temp user name for tests */
  static TEMP_USER_NAME = 'test@apgera.com';
  /** Fake password */
  static TEMP_USER_PWD = 'S3cr3t_9WD-1';
  /** Fake token to perform new user email verification test */
  static TEST_VERIFICATION_NEW = 'test_verification_token_new';
  /** Fake toke to verify email verification already done test */
  static TEST_VERIFICATION_DONE = 'test_verification_token_done';

  _id: any;

  password: string;
  email: string;
  verificationToken: string;
  creation: number;
  verification: number;
  passwordExpiration: number;
  permissions: IApgApiPermission[];
  deletion: number;

  /** The default password expiration time in milliseconds is 4 months */
  private readonly __DEFAULT_DURATION = 4 * 30 * 24 * 60 * 60 * 1000;

  /** Default length for the verification token */
  private readonly __DEFAULT_VER_TKN_LEN = 20;


  constructor(aemail: string, apwd: string, adurationDays?: number) {

    this.email = aemail;
    this.password = apwd;
    this.creation = (new Date()).valueOf();
    this.verificationToken = ApgUtils.Str_RandomNumbersAndLetters(this.__DEFAULT_VER_TKN_LEN);
    this.verification = 0;
    if (!adurationDays) {
      this.passwordExpiration = this.creation + this.__DEFAULT_DURATION;
    }
    else {
      const milliseconds = adurationDays * 24 * 60 * 60 * 1000;
      this.passwordExpiration = this.creation + milliseconds;
    }
    this.permissions = [];
    this.deletion = 0;
  }


  pwsWillExpireInDays(adate?: Date): number {

    let r = 0;
    const d = (adate) ? adate.valueOf() : (new Date()).valueOf();
    r = (this.passwordExpiration - d) / 1000 / 60 / 60 / 24;
    return r;

  }


  getRole(afamily: string): eApgApiRoles | undefined {

    let r: eApgApiRoles | undefined;

    let i: number = this.permissions.findIndex(element => {
      return element.family === afamily;
    });

    if (i === -1) {
      i = this.permissions.findIndex(element => {
        return element.family === '*';
      });
    }

    if (i !== -1) {
      r = this.permissions[i].role;
    }

    return r;
  }


  setFamilyPermissions(afamily: string, arole: eApgApiRoles): void {

    const i: number = this.permissions.findIndex(element => {
      return element.family === afamily;
    });
    if (i !== -1) {
      this.permissions[i].role = arole;
    }
    else {
      const np: IApgApiPermission = { family: afamily, role: arole, route: '*' };
      this.permissions.push(np);
    }

  }


  checkVerificationToken(atoken: string): boolean {

    return atoken === this.verificationToken;

  }


  checkPassword(apwd: string, aisProd: boolean): boolean {

    if (!aisProd && this.email === ApgAuthUser.TEMP_USER_NAME) {
      return (apwd === ApgAuthUser.TEMP_USER_PWD);
    }
    else {
      return BCrypt.compareSync(apwd, this.password);
    }

  }

}
