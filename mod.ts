/** -----------------------------------------------------------------------
 * @module [Auth] Authentication and Autorhization
 * @author [APG] ANGELI Paolo Giusto
 * ------------------------------------------------------------------------
 */

export { ApgAuthUser } from "./src/classes/ApgAuthUser.ts"
export { ApgAuthService } from "./src/classes/ApgAuthService.ts"

export type { IApgAuthCookie } from "./src/interfaces/IApgAuthCookie.ts"
export type { IApgAuthTokenPayload } from "./src/interfaces/IApgAuthTokenPayload.ts"
export type { IApgAuthUser } from "./src/interfaces/IApgAuthUser.ts"

export { eApgAuthCodedErrors } from "./src/enums/eApgAuthCodedErrors.ts"

export { IApgAuthUser_SCHEMA } from "./src/schemas/IApgAuthUserSchema.ts"