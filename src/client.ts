import * as LitJsSdk from "lit-js-sdk";

/**
 * Starts Lit Client in background. should be run upon starting of project.
 *
 * @param {Window} window the window of the project, to which it attaches
 * a litNodeClient
 */
export async function _startLitClient(window: Window) {
  const client = new LitJsSdk.LitNodeClient();
  await client.connect();
  window.litNodeClient = client;
}
