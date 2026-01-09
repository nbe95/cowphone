import axios from "axios";
import { readFileSync } from "fs";
import path from "path";
import { FtpServerProps } from "./ftp-server.js";
import { OpenStagePhone, OpenStageSkin } from "./openstage.js";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Convenience function to retrieve a mocked HTML response from a file with any status code
const getWebAsset = (rspFile: string, statusCode: number = 200) => ({
  status: statusCode,
  data: readFileSync(path.join("./mock-assets/", rspFile)),
});

// Convenience function to mock phone authentication
const mockAuthResponse = (successful: boolean = true) => {
  mockedAxios.post.mockResolvedValueOnce({
    status: 200,
    headers: {
      "set-cookie": [
        successful
          ? "webm=0000|01234567-89abcdef; path=/; secure; HttpOnly"
          : "webm=0000|0000; path=/; secure; HttpOnly",
      ],
    },
  });
};

describe("Authentication", () => {
  class OpenMock extends OpenStagePhone {
    public auth = async (): Promise<void> => this._authenticate();
  }

  let phone: OpenMock;
  beforeEach(() => {
    phone = new OpenMock("", "");
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should authenticate", async () => {
    mockAuthResponse(true);
    await expect(phone.auth()).resolves.toBeUndefined();
  });

  it("should not authenticate", async () => {
    mockAuthResponse(false);
    await expect(phone.auth()).rejects.toBeDefined();
  });
});

describe("Phone type", () => {
  let phone: OpenStagePhone;
  beforeEach(() => {
    phone = new OpenStagePhone("", "");
    mockAuthResponse();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should not resolve to garbage", async () => {
    mockedAxios.get.mockResolvedValue(getWebAsset("main-banner_invalid.html"));
    await expect(phone.getType()).rejects.toContain("OpenStage FOO");
  });

  it("should resolve to an OpenStage 40", async () => {
    mockedAxios.get.mockResolvedValue(getWebAsset("main-banner_os40.html"));
    await expect(phone.getType()).resolves.toBe("os40");
  });

  it("should resolve to an OpenStage 60", async () => {
    mockedAxios.get.mockResolvedValue(getWebAsset("main-banner_os60.html"));
    await expect(phone.getType()).resolves.toBe("os60");
  });
});

describe("Phone skin", () => {
  let phone: OpenStagePhone;
  beforeEach(() => {
    phone = new OpenStagePhone("", "");
    mockAuthResponse();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should not resolve to non-available skin", async () => {
    mockedAxios.get.mockResolvedValue(getWebAsset("display-settings_os40.html"));
    await expect(phone.getSkin()).rejects.toContain("null");
  });

  it("should resolve to Anthracite-Orange", async () => {
    mockedAxios.get.mockResolvedValue(getWebAsset("display-settings_os60-ao.html"));
    await expect(phone.getSkin()).resolves.toBe(OpenStageSkin.AnthraciteOrange);
  });

  it("should resolve to Silver-Blue", async () => {
    mockedAxios.get.mockResolvedValue(getWebAsset("display-settings_os60-sb.html"));
    await expect(phone.getSkin()).resolves.toBe(OpenStageSkin.SilverBlue);
  });
});

describe("Interpret update logo response", () => {
  let phone: OpenStagePhone;
  beforeEach(() => {
    phone = new OpenStagePhone("", "");
    mockAuthResponse();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  const ftpClientMock: FtpServerProps = {
    host: "",
    password: "",
    port: 0,
    user: "",
  };

  it("should retrieve successful update", async () => {
    mockedAxios.post.mockResolvedValue(getWebAsset("logo-update_success.html"));
    await expect(phone.updateLogo(ftpClientMock, "")).resolves.toBeUndefined();
  });

  it("should retrieve failed update", async () => {
    mockedAxios.post.mockResolvedValue(getWebAsset("logo-update_fail.html"));
    await expect(phone.updateLogo(ftpClientMock, "")).rejects.toContain("Transfer failed");
  });
});
