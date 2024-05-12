import axios from "axios";
import { Agent } from "https";
import { parse, serialize } from "cookie";
import { FtpServerProps } from "./server";
import path from "path";

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
      console.log(`Successfully authenticated at OpenStage40 ${this._ipAddr}.`);
      this._auth = authCode;
      return true;
    }
    console.error(`Could not obtain authentication at OpenStage40 ${this._ipAddr}.`);
    return false;
  }

  public async updateLogo(ftpServer: FtpServerProps, filePath: string): Promise<boolean> {
    const fileDir: string = path.dirname(filePath);
    const fileName: string = path.basename(filePath);
    const response = await axios.post(
      this.getRequestUrl(),
      {
        page_submit: "WEBM_Admin_Logo",
        "dl-lgo-method": "0",
        "dl-lgo-addr": ftpServer.host,
        "dl-lgo-port": ftpServer.port.toString(),
        "dl-lgo-account": "",
        "dl-lgo-username": ftpServer.user,
        "dl-lgo-password": ftpServer.password,
        "dl-lgo-path": fileDir,
        "dl-lgo-base-url": "",
        "dl-lgo-file": fileName,
        "WEBM-Admin-StartDownload": "1",
        WEBMv_Admin_Download_FileType: "4",
        WEBMv_Admin_Download_FileName: "dl-lgo-file",
      },
      {
        httpsAgent: this._agent,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `webm=${this._auth}`,
        },
      },
    );
    const payload: string = response.data;
    if (payload.includes("Transfer completed successfully")) {
      console.log(`Successfully updated logo for OpenStage40 ${this._ipAddr} to ${fileName}.`);
      return true;
    }
    console.error(`Could not update logo for OpenStage40 ${this._ipAddr} to ${fileName}.`);
    return false;
  }
}
