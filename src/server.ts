import { GeneralError, FtpSrv } from "ftp-srv";
import { FTP_SERVER } from "./constants";

export type FtpServerProps = {
  host: string;
  port: number;
  user: string;
  password: string;
  root: string;
};

export const runServer = async () => {
  const ftpServer = new FtpSrv({
    url: "ftp://0.0.0.0:21",
    pasv_url: FTP_SERVER.host,
    pasv_min: 3000,
    pasv_max: 3009,
    anonymous: false,
    greeting: "This server has super cow powers.",
  });

  ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
    if (username == FTP_SERVER.user && password == FTP_SERVER.password) {
      return resolve({ root: FTP_SERVER.root });
    }
    return reject(new GeneralError("Invalid username or password", 401));
  });

  ftpServer.listen().then(() => {
    console.log("FTP server is starting...");
  });
};
