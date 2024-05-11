import axios from "axios";
import { Agent } from "https";
import { parse } from "cookie";

export class Os40WebInterface {
  private _ipAddr: string;
  private _adminPassword: string;
  private _agent: Agent;
  private _auth: string | undefined = undefined;

  constructor(ipAddr: string, adminPassword: string) {
    this._ipAddr = ipAddr;
    this._adminPassword = adminPassword;
    this._agent = new Agent({ rejectUnauthorized: false });
  }

  public getRequestUrl(): string {
    return `https://${this._ipAddr}/page.cmd`;
  }

  public async authenticate(): Promise<boolean> {
    const response = await axios.post(
      this.getRequestUrl(),
      {
        page_submit: "WEBMp_Admin_Login",
        AdminPassword: this._adminPassword,
      },
      {
        httpsAgent: this._agent,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    const responseCookies: string[] | undefined = response.headers["set-cookie"];
    const authCode: string | undefined = responseCookies
      ?.map((raw) => parse(raw))
      ?.find((cookie) => "webm" in cookie)?.webm;
    if (authCode && authCode != "0000|0000") {
      console.log(
        `Successfully authenticated at OpenStage40 with IP ${this._ipAddr} and code ${authCode}.`,
      );
      this._auth = authCode;
      return true;
    }
    console.error(`Could not obtain auth code from OpenStage40 with IP ${this._ipAddr}.`);
    return false;
  }
}
