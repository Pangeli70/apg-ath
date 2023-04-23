/** -----------------------------------------------------------------------
 * @module [Auth]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.8.0 [APG 2022/07/02]
 * -----------------------------------------------------------------------
*/

const DO_ATLAS_TESTS = false;
const DO_LOCAL_TESTS = false;


import { MongoDatabase } from "../../../deps.ts"
import { ApgMongoService } from "../../Mongo/mod.ts"
import {
  ApgTestsSpecable,
  IApgTestsMongoCollectionSpecSettings
} from "../../Tests/mod.ts";
import { ApgResult, ApgResultErrors } from "../../Result/mod.ts";


import {
  IApgAuthUserSchema,
  TApgAuthUsersCollection,
  ApgAuthUsersCollection
} from "../src/collections/ApgAuthUsersCollection.ts"
import { IApgAuthUser } from "../mod.ts";
import { eApgApiRoles } from "../../Api/mod.ts";


const paoloUser: IApgAuthUser = {
  _id: "boh",
  email: "paolo.angeli@bredasys.com",
  password: "PIPPO",
  creation: Date.now(),
  verificationToken: "CICCIOBURICCIO",
  verification: Date.now(),
  passwordExpiration: Date.now(),
  permissions: [],
}
const paoloUserUpdated: IApgAuthUser = {
  _id: "boh",
  email: "paolo.angeli@bredasys.com",
  password: "PIPPO_NEW",
  creation: Date.now(),
  verificationToken: "CICCIO_SI_MA_ANCHE_BURICCIO",
  verification: Date.now(),
  passwordExpiration: Date.now(),
  permissions: [{ family: "*", route: "*", role: eApgApiRoles.administrator }],
}

const pietroUser: IApgAuthUser = {
  _id: "boboh",
  email: "pietro.bon@bredasys.com",
  password: "PLUTO",
  creation: Date.now(),
  verificationToken: "CICCIOBURICCIO2",
  verification: Date.now(),
  passwordExpiration: Date.now(),
  permissions: []
}
const danteUser: IApgAuthUser = {
  _id: "bohboboh",
  email: "dante.manarin@bredasys.com",
  password: "PAPERINO",
  creation: Date.now(),
  verificationToken: "CICCIOBURICCIO3",
  verification: Date.now(),
  passwordExpiration: Date.now(),
  permissions: []
}

export class ApgAuthUsersCollectionSpec extends ApgTestsSpecable {

  async Test01_AtlasOperations(
    arun: boolean,
    aspecSettings: IApgTestsMongoCollectionSpecSettings
  ) {
    this.suite(this.Test01_AtlasOperations.name);



    this.case('Trying to establish Atlas connection...');
    if (!arun) {
      this.skip(`Connection to Mongo Atlas Shard instance ${aspecSettings.shardName}`);
      return;
    }

    const service = new ApgMongoService(
      aspecSettings.dbName,
      aspecSettings.shardName!,
      aspecSettings.userName!,
      aspecSettings.userPwd!
    );

    await service.initializeConnection();

    this.result(`Connection estabilished with Mongo Atlas Shard instance ${aspecSettings.shardName}`, true);

    return await this.testCollection(service.Database!, aspecSettings);
  }


  async Test02_LocalOperations(
    arun: boolean,
    aspecSettings: IApgTestsMongoCollectionSpecSettings
  ) {
    this.suite(this.Test02_LocalOperations.name);

    this.case('Trying to establish Local connection...');
    if (!arun) {
      this.skip();
      return;
    }

    const service = new ApgMongoService(
      aspecSettings.dbName
    );

    await service.initializeConnection();

    this.result(`Connection estabilished with Local Mongo instance ${aspecSettings.shardName}`, true);

    return await this.testCollection(service.Database!, aspecSettings);
  }


  private async testCollection(
    adb: MongoDatabase,
    aspecSettings: IApgTestsMongoCollectionSpecSettings
  ) {
    let ar = new ApgResult();
    this.case('Retrieving collection from database...');

    const collection: TApgAuthUsersCollection = adb.collection<IApgAuthUserSchema>(aspecSettings.collectionName);
    if (collection != undefined) {
      this.result(`Collection ${aspecSettings.dbName}.${aspecSettings.collectionName} is available`, ar.Ok);
    }
    else {
      ar = ApgResultErrors.Unmanaged(`${this.testCollection.name}: Collection is unavailable`)
    }

    if (ar.Ok) {
      this.case('Inserting one test item in the collection...');
      ApgAuthUsersCollection.Init(collection);
      ar = await ApgAuthUsersCollection.InsertOne(paoloUser, true);
      this.result(`Inserted one document in the collection`, ar.Ok);
    }

    if (ar.Ok) {
      this.case('Inserting one more test item in the collection...');
      ApgAuthUsersCollection.Init(collection);
      ar = await ApgAuthUsersCollection.InsertOne(pietroUser, true);
      this.result(`Inserted one document in the collection`, ar.Ok);
    }

    if (ar.Ok) {
      this.case('Updating one test item in the collection...');
      ApgAuthUsersCollection.Init(collection);
      ar = await ApgAuthUsersCollection.UpdateOne(paoloUserUpdated);
      this.result(`Updated one document in the collection`, ar.Ok);
    }

    if (ar.Ok) {
      this.case('Inserting one more test item in the collection...');
      ApgAuthUsersCollection.Init(collection);
      ar = await ApgAuthUsersCollection.InsertOne(danteUser, true);
      this.result(`Inserted one document in the collection`, ar.Ok);
    }

    if (ar.Ok) {
      this.case('Deleting all test items from the collection...');
      ApgAuthUsersCollection.Init(collection);
      ar = await ApgAuthUsersCollection.DeleteAllTestUsers();
      const p = ar.getPayload('number') as number;
      const r = (
        ar.Ok &&
        p != undefined &&
        p === 3
      );
      this.result(`Deleted ${p} documents in the collection`, r);
    }

    return ar;
  }

  async testGroup() {

    const atlasSpecSettings: IApgTestsMongoCollectionSpecSettings = {
      shardName: "apgmongodbatlas-shard-00-@@.okfw3.mongodb.net",
      userName: "APG",
      userPwd: "Fabi-1175",
      dbName: "ApgEdsMongoDb",
      collectionName: "ApgEdsUsers"
    }
    await this.Test01_AtlasOperations(DO_ATLAS_TESTS, atlasSpecSettings);

    const localSpecSettings: IApgTestsMongoCollectionSpecSettings = {
      dbName: "ApgEdsMongoDb",
      collectionName: "ApgEdsUsers"
    }
    await this.Test02_LocalOperations(DO_LOCAL_TESTS, localSpecSettings);
  }

  async runTests(arun: boolean) {
    if (!arun) return false;
    this.title(this.className);
    await this.testGroup();
    this.resume();
    return this.return();
  }
}
