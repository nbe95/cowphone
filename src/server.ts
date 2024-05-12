import { GeneralError, FtpSrv } from "ftp-srv";

export type FtpServerProps = {
  host: string;
  port: number;
  user: string;
  password: string;
  root: string;
};

export const runServer = async (props: FtpServerProps) => {
  const ftpServer = new FtpSrv({
    url: "ftp://0.0.0.0:21",
    pasv_url: props.host,
    pasv_min: 3000,
    pasv_max: 3009,
    anonymous: false,
    greeting: "This server has super cow powers.",
  });

  ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
    if (username == props.user && password == props.password) {
      return resolve({
        root: props.root,
        blacklist: ["ALLO", "APPE", "DELE", "MKD", "RMD", "RNRF", "RNTO", "STOR", "STRU"], // make server read-only
      });
    }
    return reject(new GeneralError("Invalid username or password", 401));
  });

  ftpServer.listen().then(() => {
    console.log("FTP server is starting...");
  });
};
