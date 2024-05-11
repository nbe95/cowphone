import { GeneralError, FtpSrv } from "ftp-srv";
import { FTP_OWN_IP, FTP_OWN_PORT, FTP_PASSWORD, FTP_ROOT, FTP_USER } from "./constants";

export const runServer = async () => {
  const ftpServer = new FtpSrv({
    url: "ftp://0.0.0.0:21",
    pasv_url: FTP_OWN_IP,
    pasv_min: 3000,
    pasv_max: 3009,
    anonymous: false,
    greeting: "This server has super cow powers.",
  });

  ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
    if (username == FTP_USER && password == FTP_PASSWORD) {
      return resolve({ root: FTP_ROOT });
    }
    return reject(new GeneralError("Invalid username or password", 401));
  });

  ftpServer.listen().then(() => {
    console.log("FTP server is starting...");
  });
};
