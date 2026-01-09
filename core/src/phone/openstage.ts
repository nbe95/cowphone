import axios from "axios";
import { parse as parseCookie } from "cookie";
import { Agent } from "https";
import { parse as parseHtml } from "node-html-parser";
import path from "path";
import { FtpServerProps } from "./ftp-server.js";
import { REQUEST_HEADER_FIELDS_TOO_LARGE } from "http-status-codes";

export type OpenStageType = "os40" | "os60";

export enum OpenStageSkin {
  SilverBlue,
  AnthraciteOrange,
}

export class OpenStagePhone {
  protected readonly _host: string;
  protected readonly _adminPassword: string;
  protected _agent: Agent;
  protected _auth: string | undefined = undefined;

  constructor(host: string, adminPassword: string) {
    this._host = host;
    this._adminPassword = adminPassword;
    this._agent = new Agent({ rejectUnauthorized: false });
  }

  protected _getBaseUrl = (): string => `https://${this._host}`;

  protected _authenticate = async (): Promise<void> =>
    new Promise(async (resolve, reject) => {
      // Check and exit if already authenticated
      if (this._auth !== undefined) {
        resolve();
        return;
      }

      const response = await axios.post(
        this._getBaseUrl() + "/page.cmd",
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
      const responseCookies: string[] | undefined = response?.headers["set-cookie"];
      const authCode: string | undefined = responseCookies
        ?.map((raw) => parseCookie(raw))
        ?.find((cookie) => "webm" in cookie)?.webm;
      if (authCode && authCode != "0000|0000") {
        console.log("Successfully authenticated at OpenStage phone.", { ipAddress: this._host });
        this._auth = authCode;
        resolve();
        return;
      }
      console.error("Could not obtain authentication code from OpenStage phone.", {
        ipAddress: this._host,
      });
      reject("Could not obtain authentication.");
    });

  public getType = async (): Promise<OpenStageType> =>
    new Promise(async (resolve, reject) => {
      const response = await axios.get(this._getBaseUrl() + "/main_banner.cmd", {
        httpsAgent: this._agent,
      });
      if (response.status != 200) {
        console.error("Could not retrieve OpenStage type.", { rsp: response });
        reject(`Phone returned HTTP status ${response.status}.`);
        return;
      }

      const parsedHtml = parseHtml(response.data);
      const typeLabel: string = parsedHtml.querySelector("td.part_4")?.innerHTML ?? "";
      if (typeLabel.match(/OpenStage\s*40/i)) {
        resolve("os40");
      } else if (typeLabel.match(/OpenStage\s*60/i)) {
        resolve("os60");
      } else {
        reject(`Phone returned type label '${typeLabel}'`);
      }
    });

  public getSkin = async (): Promise<OpenStageSkin> =>
    new Promise(async (resolve, reject) => {
      this._authenticate().then(async () => {
        const response = await axios.get(this._getBaseUrl() + "/page.cmd", {
          httpsAgent: this._agent,
          params: {
            page: "WEBM_User_DisplaySettings",
          },
        });
        if (response.status != 200) {
          console.error("Could not retrieve OpenStage skin.", { rsp: response });
          reject(`Phone returned HTTP status ${response.status}.`);
          return;
        }

        const parsedHtml = parseHtml(response.data);
        const selectedSkin = parsedHtml.querySelector("select[name=display-skin] option[selected]");
        switch (selectedSkin?.innerHTML) {
          case "Silver Blue":
            resolve(OpenStageSkin.SilverBlue);
            break;
          case "Anthracite Orange":
            resolve(OpenStageSkin.AnthraciteOrange);
            break;
          default:
            reject(`Phone returned selected skin '${selectedSkin}'`);
        }
      });
    });

  public updateLogo = async (ftpServer: FtpServerProps, filePath: string): Promise<void> =>
    new Promise(async (resolve, reject) => {
      this._authenticate().then(async () => {
        const fileDir: string = path.dirname(filePath);
        const fileName: string = path.basename(filePath);
        const response = await axios.post(
          this._getBaseUrl() + "/page.cmd",
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
        const ftpLog = {
          host: this._host,
          file: filePath,
          server: (({ host, port }) => ({ host, port }))(ftpServer),
        };

        const parsedHtml = parseHtml(response.data);
        const updateResult: string = parsedHtml.querySelector("td font[color] i")?.innerHTML ?? "";
        switch (updateResult) {
          case "Transfer completed successfully":
            console.log("Successfully updated OpenStage logo.", ftpLog);
            resolve();
            break;
          default:
            console.log("Could not update OpenStage logo.", ftpLog);
            reject(`Error while updating logo. Result='${updateResult}'`);
        }
      });
    });
}
