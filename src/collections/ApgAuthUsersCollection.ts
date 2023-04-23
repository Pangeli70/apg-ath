/** -----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.8.0 [APG 2022/06/26]
 * -----------------------------------------------------------------------
 */

import {
    MongoCollection
} from "../../../../deps.ts";

import {
    IApgAuthUser
} from "../interfaces/IApgAuthUser.ts"

import {
    TApgMongoInsertResult,
    IApgMongoUpdateOneResult
} from "../../../Mongo/mod.ts"

import {
    ApgResult, ApgResultErrors
} from "../../../Result/mod.ts";

export interface IApgAuthUserSchema {
    _id: { $oid: string };
    isTest: boolean;
    user: IApgAuthUser;
}

export type TApgAuthUsersCollection = MongoCollection<IApgAuthUserSchema>;


export class ApgAuthUsersCollection {

    static readonly CLASS_NAME = "ApgAuthUsersCollection";
    private static _collection: TApgAuthUsersCollection;

    static Init(acollection: TApgAuthUsersCollection) {
        this._collection = acollection;
    }

    static async GetAll(
    ) {
        const methodName = this.GetAll.name;
        let r = new ApgResult();
        const query = {
            "isTest": { $eq: false }
        }
        try {
            const _cursor = await this._collection.find(query);
            // TODO extract users from cursor
            const users = [""]
            const p =  {
                signature: "IApgAuthUser[]",
                data: users
            }
            r.setPayload(p);
        }
        catch (e) {
            const message = `${this.CLASS_NAME}/${methodName}/ Error: ${JSON.stringify(e)}`;
            r = ApgResultErrors.Unmanaged(message);
        }
        return r;
    }

    static async InsertOne(
        aitem: IApgAuthUser,
        aisTest = false
    ) {
        const methodName = this.InsertOne.name;
        let r = new ApgResult();
        const schema = {
            user: aitem,
            isTest: aisTest
        };
        try {
            const insertResult: TApgMongoInsertResult =
                await this._collection.insertOne(schema);
            const p =  {
                signature: "TApgMongoInsertResult",
                data: insertResult
            }
            r.setPayload(p);
        }
        catch (e) {
            const message = `${this.CLASS_NAME}/${methodName}/ Error: ${JSON.stringify(e)}`;
            r = ApgResultErrors.Unmanaged(message);
        }
        return r;
    }

    static async UpdateOne(
        aitem: IApgAuthUser
    ) {
        const methodName = this.UpdateOne.name;
        let r = new ApgResult();

        const schema = {
            user: aitem,
            isTest: false
        };

        const query = { "user.email": aitem.email };

        try {
            const updateResult: IApgMongoUpdateOneResult =
                await this._collection.updateOne(
                    query,
                    { $set: schema }
                );
            const p =  {
                signature: "IApgMongoUpdateOneResult",
                data: updateResult
            }
            r.setPayload(p);
        } catch (e) {
            const message = `${this.CLASS_NAME}/${methodName}/ Error: ${JSON.stringify(e)}`;
            r = ApgResultErrors.Unmanaged(message);
        }

        return r;
    }

    static async DeleteAllTestUsers() {
        const methodName = this.DeleteAllTestUsers.name;
        let r = new ApgResult();

        const query = {
            "isTest": { $eq: true }
        }

        try {
            const deleteResult = await this._collection.deleteMany(query);
            const p =  {
                signature: "number",
                data: deleteResult
            }
            r.setPayload(p);
        } catch (e) {
            const message = `${this.CLASS_NAME}/${methodName}/ Error: ${JSON.stringify(e)}`;
            r = ApgResultErrors.Unmanaged(message);
        }

        return r;
    }

}


