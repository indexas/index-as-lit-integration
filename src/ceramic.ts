import { WebClient } from "@self.id/web";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { TileMetadataArgs } from "@ceramicnetwork/stream-tile";

import { decodeb64, encodeb64, blobToBase64 } from "./lit";

export interface LitDocument {
  encryptedZip: string;
  symKey: string;
  accessControlConditions: any;
  chain: string;
  accessControlConditionType: any;
}
declare global {
  interface Window {
    ceramic?: WebClient;
    [index: string]: any;
  }
}
/**
 * Write to Ceramic.  This function takes in an auth and what one would
 * like written and then sends it to a ceramic node in the proper format
 * @param {any[]} auth is the authentication passed via the persons wallet
 * @param {any[]} array of encrypted key, symkey, accessControlConditions, and chain
 * @returns {Promise<string>} promise with the ceramic streamID, can be used to look up data
 */
export async function _writeCeramic(
  client: WebClient,
  toBeWritten: any[],
  metadata?: TileMetadataArgs,
): Promise<TileDocument<LitDocument> | null> {
  if (client) {
    const toStore: LitDocument = {
      encryptedZip: toBeWritten[0],
      symKey: toBeWritten[1],
      accessControlConditions: toBeWritten[2],
      chain: toBeWritten[3],
      accessControlConditionType: toBeWritten[4],
    };
    const doc = await TileDocument.create(client.ceramic as any, toStore, metadata);
    return doc;
  } else {
    console.error("Failed to create document");
    return null;
  }
}

export async function _updateCeramic(
  client: WebClient,
  streamId: String,
  newContent: any[]
): Promise<TileDocument<LitDocument> | null> {
  if (client) {
    const toStore = {
      encryptedZip: encodeb64(newContent[0]),
      symKey: encodeb64(newContent[1]),
      accessControlConditions: newContent[2],
      chain: newContent[3],
      accessControlConditionType: newContent[4],
    };

    const doc = await TileDocument.load<LitDocument>(client.ceramic as any, streamId.valueOf());
    await doc.update(toStore);
    return doc;
  } else {
    console.error("Failed to update document");
    return null;
  }
}

/**
 * Read to Ceramic.  This function takes in an auth and the streamID of the desired data and then sends it to a ceramic node in the proper format getting back a promised string of whatever was stored
 *
 * @param {any[]} auth is the authentication passed via the user's wallet
 * @param {String} streamId ID hash of the stream
 * @returns {Promise<string>} promise with the ceramic streamID's output
 */
export async function _readCeramic(
  client: WebClient,
  streamId: string
): Promise<any> {
  if (client) {
    const stream = await TileDocument.load(client.ceramic as any, streamId);
    return stream.content;
  } else {
    console.error("Failed to authenticate in ceramic READ");
    return null;
  }
}

/**
 * Decode info from base64.  Data is stored in base64 to make upload to ceramic
 * more seamless.  This function decodes it so it can be decrypted with Lit in
 * the next step in the read and decrypt process
 *
 * @param {string} response response received from ceramic streamID
 * @returns {Promise<Array<any>} array of decrypted zip and symmetric key + AAC and chain
 */
export async function _decodeFromB64(response: string) {
  // data is encoded in base64, decode
  // const jason = JSON.stringify(response);
  try {
    // @ts-ignore
    const enZip = response["encryptedZip"];
    const deZip = decodeb64(enZip);

    // @ts-ignore
    const enSym = response["symKey"];
    const deSym = decodeb64(enSym);

    // @ts-ignore
    const accessControlConditions = response["accessControlConditions"];
    // @ts-ignore
    const chain = response["chain"];
    // @ts-ignore
    const accessControlConditionType = response["accessControlConditionType"];
    return [
      deZip,
      deSym,
      accessControlConditions,
      chain,
      accessControlConditionType,
    ];
  } catch (error) {
    return "There was an error decrypting, is it possible you inputted the wrong streamID?";
  }
}
