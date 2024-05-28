import { FtpSrv } from "ftp-srv";
import { mkdirp } from "mkdirp";
import { PROD } from "./constants";

export type FtpServerProps = {
  host: string;
  port: number;
  user: string;
  password: string;
  root: string;
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

export const runServer = async (props: FtpServerProps) => {
  const ftpServer = new FtpSrv({
    url: `ftp://0.0.0.0:${PROD ? 21 : props.port}`,
    pasv_url: props.host,
    pasv_min: 3000,
    pasv_max: 3009,
    anonymous: false,
    greeting: "This server has super cow powers.",
  });

  ftpServer.on("login", ({ connection, username, password }, resolve, reject) => {
    if (username == props.user && password == props.password) {
      console.log(`FTP client ${connection.ip} connected as user ${username}.`);
      return resolve({
        root: props.root,
        blacklist: ["ALLO", "APPE", "DELE", "MKD", "RMD", "RNRF", "RNTO", "STOR", "STRU"], // make server read-only
      });
    }
    console.error(`FTP login from client ${connection.ip} rejected.`);
    return reject(new GeneralError("Invalid user name or password", 401));
  });

  ftpServer.on("disconnect", ({ connection, id }) => {
    console.log(`FTP client ${connection.ip} disconnected.`);
  });

  // Create temp dir for development
  if (!PROD) {
    mkdirp(props.root).then(() => console.log("Created temporary FTP directory for development."));
  }

  ftpServer.listen().then(() => {
    console.log("FTP server is starting.", { ...props });
  });
};
