import { GeneralError, FtpSrv } from "ftp-srv";
import { FTP_OWN_IP, FTP_OWN_PORT, FTP_PASSWORD, FTP_USER } from "./constants";

const ftpServer = new FtpSrv({
  url: `ftp://0.0.0.0:${FTP_OWN_PORT}`,
  pasv_url: FTP_OWN_IP,
  pasv_min: 4000,
  pasv_max: 4009,
  anonymous: false,
  greeting: "This FTP server has super cow powers.",
});

ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
  if (username == FTP_USER && password == FTP_PASSWORD) {
    return resolve({ root: "/cowphone/media" });
  }
  return reject(new GeneralError("Invalid username or password", 401));
});

ftpServer.listen().then(() => {
  console.log("FTP server is starting...");
});
