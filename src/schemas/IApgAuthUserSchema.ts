import { IApgJValInterface } from "../../../JVal/mod.ts";
import { ApgUtils } from "../../../Utils/mod.ts";

const rawSchema: IApgJValInterface = {
    $schema: "http://json-schema.org/schema#",
    $id: "IApgAuthUser#",
    type: "object",
    properties: {
        _id: {
            type: "object",
            description: "ObjectID Identifier created by Mongo DB"
        },
        email: {
            type: "string",
            description: "The email address is used to identify the user"
        },
        password: {
            type: "string",
            description: "Encrypted password"
        },
        verificationToken: {
            type: "string",
            description: "Token for the email address verification"
        },
        creation: {
            type: "integer",
            description: "Creation date-time in milliseconds standard numeric JS format"
        },
        verification: {
            type: "integer",
            description: "Verification date in milliseconds standard numeric JS format"
        },
        passwordExpiration: {
            type: "integer",
            description: "Password expiration date in milliseconds standard numeric JS format"
        },
        permissions: {
            $ref: "IApgApiPermission#",
            description: "Authorizations list family/route-role"
        },
        deletion: {
            type: "integer",
            description: "Deletion date-time in milliseconds standard numeric JS format"
        },
    },
    additionalProperties: false,
    allErrors: true,
    required: [
        "_id",
        "email",
        "password",
        "verificationToken",
        "creation",
        "verification",
        "passwordExpiration",
        "permissions",
        "deletion"
    ]
}

export const IApgAuthUser_SCHEMA =
    ApgUtils.Obj_DeepFreeze(rawSchema) as IApgJValInterface;