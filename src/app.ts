import {GeneralError, FtpSrv} from "ftp-srv"

const ftpUser: string = "coward"
const ftpPassword: string = "os40"
const ftpPort: number = 50021;
const ftpServer = new FtpSrv({
  url: `ftp://0.0.0.0:${ftpPort}`,
  anonymous: false
});

ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
  if (username == ftpUser && password == ftpPassword) {
    return resolve({ root: "/" });
  }
  return reject(new GeneralError("Invalid username or password", 401));
});

ftpServer.listen().then(() => {
  console.log("FTP server is starting...")
});
