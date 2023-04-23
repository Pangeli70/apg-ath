/** -----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.4.0 [APG 2018/10/30]
 * @version 0.5.0 [APG 2018/11/25]
 * @version 0.7.1 [APG 2019/09/15]
 * @version 0.8.0 [APG 2022/02/261] Porting to Deno
 * -----------------------------------------------------------------------
 */

/** Apg Auth Error codes */
export enum eApgAuthCodedErrors {

  /** The authorization token was not provided */
  JWTMissing = '[AUTH] JWT_MISSING', // *
  /** The authorization token is invalid */
  JWTInvalid = '[AUTH] JWT_INVALID', // *
  /** The authorization token is expired */
  JWTExpired = '[AUTH] JWT_EXPIRED', // *
  /** Insufficient access privileges */
  InsufficientPrivileges = '[AUTH] INSUFFICIENT_PRIVILEGES', // *
  /** User email address not provided or invalid */
  LoginEmailMissing = '[AUTH] LOGIN_EMAIL_MISSING', // *
  /** The user is not in the list of the registered users */
  LoginEmailNotFound = '[AUTH] LOGIN_EMAIL_NOTFOUND', // *
  /** Password not provided or invalid */
  LoginPasswordMissing = '[AUTH] LOGIN_PASSWORD_MISSING', // *
  /** Password does not match or invalid */
  LoginPasswordInvalid = '[AUTH] LOGIN_PASSWORD_INVALID', // *
  /** Impossible to emit the token for [%1] because user is not yet verified */
  LoginNotYetVerified_1 = '[AUTH] LOGIN_NOT_YET_VERIFIED_1', // *
  /** The password is expired */
  LoginPasswordExpired = '[AUTH] LOGIN_PASSWORD_EXPIRED', // *
  /** The email address is missing! */
  SignupEmailMissing = '[AUTH] SIGNUP_EMAIL_MISSING', // *
  /** Invalid email address [%1]!.*/
  SignupEmailInvalid_1 = '[AUTH] SIGNUP_EMAIL_INVALID_1', // *
  /** The user [%1] already exists!*/
  SignupUserAlreadyExists_1 = '[AUTH] SIGNUP_USER_EXISTS_1', // *
  /** Password is invalid or not matching complexity criterias */
  SignupPasswordInvalid = '[AUTH] SIGNUP_PASSWORD_INVALID', // *
  /** Something went wrong encrypting the password! */
  SignupUnexpectedEncrypting = '[AUTH] SIGNUP_ENCRYPTING_PWD', // *
  /** The email verification token is not associated to any user. */
  VerificationTokenNotFound = '[AUTH] VERIFICATION_TOKEN_NOTFOUND', // *
  /** The email was already verified. */
  VerificationAlreadyDone = '[AUTH] VERIFICATION_ALREADY_DONE', // *
  /** Impossible to delete! The user [%1] was not found.*/
  AuthDeleteUserNotFound_1 = '[AUTH] DELETE_USER_NOTFOUND_1', // *
  /** Can't get roles! The user [%1] was not found.*/
  GetRolesUserNotFound_1 = '[AUTH] GETROLES_USER_NOTFOUND_1', // *
  /** Can't set role! The user [%1] was not found. */
  AuthSetRoleUserNotFound_1 = '[AUTH] SETROLE_USER_NOTFOUND_1', // *
  /** Can't set role! The family [%1] was not found. */
  Auth_SetRole_Family_NotFound_1 = '[AUTH] SETROLE_FAMILY_NOTFOUND_1', // *
  /** Can't set role! The route [%1] was not found. */
  Auth_SetRole_Route_NotFound_1 = '[AUTH] SETROLE_ROUTE_NOTFOUND_1', // *
  /** Can't set role! The role [%1] was not found.*/
  Auth_SetRole_Role_NotFound_1 = '[AUTH] SETROLE_ROLE_NOTFOUND_1', // *
  /** Can't reset password! The user [%1] was not found.*/
  Auth_ResetPwd_User_NotFound_1 = '[AUTH] RESETPWD_USER_NOTFOUND_1', // *
  /** Can't change password! The user [%1] was not found.*/
  AuthChangePwdUserNotFound_1 = '[AUTH] CHGPWD_USER_NOTFOUND_1', // *
  /** Can't change password! The old password is invalid.*/
  ChangePwdOldPasswordInvalid = '[AUTH] CHGPWD_OLDPWD_INVALID', // *
  /** Can't change password! The new password is invalid*/
  ChangePwdNewPasswordInvalid = '[AUTH] CHGPWD_NEWPWD_INVALID', // *
  /** The current mongo DB connection has retrieved an empty list of users */
  MongoNoUsers = '[AUTH] MONGO_NOUSERS',
  /** The current mongo DB connection has retrieved an empty list of users */
  MissingUsersFile = '[AUTH] MISSING_USERS_FILE',
}



