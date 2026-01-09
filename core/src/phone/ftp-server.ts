import { FtpSrv } from "ftp-srv";

export type FtpServerProps = {
  host: string;
  port: number;
  user: string;
  password: string;
};

class GeneralError extends Error {
  // Redefine GeneralError, because the library one won't work
  // ("GeneralError is not a constructor")
  code: number;
  constructor(message: string, code: number = 400) {
    super();
    this.code = code;
    this.name = "GeneralError";
    this.message = message;
  }
}

export const runServer = (props: FtpServerProps, rootDir: string) => {
  const noOpLogger = {
    trace: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
    fatal: () => {},
  };
  const ftpServer = new FtpSrv({
    url: `ftp://0.0.0.0:${props.port}`,
    pasv_url: props.host,
    pasv_min: 3000,
    pasv_max: 3009,
    anonymous: false,
    greeting: "This server has super cow powers…",
    log: noOpLogger,
  });

  ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
    if (username == props.user && password == props.password) {
      console.log(`FTP client ${connection.ip} connected as user ${username}.`);
      return resolve({
        root: rootDir,
        blacklist: ["ALLO", "APPE", "DELE", "MKD", "RMD", "RNRF", "RNTO", "STOR", "STRU"], // make server read-only
      });
    }
    console.error(`FTP login from client ${connection.ip} rejected.`);
    return reject(new GeneralError("Invalid user name or password", 401));
  });

  ftpServer.on("disconnect", ({ connection, id }) => {
    console.log(`FTP client ${connection.ip} disconnected.`);
  });

  ftpServer.listen().then(() => {
    console.log("FTP server is starting.", { ...props });
  });
};
