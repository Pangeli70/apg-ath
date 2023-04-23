/** -----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.2.0 [APG 2018/06/02]
 * @version 0.5.0 [APG 2018/11/25]
 * @version 0.7.0 [APG 2019/08/15]
 * @version 0.7.1 [APG 2019/09/14]
 * @version 0.8.0 [APG 2022/04/14] Porting to Deno
 * @version 0.9.0 [APG 2022/08/14] Code smells and metrics
 * -----------------------------------------------------------------------
 */
import {
  BCrypt,
  MongoCollection,
  MongoDatabase
} from '../../../../deps.ts';

import {
  ApgJsonFile,
  eApgJsonCodedErrors
} from '../../../Json/mod.ts';

import {
  ApgPmuImmutable
} from '../../../Pmu/mod.ts';

import {
  ApgJValService,
} from '../../../JVal/mod.ts';

import {
  ApgLogsLogger,
  ApgLogsLoggable
} from '../../../Logs/mod.ts';

import {
  ApgUtils,
  ApgUtilsAssert,
  ApgUtilsMetaUrl,
} from '../../../Utils/mod.ts';

import {
  ApgResult,
  ApgResultPayload,
  ApgResultErrors
} from "../../../Result/mod.ts";

import {
  IApgMongoUpdateOneResult,
  eApgMongoCodedErrors
} from '../../../Mongo/mod.ts';

import { ApgSvcBase } from "../../../Svc/mod.ts";

import { eApgAuthCodedErrors } from '../enums/eApgAuthCodedErrors.ts';
import { IApgAuthUser } from '../interfaces/IApgAuthUser.ts';
import { ApgAuthUser } from './ApgAuthUser.ts';


/** 
 * Users authorization management
 */
export class ApgAuthService extends ApgSvcBase {

  private _loggable: ApgLogsLoggable;
  static readonly $CLASS_NAME = new ApgUtilsMetaUrl(import.meta.url).FileName;


  private static readonly _$DENO_ENV_JWT_PUBLIC_KEY_NAME = "JWT_PUBLIC_KEY"
  readonly JWT_PUBLIC_KEY: string;
  private static readonly _$DEVELOPMENT_JWT_PUBLIC_KEY = '$Jft6Ow£fla&9fa51e3Q£';

  private static readonly _$DENO_ENV_JWT_DURATION_NAME = "JWT_DURATION"
  readonly JWT_DURATION: ApgPmuImmutable;
  private static readonly _$DEFAULT_JWT_DURATION_IN_SECONDS = ApgPmuImmutable.newSeconds(24 * 60 * 60);


  /** List of the active users*/
  users: IApgAuthUser[] = [];

  /** State of the object */
  status: ApgResult;

  private _isProduction: boolean;

  /** File that contains the users used in develompment for the tests*/
  file: string | null = null;

  dbUsersCollection: MongoCollection<IApgAuthUser> | null = null;

  schemas: ApgJValService;


  constructor(
    aschemas: ApgJValService,
    alogger: ApgLogsLogger,
    aisProduction: boolean,
    afile: string,
    amongoDb: MongoDatabase | null
  ) {

    super(import.meta.url);
    this._loggable = new ApgLogsLoggable(this.CLASS_NAME, alogger);

    this._loggable.logBegin('constructor', new ApgResultPayload('file', afile));

    this.status = new ApgResult();

    this._isProduction = aisProduction;

    this.schemas = aschemas;

    if (this._isProduction) {
      if (!amongoDb) {
        this.status = ApgResultErrors.NotAValidObject(eApgMongoCodedErrors.NotAValidDb);
      }
      else {
        this.dbUsersCollection = amongoDb!.collection("users");
        ApgUtilsAssert.isUndefined(
          this.dbUsersCollection,
          `Collection [users] is invalid for database ${amongoDb.name}.`,
        );
      }
    }
    else {
      if (!afile || !ApgUtils.Fs_FileExistsSync(afile)) {
        this.status = ApgResultErrors.NotAValidObject(eApgAuthCodedErrors.MissingUsersFile);
      } else {
        this.file = afile;
      }
    }

    // these are very important for all the auth JWT management
    this.JWT_PUBLIC_KEY = this.#getJwtPublicKey();
    this.JWT_DURATION = this.#getJwtDuration();

    this._loggable.logEnd();
  }

  #getJwtPublicKey() {

    const kyeName = ApgAuthService._$DENO_ENV_JWT_PUBLIC_KEY_NAME;
    let r = Deno.env.get(kyeName);

    if (this._isProduction) {
      ApgUtilsAssert.isUndefined(
        r,
        `The value of the parameter [${kyeName}] for the EDS JWT public key, is missing in the Deno.env.`
      );
      r = ""; // to silence the compiler and return string
    }
    else {
      r = ApgAuthService._$DEVELOPMENT_JWT_PUBLIC_KEY;
    }

    return r;
  }

  #getJwtDuration() {
    const denoEnvJwtDurationName = ApgAuthService._$DENO_ENV_JWT_DURATION_NAME;
    const denoEnvJwtDurationRaw = Deno.env.get(denoEnvJwtDurationName);
    const denoEnvJwtDuration = ApgUtils.Math_SafeInteger(denoEnvJwtDurationRaw);

    const r = (denoEnvJwtDuration) ?
      ApgPmuImmutable.newSeconds(denoEnvJwtDuration) :
      ApgAuthService._$DEFAULT_JWT_DURATION_IN_SECONDS;
    return r;
  }

  async loadUsersData() {

    this._loggable.logBegin(this.loadUsersData.name);

    let r;
    if (this._isProduction) {
      r = await this.#readUsersFromMongo();
    }
    else {
      r = this.#readUsersFromFile(this.file!);
    }

    this._loggable.logEnd();
    return r;
  }


  #readUsersFromFile(afile: string) {

    this._loggable.logBegin(this.#readUsersFromFile.name);

    this.file = afile;
    let r = ApgJsonFile.readArray(this.file);

    if (r.Ok) {
      this.users = <IApgAuthUser[]>ApgJsonFile.array(r);
      if (this.users.length === 0) {
        // this handles the only possible case of a file that contains only a valid
        // JSON empty array.
        r = ApgResultErrors.NotAnArray(eApgJsonCodedErrors.NotAnArray);
      }
      else {
        r = this.#validateUsers();
      }
    }

    this._loggable.logEnd(r);
    return r;
  }


  async #readUsersFromMongo() {

    this._loggable.logBegin(this.#readUsersFromMongo.name);

    let r = new ApgResult();

    if (!this.dbUsersCollection) {
      r = ApgResultErrors.NotAValidObject(eApgMongoCodedErrors.NotAValidDb);
    }
    else {
      const q = { active: true };
      this.users = await this.dbUsersCollection.find(q).toArray();

      if (this.users.length === 0) {
        r = ApgResultErrors.NotAnArray(eApgAuthCodedErrors.MongoNoUsers);
      }
      else {
        r = this.#validateUsers();
      }
    }

    this._loggable.logEnd();
    return r;

  }


  #validateUsers() {

    this._loggable.logBegin(this.#validateUsers.name);

    const validator = this.schemas.getValidator('IApgAuthUser');
    ApgUtilsAssert.isUndefined(
      validator,
      "Auth User schema validator is undefiend"
    )

    let r = new ApgResult();
    this.users.forEach(user => {
      if (r.Ok) {
        r = validator!.validate(user);
      }
    });

    this._loggable.logEnd();
    return r;
  }


  getUser(aemail: string): IApgAuthUser | undefined {

    let r: IApgAuthUser | undefined;
    const i: number = this.users.findIndex(element => {
      return element.email === aemail;
    });
    if (i !== -1) {
      r = this.users[i];
    }
    return r;
  }


  getUserLogin(aemail: string) {

    let r = new ApgResult();
    const i: number = this.users.findIndex(element => {
      return element.email === aemail;
    });
    if (i === -1) {
      r = ApgResultErrors.NotFound(eApgAuthCodedErrors.LoginEmailNotFound);
    }
    else {
      const p = new ApgResultPayload('ApgAuthUser', this.users[i]);
      r.setPayload(p);
    }
    return r;
  }


  getUserNames(afilter: string, apageSize: number, apageNum: number) {

    let r: string[] = [];
    const reg: RegExp = ApgUtils.BuildRegExpFilter(afilter);

    if (!this._isProduction) {
      const emails: string[] = [
        'aname1@test1.com',
        'bname1@test2.com',
        'cname1@test3.com',
        'aname2@test4.com',
        'aname3@testabc.it',
        'aname3@testabc.it',
        'bname1@testabc.it',
        'bname2@testabc.it',
        'bname3@testabc.it',
        'bname4@test1.it',
        'cname2@test1.it',
        'cname3@test1.it',
        'cname4@test1.it',
        'cname1-surname@test1.it',
        'cname2-surname@test1.it',
        'cname3-surname@test2.it',
        'aname4@test2.com',
        'aname5@test3.com',
        'aname6@test3.com',
      ];

      emails.forEach(element => {
        if (afilter === '*' || afilter === '') {
          r.push(element);
        }
        else {
          if (reg.test(element)) {
            r.push(element);
          }
        }
      });
    }
    else {
      this.users.forEach(element => {
        if (afilter === '*' || afilter === '') {
          r.push(element.email);
        }
        else {
          if (reg.test(element.email)) {
            r.push(element.email);
          }
        }
      });
    }

    const skip = apageSize * (apageNum - 1);
    r.splice(0, skip);
    r = r.splice(0, apageSize);

    return r;
  }


  async saveAll2() {

    // @DONE_0_7_1 be sure to not use this in production
    const r = await ApgJsonFile.writeArray(this.users, this.file!);

    return r;

  }


  async encryptPassword(apwd: string) {
    return await BCrypt.hash(apwd);
  }


  async newUser(aemail: string, apwd: string) {

    let r = new ApgResult();

    if (!this.checkEmail(aemail)) {
      r = ApgResultErrors.NotValidParameters(
        eApgAuthCodedErrors.SignupEmailInvalid_1,
        [aemail]
      );

    }
    else {

      if (!this.checkPassword(apwd)) {
        r = ApgResultErrors.NotValidParameters(
          eApgAuthCodedErrors.SignupPasswordInvalid
        );
      }
      else {

        if (this.getUser(aemail)) {
          r = ApgResultErrors.NotValidParameters(
            eApgAuthCodedErrors.SignupUserAlreadyExists_1,
            [aemail]
          );
        }
        else {

          // mock to test specific error
          if (apwd === 'Encrypt_Err0r') {
            r = ApgResultErrors.NotValidParameters(
              eApgAuthCodedErrors.SignupUnexpectedEncrypting
            );
          }
          else {

            r = await this.encryptPwd(apwd);

            if (r.Ok) {

              const cryptedPwd = r.getPayload('string') as string;
              const user = new ApgAuthUser(aemail, cryptedPwd);
              r = await this.newUserToMongo(user);

              if (r.Ok) {
                this.users.push(user);
              }
            }
          }
        }
      }
    }
    return r;
  }


  /** @payload string : encrypted password or '' */
  private async encryptPwd(apwd: string) {

    let r = new ApgResult();

    let cryptedPwd = '';
    try {
      cryptedPwd = await BCrypt.hash(apwd);
    } catch (e) {
      r = ApgResultErrors.NotValidParameters(
        eApgAuthCodedErrors.SignupUnexpectedEncrypting);
      const p = new ApgResultPayload('Error', e);
      r.setPayload(p);
    }
    if (r.Ok) {
      const p = new ApgResultPayload('string', cryptedPwd);
      r.setPayload(p);
    }
    return r;
  }


  private checkEmail(aemail: string): boolean {

    let r = true;

    // tslint:disable-next-line:max-line-length
    const ree1 = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // tslint:disable-next-line:max-line-length
    const ree2 = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    if (!(ree1.test(aemail.toLowerCase()) && ree2.test(aemail.toLowerCase()))) {
      r = false;
    }
    return r;
  }


  private checkPassword(apwd: string): boolean {

    let r = true;
    // Password strength regex
    const rep = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\\/\|\[\]\{\}\(\)\_\-\=\+\.\,\;\:\!\@\#\§\$\%\^\&\*]).{8,16}$/;
    if (!(rep.test(apwd))) {
      r = false;
    }
    return r;
  }


  private async newUserToMongo(auser: ApgAuthUser) {
    let r = new ApgResult();
    if (this.dbUsersCollection) {
      // TODO@2 test this
      const dbr: any = await this.dbUsersCollection.insertOne(auser);
      if (dbr.result.ok) {
        throw new Error("Not implemented");
      }
    }
    return r;
  }


  newFakeUser(aemail: string, apwd: string): ApgAuthUser | undefined {

    let r: ApgAuthUser | undefined;
    if (this.checkEmail(aemail) && this.checkPassword(apwd)) {
      const pwd: string = BCrypt.hashSync(apwd);
      r = new ApgAuthUser(aemail, pwd);
      this.users.push(r);
    }
    return r;
  }


  async verifyUsersEmail(atoken: string) {

    let r = new ApgResult();

    if (!this._isProduction) {
      // mocks for testing
      if (atoken === ApgAuthUser.TEST_VERIFICATION_NEW) {
        // do nothing
      }
      else {
        if (atoken === ApgAuthUser.TEST_VERIFICATION_DONE) {
          r = ApgResultErrors.NotValidParameters(
            eApgAuthCodedErrors.VerificationAlreadyDone
          );
        }
        else {
          // do nothing
        }
      }
    }
    else {
      const i: number = this.users.findIndex(element => {
        return element.verificationToken === atoken;
      });

      if (i === -1) {
        r = ApgResultErrors.NotFound(
          eApgAuthCodedErrors.VerificationTokenNotFound
        );
      }
      else {
        if (this.users[i].verification) {
          r = ApgResultErrors.NotValidParameters(
            eApgAuthCodedErrors.VerificationAlreadyDone
          );
        }
        else {
          this.users[i].verification = (new Date()).valueOf();
          r = await this.updateUserToMongo(this.users[i]);
        }
      }
    }
    return r;
  }


  async changePassword(
    auser: ApgAuthUser,
    anewPwd: string
  ) {

    let r = new ApgResult();

    if (!this._isProduction) {
      // mocks for testing
      // TODO @5 implement some test
    }
    else {
      const i: number = this.users.findIndex(element => {
        return element.email === auser.email;
      });

      if (i === -1) {
        r = ApgResultErrors.NotFound(
          eApgAuthCodedErrors.AuthChangePwdUserNotFound_1,
          [auser.email]
        );
      }
      else {

        if (!this.checkPassword(anewPwd)) {
          r = ApgResultErrors.NotValidParameters(
            eApgAuthCodedErrors.SignupPasswordInvalid
          );
        }
        else {

          r = await this.encryptPwd(anewPwd);

          if (r.Ok) {

            const cryptedPwd = r.getPayload('string') as string;
            this.users[i].password = cryptedPwd;
            r = await this.updateUserToMongo(this.users[i]);

          }
        }
      }
    }
    return r;
  }


  private async deleteUserToMongo(auser: IApgAuthUser) {
    let r = new ApgResult();

    if (this.dbUsersCollection) {
      const filter = { email: auser.email };
      const deleted = await this.dbUsersCollection.deleteOne(filter);

      if (deleted == 0) {
        r = ApgResultErrors.NotFound(
          eApgAuthCodedErrors.AuthDeleteUserNotFound_1,
          [auser.email]);
      }
    }
    return r;
  }


  async deleteUser(aemail: string) {

    let r = new ApgResult();

    const i: number = this.users.findIndex(element => {
      return element.email === aemail;
    });

    if (i === -1) {

      if (!this._isProduction) {

        // mock for testing
        if (aemail === ApgAuthUser.TEMP_USER_NAME) {
          // do nothing
        }

      }
      else {
        r = ApgResultErrors.NotFound(
          eApgAuthCodedErrors.AuthDeleteUserNotFound_1,
          [aemail]
        );
      }

    }
    else {

      r = await this.deleteUserToMongo(this.users[i]);
      if (r.Ok) {
        this.users.splice(i, 1);
      }

    }

    return r;
  }


  private async updateUserToMongo(auser: IApgAuthUser) {
    let r = new ApgResult();

    if (this.dbUsersCollection) {
      const filter = { email: auser.email };
      const command = { $set: auser };

      const dbr: IApgMongoUpdateOneResult = await this.dbUsersCollection.updateOne(filter, command);
      // TODO @2 test this
      if (dbr.modifiedCount === 0) {
        r = ApgResultErrors.NotFound(
          eApgAuthCodedErrors.AuthSetRoleUserNotFound_1,
          [auser.email]);
      }
    }
    return r;
  }


  deleteFakeUser(aemail: string): void {

    // TODO @5 seems brittle here test!
    const i: number = this.users.findIndex(element => {
      return element.email === aemail;
    });

    if (i !== -1) {

      this.users.splice(i, 1);
    }
  }


}


